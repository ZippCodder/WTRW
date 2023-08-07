import {
    createText,
    drawText,
    draw,
    distance,
    cut,
    aofb,
    aisofb,
    genObjectId,
    random,
    LoopAnimation,
    MultiFrameLoopAnimation,
    MultiFrameLinearAnimation,
    offsetVertices,
    Inventory,
    fromRGB,
    toRGB,
    rotate,
    lineIntersectsBox
} from "/public/scripts/lib.js";

const pathfinder = new Worker("/public/scripts/pathfinder.js");

pathfinder.requestPath = function(avatar, start, end) {
    this.postMessage({
        mapId: avatar.map.id,
        blocked: avatar.map.GRAPH.blocked,
        nodes: avatar.map.GRAPH.nodes,
        avatarId: avatar.id,
        path: {
            start: start,
            end: end
        }
    });
}

pathfinder.onmessage = function({
    data
}) {
    _Map_._all[data.mapId].avatars[data.avatarId]?.findPathTo(data.result);
}

export class _Object_ {
    constructor(vertices, imp, render = function() {}, width, height, initialX, initialY, initialRotation, type, name) {
        render = render.bind(this);

        this.vao = ext.createVertexArrayOES();
        this.vertices = new Float32Array(vertices);
        this.imp = imp.bind(this);
        this.render = function() {
            if (this.preRender) this.preRender();
            render();
        }
        this.trans = {
            offsetX: initialX || 0,
            offsetY: initialY || 0,
            rotation: (initialRotation * Math.PI / 180) || 0
        }
        this.width = width;
        this.height = height;
        this.id = genObjectId();
        this.type = type;
        this.topLayer = false;
        this.name = name;
        this.textures = [];

        ext.bindVertexArrayOES(this.vao);
        this.imp();
    }
    texture;
    buffer;
    segments;
    obstacle;
    pickup;
    interactable;

    delete() {
        this.map.unlink(this.id);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    rotate(a) {
        a = a * Math.PI / 180;
        this.trans.rotation = a;
    }
}

export class _StaticCluster_ {
    constructor(texture, topLayer) {

        this.vao = ext.createVertexArrayOES();
        this.linked = false;
        this.isCluster = true;
        this.vertices = [];
        this.verticesCount = 0;
        this.texture = texture;
        this.members = 0;
        this.trans = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        }
        this.id = genObjectId();
        this.type = "static cluster";
        this.topLayer = topLayer || false;

        // set up cluster VAO...

        ext.bindVertexArrayOES(this.vao);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.disableVertexAttribArray(locations.offset);
        gl.disableVertexAttribArray(locations.textrUnit);
    }

    delete() {
        this.map.unlink(this.id);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    translateVertices(index, vertices, x = 0, y = 0, rotation = 0) {
        this.vertices[index] = offsetVertices(vertices, x, y, -rotation);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat(1)), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
    }

    link(vertices, xOffset = 0, yOffset = 0, rotation = 0, stride = 5) {

        this.vertices.push(offsetVertices(vertices, xOffset, yOffset, -rotation, stride));

        let v = this.vertices.flat(1);
        this.verticeCount = v.length;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);

        return this.vertices.length - 1;
    }

    unlink(clusterIndex) {

        delete this.vertices[clusterIndex];

        let v = this.vertices.flat(1);
        this.verticeCount = v.length;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
    }

    render() {
        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.useProgram(program);

        gl.drawArrays(gl.TRIANGLES, 0, this.verticeCount / 5);
    }
}

export class _BulletCluster_ {
    constructor(vertices, texture) {
        this.vao = ext.createVertexArrayOES();
        this.linked = false;
        this.topLayer = true;
        this.isCluster = true;
        this.animation = new LoopAnimation(function() {
            for (let i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i]) {
                    let b = this.bullets[i];

                    let off = i * 3;
                    this.offsets[off] += b.rate.x;
                    this.offsets[off + 1] += b.rate.y;
                    b.translate(b.rate.x, b.rate.y);

                    outer: for (let o in this.map.obstacles) {
                        for (let segment of this.map.obstacles[o].segments) {
                            let [ox, oy, ow, oh] = segment;

                            ox = ox + this.map.obstacles[o].trans.offsetX;
                            ox += ow / 2;
                            oy = oy + this.map.obstacles[o].trans.offsetY;
                            oy += oh / 2;

                            if ((Math.abs(ox - b.trans.offsetX) < (b.width / 2 + ow / 2)) && (Math.abs(oy - b.trans.offsetY) < (b.height / 2 + oh / 2))) {
                                b.delete();
                                if (this.map.obstacles[o].hit) this.map.obstacles[o].hit(b.damage, b.rate.x, b.rate.y, b.owner);
                                break outer;
                            }

                        }
                    }

                }

            }
        }, this, bulletResolution);
        this.vertices = vertices;
        this.bullets = [];
        this.offsets = [];
        this.texture = texture;
        this.verticeCount = vertices.length / 5;
        this.members = 0;
        this.instances = 0;
        this.trans = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        }
        this.id = genObjectId();
        this.type = "bullet cluster";

        // set up cluster VAO...

        ext.bindVertexArrayOES(this.vao);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);

        this.offsetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        instExt.vertexAttribDivisorANGLE(locations.offset, 1);
        gl.enableVertexAttribArray(locations.offset);
        gl.disableVertexAttribArray(locations.textrUnit);
    }

    delete() {
        this.map.unlink(this.id);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    translateVertices(index, x = 0, y = 0, rotation = 0) {

        let i = index * 3;

        this.offsets[i] += x;
        this.offsets[i + 1] += y;
        this.offsets[i + 2] = rotation;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.offset);
    }

    link(xOffset = 0, yOffset = 0, rotation = 0, bullet) {

        let m = this.members * 3;
        let t = this.members * 2;

        this.offsets[m] = xOffset;
        this.offsets[m + 1] = yOffset;
        this.offsets[m + 2] = rotation;

        this.bullets[this.members] = bullet;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.offset);

        this.instances++;

        return this.members++;
    }

    unlink(index) {
        let i = index * 3;

        delete this.offsets[i];
        delete this.offsets[i + 1];
        delete this.offsets[i + 2];

        delete this.bullets[index];

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.offset);
    }

    preRender() {
        this.animation.run();
    }

    render() {

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.offset);

        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.useProgram(program);

        instExt.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.verticeCount, this.instances);
    }
}

export class _InstancedCluster_ {
    constructor(vertices, texture, useLight) {

        this.vao = ext.createVertexArrayOES();
        this.linked = false;
        this.isCluster = true;
        this.vertices = vertices;
        this.offsets = [];
        this.useLight = useLight;
        this.texture = texture;
        this.verticeCount = vertices.length / 5;
        this.members = 0;
        this.instances = 0;
        this.trans = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        }
        this.id = genObjectId();
        this.type = "instanced cluster";
        this.topLayer = useLight;

        // set up cluster VAO...

        ext.bindVertexArrayOES(this.vao);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);

        this.offsetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        instExt.vertexAttribDivisorANGLE(locations.offset, 1);
        gl.enableVertexAttribArray(locations.offset); 
        gl.disableVertexAttribArray(locations.textrUnit);
    }
   
    delete() {
        this.map.unlink(this.id);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    updateBuffer() {
        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.offset);
    }

    translateVertices(index, x = 0, y = 0, rotation = 0) {
        let i = index * 3;

        this.offsets[i] += x;
        this.offsets[i + 1] += y;
        this.offsets[i + 2] = (-rotation) * (Math.PI / 180);

        this.updateBuffer();
    }

    link(xOffset = 0, yOffset = 0, rotation = 0) {

        let m = this.members * 3;

        this.offsets[m] = xOffset;
        this.offsets[m + 1] = yOffset;
        this.offsets[m + 2] = (-rotation) * (Math.PI / 180);

        this.updateBuffer();
        this.instances++;

        return this.members++;
    }

    unlink(index) {
        let i = index * 3;

        delete this.offsets[i];
        delete this.offsets[i + 1];
        delete this.offsets[i + 2];

        this.updateBuffer();
    }

    render() {
        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);
        if (this.useLight) {
            gl.uniform1f(locations.darkness, 1);
            gl.blendFuncSeparate(gl.DST_COLOR, gl.DST_ALPHA, gl.ONE, gl.ONE);
        }

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.useProgram(program);

        instExt.drawArraysInstancedANGLE(gl.TRIANGLES, 0, this.verticeCount, this.instances);
        if (this.useLight) {
            gl.uniform1f(locations.darkness, this.map.darkness + globalDarkness);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
    }
}

export class _MixedStaticCluster_ {

    static groupings = {
        "0": [textures.objects.roads],
        "1": [textures.objects.fences],
    };

    constructor(textures = [], stride = 6, topLayer) {
        this.vao = ext.createVertexArrayOES();
        this.linked = false;
        this.isCluster = true;
        this.stride = stride;
        this.sources = [];
        this.vertices = [];
        this.textures = textures;
        this.verticesCount = 0;
        this.members = 0;
        this.trans = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        }
        this.id = genObjectId();
        this.type = "mixed static cluster";
        this.topLayer = topLayer;

        // set up cluster VAO...

        ext.bindVertexArrayOES(this.vao);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
    }

    delete() {
        this.map.unlink(this.id);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    translateVertices(index, vertices, x = 0, y = 0, rotation = 0) {
        this.vertices[index] = offsetVertices(vertices, x, y, -rotation, this.stride);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat(1)), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 24, 0); // 20
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(locations.textrUnit, 1, gl.FLOAT, false, 24, 20);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
        gl.enableVertexAttribArray(locations.textrUnit);
    }

    link(vertices, xOffset = 0, yOffset = 0, rotation = 0) {

        this.vertices.push(offsetVertices(vertices, xOffset, yOffset, rotation, this.stride));

        let v = this.vertices.flat(1);
        this.verticeCount = v.length;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 24, 0); // 20
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(locations.textrUnit, 1, gl.FLOAT, false, 24, 20);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
        gl.enableVertexAttribArray(locations.textrUnit);

        this.members++;

        return this.vertices.length - 1;
    }

    unlink(clusterIndex) {

        delete this.vertices[clusterIndex];

        let v = this.vertices.flat(1);
        this.verticeCount = v.length;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 24, 0); // 20
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(locations.textrUnit, 1, gl.FLOAT, false, 24, 20);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
        gl.enableVertexAttribArray(locations.textrUnit);
    }

    render() {
        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        for (let i = 0; i < this.textures.length; i++) {
            eval(`gl.activeTexture(gl.TEXTURE${i})`);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        }

        gl.useProgram(program);

        gl.drawArrays(gl.TRIANGLES, 0, this.verticeCount / this.stride);
    }
}

export class _LineMatrix_ {
    constructor() {
        this.vao = ext.createVertexArrayOES();
        this.isCluster = true;
        this.vertices = [];
        this.shotQueue = [];
        this.animation = new LoopAnimation(function() {
            this.removeShot(this.shotQueue.shift());
        }, this, 0.1);
        this.trans = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0
        }
        this.id = genObjectId();
        this.type = "line matrix";
        this.topLayer = true;

        // set up cluster VAO...

        ext.bindVertexArrayOES(this.vao);

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.coords);
        gl.disableVertexAttribArray(locations.tcoords);
        gl.disableVertexAttribArray(locations.textrUnit);
    }

    delete() {
        this.map.unlink(this.id);
    }

    showShot(p1, p2) {
        let [x1, y1] = p1, [x2, y2] = p2, index = this.vertices.length;

        this.vertices.push(x1, y1, 0, x2, y2, 0);

        ext.bindVertexArrayOES(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.coords);
        gl.disableVertexAttribArray(locations.tcoords);
        gl.disableVertexAttribArray(locations.textrUnit);

        return index;
    }

    removeShot(index) {
        this.vertices.splice(index, 6, undefined, undefined, undefined, undefined, undefined, undefined);

        ext.bindVertexArrayOES(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 12, 0);
        gl.enableVertexAttribArray(locations.coords);
        gl.disableVertexAttribArray(locations.tcoords);
        gl.disableVertexAttribArray(locations.textrUnit);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    render() {

        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);
        gl.uniform4fv(locations.color, [0, 0, 0, 1.0]);
        gl.uniform1i(locations.lines, 1);
        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.useProgram(program);

        gl.drawArrays(gl.LINES, 0, this.vertices.length / 3);
        gl.uniform1i(locations.lines, 0);
        gl.uniform4fv(locations.color, [0, 0, 0, 0.0]);
    }
}

export class _MixedStaticClusterClient_ {

    hasCluster = true;
    clusterType = _MixedStaticCluster_;
    id = genObjectId();

    constructor(initialX = 0, initialY = 0, initialRotation = 0) {
        this.trans = {
            offsetX: initialX,
            offsetY: initialY,
            rotation: initialRotation
        }
    }

    translate(x, y, rotation = false, translateVertices) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }
        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }

    moveToTop() {
        this.cluster.unlink(this.clusterIndex);
        this.clusterIndex = this.cluster.link(this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

export class _StaticClusterClient_ {

    hasCluster = true;
    clusterType = _StaticCluster_;
    id = genObjectId();

    constructor(initialX = 0, initialY = 0, initialRotation = 0) {
        this.trans = {
            offsetX: initialX,
            offsetY: initialY,
            rotation: initialRotation
        }
    }

    translate(x, y, rotation = false, translateVertices) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }
        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }

    moveToTop() {
        this.cluster.unlink(this.clusterIndex);
        this.clusterIndex = this.cluster.link(this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

export class _InstancedClusterClient_ {

    hasCluster = true;
    clusterType = _InstancedCluster_;
    id = genObjectId();

    constructor(initialX = 0, initialY = 0, initialRotation = 0) {
        this.trans = {
            offsetX: initialX,
            offsetY: initialY,
            rotation: initialRotation
        }
    }

    translate(x, y, rotation = false, translateVertices) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }
        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, x, y, this.trans.rotation);
    }

    moveToTop() {
        this.cluster.unlink(this.clusterIndex);
        this.clusterIndex = this.cluster.link(-this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

export class _BulletClusterClient_ {

    hasCluster = true;
    name = "bullet";
    id = genObjectId();
    exclude = true;

    constructor(initialX = 0, initialY = 0, initialRotation = 0, translationX = 0, translationY = 0, damage = 1, owner) {
        this.trans = {
            offsetX: initialX,
            offsetY: initialY,
            rotation: (initialRotation * Math.PI / 180)
        }
        this.rate = {
            x: translationX,
            y: translationY
        };
        this.damage = damage;
        this.owner = owner;
    }

    postLink() {
        this.cluster = this.map._bulletMatrix;
        this.clusterIndex = this.cluster.link(-this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation, this);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
    }

    delete() {
        this.map.unlink(this.id);
    }
}

export class DownwardLight extends _Object_ {
    constructor(initialX, initialY, initialRotation, color) {
        super([], function() {

            this.vertices = [-35, 35, 1, 0, 0, 35, 35, 1, 1, 0, -35, -35, 1, 0, 1, 35, 35, 1, 1, 0, -35, -35, 1, 0, 1, 35, -35, 1, 1, 1];

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
 
            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.offset);
            gl.disableVertexAttribArray(locations.textrUnit);

            gl.useProgram(program);
        }, function() {

            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            gl.uniform1f(locations.rotation, this.trans.rotation);

            gl.uniform1f(locations.darkness, 1);
            gl.uniform4fv(locations.lightColor, this._color);
            gl.blendFuncSeparate(gl.DST_COLOR, gl.DST_ALPHA, gl.ONE, gl.ONE);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.useProgram(program);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);

            gl.uniform1f(locations.darkness, this.map.darkness);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.uniform4fv(locations.lightColor, [0, 0, 0, 0]);
        }, 70, 70, initialX, initialY, initialRotation);
        this.texture = textures.objects.downwardlight;
        this.name = "downward light";
        this.topLayer = true;
        this.color = color || [0, 0, 0, 0];
    }

    set color(code) {
        this._color = fromRGB(code);
    }
}

export class Bullet extends _BulletClusterClient_ {

    width = 1.8;
    height = 0.8;

    constructor(initialX, initialY, initialRotation, translationX, translationY, damage, owner) {
        super(initialX, initialY, initialRotation, translationX, translationY, damage, owner);
    }
}

export class Grass extends _InstancedClusterClient_ {

    static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

    width = 2;
    height = 2;
    name = "grass";
    clusterName = "grass";
    texture = textures.objects.grass1;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class BulletShell extends _InstancedClusterClient_ {

    static _defaultVertices = [-0.9, 0.5, 1, 0, 0, 0.9, 0.5, 1, 0.5625, 0, -0.9, -0.5, 1, 0, 0.625, 0.9, 0.5, 1, 0.5625, 0, -0.9, -0.5, 1, 0, 0.625, 0.9, -0.5, 1, 0.5625, 0.625];

    width = 1.8;
    height = 1;
    name = "bullet shell";
    clusterName = "bullet shell";
    texture = textures.objects.bulletshell;
    exclude = true;
    bottomLayer = true;
    preserveCluster = true;

    constructor(initialX, initialY, directionX, directionY) {
        super(initialX, initialY, random(360));

        this.directionX = directionX;
        this.directionY = directionY;
        this.animation = new LoopAnimation(function() {
            this.translate(directionX /= 2, directionY /= 2, this.trans.rotation - (this.trans.rotation * 2), true);
        }, this, 0.01);
        this.timeout = new MultiFrameLinearAnimation([function() {
            this.delete();
        }], this, [0.2]);
    }

    preRender() {
        this.animation.run();
        this.timeout.start();
        this.timeout.run();
    }
}

export class Plus100 extends _InstancedClusterClient_ {

    static _defaultVertices = [-4.15, 1.1, 1, 0, 0, 4.15, 1.1, 1, 0.6484375, 0, -4.15, -1.1, 1, 0, 0.6875, 4.15, 1.1, 1, 0.6484375, 0, -4.15, -1.1, 1, 0, 0.6875, 4.15, -1.1, 1, 0.6484375, 0.6875];

    width = 8.3;
    height = 2.2;
    name = "plus 100";
    clusterName = "plus 100";
    texture = textures.misc.plus100;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);

        this.animation = new LoopAnimation(function() {
            this.translate(0, 0.2, 0, true);
            if (this.trans.offsetY > initialY + 10) this.delete();
        }, this, 0.01);
    }

    preRender() {
        this.animation.run();
    }
}

export class Grass2 extends _InstancedClusterClient_ {

    static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

    width = 2;
    height = 2;
    name = "grass2";
    clusterName = "grass2";
    texture = textures.objects.grass2;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class Rocks1 extends _InstancedClusterClient_ {

    static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

    width = 2;
    height = 2;
    clusterName = "three rocks";
    texture = textures.objects.rocks1;
    name = "three rocks";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation || random(360));
    }
}

export class Rocks2 extends _InstancedClusterClient_ {

    static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

    width = 2;
    height = 2;
    clusterName = "two rocks";
    texture = textures.objects.rocks2;
    name = "two rocks";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation || random(360));
    }
}

/* Misc props */

export class Book1 extends _InstancedClusterClient_ {

    static _defaultVertices = [-3.0100000000000002, 4.16, 1, 0, 0, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, -4.16, 1, 0.940625, 0.65];

    width = 6.0200000000000005;
    height = 8.32;
    name = "black book";
    clusterName = "black book";
    texture = textures.objects.book1;
    moveable = true;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class Book2 extends _InstancedClusterClient_ {

    static _defaultVertices = [-3.0100000000000002, 4.16, 1, 0, 0, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, -4.16, 1, 0.940625, 0.65];

    width = 6.0200000000000005;
    height = 8.32;
    name = "white book";
    clusterName = "white book";
    texture = textures.objects.book2;
    moveable = true;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadRail extends _InstancedClusterClient_ {

    static _defaultVertices = [-13.4, 5.9, 1, 0, 0, -10, 5.9, 1, 0.033203125, 0, -13.4, -5.5, 1, 0, 0.111328125, -10, 5.9, 1, 0.033203125, 0, -13.4, -5.5, 1, 0, 0.111328125, -10, -5.5, 1, 0.033203125, 0.111328125, 9.6, 5.9, 1, 0.224609375, 0, 12.999999999999998, 5.9, 1, 0.2578125, 0, 9.6, -5.5, 1, 0.224609375, 0.111328125, 12.999999999999998, 5.9, 1, 0.2578125, 0, 9.6, -5.5, 1, 0.224609375, 0.111328125, 12.999999999999998, -5.5, 1, 0.2578125, 0.111328125, -10.4, 4.9, 1, 0.029296875, 0.009765625, 9.999999999999998, 4.9, 1, 0.228515625, 0.009765625, -10.4, -3.7, 1, 0.029296875, 0.09375, 9.999999999999998, 4.9, 1, 0.228515625, 0.009765625, -10.4, -3.7, 1, 0.029296875, 0.09375, 9.999999999999998, -3.7, 1, 0.228515625, 0.09375];

    width = 26.4;
    height = 11.4;
    clusterName = "road rail";
    texture = textures.objects.fences;
    name = "road rail";
    obstacle = true;
    segments = [
        [-13.2, -5.7, 3.4, 11.4],
        [9.8, -5.7, 3.4, 11.4],
        [-10.2, -4.7, 20.4, 8.6]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadRailVertical extends _StaticClusterClient_ {

    static _defaultVertices = [-1.7, 12.7, 1, 0, 0, 1.7, 12.7, 1, 0.53125, 0, -1.7, -12.7, 1, 0, 0.49609375, 1.7, 12.7, 1, 0.53125, 0, -1.7, -12.7, 1, 0, 0.49609375, 1.7, -12.7, 1, 0.53125, 0.49609375];

    width = 3.4;
    height = 25.4;
    name = "road rail vertical";
    clusterName = "road rail vertical";
    texture = textures.objects.roadrailvertical;
    obstacle = true;
    segments = [
        [-1.7, -12.7, 3.4, 25.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class StreetLight extends _StaticClusterClient_ {

    static _defaultVertices = [-15.5, 24.5, 1, 0, 0, 15.5, 24.5, 1, 0.60546875, 0, -15.5, -24.5, 1, 0, 0.95703125, 15.5, 24.5, 1, 0.60546875, 0, -15.5, -24.5, 1, 0, 0.95703125, 15.5, -24.5, 1, 0.60546875, 0.95703125];

    width = 31;
    height = 49;
    name = "street light";
    clusterName = "street light";
    texture = textures.objects.streetlight;
    obstacle = true;
    segments = [
        [-0.3, -24.3, 1.2, 8.6]
    ];
    topLayer = true;
    on = false;

    constructor(initialX, initialY, initialRotation, color) {
        super(initialX, initialY, initialRotation);
        this._color = color || undefined;
        this.lights = [new DownwardLight(this.trans.offsetX - 13, this.trans.offsetY - 11.5, 0, this._color), new DownwardLight(this.trans.offsetX + 13, this.trans.offsetY - 11.5, 0, this._color)];
    }

    set color(c) {
        this._color = c;
        for (let i of this.lights) {
            i.color = this._color;
        }
    }

    postLink() {
        for (let i of this.lights) {
            if (!this.on) i.hidden = true;
            i.managedMovement = true;
            i.exclude = true;
            this.map.link(i);
        }
    }

    clean() {
        for (let i of this.lights) {
            i.delete();
        }
    }

    toggle() {
        for (let i of this.lights) {
            i.hidden = this.on;
        }

        this.on = (this.on) ? false : true;
    }

    preRender() {
        if (this.map.lighting && !this.on) {
            this.toggle();
        } else if (!this.map.lighting && this.on) {
            this.toggle();
        }
    }

    translate(x, y, rotation = false, translateVertices) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }

        for (let i of this.lights) {
            i.translate(x, y);
        }

        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }
}

export class Bench extends _StaticClusterClient_ {

    static _defaultVertices = [-12.2, 7.7, 1, 0, 0, 12.2, 7.7, 1, 0.953125, 0, -12.2, -7.7, 1, 0, 0.6015625, 12.2, 7.7, 1, 0.953125, 0, -12.2, -7.7, 1, 0, 0.6015625, 12.2, -7.7, 1, 0.953125, 0.6015625];

    width = 24.4;
    height = 15.4;
    name = "bench";
    clusterName = "bench";
    texture = textures.objects.bench;
    obstacle = true;
    segments = [
        [-12.2, -7.7, 24.4, 13.4]
    ];
    interactable = true;
    minDistance = 12;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }

    action() {
        $CURRENT_MAP.noclip = true;
        $CURRENT_MAP.translate(this.trans.offsetX, this.trans.offsetY);
        $CURRENT_MAP.noclip = false;
        $AVATAR.trans.rotation = 180 * Math.PI / 180;
    }
}

export class Tile extends _StaticClusterClient_ {

    static _defaultVertices = [-4.2, 4.2, 1, 0, 0, 4.2, 4.2, 1, 0.65625, 0, -4.2, -4.2, 1, 0, 0.65625, 4.2, 4.2, 1, 0.65625, 0, -4.2, -4.2, 1, 0, 0.65625, 4.2, -4.2, 1, 0.65625, 0.65625];

    width = 8.4;
    height = 8.4;
    clusterName = "tile";
    texture = textures.objects.tile;
    bottomLayer = true;
    name = "tile";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class LightSwitch extends _StaticClusterClient_ {

    static _defaultVertices = [-1.6, 2.4, 1, 0, 0, 1.6, 2.4, 1, 0.5, 0, -1.6, -2.4, 1, 0, 0.75, 1.6, 2.4, 1, 0.5, 0, -1.6, -2.4, 1, 0, 0.75, 1.6, -2.4, 1, 0.5, 0.75];

    width = 3.2;
    height = 4.8;
    clusterName = "light switch";
    texture = textures.objects.lightswitch;
    name = "light switch";
    interactable = true;
    minDistance = 18;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }

    action() {
        if (this.map.darkness <= 1) {
            this.map.lighting = true;
            this.map.darkness = 5;
            this.on = false;
            return;
        }
        this.map.lighting = false;
        this.map.darkness = 1;
    }
}

export class Chair extends _StaticClusterClient_ {

    static _defaultVertices = [-5.2, 7.5, 1, 0, 0, 5.2, 7.5, 1, 0.8125, 0, -5.2, -7.5, 1, 0, 0.5859375, 5.2, 7.5, 1, 0.8125, 0, -5.2, -7.5, 1, 0, 0.5859375, 5.2, -7.5, 1, 0.8125, 0.5859375];

    width = 10.4;
    height = 15;
    name = "chair";
    clusterName = "chair";
    texture = textures.objects.chair;
    obstacle = true;
    interactable = true;
    minDistance = 12;
    segments = [
        [-5, -5.7, 10, 13]
    ];

    action() {
        $CURRENT_MAP.noclip = true;
        $CURRENT_MAP.translate(this.trans.offsetX, this.trans.offsetY + 1);
        $CURRENT_MAP.noclip = false;
        $AVATAR.trans.rotation = 180 * Math.PI / 180;
    }

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class SmallPlant extends _StaticClusterClient_ {

    static _defaultVertices = [-2.7, 0.5, 1, 0, 0.29296875, 2.7, 0.5, 1, 0.421875, 0.29296875, -2.7, -7.9, 1, 0, 0.62109375, 2.7, 0.5, 1, 0.421875, 0.29296875, -2.7, -7.9, 1, 0, 0.62109375, 2.7, -7.9, 1, 0.421875, 0.62109375, -2.7, 8.100000000000001, 1, 0, -0.00390625, 2.7, 8.100000000000001, 1, 0.421875, -0.00390625, -2.7, 0.09999999999999964, 1, 0, 0.30859375, 2.7, 8.100000000000001, 1, 0.421875, -0.00390625, -2.7, 0.09999999999999964, 1, 0, 0.30859375, 2.7, 0.09999999999999964, 1, 0.421875, 0.30859375];

    width = 5.4;
    height = 16;
    texture = textures.objects.smallplant;
    name = "small plant";
    clusterName = "small plant";
    obstacle = true;
    segments = [
        [-2.7, -0.5, 5.4, 8.4]
    ];
    topLayer = true;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadSign extends _StaticClusterClient_ {

    static _defaultVertices = [-4.2, 15.6, 1, 0.2578125, 0, 3.8, 15.6, 1, 0.3359375, 0, -4.2, 4.799999999999999, 1, 0.2578125, 0.10546875, 3.8, 15.6, 1, 0.3359375, 0, -4.2, 4.799999999999999, 1, 0.2578125, 0.10546875, 3.8, 4.799999999999999, 1, 0.3359375, 0.10546875, -1, 5.200000000000001, 1, 0.2890625, 0.1015625, 0.5999999999999996, 5.200000000000001, 1, 0.3046875, 0.1015625, -1, -15.2, 1, 0.2890625, 0.30078125, 0.5999999999999996, 5.200000000000001, 1, 0.3046875, 0.1015625, -1, -15.2, 1, 0.2890625, 0.30078125, 0.5999999999999996, -15.2, 1, 0.3046875, 0.30078125];

    width = 8;
    height = 30.8;
    name = "road sign";
    clusterName = "road sign";
    texture = textures.objects.fences;
    topLayer = true;
    obstacle = true;
    segments = [
        [-0.8, 10, 1.6, 5.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class Laptop extends _StaticClusterClient_ {

    static _defaultVertices = [-4.36, 4.86, 1, 0, 0, 4.36, 4.86, 1, 0.68125, 0, -4.36, -4.86, 1, 0, 0.759375, 4.36, 4.86, 1, 0.68125, 0, -4.36, -4.86, 1, 0, 0.759375, 4.36, -4.86, 1, 0.68125, 0.759375];

    width = 8.72;
    clusterName = "laptop";
    texture = textures.objects.laptop;
    height = 9.72;
    moveable = true;
    name = "laptop";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class UrbanFence extends _MixedStaticClusterClient_ {

    static _defaultVertices = [-24.2, 14.2, 1, 0, 0.30078125, 0, 24.2, 14.2, 1, 0.47265625, 0.30078125, 0, -24.2, -14.2, 1, 0, 0.578125, 0, 24.2, 14.2, 1, 0.47265625, 0.30078125, 0, -24.2, -14.2, 1, 0, 0.578125, 0, 24.2, -14.2, 1, 0.47265625, 0.578125, 0];

    width = 48.4;
    height = 28.4;
    name = "urban fence";
    obstacle = true;
    clusterName = "urban fence";
    grouping = 1;
    texture = textures.objects.fences;
    segments = [
        [-24.2, -14.2, 48.4, 28.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class UrbanFenceVertical extends _MixedStaticClusterClient_ {

    static _defaultVertices = [-2.2, 28.2, 1, 0.47265625, 0.30078125, 0, 2.2, 28.2, 1, 0.515625, 0.30078125, 0, -2.2, -28.2, 1, 0.47265625, 0.8515625, 0, 2.2, 28.2, 1, 0.515625, 0.30078125, 0, -2.2, -28.2, 1, 0.47265625, 0.8515625, 0, 2.2, -28.2, 1, 0.515625, 0.8515625, 0];

    width = 4.4;
    height = 56.4;
    name = "urban fence vertical";
    clusterName = "urban fence";
    grouping = 1;
    texture = textures.objects.fences;
    obstacle = true;
    segments = [
        [-2.2, -28.2, 4.4, 56.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class UrbanFenceHalf extends _MixedStaticClusterClient_ {

    static _defaultVertices = [-12.2, 14.2, 1, 0.3359375, 0, 0, 12.2, 14.2, 1, 0.57421875, 0, 0, -12.2, -14.2, 1, 0.3359375, 0.27734375, 0, 12.2, 14.2, 1, 0.57421875, 0, 0, -12.2, -14.2, 1, 0.3359375, 0.27734375, 0, 12.2, -14.2, 1, 0.57421875, 0.27734375, 0];

    width = 24.4;
    height = 28.4;
    name = "urban fence half";
    clusterName = "urban fence";
    grouping = 1;
    texture = textures.objects.urbanfencehalf;
    obstacle = true;
    segments = [
        [-12.2, -14.2, 24.4, 28.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class PicnicTable extends _StaticClusterClient_ {

    static _defaultVertices = [-14.2, 6.300000000000001, 1, 0, 0.09375, -5.799999999999999, 6.300000000000001, 1, 0.1640625, 0.09375, -14.2, -12.1, 1, 0, 0.8125, -5.799999999999999, 6.300000000000001, 1, 0.1640625, 0.09375, -14.2, -12.1, 1, 0, 0.8125, -5.799999999999999, -12.1, 1, 0.1640625, 0.8125, -6.199999999999999, 8.7, 1, 0.15625, 0, 6.199999999999999, 8.7, 1, 0.3984375, 0, -6.199999999999999, -11.7, 1, 0.15625, 0.796875, 6.199999999999999, 8.7, 1, 0.3984375, 0, -6.199999999999999, -11.7, 1, 0.15625, 0.796875, 6.199999999999999, -11.7, 1, 0.3984375, 0.796875, 5.800000000000001, 6.300000000000001, 1, 0.390625, 0.09375, 14.2, 6.300000000000001, 1, 0.5546875, 0.09375, 5.800000000000001, -12.1, 1, 0.390625, 0.8125, 14.2, 6.300000000000001, 1, 0.5546875, 0.09375, 5.800000000000001, -12.1, 1, 0.390625, 0.8125, 14.2, -12.1, 1, 0.5546875, 0.8125, -8.2, -11.299999999999999, 1, 0.1171875, 0.78125, 8.2, -11.299999999999999, 1, 0.4375, 0.78125, -8.2, -15.7, 1, 0.1171875, 0.953125, 8.2, -11.299999999999999, 1, 0.4375, 0.78125, -8.2, -15.7, 1, 0.1171875, 0.953125, 8.2, -15.7, 1, 0.4375, 0.953125];

    width = 28.4;
    height = 17.4;
    name = "picnic table";
    obstacle = true;
    clusterName = "picnic table";
    texture = textures.objects.picnictable;
    segments = [
        [-14.2, -12.1, 8.4, 18.4],
        [-6.2, -11.7, 12.4, 20.4],
        [5.8, -12.1, 8.4, 18.4]
    ];
    interactable = true;
    minDistance = 20;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }

    action() {
        $CURRENT_MAP.noclip = true;

        if (this.trans.offsetX > $AVATAR.trans.offsetX) {
            $CURRENT_MAP.translate(this.trans.offsetX - 11, this.trans.offsetY - 2);
            $AVATAR.trans.rotation = -90 * Math.PI / 180;
        } else {
            $CURRENT_MAP.translate(this.trans.offsetX + 11, this.trans.offsetY - 2);
            $AVATAR.trans.rotation = 90 * Math.PI / 180;
        }

        $CURRENT_MAP.noclip = false;
    }
}

export class Road extends _MixedStaticClusterClient_ {

    static _defaultVertices = [-25, 14.1, 1, 0, 0, 0, 25, 14.1, 1, 0.48828125, 0, 0, -25, -14.1, 1, 0, 0.275390625, 0, 25, 14.1, 1, 0.48828125, 0, 0, -25, -14.1, 1, 0, 0.275390625, 0, 25, -14.1, 1, 0.48828125, 0.275390625, 0];

    width = 50;
    height = 28.2;
    name = "road";
    clusterName = "road";
    bottomLayer = true;
    texture = textures.objects.roads;
    grouping = 0;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadDouble extends _MixedStaticClusterClient_ {

    static _defaultVertices = [-25, 14.1, 1, 0, 0, 1, 25, 14.1, 1, 0.9765625, 0, 1, -25, -14.1, 1, 0, 0.55078125, 1, 25, 14.1, 1, 0.9765625, 0, 1, -25, -14.1, 1, 0, 0.55078125, 1, 25, -14.1, 1, 0.9765625, 0.55078125, 1];

    width = 50;
    height = 28.2;
    name = "road double";
    clusterName = "road";
    bottomLayer = true;
    texture = textures.objects.roads;
    grouping = 0;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadCorner extends _StaticClusterClient_ {

    static _defaultVertices = [-14.1, 14.1, 1, 0, 0.275390625, 0, 14.1, 14.1, 1, 0.275390625, 0.275390625, 0, -14.1, -14.1, 1, 0, 0.55078125, 0, 14.1, 14.1, 1, 0.275390625, 0.275390625, 0, -14.1, -14.1, 1, 0, 0.55078125, 0, 14.1, -14.1, 1, 0.275390625, 0.55078125, 0];

    width = 28.2;
    height = 28.2;
    name = "road corner";
    bottomLayer = true;
    clusterName = "road";
    texture = textures.objects.roads;
    grouping = 0;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadTriCorner extends _StaticClusterClient_ {

    static _defaultVertices = [-14.1, 14.1, 1, 0.275390625, 0.275390625, 0, 14.1, 14.1, 1, 0.55078125, 0.275390625, 0, -14.1, -14.1, 1, 0.275390625, 0.55078125, 0, 14.1, 14.1, 1, 0.55078125, 0.275390625, 0, -14.1, -14.1, 1, 0.275390625, 0.55078125, 0, 14.1, -14.1, 1, 0.55078125, 0.55078125, 0];

    width = 28.2;
    height = 28.2;
    name = "road tri corner";
    clusterName = "road";
    grouping = 0;
    bottomLayer = true;
    texture = textures.objects.roads;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class RoadQuadCorner extends _StaticClusterClient_ {

    static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, -14.1, 1, 0.55078125, 0.55078125, 4];

    width = 28.2;
    height = 28.2;
    clusterName = "road";
    texture = textures.objects.roads;
    grouping = 0;
    bottomLayer = true;
    name = "road quad corner";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class Door extends _StaticClusterClient_ {

    static _defaultVertices = [-7.3, 10.2, 1, 0, 0, 7.3, 10.2, 1, 0.5703125, 0, -7.3, -10.2, 1, 0, 0.796875, 7.3, 10.2, 1, 0.5703125, 0, -7.3, -10.2, 1, 0, 0.796875, 7.3, -10.2, 1, 0.5703125, 0.796875];
    width = 14.6;
    height = 20.4;
    clusterName = "door";
    texture = textures.objects.door;
    name = "door";
    obstacle = true;
    segments = [
        [-7.3, -0.2, 14.6, 9.4]
    ];
    topLayer = false;
    exclude = true;
    interactable = true;
    minDistance = 17;

    constructor(label, room = -1, initialX, initialY, initialRotation, outPoint, buildingExit) {
        super(initialX, initialY, initialRotation);
        if (label) {
            this.label = new Text(label.substring(0, 10), 50, false, this.trans.offsetX, this.trans.offsetY + 3);
        }
        this.text = label || false;
        this.roomIndex = room;
        this.room = room;
        this.buildingExit = buildingExit;
        this.outPoint = outPoint;
    }

    postLink() {
        if (this.label) {
            this.label.exclude = true;
            this.label.managedMovement = true;
            this.map.link(this.label);
        }
    }

    action() {
        if (typeof this.room === "number") this.room = (this.room < 0) ? this.map.PARENT_MAP : this.map.SUB_MAPS[this.room];

        if (this.room) {
            $CURRENT_MAP.move = false;
            requestTransition((function() {
                $CURRENT_MAP = this.room;
                $AVATAR.rotate(180);
                this.map.move = true;

                if ($AVATAR.state.pickup.current) {
                    $AVATAR.state.pickup.current.delete();
                    $CURRENT_MAP.link($AVATAR.state.pickup.current);
                }

                if (this.outPoint) {
                    let [x, y] = this.outPoint;
                    if (this.buildingExit && this.map.building) {
                        let b = this.map.building;
                        $CURRENT_MAP.noclip = true;
                        $CURRENT_MAP.translate(-$CURRENT_MAP.centerX + (b.trans.offsetX + $CURRENT_MAP.centerX + x), -$CURRENT_MAP.centerY + (b.trans.offsetY + $CURRENT_MAP.centerY + y));
                        $CURRENT_MAP.noclip = false;
                    } else {
                        $CURRENT_MAP.noclip = true;
                        $CURRENT_MAP.translate((-$CURRENT_MAP.centerX) + x, (-$CURRENT_MAP.centerY) + y);
                        $CURRENT_MAP.noclip = false;
                    }
                }
            }).bind(this));
        }
    }

    clean() {
        if (this.label) this.label.delete();
    }

    translate(x, y, rotation = false, translateVertices) {
        if (this.label) this.label.translate(x, y);

        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }
        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }
}

export class Table extends _StaticClusterClient_ {

    static _defaultVertices = [-14.2, 9.3, 1, 0, 0, 14.2, 9.3, 1, 0.5546875, 0, -14.2, -7.1000000000000005, 1, 0, 0.640625, 14.2, 9.3, 1, 0.5546875, 0, -14.2, -7.1000000000000005, 1, 0, 0.640625, 14.2, -7.1000000000000005, 1, 0.5546875, 0.640625, -13.399999999999999, -6.700000000000001, 1, 0.015625, 0.625, -11, -6.700000000000001, 1, 0.0625, 0.625, -13.399999999999999, -9.3, 1, 0.015625, 0.7265625, -11, -6.700000000000001, 1, 0.0625, 0.625, -13.399999999999999, -9.3, 1, 0.015625, 0.7265625, -11, -9.3, 1, 0.0625, 0.7265625, 11, -6.700000000000001, 1, 0.4921875, 0.625, 13.400000000000002, -6.700000000000001, 1, 0.5390625, 0.625, 11, -9.3, 1, 0.4921875, 0.7265625, 13.400000000000002, -6.700000000000001, 1, 0.5390625, 0.625, 11, -9.3, 1, 0.4921875, 0.7265625, 13.400000000000002, -9.3, 1, 0.5390625, 0.7265625];

    width = 28.4;
    height = 18.6;
    name = "table";
    clusterName = "table";
    texture = textures.objects.table;
    obstacle = true;
    segments = [
        [-14.2, -7.1, 28.4, 16.4]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

/* Buildings */

export class _Building_ extends _StaticClusterClient_ {
    constructor(initialX, initialY, initialRotation, doors = [], rooms, doorOffset = 0, setup) {
        super(initialX, initialY, initialRotation);

        this.setup = setup;
        this.doors = [];
        this.type = "building";  
        this.bottomLayer = true;
        this.subLayer = 1;
        this.rooms = rooms || [new _Map_(150, 80, false).init([
            [0 + doorOffset, 35]
        ], doorOffset)];

        for (let i of doors) {
            let t = new Trigger(this.trans.offsetX + i[0], this.trans.offsetY + i[1], (function() {

                $CURRENT_MAP.move = false;

                requestTransition((function() {
                    $CURRENT_MAP = this.rooms[i[2]];
                    $AVATAR.rotate(180);
                    this.map.move = true;

                    if ($AVATAR.state.pickup.current) {
                        $AVATAR.state.pickup.current.delete();
                        $CURRENT_MAP.link($AVATAR.state.pickup.current);
                    }

                    if (i[3]) {
                        let [x, y] = i[3];
                        $CURRENT_MAP.noclip = true;
                        $CURRENT_MAP.translate((-$CURRENT_MAP.centerX) + x, (-$CURRENT_MAP.centerY) + y);
                        $CURRENT_MAP.noclip = false;
                    }
                }).bind(this));
            }).bind(this), true);
            t.outPoint = i[3];

            this.doors.push(t);
        }
    }

    postLink() {
        for (let d of this.doors) {
            this.map.link(d);
        }

        for (let i of this.rooms) {
            i.building = this;
            this.map.addSubMap(i);
        }

        if (this.setup) this.setup();
    }

    clean() {
        for (let d of this.doors) {
            d.delete();
        }
    }

    translate(x, y, rotation = false, translateVertices) {
        for (let i of this.doors) {
            i.translate(x, y);
        }

        this.trans.offsetX += x;
        this.trans.offsetY += y;
        if (rotation) {
            this.trans.rotation = rotation;
        }
        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, this.constructor._defaultVertices, -this.cluster.trans.offsetX + this.trans.offsetX, -this.cluster.trans.offsetY + this.trans.offsetY, this.trans.rotation);
    }
}

export class House1 extends _Building_ {

    static _defaultVertices = [-73.7, 93.2, 1, 0, 0, 73.7, 93.2, 1, 0.7197265625, 0, -73.7, -93.2, 1, 0, 0.91015625, 73.7, 93.2, 1, 0.7197265625, 0, -73.7, -93.2, 1, 0, 0.91015625, 73.7, -93.2, 1, 0.7197265625, 0.91015625];

    width = 147.4;
    height = 186.4;
    name = "house 1";
    clusterName = "house 1";
    texture = textures.objects.house1;
    obstacle = true;
    segments = [
        [12.5, -49, 50, 24],
        [-71.5, -41, 34, 34],
        [-73.5, 23, 111, 70],
        [2.5, -27, 70, 30],
        [2.5, -51, 10, 30],
        [62.5, -51, 10, 30],
        [2.5, 21, 70, 64],
        [2.5, 1, 6, 64],
        [66.5, 1, 6, 64],
        [-71.5, -35, 78, 120]
    ];

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation, [
            [-26.1, -33, 0, [0, 44.38]],
            [23, -57, 1],
            [-30, -65, 0]
        ], [new _Map_(150, 100, false).init(), new _Map_(150, 80, false).init(), new _Map_(150, 80, false).init()], undefined);
 
      let floor = new Floor(0,0,150,100,0);
      floor.exclude = true;
      this.rooms[0].link(floor);
    }
}

/* Weapons and Firearms */

export class _Pickup_ extends _InstancedClusterClient_ {
    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation ?? random(360));

        this.ring = new PickupRing(this.trans.offsetX, this.trans.offsetY);
    }

    pickup = true;
    interactable = true;
    minDistance = 5;
    moveable = true;

    postLink() {
        this.map.link(this.ring);
    }

    clean() {
        this.ring.delete();
    }

    action() {
        $AVATAR.addItem(this);
    }

    translate(x, y, rotation = false, translateVertices) {

        this.trans.offsetX += x;
        this.trans.offsetY += y;
        this.ring.translate(this.trans.offsetX - this.ring.trans.offsetX, this.trans.offsetY - this.ring.trans.offsetY, false, translateVertices);

        if (rotation) {
            this.trans.rotation = rotation;
        }

        if (translateVertices) this.cluster.translateVertices(this.clusterIndex, x, y, this.trans.rotation);
    }
}

export class _Gun_ extends _Pickup_ {

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
 
    loaded = true;
    type = "gun";
}

export class _Blade_ extends _Pickup_ {

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }

    type = "blade";
}

export class KitchenKnife extends _Blade_ {

    static _defaultVertices = [-1.24, 6.57, 1, 0, 0, 1.24, 6.57, 1, 0.775, 0, -1.24, -6.57, 1, 0, 0.51328125, 1.24, 6.57, 1, 0.775, 0, -1.24, -6.57, 1, 0, 0.51328125, 1.24, -6.57, 1, 0.775, 0.51328125];

    width = 2.48;
    height = 13.14;
    clusterName = "kitchen knife";
    texture = textures.objects.kitchenknife;
    name = "kitchen knife";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class AssassinsKnife extends _Blade_ {

    static _defaultVertices = [-1.73, 6.7700000000000005, 1, 0, 0, 1.73, 6.7700000000000005, 1, 0.540625, 0, -1.73, -6.7700000000000005, 1, 0, 0.52890625, 1.73, 6.7700000000000005, 1, 0.540625, 0, -1.73, -6.7700000000000005, 1, 0, 0.52890625, 1.73, -6.7700000000000005, 1, 0.540625, 0.52890625];

    width = 3.46;
    height = 13.540000000000001;
    name = "assassin's knife";
    clusterName = "assassin's knife";
    texture = textures.objects.assassinsknife;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class CombatKnife extends _Blade_ {

    static _defaultVertices = [-3.4899999999999998, 4.630000000000001, 1, 0, 0, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, -4.630000000000001, 1, 0.5453125, 0.7234375];

    width = 6.9799999999999995;
    height = 9.260000000000002;
    clusterName = "combat knife";
    texture = textures.objects.combatknife;
    name = "combat knife";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class GLOCK_20 extends _Gun_ {

    static _properties = {
        fireRate: 1,
        bulletSpeed: 5,
        damage: 18,
        accuracy: 5,
        nozzelLength: 13,
        capacity: 8,
        reloadTime: 3,
        useTextures: [4,5]
    }

    static _defaultVertices = [-4.390000000000001, 3.0900000000000003, 1, 0, 0, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, -3.0900000000000003, 1, 0.6859375000000001, 0.965625];

    width = 8.780000000000001;
    height = 6.180000000000001;
    name = "glock 20";
    clusterName = "glock 20";
    texture = textures.objects.glock20;

    constructor(initialX, initialY, initialRotation, bullets) {
        super(initialX, initialY, initialRotation);
        this.bullets = bullets ?? 65;
    }
}

export class GP_K100 extends _Gun_ {

      static _properties = {
        fireRate: 3,
        bulletSpeed: 8,
        damage: 25,
        accuracy: 2,
        nozzelLength: 21,
        capacity: 12,
        reloadTime: 3,
        useTextures: [6,7]
      }

    static _defaultVertices = [-7.4, 3.0900000000000003, 1, 0, 0, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, -3.0900000000000003, 1, 0.578125, 0.965625];

    width = 14.8;
    height = 6.180000000000001;
    name = "gp k100";
    clusterName = "gp k100";
    texture = textures.objects.gpk100;

    constructor(initialX, initialY, initialRotation, bullets) {
        super(initialX, initialY, initialRotation);
        this.bullets = bullets ?? 58;
    }
}

export class NXR_44_MAG extends _Gun_ {

    static _defaultVertices = [-6.910000000000001, 3.44, 1, 0, 0, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, -3.44, 1, 0.5398437500000001, 0.5375];

    width = 13.820000000000002;
    height = 6.88;
    clusterName = "nxr 44 mag";
    texture = textures.objects.nxr44mag;
    name = "nxr 44 mag";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class KC_357 extends _Gun_ {

    static _defaultVertices = [-4.26, 2.8, 1, 0, 0, 4.26, 2.8, 1, 0.665625, 0, -4.26, -2.8, 1, 0, 0.875, 4.26, 2.8, 1, 0.665625, 0, -4.26, -2.8, 1, 0, 0.875, 4.26, -2.8, 1, 0.665625, 0.875];

    width = 8.52;
    height = 5.6;
    clusterName = "kc 357";
    texture = textures.objects.kc357;
    name = "kc 357";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class USP_45 extends _Gun_ {

    static _defaultVertices = [-8.15, 3.9300000000000006, 1, 0, 0, 8.15, 3.9300000000000006, 1, 0.63671875, 0, -8.15, -3.9300000000000006, 1, 0, 0.6140625000000001, 8.15, 3.9300000000000006, 1, 0.63671875, 0, -8.15, -3.9300000000000006, 1, 0, 0.6140625000000001, 8.15, -3.9300000000000006, 1, 0.63671875, 0.6140625000000001];

    width = 16.3;
    height = 7.860000000000001;
    clusterName = "usp 45";
    texture = textures.objects.usp45;
    name = "usp 45";

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);
    }
}

export class PickupRing extends _InstancedClusterClient_ {

    static _defaultVertices = [-4.28, 4.28, 1, 0, 0, 4.28, 4.28, 1, 0.66875, 0, -4.28, -4.28, 1, 0, 0.66875, 4.28, 4.28, 1, 0.66875, 0, -4.28, -4.28, 1, 0, 0.66875, 4.28, -4.28, 1, 0.66875, 0.66875];

    width = 8.56;
    height = 8.56;
    name = "pickup ring";
    clusterName = "pickup ring";
    exclude = true;
    texture = textures.misc.pickupring;
    managedMovement = true;

    constructor(initialX, initialY, initialRotation) {
        super(initialX, initialY, initialRotation);

        this.rot = 0;

        this.animation = new LoopAnimation(function() {
            if (this.rot === 360) {
                this.rot = 0;
            } else {
                this.translate(0, 0, this.rot += 2, true);
            }
        }, this, 0.1, 0.2);
    }

    preRender() {
        this.animation.run();
    }
}

export class Avatar {

    constructor(name = "Unnamed Human", initialX = 0, initialY = 0, initialRotation = 0) {
        this.character = name;
        this.nameObj = new Text(name, 25);
        this.nameObj.translate(initialX + 0, initialY + 10);
        this.vao = ext.createVertexArrayOES();

        ext.bindVertexArrayOES(this.vao);

        this.vertices = {
          body: [-7.0200000000000005,21.4,1,0,0,0,7.0200000000000005,21.4,1,0.5484375,0,0,-7.0200000000000005,-21.4,1,0,0.8359375,0,7.0200000000000005,21.4,1,0.5484375,0,0,-7.0200000000000005,-21.4,1,0,0.8359375,0,7.0200000000000005,-21.4,1,0.5484375,0.8359375,0],
          eyes: [-2.7,3.379999999999999,1,0.16875,0.351953125,1,2.7,3.379999999999999,1,0.3796875,0.351953125,1,-2.7,1.4800000000000004,1,0.16875,0.3890625,1,2.7,3.379999999999999,1,0.3796875,0.351953125,1,-2.7,1.4800000000000004,1,0.16875,0.3890625,1,2.7,1.4800000000000004,1,0.3796875,0.3890625,1]
        }

        this.trans = {
            offsetX: initialX || 0,
            offsetY: initialY || 0,
            rotation: (initialRotation * Math.PI / 180) || 0
        }
        this.width = 8.56;
        this.height = 8.56;
        this.obstacle = true;
        this.segments = [
            [-4.08, -4.08, 8.16, 8.16]
        ];
        this.bounds = {
            width: this.height,
            height: this.height
        };
        this.id = genObjectId();
        this.playerId = genObjectId(20);
        this.inventory = new Inventory();
        this.type = "avatar";
        this.name = "avatar";

        this.state = {
            hostile: false,
            baseSpeed: 1,
            runningSpeed: 2,
            speed: 1,
            armor: 0,
            invinsible: false,
            kills: 0,
            passive: false,
            aggressive: false,
            pickup: {
                hitbox: {
                    x: 0,
                    y: 0,
                    width: 5,
                    height: 5
                },
                offset: {
                    x: 0,
                    y: 0,
                    aRotation: 0,
                    bRotation: 0,
                },
                current: false,
                reachDistance: 2.5
            },
            vitals: {
                health: 100,
                hunger: 100,
                thirst: 100
            },
            goto: {
                x: 0,
                y: 0,
                target: {
                    x: 0,
                    y: 0
                },
                engaged: false,
                reserve: undefined
            },
            path: {
                current: [],
                index: 0,
                engaged: false,
                start: undefined,
                end: undefined,
                request: true
            },
            targetId: undefined,
            target: {
                current: undefined,
                id: [],
                engaged: false,
                shot: true
            },
            reload: {
                progress: 0,
            },
            follow: {
                target: undefined,
                rush: false,
                run: false,
                engageDistance: 100,
                slowdownDistance: 50,
                settleDistance: 30,
                disengageDistance: 200
            },
            attack: {
                engageDistance: 100,
                slowdownDistance: 50,
                settleDistance: 30,
                disengageDistance: 200,
                attackSpeed: 1,
                multiple: false,
                forget: false,
                invertTargets: false,
                reactionTime: 1
            },
            recording: {
                useRecording: false,
                data: undefined,
                frame: 0
            },
            baseRotation: 0,
            walking: false,
            armed: false,
            draw: false,
            fire: false,
            openCarry: false,
            equippedItems: {
                mainTool: undefined
            },
            shotCheckAnimation: new LoopAnimation(function() {
                this.state.target.shot = true;

                outer: for (let o in this.map.obstacles) {
                    let obstacle = this.map.obstacles[o];

                    if (obstacle.id === this.id || obstacle.id === this.state.target.current.id) continue;

                    for (let segment of obstacle.segments) {
                        let [ox, oy, ow, oh] = segment;

                        ox = ox + obstacle.trans.offsetX;
                        oy = oy + obstacle.trans.offsetY;

                        let p1 = this.trans.offsetX;
                        let p2 = this.trans.offsetY;
                        let p3 = this.state.target.current.trans.offsetX;
                        let p4 = this.state.target.current.trans.offsetY;

                        let result = lineIntersectsBox(p1, p2, p3, p4, ox, oy, ow, oh);

                        if (result) {
                            this.state.target.shot = !result;
                            break outer;
                        }
                    }
                }
            }, this, 0.5),
            reloadTimeout: new MultiFrameLinearAnimation([function() {
                this.state.reload.progress = 0;
                this.state.equippedItems.mainTool = true;
            }], this, [0]),
            pathRequestRateLimit: new MultiFrameLinearAnimation([function() {
                this.state.path.request = true;
            }], this, [1]),
            targetUpdateAnimation: new LoopAnimation(function() {
                const map = (this.map || $CURRENT_MAP);

                if (this.state.attack.multiple) {
                    let targetDistance = this.state.attack.engageDistance,
                        target, remember = [];

                    for (let i in map.avatars) {
                        if (map.avatars[i].id === this.id) continue;

                        let {
                            offsetX: targetX,
                            offsetY: targetY
                        } = map.avatars[i].trans;
                        let dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY);
                        if (((this.state.target.id.includes(map.avatars[i].state.targetId) && !this.state.attack.invertTargets) || (!this.state.target.id.includes(this.map.avatars[i].state.targetId) && this.state.attack.invertTargets))) {
                            if (dist < targetDistance && map.avatars[i] !== this) {
                                targetDistance = dist;
                                target = map.avatars[i];
                            }
                            if (dist < this.state.attack.disengageDistance && this.state.attack.forget && !remember.includes(map.avatars[i].state.targetId)) {
                                remember.push(map.avatars[i].state.targetId);
                            }
                        }
                    }

                    if (this.state.attack.forget) {
                        this.state.target.id = remember;
                    }

                    if (target && this.state.target.current !== target) {
                        this.state.target.current = target;
                        this.state.target.engaged = true;
                    }

                } else if (map.avatars[this.state.target.id[0]]) {
                    let {
                        offsetX: targetX,
                        offsetY: targetY
                    } = map.avatars[this.state.target.id[0]].trans;
                    let dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY);

                    if (!this.state.target.engaged && dist < this.state.attack.engageDistance && !this.state.attack.forget) this.killTarget([this.state.target.id[0]]);
                }

            }, this, 1),
            gotoAnimation: new LoopAnimation(function() {
                let tx = 0,
                    ty = 0;

                this.state.goto.x = this.state.goto.target.x - this.map.centerX;
                this.state.goto.y = this.state.goto.target.y - this.map.centerY;

                if (this.state.goto.x !== this.trans.offsetX) {
                    tx = (Math.abs(this.state.goto.x - this.trans.offsetX) < this.state.speed) ? (this.state.goto.x - this.trans.offsetX) : (this.trans.offsetX < this.state.goto.x) ? this.state.speed : -this.state.speed;
                }

                if (this.state.goto.y !== this.trans.offsetY) {
                    ty = (Math.abs(this.state.goto.y - this.trans.offsetY) < this.state.speed) ? (this.state.goto.y - this.trans.offsetY) : (this.trans.offsetY < this.state.goto.y) ? this.state.speed : -this.state.speed;
                }

                this.translate(tx, ty);

                if (this.state.goto.x === this.trans.offsetX && this.state.goto.y === this.trans.offsetY) {
                    this.disengageGoto();
                }
            }, this, 0.03),
            recordAnimation: new LoopAnimation(function() {
                if (this.state.recording.useRecording) {
                    let [x, y, r, w] = this.state.recording.data.slice(this.state.recording.frame, this.state.recording.frame + 4);
                    this.trans.offsetX = this.nameObj.trans.offsetX = x - this.map.centerX;
                    this.trans.offsetY = this.nameObj.trans.offsetY = y - this.map.centerY;
                    this.nameObj.trans.offsetY += 10;
                    this.rotate(r);
                    this.state.walking = w;

                    this.state.recording.frame += 4;

                    if (this.state.recording.frame === this.state.recording.data.length - 4) this.state.recording.frame = 0;
                }
            }, this, 0.01),
            fireAnimation: undefined,
            recoilAnimation: new MultiFrameLinearAnimation([function() {
                this.state.position.body.texture = this.state.equippedItems.mainTool.constructor._properties.useTextures[1];
            }, function() {
                this.state.position.body.texture = this.state.equippedItems.mainTool.constructor._properties.useTextures[0];
            }], this, [0.05, 0.05], function() {
                this.state.position.body.texture = this.state.equippedItems.mainTool.constructor._properties.useTextures[0];
            }, 0.5, true),
            walkingAnimation: new MultiFrameLoopAnimation([function() {
                this.state.position.body.texture = 2;
            }, function() {
                this.state.position.body.texture = 0;
            }, function() {
                this.state.position.body.texture = 3;
            }, function() {
                this.state.position.body.texture = 0;
            }], this, [0.08, 0.08, 0.08, 0.08], function() {
                this.state.position.body.texture = 0;
            }, 0.5),
            blinkingAnimation: new MultiFrameLoopAnimation([function() {
                this.state.position.eyes.texture = 0;
            }, function() {
                this.state.position.eyes.texture = 1;
            }, function() {
                this.state.position.eyes.texture = 0;
            }], this, [5 * Math.random(), 1, 1]),
            position: {
                body: {
                    texture: 0
                },
                eyes: {
                    texture: 0
                }
            }
        }

        ext.bindVertexArrayOES(this.vao);
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(locations.textrUnit, 1, gl.FLOAT, false, 24, 20);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
        gl.enableVertexAttribArray(locations.textrUnit);
        gl.disableVertexAttribArray(locations.offset);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...this.vertices.body, ...this.vertices.eyes]), gl.STATIC_DRAW);

        gl.useProgram(program);
    }

    translate(x, y) {
        this.trans.offsetX += x;
        this.trans.offsetY += y;
        this.nameObj.translate(x, y);
        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
    }

    rotate(a) {
        a = a * Math.PI / 180;
        this.trans.rotation = a;
        gl.uniform1f(locations.rotation, this.trans.rotation);
    }

    postLink() {

        this.state.targetUpdateAnimation.rate = this.state.attack.reactionTime;

        this.state.fireAnimation = new LoopAnimation(function() {

            this.state.recoilAnimation.start();

            const map = (this.map || $CURRENT_MAP);
            const [initialTrajectoryX, initialTrajectoryY] = rotate(0, 1, (this.trans.rotation) * 180 / Math.PI);

            let randomBulletRotation = random(this.state.equippedItems.mainTool.constructor._properties.accuracy || 0);
            randomBulletRotation = (Math.random() < 0.5) ? -randomBulletRotation : randomBulletRotation;

            let [finalTrajectoryX, finalTrajectoryY] = rotate(initialTrajectoryX, initialTrajectoryY, randomBulletRotation);
            let [initialPointX, initialPointY] = rotate(0, this.state.equippedItems.mainTool.constructor._properties.nozzelLength, (this.trans.rotation) * 180 / Math.PI);

            map.link(new Bullet(initialPointX + this.trans.offsetX, initialPointY + this.trans.offsetY, ((this.trans.rotation) * 180 / Math.PI) + 90, finalTrajectoryX * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, finalTrajectoryY * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, this.state.equippedItems.mainTool.constructor._properties.damage, this));


            let [shellDirectionX, shellDirectionY] = rotate(20, 0, (this.trans.rotation) * 180 / Math.PI), randomShellRotation = random(10);
            let [randomShellDirectionX, randomShellDirectionY] = rotate(shellDirectionX, shellDirectionY, (Math.random() < 0.5) ? -randomShellRotation : randomShellRotation);
            let [shellInitialX, shellInitialY] = rotate(0, 8, (this.trans.rotation) * 180 / Math.PI);

            map.link(new BulletShell(this.trans.offsetX + shellInitialX, this.trans.offsetY + shellInitialY, randomShellDirectionX, randomShellDirectionY));

            this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo--;
            this.state.reload.progress++;

            if (this.state.reload.progress === this.state.equippedItems.mainTool.constructor._properties.capacity) this.state.equippedItems.mainTool.loaded = false;

        }, this, 0);
    }

    hit(damage, x, y, owner) {
        if (!this.state.invinsible) {
            (this.state.armor > 0) ? this.state.armor -= damage: this.state.vitals.health -= damage;
            if (this.state.vitals.health <= 0) {
                let attacker = (this.map ?? $CURRENT_MAP).avatars[owner.id];
                if (attacker) attacker.state.kills += 1;

                this.purgeItems(5);
                this.delete();
                return;
            }
        }

        if ((this.state.passive && !this.state.aggressive) || (this.state.armed && this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo <= 0)) {
            this.run();
        } else if (!this.state.target.id.includes(owner.state.targetId) && (this.map || $CURRENT_MAP).avatars[owner.id] && this.state.aggressive) {
            this.state.target.id.push(owner.state.targetId);
            this.state.target.engaged = true;
            this.state.attack.multiple = true;
        }
    }

    drawWeapon() {
        if (this.state.armed) {
            this.state.draw = true;
            this.state.position.body.texture = this.state.equippedItems.mainTool.constructor._properties.useTextures[0];
        }
    }

    holsterWeapon() {
        if (this.state.armed) {
            this.state.draw = false;
            this.state.position.body.texture = 0;
        }
    }

    reload() {
        this.state.reloadTimeout.start();
    }

    follow(id) {
        this.state.speed = (this.state.follow.run) ? this.state.runningSpeed : this.state.baseSpeed;
        this.state.follow.target = this.map.avatars[id];
    }

    disengageFollow() {
        this.state.follow.target = undefined;
    }

    addItem(item, slot) {
      if (this.inventory.addItem(item, slot)) {
        updateInventoryItem(item.slot,item.name);
      }
    }

    dropItem(slot) {
     if (!this.inventory.items[slot]) return false;      

        updateInventoryItem(this.inventory.items[slot].slot,this.inventory.items[slot].name,true);
        this.unequipItem(slot);
 
        let item = this.inventory.ejectItem(slot);
         
        item.ring.trans.offsetX = item.trans.offsetX = this.trans.offsetX + random(10, true);
        item.ring.trans.offsetY = item.trans.offsetY = this.trans.offsetY + random(10, true);
        item.trans.rotation = random(360);

        (this.map || $CURRENT_MAP).link(item);

        return true;
    }

    purgeItems(limit) {
        for (let i = 0; i < limit; i++) {
            if (this.inventory.items[i]) this.dropItem(i);
        }
    }

    equipItem(slot) {
        let item = this.inventory.items[slot];

        if (item) {
            switch (item.type) {
                case "gun": {
                    this.state.armed = true;
                    this.state.equippedItems.mainTool = item;
                    this.state.reload.progress = 0;
                    this.state.equippedItems.mainTool.loaded = item.loaded;
                    this.state.reloadTimeout.timingConfig[0] = this.state.equippedItems.mainTool.constructor._properties.reloadTime;
                    this.state.fireAnimation.rate = 0.5 / this.state.equippedItems.mainTool.constructor._properties.fireRate;
                }
                break;
            }

            return true;
        }
        return false;
    }

    unequipItem(slot) {
      if (!this.inventory.items[slot]) return false;      

        let item = this.inventory.items[slot];
        
        switch (item.type) {
            case "gun": {
                if (this.state.equippedItems.mainTool && item.slot === this.state.equippedItems.mainTool.slot) {
                    this.state.armed = false;
                    this.state.equippedItems.mainTool = undefined;
                }
            };
            break;
        }

     return true;
    }

    preRender() {
        // run animations

        this.state.blinkingAnimation.run();

        if (this.state.walking && this.state.draw === false) {
            this.state.walkingAnimation.run();
        } else {
            this.state.walkingAnimation.end();
        }

        if (this.state.draw) {
            this.state.position.body.texture = this.state.equippedItems.mainTool.constructor._properties.useTextures[0];
        }

        if (this.state.fire && this.state.target.shot && this.state.equippedItems.mainTool?.loaded && this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo) {
            this.state.fireAnimation.run();
        }

        this.state.recoilAnimation.run();
        if (!this.state.equippedItems.mainTool?.loaded) this.state.reloadTimeout.run();

        if (this.state.recording.useRecording) this.state.recordAnimation.run();
        if (this.state.goto.engaged) this.state.gotoAnimation.run();
        if (!this.state.path.request) this.state.pathRequestRateLimit.run();

        // walk to destination
        walk: if (this.state.path.engaged && !this.state.goto.engaged) {

            if (this.state.recording.useRecording) this.pauseRecording();

            if (this.state.path.index === this.state.path.current.length) {
                this.disengagePath();
                break walk;
            }

            let {
                x,
                y
            } = this.state.path.current[this.state.path.index];
            let next = this.map.GRAPH.find(x, y).id;

            if (!this.map.GRAPH.blocked.includes(next) && !this.map.GRAPH.reserved.includes(next)) {
                this.state.goto.reserve = next;
                this.map.GRAPH.reserved.push(next);

                this.goto(x + 5, y - 5);

                let r = (Math.atan2(this.state.goto.y - this.trans.offsetY, this.state.goto.x - this.trans.offsetX) - 1.5708);
                this.trans.rotation = r;

            } else {
                this.disengagePath();
                this.requestPath(this.state.path.end.x, this.state.path.end.y);
                break walk;
            }

            this.state.path.index++;
        }

        // attack target(s)

        if (this.state.target.id.length > 0) this.state.targetUpdateAnimation.run();

        attack: if (this.state.target.current && this.state.target.engaged && this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo > 0) {
            const m = this.map || $CURRENT_MAP;
            if (this.map.avatars[this.state.target.current.id]) {
                if (!this.state.equippedItems.mainTool?.loaded && !this.state.reloadTimeout.running) this.reload();
                this.state.shotCheckAnimation.run();

                const {
                    offsetX: targetX,
                    offsetY: targetY
                } = this.state.target.current.trans, dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY);
                if (dist > this.state.attack.disengageDistance && this.state.target.engaged) {
                    this.disengageTarget();
                } else if (dist > this.state.attack.engageDistance) {
                    this.state.speed = this.state.baseSpeed * this.state.attack.attackSpeed;
                    this.state.fire = false;
                    if (!this.state.openCarry && this.state.draw) this.holsterWeapon();
                    if (this.state.path.request && !this.state.path.engaged && !this.state.follow.target) this.requestPath(targetX + m.centerX, targetY + m.centerY);
                } else if (dist < this.state.attack.settleDistance) {
                    if (this.state.target.shot && this.state.path.engaged && !this.state.follow.target) {
                        this.disengagePath();
                    }

                    this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                    if (!this.state.draw) this.drawWeapon();
                    if (this.state.target.shot) this.state.fire = true;

                } else if (dist < this.state.attack.slowdownDistance) {
                    this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                    if (!this.state.draw) this.drawWeapon();
                    if (this.state.target.shot) this.state.fire = true;

                    if (!this.state.follow.rush || !this.state.follow.target) this.state.speed = this.state.baseSpeed * (this.state.attack.attackSpeed / 3);
                } else if (dist < this.state.attack.engageDistance) {
                    this.state.speed = this.state.baseSpeed * this.state.attack.attackSpeed;
                    this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                    if (!this.state.draw) this.drawWeapon();
                    if (this.state.target.shot) this.state.fire = true;

                    if (!this.state.path.engaged && !this.state.follow.target) {
                        this.requestPath(targetX + m.centerX, targetY + m.centerY);
                    }
                }

                if (!this.state.target.shot && this.state.path.request && !this.state.path.engaged && !this.state.follow.target) this.requestPath(targetX + m.centerX, targetY + m.centerY)

                break attack;
            }

            this.disengageTarget();
        }

        // follow target

        follow: if (this.state.follow.target) {

            const {
                offsetX: targetX,
                offsetY: targetY
            } = this.state.follow.target.trans, dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY), speed = (this.state.follow.run) ? this.state.runningSpeed * this.state.baseSpeed : this.state.baseSpeed;

            if (dist > this.state.follow.settleDistance) {
                this.state.speed = speed;
                if (this.state.path.request && !this.state.path.engaged) {
                    this.requestPath(targetX + this.map.centerX, targetY + this.map.centerY);
                }
            }

            if (dist < this.state.follow.slowdownDistance && dist > this.state.settleDistance) {
                this.state.speed = speed / 3;
            } else if (dist < this.state.follow.settleDistance) {
                if (this.state.path.engaged) {
                    this.disengagePath();
                }
            }
        }
        this.movePickup();
    }

    render() {
        gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        gl.uniform1f(locations.rotation, this.trans.rotation);

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures.skins.index[this.state.position.body.texture]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures.skins.index[this.state.position.eyes.texture]);
        gl.useProgram(program);

        gl.drawArrays(gl.TRIANGLES, 0, 12);

        this.nameObj.render();
    }

    useRecording(rec) {
        this.state.recording.data = JSON.parse(rec);
        this.state.recording.useRecording = true;
    }

    deleteRecording() {
        this.state.recording.useRecording = false;
        this.state.walking = false;
        this.state.recording.frame = 0;
        delete this.state.recording.data;
    }

    resumeRecording() {
        this.state.walking = true;
        this.state.recording.useRecording = true;
    }

    pauseRecording() {
        this.state.walking = false;
        this.state.recording.useRecording = false;
    }

    goto(x, y) {
        this.state.goto.x = x - this.map.centerX;
        this.state.goto.y = y - this.map.centerY;
        this.state.goto.target = {
            x: x,
            y: y
        };
        this.state.goto.engaged = true;
        this.state.recording.useRecording = false;
        this.state.walking = true;
    }

    disengageGoto() {
        this.state.goto.engaged = false;
        this.state.walking = false;
        if (this.state.goto.reserve) this.map.GRAPH.reserved.splice(this.map.GRAPH.reserved.indexOf(this.state.goto.reserve), 1);
    }

    killTarget(ids, multiple, invert) {
        if (this.state.armed) {
            let map = (this.map || $CURRENT_MAP);
            let target = map.avatars[ids[0]];

            this.state.attack.multiple = multiple;
            this.state.attack.invertTargets = invert;

            if (target && !this.state.attack.multiple) {
                this.state.target.current = target;
                this.state.target.id = ids;
                this.state.target.engaged = true;

                return true;
            } else if (this.state.attack.multiple) {
                this.state.target.id = ids;
                this.state.target.engaged = true;
            }
        }

        return false;
    }

    disengageTarget() {
        this.state.target.engaged = false;
        this.state.target.current = undefined;
        this.state.speed = this.state.baseSpeed;
        this.state.fire = false;
        if (this.state.path.engaged && !this.state.follow.target) this.disengagePath();

        if (this.state.openCarry) {
            this.drawWeapon();
        } else {
            this.holsterWeapon();
        }

    }

    run() {
        if (!this.state.path.engaged && !this.state.follow.target) {
            let point = this.map.GRAPH.getRandomPoint();

            if (point) {
                this.state.speed = this.state.runningSpeed * this.state.baseSpeed;
                this.requestPath(point.x, point.y);
            }
        }
    }

    grab() {
        if (this.state.pickup.current) return;

        let [x, y] = rotate(0, this.state.pickup.reachDistance, (this.trans.rotation) * 180 / Math.PI);
        let {
            width,
            height
        } = this.state.pickup.hitbox;

        for (let i in $CURRENT_MAP.moveables) {
            let obj = $CURRENT_MAP.moveables[i];

            if ((Math.abs(x - obj.trans.offsetX) < (obj.width / 2 + width / 2)) && (Math.abs(y - obj.trans.offsetY) < (obj.height / 2 + height / 2))) {
                obj.moveToTop();

                this.state.pickup.offset.x = obj.trans.offsetX;
                this.state.pickup.offset.y = obj.trans.offsetY;
                this.state.pickup.offset.aRotation = (this.trans.rotation * 180 / Math.PI);
                this.state.pickup.offset.bRotation = obj.trans.rotation;
                this.state.pickup.current = obj;
                break;
            }
        }
    }

    movePickup() {
        if (this.state.pickup.current) {
            let {
                offsetX,
                offsetY
            } = this.state.pickup.current.trans, pickup = this.state.pickup.current, rotation = (this.trans.rotation * 180 / Math.PI);
            let [x2, y2] = rotate((this.state.pickup.offset.x), (this.state.pickup.offset.y), rotation - this.state.pickup.offset.aRotation);

            pickup.translate(x2 - offsetX, y2 - offsetY, this.state.pickup.offset.bRotation + (this.state.pickup.offset.aRotation - rotation), true);
        }
    }

    drop() {
        if (this.state.pickup.current) {
            this.state.pickup.current = undefined;
        }
    }

    requestPath(x, y) {
        if (this.state.path.request) {
            this.state.path.request = false;
            this.state.pathRequestRateLimit.start();

            let start = this.map.GRAPH.getPoint(this.trans.offsetX + this.map.centerX, this.trans.offsetY + this.map.centerY),
                end = this.map.GRAPH.getPoint(x, y);

            if ((x >= -this.map.width / 2 && x < this.map.width / 2) && (y <= this.map.height / 2 && y > -this.map.height / 2) && start && end) {
                this.state.path.start = start;
                this.state.path.end = end;
                pathfinder.requestPath(this, this.state.path.start.unit, this.state.path.end.unit);
                return true;
            }
        }
        return false;
    }

    findPathTo(path) {
        if (path.result && this.state.path.start) {
            this.state.path.current = path.path;
            this.state.path.index = 0;
            this.state.path.engaged = true;
        }
        return path;
    }

    disengagePath() {
        this.state.path.current = [];
        this.state.path.index = 0;
        this.state.path.engaged = false;
        this.disengageGoto();
    }

    gotoAvatar() {
        return this.requestPath(this.map.centerX, this.map.centerY);
    }

    clean() {
        if (this.state.goto.reserve) this.map.GRAPH.reserved.splice(this.map.GRAPH.reserved.indexOf(this.state.goto.reserve), 1);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

export class Floor extends _Object_ {

            static _tileTypes = {
              0: {
               vertices: [-6.390000000000001,6.390000000000001,1,0,0,6.390000000000001,6.390000000000001,1,0.9984375000000001,0,-6.390000000000001,-6.390000000000001,1,0,0.9984375000000001,6.390000000000001,6.390000000000001,1,0.9984375000000001,0,-6.390000000000001,-6.390000000000001,1,0,0.9984375000000001,6.390000000000001,-6.390000000000001,1,0.9984375000000001,0.9984375000000001],
               width: 12.780000000000001, 
               height: 12.780000000000001, 
               texture: textures.objects.floortile
              } 
            }
 
    constructor(initialX, initialY, width, height, tileType = 0) {
        super([], function() {
           
            let tile = Floor._tileTypes[tileType];

            this.vertices = tile.vertices; 
            this.texture = tile.texture;
            this.width = width; 
            this.height = height; 
            this.tileType = tileType;
            this.renderDimensions = {width: width/tile.width, height: height/tile.height};

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.textrUnit);

            gl.useProgram(program);
        }, function() {
            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            gl.uniform2fv(locations.size, [this.renderDimensions.width, this.renderDimensions.height]);
            gl.uniform2fv(locations.textureRange, [this.renderDimensions.width,this.renderDimensions.height]);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.useProgram(program);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);
            gl.uniform2fv(locations.size, [1, 1]);
            gl.uniform2fv(locations.textureRange, [0, 0]);
        }, width, height, initialX, initialY, 0); 
        this.name = "floor";
        this.type = "floor";
        this.bottomLayer = true;
        this.subLayer = 1;
    }

    delete() {
        this.map.unlink(this.id);
    }
}


// Class for invisible barriers
export class Barrier {
    constructor(x, y, width, height) {
        this.segments = [
            [0, -height, width, height]
        ];

        this.trans = {
            offsetX: 0,
            offsetY: 0
        }

        this.width = width;
        this.height = height;
        this.obstacle = true;
        this.isValid = true;
        this.name = "invisible barrier";
        this.type = "barrier";
        this.id = genObjectId();

        this.translate = function(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
        }

        this.translate(x, y);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

// export class for visible barriers
export class VisibleBarrier extends _Object_ {
    constructor(initialX, initialY, width, height, color = [40, 40, 40, 1.0]) {
        super([], function() {

            this.vertices = cut([
                [-width / 2, -height / 2, width, height]
            ], false, [1], true);
            this.width = width;
            this.height = height;
            this.color = color;

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(locations.coords);
            gl.disableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.textrUnit);

            gl.useProgram(program);
        }, function() {
            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            gl.uniform1f(locations.rotation, this.trans.rotation);
            gl.uniform4fv(locations.color, [...fromRGB(this.color)]);
            gl.uniform1i(locations.lines, 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.useProgram(program);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
            gl.uniform1i(locations.lines, 0);
            gl.uniform4fv(locations.color, [0, 0, 0, 0]);
        }, width, height, initialX, initialY, 0);
        this.segments = [
            [-width / 2, -height / 2, width, height]
        ];
        this.obstacle = true;
        this.name = "visible barrier";
        this.type = "barrier";
    }

    delete() {
        this.map.unlink(this.id);
    }
}

// Invisible sensor for event triggers
export class Sensor extends Barrier {
    constructor(x, y, width, height, action) {
        super(x, y, width, height);
        this.action = action;
        this.isValid = true;
        this.name = "sensor";
        this.type = "sensor";
        this.id = genObjectId();
    }

    delete() {
        this.map.unlink(this.id);
    }
}

// Invisible trigger for doors, etc.

export class Trigger {
    constructor(x, y, action, managedMovement = false) {
        this.segments = [
            [-2.5, -2.5, 2.5, 2.5]
        ];

        this.trans = {
            offsetX: 0,
            offsetY: 0
        }

        this.width = 5;
        this.height = 5;
        this.interactable = true;
        this.minDistance = 10;
        this.isValid = true;
        this.managedMovement = managedMovement;
        this.id = genObjectId();
        this.action = action.bind(this);
        this.name = "trigger";
        this.type = "trigger";
        this.exclude = true;

        this.translate = function(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
        }

        this.translate(x, y);
    }

    delete() {
        this.map.unlink(this.id);
    }
}

// class for generating graphs for maps, used for pathfinding..

class _Graph_ {
    constructor(width, height, diagonal = false) {

        this.width = width;
        this.height = height;
        this.nodeCount = width * height;
        this.diagonal = diagonal;
        this.blocked = [];
        this.reserved = [];
        this.grid = new Map();
        this.find = (function(col, row) {
            return this.grid.get(`${col},${row}`);
        }).bind(this);

        class Node {
            constructor(x, y, edges = []) {
                this.position = {
                    x: x,
                    y: y
                };
                this.f = 0;
                this.g = 0;
                this.h = 0;
                this.id = undefined;
                this.edges = edges;
                this.parent = undefined;
                this.fresh = true;
            }
        }

        this.nodes = {};

        let col = 0,
            row = 0,
            node;
        for (let i = 1; i <= this.nodeCount; i++) {
            node = new Node((col - (width / 2)) * 10, -((row - (height / 2)) * 10));
            node.id = i;
            this.nodes[i] = node;
            this.grid.set(`${(col-(width/2))*10},${-((row-(height/2))*10)}`, node);

            if (col > 0) node.edges.push(node.id - 1);
            if (col < this.width - 1) node.edges.push(node.id + 1);
            if (row > 0) node.edges.push(node.id - width);
            if (row < this.height - 1) node.edges.push(node.id + width);

            if (this.diagonal) {
                if (col > 0 && row > 0) node.edges.push(node.id - width - 1);
                if (col < width - 1 && row > 0) node.edges.push(node.id - width + 1);
                if (row < height - 1 && col < width - 1) node.edges.push(node.id + width + 1);
                if (row < height - 1 && col > 0) node.edges.push(node.id + width - 1);
            }

            if (col === width - 1) {
                col = 0;
                row++;
            } else {
                col++;
            }
        }
    }

    getPath(s, g) {

        function euclideanDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function manhattanDistance(x1, y1, x2, y2) {
            return (Math.abs(x1 - x2) + Math.abs(y1 - y2));
        }

        if (this.blocked.includes(g)) return false;

        const start = s,
            goal = g,
            open = [s],
            closed = [];
        let current, result = {
            result: false,
            path: []
        };

        while (open.length > 0) {

            current = open.reduce((a, v) => {
                return ((this.nodes[v].f < a.f || (this.nodes[v].f === a.f && this.nodes[v].h < a.h)) ? this.nodes[v] : a)
            }, {
                f: Infinity,
                h: Infinity
            });

            open.splice(open.indexOf(current.id), 1);
            closed.push(current.id);

            if (current.id === goal) {
                let n = current;

                while (n.id !== start) {
                    n = this.nodes[n.parent];
                    if (n.id === start) break;
                    result.path.unshift(n.position);
                }

                result.path.push(current.position);
                result.result = true;
                break;
            }

            for (let i of current.edges) {
                let edge = this.nodes[i];

                if (edge === undefined) continue;

                let calc = {
                    g: current.g + euclideanDistance(edge.position.x, edge.position.y, current.position.x, current.position.y),
                    h: manhattanDistance(edge.position.x, edge.position.y, this.nodes[goal].position.x, this.nodes[goal].position.y)
                };
                calc.f = calc.g + calc.h;

                if (this.blocked.includes(edge.id) || closed.includes(edge.id)) continue;
                if (edge.parent === undefined || edge.fresh === true || calc.f < edge.f) {
                    edge.parent = current.id;
                    edge.f = calc.f;
                    edge.g = calc.g;
                    edge.h = calc.h;
                    if (!open.includes(edge.id)) open.push(edge.id);
                }
            }

            current.f = 0;
            current.h = 0;
            current.g = 0;
            current.fresh = true;
        }

        return result;
    }
 
    getFixedCoordinate(x, y) {
       let coord = {x: (this.width % 2 === 0) ? (Math.floor(x * 0.1) * 10) : (Math.round(x * 0.1) * 10) - 5, y: (this.height % 2 === 0) ? (Math.ceil(y * 0.1) * 10) : (y % 5 === 0 && y % 2 !== 0) ? (Math.round(y * 0.1) * 10) - 5 : (Math.round(y * 0.1) * 10) + 5};
 
       return coord;
    }

    getPoint(x, y) {
        let p = this.getFixedCoordinate(x, y), unit = this.find(p.x, p.y);

        return (unit) ? {
            x: p.x,
            y: p.y,
            unit: unit.id
        } : false;
    }

    getRandomPoint() {
        let p = false;

        while (!p || (this.blocked.includes(p.id) && this.blocked.length !== this.nodeCount)) {
            p = this.nodes[random(this.nodeCount) || 1];
        }

        return (p) ? {
            x: p.position.x - this.map.centerX,
            y: p.position.y - this.map.centerY
        } : p;
    }

    evalObstacle(x, y, width, height) {

        x = Math.round(x);
        y = Math.round(y);

        let xAndWidth = (x + width),
            yAndHeight = (y + height);

        const cornerA = this.getFixedCoordinate(x, y);
        const cornerB = this.getFixedCoordinate(xAndWidth, y);
        const cornerC = this.getFixedCoordinate(xAndWidth, yAndHeight);

        let inBounds = (Math.abs(x + width/2) < (this.map.width/2) + width/2) && (Math.abs(y + height/2) < (this.map.height/2) + height/2);
       
        if (inBounds) {
            for (let i = cornerA.x; i <= cornerB.x; i += 10) {
                for (let j = cornerB.y; j <= cornerC.y; j += 10) {
                    let unit = this.find(i, j);
                    if (unit) this.blocked.push(unit.id);
                }
            }
        } else {
            return false;
        }

        return true;
    }
}

// export class for map creation
export class _Map_ {

    static _recording = {
        isRecording: false,
        recording: []
    };

    static _all = {};

    constructor(width = 100, height = 100, root = true) {
        this.width = width;
        this.height = height;
        this.id = genObjectId();
        this.root = root;
        this.objectCount = 0;
        this.lighting = false;
        this.spawnPoints = [];
        this.centerX = 0;
        this.centerY = 0;
        this.groundColor = (root) ? [255, 255, 255, 1] : [255, 255, 255, 1];
        this.show = true;
        this.freeze = false;
        this.move = true;
        this.noclip = false;
        this.objectSearchStride = (root) ? 4 : 5;
        this.darkness = 1;
        this.units = {
            width: width / 10,
            height: height / 10,
            total: (width / 10) * (height / 10)
        };
        this.objects = {};
        this.avatars = {};
        this.obstacles = {};
        this.moveables = {};
        this.locations = {};
        this.clusters = {};
        this.subLayers = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        };
        this.interactables = {};
        this.GRAPH = new _Graph_(this.units.width, this.units.height, true);
        this.GRAPH.map = this;
        this.SUB_MAP_COUNT = 0;
        this.SUB_MAPS = {};
        this.PARENT_MAP = undefined;
        this.mapId = undefined;
        this.pickups = {};

        this.barriers = (root) ? [new Barrier(-(width / 2), (height / 2) + 20, width, 20), new Barrier(-(width / 2), -(height / 2), width, 20), new Barrier(-(width / 2) - 20, height / 2, 20, height), new Barrier((width / 2), height / 2, 20, height)] : [new VisibleBarrier((-width / 2) - 125, 0, 250, height + 10), new VisibleBarrier(0, -(height / 2) - 125, width + 500, 250), new VisibleBarrier((width / 2) + 125, 0, 250, height + 10), new VisibleBarrier(0, (height / 2) + 125, width + 500, 250), new VisibleBarrier(0, (height / 2) + 12, width, 24, [70, 70, 70, 1.0])];

        for (let i in this.barriers) {
            this.barriers[i].exclude = true;
            this.link(this.barriers[i]);
        }

        this.groundPlate = new VisibleBarrier(0, 0, 500, 500, this.groundColor);

        _Map_._all[this.id] = this;
    }

    render() {
        gl.uniform1f(locations.scale, 1);
        this.groundPlate.render();
        gl.uniform1f(locations.scale, scale);
        gl.uniform1f(locations.darkness, this.darkness + globalDarkness);

        if (_Map_._recording.isRecording) _Map_._recording.recording.push($CURRENT_MAP.centerX, $CURRENT_MAP.centerY, $AVATAR.trans.rotation * 180 / Math.PI, $AVATAR.state.walking);

        this.updateGraph();

        this.renderBottomLayer();

        for (let i in this.objects) {

            let ob = this.objects[i];
            if (ob.preRender && !this.freeze) ob.preRender();

            if (!(ob instanceof Barrier || ob instanceof Trigger || ob instanceof Avatar) && !ob.bottomLayer && !ob.topLayer && !ob.hasCluster && !ob.hidden && !ob.subLayer && this.show) {
                ob.render();
            }
        }

        if (this.show) this.renderSubLayers();

        for (let i in this.avatars) {
            let av = this.avatars[i];

            if (av.preRender && !this.freeze) av.preRender();
            if (this.show) av.render();
        }
    }

    renderTopLayer() {
        if (this.show) {
            for (let i in this.objects) {

                let ob = this.objects[i];

                if (!(ob instanceof Barrier || ob instanceof Trigger || ob instanceof Avatar) && !ob.bottomLayer && ob.topLayer && !ob.hasCluster && !ob.hidden && !ob.subLayer) {
                    ob.render();
                }
            }

            this.renderSubLayers("topLayer");

            if (!this._lineMatrix.hidden) this._lineMatrix.render();
        }
    }

    renderBottomLayer() {
        if (this.show) {

            this.renderSubLayers("bottomLayer");

            for (let i in this.objects) {

                let ob = this.objects[i];

                if (!(ob instanceof Barrier || ob instanceof Trigger || ob instanceof Avatar) && !ob.topLayer && ob.bottomLayer && !ob.hasCluster && !ob.hidden && !ob.subLayer) {
                    ob.render();
                }
            }
        }
    }

    renderSubLayers(layer) {
        for (let l in this.subLayers) {
            for (let ob of this.subLayers[l]) {
                if (!(ob instanceof Barrier || ob instanceof Trigger || ob instanceof Avatar) && (ob[layer] || (!layer && !ob.bottomLayer && !ob.topLayer)) && !ob.hasCluster && !ob.hidden) {
                    ob.render();
                }
            }
        }
    }

    link(obj) {
        if (obj.render || obj.hasCluster || obj.isValid) {

            if (obj.hasCluster) {
                switch (obj.clusterType) {
                    case _StaticCluster_: {
                        if (!this.clusters[obj.clusterName]) {
                            let cluster = new obj.clusterType(obj.texture, obj.topLayer);

                            cluster.bottomLayer = obj.bottomLayer;
                            cluster.topLayer = obj.topLayer;
                            cluster.subLayer = obj.subLayer;

                            this.registerCluster(obj.clusterName, cluster);
                        }

                        obj.cluster = this.clusters[obj.clusterName];

                        obj.clusterIndex = this.clusters[obj.clusterName].link(obj.constructor._defaultVertices, -this.clusters[obj.clusterName].trans.offsetX + obj.trans.offsetX, -this.clusters[obj.clusterName].trans.offsetY + obj.trans.offsetY, obj.trans.rotation);
                    };
                    break;
                    case _InstancedCluster_: {
                        if (!this.clusters[obj.clusterName]) {
                            let cluster = new obj.clusterType(obj.constructor._defaultVertices, obj.texture, obj.type === "light");

                            cluster.bottomLayer = obj.bottomLayer;
                            cluster.topLayer = obj.topLayer;
                            cluster.subLayer = obj.subLayer;

                            this.registerCluster(obj.clusterName, cluster);
                        }

                        obj.cluster = this.clusters[obj.clusterName];

                        obj.clusterIndex = this.clusters[obj.clusterName].link(-this.clusters[obj.clusterName].trans.offsetX + obj.trans.offsetX, -this.clusters[obj.clusterName].trans.offsetY + obj.trans.offsetY, obj.trans.rotation);
                    };
                    break;
                    case _MixedStaticCluster_: {
                        if (!this.clusters[obj.clusterName]) {
                            let cluster = new obj.clusterType(_MixedStaticCluster_.groupings[obj.grouping]);

                            cluster.bottomLayer = obj.bottomLayer;
                            cluster.topLayer = obj.topLayer;
                            cluster.subLayer = obj.subLayer;

                            this.registerCluster(obj.clusterName, cluster);
                        }

                        obj.cluster = this.clusters[obj.clusterName];

                        obj.clusterIndex = this.clusters[obj.clusterName].link(obj.constructor._defaultVertices, -this.clusters[obj.clusterName].trans.offsetX + obj.trans.offsetX, -this.clusters[obj.clusterName].trans.offsetY + obj.trans.offsetY, obj.trans.rotation);
                    };
                    break;
                }
            }

            if (obj.preLink) obj.preLink();

            obj.map = this;
            obj.index = this.objectCount;

            this.objects[obj.id] = obj;

            if (obj.obstacle) this.obstacles[obj.id] = obj;
            if (obj.pickup) this.pickups[obj.id] = obj;
            if (obj.moveable) this.moveables[obj.id] = obj;
            if (obj.interactable) this.interactables[obj.id] = obj;
            if (obj.type === "avatar") this.avatars[obj.id] = obj;
            if (obj.subLayer && !obj.hasCluster) this.subLayers[obj.subLayer].push(obj);

            if (obj.isCluster) obj.linked = true;

            if (obj.postLink) obj.postLink();

            if (obj.obstacle) {
                for (let i of obj.segments) {
                    this.GRAPH.evalObstacle((i[0] + obj.trans.offsetX) + this.centerX, (i[1] + obj.trans.offsetY) + this.centerY, i[2], i[3]);
                }
            }

            this.objectCount++;
        } else {
            return "invalid object.";
        }
    }

    unlink(id) {
        if (this.objects[id]) {

            if (this.objects[id].clean) this.objects[id].clean();
            if (this.objects[id].hasCluster && !this.objects[id].preserveCluster) {
                this.objects[id].cluster.unlink(this.objects[id].clusterIndex);
                this.objects[id].cluster = undefined;
            }
            if (!this.objects[id].pickup) this.objects[id].map = undefined;

            delete this.interactables[id];
            delete this.objects[id];
            delete this.obstacles[id];
            delete this.pickups[id];
            delete this.avatars[id];

            this.objectCount--;
        } else {
            return "that object dosen't exist.";
        }
    }

    locateObject(name) {
        let closest = 1000,
            result, currentDistance;

        for (let i in this.objects) {
            i = this.objects[i];
            if (i.name !== name) continue;

            currentDistance = distance(i.trans.offsetX, i.trans.offsetY, 0, 0);
            if (currentDistance < closest) {
                closest = currentDistance;
                result = i;
            }
        }
        return result;
    }

    updateGraph() {
        this.GRAPH.blocked = [];
        for (let o in this.obstacles) {
            let obj = this.obstacles[o];
            for (let i of obj.segments) {
                this.GRAPH.evalObstacle((i[0] + obj.trans.offsetX) + this.centerX, (i[1] + obj.trans.offsetY) + this.centerY, i[2], i[3]);
            }
        }
    }

    getObject(index) {
        return Object.values(this.objects)[index + this.objectSearchStride];
    }

    translateCluster(xoffset, yoffset, start, end, exclude = []) {
        for (let i = start; i < Object.keys(this.objects).length - 1; i++) {
            if (exclude.includes(i) || this.getObject(i).isCluster) continue;
            this.getObject(i).translate(xoffset, yoffset, true);

            if (i === end) break;
        }
        return "cluster translated.";
    }

    printLayoutScript(json = true, resetTranslation, start = 0) {
        if (!resetTranslation) {
            this.noclip = true;
            this.translate(-this.centerX, -this.centerY);
            this.noclip = false;
        }

        let objs = {
            layout: [],
            settings: {
                groundColor: this.groundColor,
                lighting: this.lighting,
                darkness: this.darkness
            },
            root: this.root,
            nodes: this.SUB_MAP_COUNT,
            children: []
        };
        let keys = Object.keys(this.objects);
        for (let i = start; i < this.objectCount; i++) {
            let ob = this.objects[keys[i]];
            if (!(ob instanceof Barrier) && !ob.isCluster && !ob.exclude) {
                let frame = [ob.constructor.name];

                // add special attributes for more complex objects...
                switch (ob.name) {
                    case "avatar":
                        frame = frame.concat([ob.character, ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI)]);
                        break;
                    case "text":
                        frame = frame.concat([ob.text, ob.size, toRGB(ob._color), ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI), false]);
                        break;
                    case "door":
                        frame = frame.concat([ob.text, ob.roomIndex, ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI), ob.outPoint]);
                        break;
                    case "visible barrier":
                        frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.width, ob.height, ob.color]);
                        break;
                    case "street light":
                        frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation, ob._color]);
                        break;
                    case "floor": 
                        frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.width, ob.height, ob.tileType]);
                        break;
                    default:
                        frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation]);
                        break;
                }

                objs.layout.push(frame);
            }
        }

        for (let i in this.SUB_MAPS) {
            objs.children.push(this.SUB_MAPS[i].printLayoutScript(false));
        }

        return (json) ? JSON.stringify(objs) : objs;
    }

    parseLayoutScript(layout, json = true) {
        if (!layout) return;

        let objects = (json) ? JSON.parse(layout) : layout;
        let objs = objects.layout,
            children = objects.children,
            settings = objects.settings;

        if (settings) {
            this.lighting = settings.lighting;
            this.groundColor = settings.groundColor;
            this.groundPlate.color = this.groundColor;
            this.darkness = settings.darkness;
        }

        for (let i of objs) {
            let attribs = i.slice(1, i.length);
            let ob = new(eval(`${i[0]}`))(...attribs);
            this.link(ob);
        }

        for (let i = 0; i < objects.nodes; i++) {
            this.SUB_MAPS[i].parseLayoutScript(objects.children[i], false);
        }

        return "parsed layout.";
    }

    translate(x, y) {
        if (this.move) {
            if (!this.noclip) {
                for (let i in this.obstacles) {
                    if (this.obstacles[i] === $AVATAR.state.pickup.current) continue;
                    for (let segment of this.obstacles[i].segments) {

                        let [ox,
                            oy,
                            ow,
                            oh
                        ] = segment;

                        ox = ox + this.obstacles[i].trans.offsetX;
                        ox += ow / 2;
                        oy = oy + this.obstacles[i].trans.offsetY;
                        oy += oh / 2;

                        if ((Math.round(Math.abs($AVATAR.trans.offsetY - (oy))) < Math.round(($AVATAR.bounds.height / 2) + (oh / 2))) && (Math.abs($AVATAR.trans.offsetX - (ox - x)) < ($AVATAR.bounds.width / 2) + (ow / 2))) {
                            if (!(this.obstacles[i] instanceof Sensor)) {
                                let negative = (x < 0);
                                x += Math.abs($AVATAR.trans.offsetX - ox) - (($AVATAR.bounds.width / 2) + (ow / 2) + x);

                                x = (negative) ? -x : x;
                            } else {
                                this.obstacles[i].action();
                            }
                        }

                        if ((Math.round(Math.abs($AVATAR.trans.offsetX - (ox))) < Math.round(($AVATAR.bounds.width / 2) + (ow / 2))) && (Math.abs($AVATAR.trans.offsetY - (oy - y)) < ($AVATAR.bounds.height / 2) + (oh / 2))) {
                            if (!(this.obstacles[i] instanceof Sensor)) {
                                let negative = (y < 0);
                                y += Math.abs($AVATAR.trans.offsetY - oy) - (($AVATAR.bounds.height / 2) + (oh / 2) + y);

                                y = (negative) ? -y : y;
                            } else {
                                this.obstacles[i].action();
                            }
                        }
                    }
                }
            }

            this.centerX += x;
            this.centerY += y;

            for (let i in this.objects) {
                if (!this.objects[i].managedMovement) this.objects[i].translate(-x, -y);
            }

            this._lineMatrix.translate(-x, -y);

            this.currentInteractable = undefined;

            for (let i in this.interactables) {
                i = this.interactables[i];

                if (distance($AVATAR.trans.offsetX, $AVATAR.trans.offsetY, i.trans.offsetX, i.trans.offsetY) < i.minDistance) {
                    this.currentInteractable = i;
                }
            }

            if (!this.currentInteractable && $ACTION_BUTTON) {
                $ACTION_BUTTON.hidden = true;
            } else if ($ACTION_BUTTON) {
                $ACTION_BUTTON.hidden = false;
            }
        }
    }

    record() {
        if (!_Map_._recording.isRecording) {
            _Map_._recording.isRecording = true;
            return "recording...";
        } else {
            let result = _Map_._recording.recording;
            _Map_._recording.isRecording = false;
            _Map_._recording.recording = [];

            return JSON.stringify(result);
        }
    }

    pause() {
        _Map_._recording.isRecording = false;
    }

    resume() {
        _Map_._recording.isRecording = true;
    }

    getRecording() {
        let result = _Map_._recording.recording;
        _Map_._recording.isRecording = false;
        _Map_._recording.recording = [];

        return JSON.stringify(result);
    }

    registerCluster(name, cluster) {
        this.clusters[name] = cluster;
        this.link(cluster);
        cluster.linked = true;
    }

    showGeometry() {
        this._lineMatrix.hidden = false;
    }

    hideGeometry() {
        this._lineMatrix.hidden = true;
    }

    addSubMap(m) {
        m.PARENT_MAP = this;
        m.mapId = this.SUB_MAP_COUNT++;
        this.SUB_MAPS[String(m.mapId)] = m;
    }

    deleteSubMap(id) {
        delete this.SUB_MAPS[m.mapId];
    }

    init(spawns = [
        [0, 0]
    ], doorOffset = 0, exitPoint, buildingExit, label) {
        // attach $AVATAR to map
  
        this.avatars[$AVATAR.id] = $AVATAR;

        // attach any default objects or clusters for all maps, etc.
        this._bulletMatrix = new _BulletCluster_([-0.9, 0.4, 1, 0, 0, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, -0.4, 1, 0.5625, 0.5], textures.objects.bullet);
        this.link(this._bulletMatrix);

        this._lineMatrix = new _LineMatrix_();
        this._lineMatrix.hidden = true;

        this._lineMatrix.showShot([-this.width / 2, -this.height / 2], [this.width / 2, -this.height / 2]);
        this._lineMatrix.showShot([-this.width / 2, -this.height / 2], [-this.width / 2, this.height / 2]);
        this._lineMatrix.showShot([-this.width / 2, this.height / 2], [this.width / 2, this.height / 2]);
        this._lineMatrix.showShot([this.width / 2, this.height / 2], [this.width / 2, -this.height / 2]);

        this._lineMatrix.showShot([-5 / 2, -5 / 2], [5 / 2, -5 / 2]);
        this._lineMatrix.showShot([-5 / 2, -5 / 2], [-5 / 2, 5 / 2]);
        this._lineMatrix.showShot([-5 / 2, 5 / 2], [5 / 2, 5 / 2]);
        this._lineMatrix.showShot([5 / 2, 5 / 2], [5 / 2, -5 / 2]);

        for (let i = 10; i < this.width; i += 10) {
            this._lineMatrix.showShot([(-this.width / 2) + i, -this.height / 2], [(-this.width / 2) + i, this.height / 2]);
        }

        for (let i = 10; i < this.height; i += 10) {
            this._lineMatrix.showShot([-this.width / 2, (-this.height / 2) + i], [this.width / 2, (-this.height / 2) + i]);
        }

        for (let i of spawns) {
            this.spawnPoints.push(i);
        }

        if (!this.root) {
            let exit = new Door(label, -1, 0 + doorOffset, (this.height / 2) + 9.2, 0, exitPoint, buildingExit);
            let light = new LightSwitch(25 + doorOffset, (this.height / 2) + 12);
            light.exclude = true;

            this.link(exit);
            this.link(light);
        }

        return this;
    }
}

export class Text extends _Object_ {
    constructor(text, size = 30, color, initialX, initialY, initialRotation, texture, segments) {
        super([], function() {
            let textData = createText(text, size);

            this.vertices = textData.vertices;
            this.text = text;
            this.width = textData.width;
            this.height = textData.height;
            this.color = color || [0, 0, 0, 1];
            this.size = size;
            this.texture = texture || textures.misc.font;

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
 
            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.offset);
            gl.disableVertexAttribArray(locations.textrUnit);

            gl.useProgram(program);
        }, function() {
            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            gl.uniform1f(locations.rotation, this.trans.rotation);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.useProgram(program);
            gl.uniform4fv(locations.color, this._color);
            gl.uniform1i(locations.textColor, 1);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);
            gl.uniform4fv(locations.color, [0, 0, 0, 0]);
            gl.uniform1i(locations.textColor, 0);
        }, undefined, undefined, initialX, initialY, initialRotation);
        this.segments = segments;
        this.name = "text";
        this.type = "text";
    }

    update(text) {
        let textData = createText(text, this.size);

        this.vertices = new Float32Array(textData.vertices);
        this.width = textData.width;
        this.height = textData.height;

        ext.bindVertexArrayOES(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
        gl.enableVertexAttribArray(locations.coords);
        gl.enableVertexAttribArray(locations.tcoords);
    }

    set color(code) {
        this._color = fromRGB(code);
    }
}

/* GAME CONTROL ELEMENTS */

export class _Button_ extends _Object_ {
    constructor(texture, textureActive, initialX, initialY, action, radius, scale = 1, toggle = false, vertices) {
        super(vertices || [-8.571428571428571, 8.571428571428571, 1, 0, 0, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, -8.571428571428571, 1, 1, 1], function() {

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

            this.texture = texture;
            this.textureActive = textureActive;

            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.offset);
            gl.disableVertexAttribArray(locations.textrUnit);
            gl.useProgram(program);
        }, function() {
            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.trans.offsetX * this.scale, this.trans.offsetY * this.scale]);
            gl.uniform1f(locations.rotation, this.trans.rotation);
            gl.uniform1f(locations.scale, this.scale);

            (this.enabled) ? gl.uniform1f(locations.transparency, 1 / controlTransparency): gl.uniform1f(locations.transparency, 0.5 / controlTransparency);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.activeTexture(gl.TEXTURE0);

            if ((this.active && !toggle) || (toggle && !this.on)) {
                gl.bindTexture(gl.TEXTURE_2D, this.textureActive);
            } else if ((!this.active && !toggle) || (toggle && this.on)) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            }

            gl.useProgram(program);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);
            gl.uniform1f(locations.transparency, 1);
        }, radius * 2, radius * 2, initialX, initialY, 0);
        this.type = "button";
        this.scale = scale;
        this.enabled = true;
        this.active = false;
        this.radius = radius / scale;
        this.on = false;
        this.action = action.bind(this);
    }
}

export class _Joystick_ extends _Object_ {

    constructor(left, scale = 1, fixed = false, position = {
        x: 0,
        y: 0
    }) {
        super([-15,15,1,0,0,15,15,1,0.5859375,0,-15,-15,1,0,0.5859375,15,15,1,0.5859375,0,-15,-15,1,0,0.5859375,15,-15,1,0.5859375,0.5859375], function() {

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            this.texture = textures.controls.joystick_disc;
            
            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);

            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.disableVertexAttribArray(locations.offset);
            gl.disableVertexAttribArray(locations.textrUnit);

        }, function() {
            if (!this.base.anchored && !this.fixed) return;

            ext.bindVertexArrayOES(this.vao);
            gl.uniform2fv(locations.translation, [this.base.x * scale, this.base.y * scale]);
            gl.uniform1f(locations.rotation, 0);
            gl.uniform1f(locations.scale, this.scale);
            gl.uniform1f(locations.transparency, 1 / controlTransparency);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.useProgram(program);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.uniform2fv(locations.translation, [this.thumb.x * scale, this.thumb.y * scale]);
            gl.bufferData(gl.ARRAY_BUFFER, this.thumbVertices, gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.uniform1f(locations.transparency, 1);

            if ($CURRENT_MAP.move) {
                if (left && this.base.anchored) {
                    $CURRENT_MAP.translate((this.distance.x * this.scale) * movementMultFactor, (this.distance.y * this.scale) * movementMultFactor);

                    if ($CURRENT_MAP.move) $AVATAR.state.walking = true;
                }

                if (this.base.anchored) $AVATAR.trans.rotation = this.rotation;
                if ($CURRENT_MAP.move && this.base.anchored && !left) $AVATAR.drawWeapon();
            }
        }, 30, 30);
        this.position = Object.create(position);
        this.base = {
            x: position.x,
            y: position.y,
            width: 30 / scale,
            height: 30 / scale,
            anchored: false,
            radius: 15 / scale
        };
        this.scale = scale;
        this.fixed = fixed;
        this.thumb = {
            x: position.x,
            y: position.y,
            width: 15 / scale,
            height: 15 / scale
        };
        this.thumbVertices = new Float32Array([-7.5,7.5,1,0,0,7.5,7.5,1,0.5859375,0,-7.5,-7.5,1,0,0.5859375,7.5,7.5,1,0.5859375,0,-7.5,-7.5,1,0,0.5859375,7.5,-7.5,1,0.5859375,0.5859375]);
        this.distance = {
            x: 0,
            y: 0,
            absolute: 0
        };
        this.rotation = undefined;
        this.ratio = 0;
        this.left = left;
        this.id = undefined;
        this.fix();
    }

    unanchor() {
        this.base.anchored = false;

        // deactivate player firing when the left joystick is lifted 
        if (!this.left && $CURRENT_MAP.move) {
            $AVATAR.state.fire = false;
        }
    }

    fix() {
        if (!this.fixed) return;

        let {
            x,
            y
        } = this.position;

        this.base.x = x;
        this.base.y = y;
        this.thumb.x = x;
        this.thumb.y = y;
    }

    translate(x, y) {

        if (!this.base.anchored) {
            if (!this.fixed) {
                this.base.x = x;
                this.base.y = y;
            }
            this.base.anchored = true;
        }
        this.thumb.x = x;
        this.thumb.y = y;

        this.distance.absolute = Math.round(distance(this.base.x, this.base.y, x, y));

        // activate player firing state when the left joystick is at the edge, and viceversa
        if (!this.left && $CURRENT_MAP.move) {
            if (this.distance.absolute === this.base.radius && $AVATAR.state.armed) {
                $AVATAR.state.fire = true;
            } else {
                $AVATAR.state.fire = false;
            }
        }

        this.distance.x = (this.thumb.x - this.base.x);
        this.distance.y = (this.thumb.y - this.base.y);
        this.rotation = Math.atan2(this.thumb.y - this.base.y, this.thumb.x - this.base.x) - 1.5708;
        this.ratio = this.distance.x / this.distance.y;
    }
}
