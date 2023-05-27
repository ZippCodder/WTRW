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
    rotate
} from "./lib.js";
/*
import { 
 gl, 
 $JOYSTICK_L,
 $JOYSTICK_R, 
 $CURRENT_MAP,
 $ACTION_BUTTON,
 $AVATAR,
 $USER_MESSAGE,
 $globals.$TEXTURES,
 _MAP_
} */

import * as $globals from "./globals.js";

   /* CLASSES FOR CONSTRUCTING GAME ELEMENTS */

    // Game element base class
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
        constructor(textureSrc, topLayer) {

            this.vao = ext.createVertexArrayOES();
            this.linked = false;
            this.isCluster = true;
            this.vertices = [];
            this.textureSrc = textureSrc;
            this.verticesCount = 0;
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

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.DYNAMIC_DRAW);

            this.texture = $globals.gl.createTexture();

            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrc);
            //gl.generateMipmap(gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            $globals.gl.disableVertexAttribArray(locations.offset);
            $globals.gl.disableVertexAttribArray(locations.textrUnit);
        }
        texture;
        buffer;
        segments;
        obstacle;
        pickup;

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
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat(1)), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
        }

        link(vertices, xOffset = 0, yOffset = 0, rotation = 0, stride = 5) {

            this.vertices.push(offsetVertices(vertices, xOffset, yOffset, -rotation, stride));

            let v = this.vertices.flat(1);
            this.verticeCount = v.length;

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(v), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);

            return this.vertices.length - 1;
        }

        unlink(clusterIndex) {

            delete this.vertices[clusterIndex];

            let v = this.vertices.flat(1);
            this.verticeCount = v.length;

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(v), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
        }

        render() {
            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

            $globals.gl.activeTexture($globals.gl.TEXTURE0);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.useProgram(program);

            $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.verticeCount / 5);
        }
    }

    export class _BulletCluster_ {
        constructor(vertices, textureSrc) {
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

                                ox = (0 + ox) + this.map.obstacles[o].trans.offsetX;
                                ox += ow / 2;
                                oy = (0 - oy) + this.map.obstacles[o].trans.offsetY;
                                oy -= oh / 2;

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
            this.textureSrc = textureSrc;
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

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);

            this.offsetBuffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            instExt.vertexAttribDivisorANGLE(locations.offset, 1);
            $globals.gl.enableVertexAttribArray(locations.offset);

            this.texture = $globals.gl.createTexture();

            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrc);
            //gl.generateMipmap(gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            $globals.gl.disableVertexAttribArray(locations.textrUnit);
        }
        texture;
        buffer;
        segments;
        obstacle;
        pickup;

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
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);
        }

        link(xOffset = 0, yOffset = 0, rotation = 0, bullet) {
            if (!this.linked) {
                $CURRENT_MAP.link(this);
                this.linked = true;
            }

            let m = this.members * 3;
            let t = this.members * 2;

            this.offsets[m] = xOffset;
            this.offsets[m + 1] = yOffset;
            this.offsets[m + 2] = rotation;

            this.bullets[this.members] = bullet;

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);

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
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);
        }

        preRender() {
            this.animation.run();
        }

        render() {

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);

            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

            $globals.gl.activeTexture($globals.gl.TEXTURE0);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.useProgram(program);

            instExt.drawArraysInstancedANGLE($globals.gl.TRIANGLES, 0, this.verticeCount, this.instances);
        }
    }

    export class _InstancedCluster_ {
        constructor(vertices, textureSrc, useLight) {

            this.vao = ext.createVertexArrayOES();
            this.linked = false;
            this.isCluster = true;
            this.vertices = vertices;
            this.offsets = [];
            this.useLight = useLight;
            this.textureSrc = textureSrc;
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

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);

            this.offsetBuffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            instExt.vertexAttribDivisorANGLE(locations.offset, 1);
            $globals.gl.enableVertexAttribArray(locations.offset);

            this.texture = $globals.gl.createTexture();

            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrc);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            $globals.gl.disableVertexAttribArray(locations.textrUnit);
        }
        texture;
        buffer;
        segments;
        obstacle;
        pickup;

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
            this.offsets[i + 2] = (-rotation) * (Math.PI / 180);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);
        }

        link(xOffset = 0, yOffset = 0, rotation = 0) {

            let m = this.members * 3;

            this.offsets[m] = xOffset;
            this.offsets[m + 1] = yOffset;
            this.offsets[m + 2] = (-rotation) * (Math.PI / 180);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);

            this.instances++;

            return this.members++;
        }

        unlink(index) {
            let i = index * 3;

            delete this.offsets[i];
            delete this.offsets[i + 1];
            delete this.offsets[i + 2];

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.offsetBuffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.offsets), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.offset, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.offset);
        }

        render() {
            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
            if (this.useLight) {
                $globals.gl.uniform1f(locations.darkness, 1);
                $globals.gl.blendFuncSeparate($globals.gl.DST_COLOR, $globals.gl.DST_ALPHA, $globals.gl.ONE, $globals.gl.ONE);
            }

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

            $globals.gl.activeTexture($globals.gl.TEXTURE0);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
            $globals.gl.useProgram(program);

            instExt.drawArraysInstancedANGLE($globals.gl.TRIANGLES, 0, this.verticeCount, this.instances);
            if (this.useLight) {
                $globals.gl.uniform1f(locations.darkness, this.map.darkness + $globals.globalDarkness);
                $globals.gl.blendFunc($globals.gl.ONE, $globals.gl.ONE_MINUS_SRC_ALPHA);
            }
        }
    }

    export class _MixedStaticCluster_ {

        static groupings = {
            "0": [$globals.$TEXTURES.road, $globals.$TEXTURES.roaddouble, $globals.$TEXTURES.roadcorner, $globals.$TEXTURES.roadtricorner, $globals.$TEXTURES.roadquadcorner],
            "1": [$globals.$TEXTURES.urbanfence, $globals.$TEXTURES.urbanfencevertical, $globals.$TEXTURES.urbanfencehalf],
        };

        constructor(textureSrcs = [], stride = 6, topLayer) {
            this.vao = ext.createVertexArrayOES();
            this.linked = false;
            this.isCluster = true;
            this.stride = stride;
            this.sources = [];
            this.vertices = [];
            this.textures = [];
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

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.DYNAMIC_DRAW);

            for (let i = 0; i < textureSrcs.length; i++) {
                this.textures[i] = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[i]);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrcs[i]);
                //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);
            }
        }
        texture;
        buffer;
        segments;
        obstacle;
        pickup;

        delete() {
            this.map.unlink(this.id);
        }

        addTexture(name, textureSrc) {
            if (!this.sources.includes(name) && this.textures.length < 8) {
                this.sources.push(name);
                this.textures[this.textures.length] = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures.at(-1));
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrc);
                //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);
            }
        }

        translate(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
        }

        translateVertices(index, vertices, x = 0, y = 0, rotation = 0) {
            this.vertices[index] = offsetVertices(vertices, x, y, rotation, this.stride);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices.flat(1)), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 24, 0); // 20
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 24, 12);
            $globals.gl.vertexAttribPointer(locations.textrUnit, 1, $globals.gl.FLOAT, false, 24, 20);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
            $globals.gl.enableVertexAttribArray(locations.textrUnit);
        }

        link(vertices, xOffset = 0, yOffset = 0, rotation = 0) {

            if (!this.linked) {
                $CURRENT_MAP.link(this);
                this.linked = true;
            }

            this.vertices.push(offsetVertices(vertices, xOffset, yOffset, rotation, this.stride));

            let v = this.vertices.flat(1);
            this.verticeCount = v.length;

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(v), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 24, 0); // 20
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 24, 12);
            $globals.gl.vertexAttribPointer(locations.textrUnit, 1, $globals.gl.FLOAT, false, 24, 20);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
            $globals.gl.enableVertexAttribArray(locations.textrUnit);

            this.members++;

            return this.vertices.length - 1;
        }

        unlink(clusterIndex) {

            delete this.vertices[clusterIndex];

            let v = this.vertices.flat(1);
            this.verticeCount = v.length;

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(v), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 24, 0); // 20
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 24, 12);
            $globals.gl.vertexAttribPointer(locations.textrUnit, 1, $globals.gl.FLOAT, false, 24, 20);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
            $globals.gl.enableVertexAttribArray(locations.textrUnit);
        }

        render() {
            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);

            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

            for (let i = 0; i < this.textures.length; i++) {
                eval(`$globals.gl.activeTexture($globals.gl.TEXTURE${i})`);
                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[i]);
            }

            $globals.gl.useProgram(program);

            $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.verticeCount / this.stride);
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

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.DYNAMIC_DRAW);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.disableVertexAttribArray(locations.tcoords);
            $globals.gl.disableVertexAttribArray(locations.textrUnit);
        }

        delete() {
            this.map.unlink(this.id);
        }

        showShot(p1, p2) {
            let [x1, y1] = p1, [x2, y2] = p2, index = this.vertices.length;

            this.vertices.push(x1, y1, 0, x2, y2, 0);

            ext.bindVertexArrayOES(this.vao);

            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.disableVertexAttribArray(locations.tcoords);
            $globals.gl.disableVertexAttribArray(locations.textrUnit);

            return index;
        }

        removeShot(index) {
            this.vertices.splice(index, 6, undefined, undefined, undefined, undefined, undefined, undefined);

            ext.bindVertexArrayOES(this.vao);

            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.DYNAMIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 12, 0);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.disableVertexAttribArray(locations.tcoords);
            $globals.gl.disableVertexAttribArray(locations.textrUnit);
        }

        translate(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
        }

        render() {

            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
            $globals.gl.uniform4fv(locations.color, [0, 0, 0, 1.0]);
            $globals.gl.uniform1i(locations.lines, 1);
            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

            $globals.gl.useProgram(program);

            $globals.gl.drawArrays($globals.gl.LINES, 0, this.vertices.length / 3);
            $globals.gl.uniform1i(locations.lines, 0);
            $globals.gl.uniform4fv(locations.color, [0, 0, 0, 0.0]);
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

                this.buffer = $globals.gl.createBuffer();
                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);

                this.texture = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.downwardlight);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

                $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0); // 20
                $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
                $globals.gl.enableVertexAttribArray(locations.coords);
                $globals.gl.enableVertexAttribArray(locations.tcoords);
                $globals.gl.disableVertexAttribArray(locations.offset);
                $globals.gl.disableVertexAttribArray(locations.textrUnit);

                $globals.gl.useProgram(program);
            }, function() {

                ext.bindVertexArrayOES(this.vao);
                $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
                $globals.gl.uniform1f(locations.rotation, this.trans.rotation);

                $globals.gl.uniform1f(locations.darkness, 1);
                $globals.gl.uniform4fv(locations.lightColor, this._color);
                $globals.gl.blendFuncSeparate($globals.gl.DST_COLOR, $globals.gl.DST_ALPHA, $globals.gl.ONE, $globals.gl.ONE);

                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.activeTexture($globals.gl.TEXTURE0);
                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.useProgram(program);

                $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.vertices.length / 5);

                $globals.gl.uniform1f(locations.darkness, this.map.darkness + $globals.globalDarkness);
                $globals.gl.blendFunc($globals.gl.ONE, $globals.gl.ONE_MINUS_SRC_ALPHA);
                $globals.gl.uniform4fv(locations.lightColor, [0, 0, 0, 0]);
            }, 70, 70, initialX, initialY, initialRotation);
            this.textureSrc = $globals.$TEXTURES.downwardlight;
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
        texture = $globals.$TEXTURES.grass1;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class Grass2 extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        name = "grass2";
        clusterName = "grass2";
        texture = $globals.$TEXTURES.grass2;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class Rocks1 extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        clusterName = "three rocks";
        texture = $globals.$TEXTURES.rocks1;
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
        texture = $globals.$TEXTURES.rocks2;
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
        texture = $globals.$TEXTURES.book1;

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
        texture = $globals.$TEXTURES.book2;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class RoadRail extends _InstancedClusterClient_ {

        static _defaultVertices = [-13.2, 5.7, 1, 0, 0, -9.799999999999999, 5.7, 1, 0.06640625, 0, -13.2, -5.7, 1, 0, 0.4453125, -9.799999999999999, 5.7, 1, 0.06640625, 0, -13.2, -5.7, 1, 0, 0.4453125, -9.799999999999999, -5.7, 1, 0.06640625, 0.4453125, 9.8, 5.7, 1, 0.44921875, 0, 13.2, 5.7, 1, 0.515625, 0, 9.8, -5.7, 1, 0.44921875, 0.4453125, 13.2, 5.7, 1, 0.515625, 0, 9.8, -5.7, 1, 0.44921875, 0.4453125, 13.2, -5.7, 1, 0.515625, 0.4453125, -10.2, 4.7, 1, 0.05859375, 0.0390625, 10.2, 4.7, 1, 0.45703125, 0.0390625, -10.2, -3.9000000000000004, 1, 0.05859375, 0.375, 10.2, 4.7, 1, 0.45703125, 0.0390625, -10.2, -3.9000000000000004, 1, 0.05859375, 0.375, 10.2, -3.9000000000000004, 1, 0.45703125, 0.375];

        width = 26.4;
        height = 11.4;
        clusterName = "road rail";
        texture = $globals.$TEXTURES.roadrail;
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
        texture = $globals.$TEXTURES.roadrailvertical;
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
        texture = $globals.$TEXTURES.streetlight;
        obstacle = true;
        segments = [
            [-0.7, 16.2, 1.4, 8]
        ];
        topLayer = true;
        on = false;

        constructor(initialX, initialY, initialRotation, color) {
            super(initialX, initialY, initialRotation);
            this._color = color || [255, 255, 255, 1];
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
        texture = $globals.$TEXTURES.bench;
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
        texture = $globals.$TEXTURES.tile;
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
        texture = $globals.$TEXTURES.lightswitch;
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
        texture = $globals.$TEXTURES.chair;
        obstacle = true;
        interactable = true;
        minDistance = 12;
        segments = [
            [-5.2, -7.5, 10.4, 13.6]
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
        texture = $globals.$TEXTURES.smallplant;
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

        static _defaultVertices = [-4, 15.4, 1, 0, 0, 4, 15.4, 1, 0.625, 0, -4, 4.6, 1, 0, 0.2109375, 4, 15.4, 1, 0.625, 0, -4, 4.6, 1, 0, 0.2109375, 4, 4.6, 1, 0.625, 0.2109375, -0.7999999999999998, 4.999999999999998, 1, 0.25, 0.203125, 0.7999999999999998, 4.999999999999998, 1, 0.375, 0.203125, -0.7999999999999998, -15.4, 1, 0.25, 0.6015625, 0.7999999999999998, 4.999999999999998, 1, 0.375, 0.203125, -0.7999999999999998, -15.4, 1, 0.25, 0.6015625, 0.7999999999999998, -15.4, 1, 0.375, 0.6015625];

        width = 8;
        height = 30.8;
        name = "road sign";
        clusterName = "road sign";
        texture = $globals.$TEXTURES.roadsign;
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
        texture = $globals.$TEXTURES.laptop;
        height = 9.72;
        name = "laptop";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class UrbanFence extends _MixedStaticClusterClient_ {

        static _defaultVertices = [-24.2, 14.2, 1, 0, 0, 0, 24.2, 14.2, 1, 0.9453125, 0, 0, -24.2, -14.2, 1, 0, 0.5546875, 0, 24.2, 14.2, 1, 0.9453125, 0, 0, -24.2, -14.2, 1, 0, 0.5546875, 0, 24.2, -14.2, 1, 0.9453125, 0.5546875, 0];

        width = 48.4;
        height = 28.4;
        name = "urban fence";
        obstacle = true;
        clusterName = "urban fence";
        grouping = 1;
        texture = $globals.$TEXTURES.urbanfence;
        segments = [
            [-24.2, -14.2, 48.4, 28.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class UrbanFenceVertical extends _StaticClusterClient_ {

        static _defaultVertices = [-2.2, 28.2, 1, 0, 0, 1, 2.2, 28.2, 1, 0.6875, 0, 1, -2.2, -28.2, 1, 0, 0.55078125, 1, 2.2, 28.2, 1, 0.6875, 0, 1, -2.2, -28.2, 1, 0, 0.55078125, 1, 2.2, -28.2, 1, 0.6875, 0.55078125, 1];

        width = 4.4;
        height = 56.4;
        name = "urban fence vertical";
        clusterName = "urban fence";
        grouping = 1;
        texture = $globals.$TEXTURES.urbanfencevertical;
        obstacle = true;
        segments = [
            [-2.2, -28.2, 4.4, 56.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class UrbanFenceHalf extends _StaticClusterClient_ {

        static _defaultVertices = [-12.2, 14.2, 1, 0, 0, 2, 12.2, 14.2, 1, 0.953125, 0, 2, -12.2, -14.2, 1, 0, 0.5546875, 2, 12.2, 14.2, 1, 0.953125, 0, 2, -12.2, -14.2, 1, 0, 0.5546875, 2, 12.2, -14.2, 1, 0.953125, 0.5546875, 2];

        width = 24.4;
        height = 28.4;
        name = "urban fence half";
        clusterName = "urban fence";
        grouping = 1;
        texture = $globals.$TEXTURES.urbanfencehalf;
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
        texture = $globals.$TEXTURES.picnictable;
        segments = [
            [-14.2, -6.3, 8.4, 18.4],
            [-6.2, -8.7, 12.4, 20.4],
            [5.8, -6.3, 8.4, 18.4]
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

        static _defaultVertices = [-25, 14.1, 1, 0, 0, 0, 25, 14.1, 1, 0.9765625, 0, 0, -25, -14.1, 1, 0, 0.55078125, 0, 25, 14.1, 1, 0.9765625, 0, 0, -25, -14.1, 1, 0, 0.55078125, 0, 25, -14.1, 1, 0.9765625, 0.55078125, 0];

        width = 50;
        height = 28.2;
        name = "road";
        clusterName = "road";
        bottomLayer = true;
        texture = $globals.$TEXTURES.road;
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
        texture = $globals.$TEXTURES.roaddouble;
        grouping = 0;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class RoadCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 2, 14.1, 14.1, 1, 0.55078125, 0, 2, -14.1, -14.1, 1, 0, 0.55078125, 2, 14.1, 14.1, 1, 0.55078125, 0, 2, -14.1, -14.1, 1, 0, 0.55078125, 2, 14.1, -14.1, 1, 0.55078125, 0.55078125, 2];

        width = 28.2;
        height = 28.2;
        name = "road corner";
        bottomLayer = true;
        clusterName = "road";
        texture = $globals.$TEXTURES.roadcorner;
        grouping = 0;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class RoadTriCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 3, 14.1, 14.1, 1, 0.55078125, 0, 3, -14.1, -14.1, 1, 0, 0.55078125, 3, 14.1, 14.1, 1, 0.55078125, 0, 3, -14.1, -14.1, 1, 0, 0.55078125, 3, 14.1, -14.1, 1, 0.55078125, 0.55078125, 3];

        width = 28.2;
        height = 28.2;
        name = "road tri corner";
        clusterName = "road";
        grouping = 0;
        bottomLayer = true;
        texture = $globals.$TEXTURES.roadtricorner;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class RoadQuadCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, -14.1, 1, 0.55078125, 0.55078125, 4];

        width = 28.2;
        height = 28.2;
        clusterName = "road";
        texture = $globals.$TEXTURES.roadquadcorner;
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
        texture = $globals.$TEXTURES.door;
        name = "door";
        obstacle = true;
        segments = [
            [-7.3, -0.2, 14.6, 9.4]
        ];
        topLayer = false;
        interactable = true;
        minDistance = 17;

        constructor(label, room = -1, initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
            if (label) {
                this.label = new Text(label.substring(0, 10), 50, false, this.trans.offsetX, this.trans.offsetY + 3);
            }
            this.text = label || false;
            this.roomIndex = room;
            this.room = room;
        }

        postLink() {
            if (this.label) {
                this.label.exclude = true;
                this.label.managedMovement = true;
                this.label.topLayer = true;
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
                    if ($CURRENT_MAP.centerX === 0 && $CURRENT_MAP.centerY === 0) {
                        let [x, y] = $CURRENT_MAP.spawnPoints[0];
                        $CURRENT_MAP.translate((-$CURRENT_MAP.centerX) + x, (-$CURRENT_MAP.centerY) + y);
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
        texture = $globals.$TEXTURES.table;
        obstacle = true;
        segments = [
            [-14.2, -9.3, 28.4, 16.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    /* Buildings */

    export class _Building_ extends _StaticClusterClient_ {
        constructor(initialX, initialY, initialRotation, doors = [], rooms) {
            super(initialX, initialY, initialRotation);

            this.doors = [];
            this.rooms = rooms || [new _Map_(150, 80, false).init([
                [0, 35]
            ])];

            for (let i of doors) {
                this.doors.push(new Trigger(this.trans.offsetX + i[0], this.trans.offsetY + i[1], (function() {

                    $CURRENT_MAP.move = false;

                    requestTransition((function() {
                        $CURRENT_MAP = this.rooms[i[2]];
                        $AVATAR.rotate(180);
                        this.map.move = true;
                        if ($CURRENT_MAP.centerX === 0 && $CURRENT_MAP.centerY === 0) {
                            let [x, y] = $CURRENT_MAP.spawnPoints[0];
                            $CURRENT_MAP.translate((-$CURRENT_MAP.centerX) + x, (-$CURRENT_MAP.centerY) + y);
                        }
                    }).bind(this));
                }).bind(this), true));
            }
        }

        postLink() {
            for (let d of this.doors) {
                this.map.link(d);
            }

            for (let i of this.rooms) {
                this.map.addSubMap(i);
            }
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

    export class GenericApartment extends _Building_ {

        static _defaultVertices = [-32.2, 23, 1, 0, 0, 32.2, 23, 1, 0.62890625, 0, -32.2, -7.4, 1, 0, 0.59375, 32.2, 23, 1, 0.62890625, 0, -32.2, -7.4, 1, 0, 0.59375, 32.2, -7.4, 1, 0.62890625, 0.59375, -30.200000000000003, -7, 1, 0.01953125, 0.5859375, 30.199999999999996, -7, 1, 0.609375, 0.5859375, -30.200000000000003, -21.4, 1, 0.01953125, 0.8671875, 30.199999999999996, -7, 1, 0.609375, 0.5859375, -30.200000000000003, -21.4, 1, 0.01953125, 0.8671875, 30.199999999999996, -21.4, 1, 0.609375, 0.8671875, 12.799999999999997, -21, 1, 0.439453125, 0.859375, 25.199999999999996, -21, 1, 0.560546875, 0.859375, 12.799999999999997, -26.4, 1, 0.439453125, 0.96484375, 25.199999999999996, -21, 1, 0.560546875, 0.859375, 12.799999999999997, -26.4, 1, 0.439453125, 0.96484375, 25.199999999999996, -26.4, 1, 0.560546875, 0.96484375];

        width = 64.4;
        height = 46;
        name = "generic apartment";
        clusterName = "generic apartment";
        texture = $globals.$TEXTURES.genericapartment;
        obstacle = true;
        segments = [
            [-32.2, -23, 64.4, 30.4],
            [-30.2, 7, 60.4, 14.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation, [
                [19, -20, 0]
            ]);
        }
    }

    export class Cafe extends _Building_ {

        static _defaultVertices = [-40.2, 30.2, 1, 0, 0, 40.2, 30.2, 1, 0.78515625, 0, -40.2, -12.2, 1, 0, 0.4140625, 40.2, 30.2, 1, 0.78515625, 0, -40.2, -12.2, 1, 0, 0.4140625, 40.2, -12.2, 1, 0.78515625, 0.4140625, -38.2, -9.8, 1, 0.01953125, 0.390625, 38.2, -9.8, 1, 0.765625, 0.390625, -38.2, -30.2, 1, 0.01953125, 0.58984375, 38.2, -9.8, 1, 0.765625, 0.390625, -38.2, -30.2, 1, 0.01953125, 0.58984375, 38.2, -30.2, 1, 0.765625, 0.58984375];

        width = 80.4;
        height = 60.4;
        name = "cafe";
        clusterName = "cafe";
        texture = $globals.$TEXTURES.cafe;
        obstacle = true;
        segments = [
            [-40.2, -30.2, 80.4, 42.4],
            [-38.2, 9.8, 76.4, 20.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation, [
                [20, 20, 0]
            ]);
        }
    }

    export class Supermarket extends _StaticClusterClient_ {

        static _defaultVertices = [-62.2, 26.2, 1, 0, 0, 62.2, 26.2, 1, 0.607421875, 0, -62.2, -8.2, 1, 0, 0.3359375, 62.2, 26.2, 1, 0.607421875, 0, -62.2, -8.2, 1, 0, 0.3359375, 62.2, -8.2, 1, 0.607421875, 0.3359375, -60.2, -7.800000000000001, 1, 0.009765625, 0.33203125, 60.2, -7.800000000000001, 1, 0.59765625, 0.33203125, -60.2, -26.2, 1, 0.009765625, 0.51171875, 60.2, -7.800000000000001, 1, 0.59765625, 0.33203125, -60.2, -26.2, 1, 0.009765625, 0.51171875, 60.2, -26.2, 1, 0.59765625, 0.51171875];

        width = 124.4;
        height = 52.4;
        name = "supermarket";
        clusterName = "supermarket";
        texture = $globals.$TEXTURES.supermarket;
        obstacle = true;
        segments = [
            [-62.2, -26.2, 124.4, 34.4],
            [-60.2, 7.8, 120.4, 18.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    /* Weapons and Firearms */

    export class _Pickup_ extends _InstancedClusterClient_ {
        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, typeof initialRotation === "number" || random(360));

            this.ring = new PickupRing(this.trans.offsetX, this.trans.offsetY);
            this.ring.exclude = true;
        }

        pickup = true;
        interactable = true;
        minDistance = 5;

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
            this.ring.translate(x, y, rotation, translateVertices);

            this.trans.offsetX += x;
            this.trans.offsetY += y;
            if (rotation) {
                this.trans.rotation = rotation;
            }
            if (translateVertices) this.cluster.translateVertices(this.clusterIndex, x, y, this.trans.rotation * (Math.PI / 180));
        }
    }

    export class _Gun_ extends _Pickup_ {

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }

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
        texture = $globals.$TEXTURES.kitchenknife;
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
        texture = $globals.$TEXTURES.assassinsknife;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class CombatKnife extends _Blade_ {

        static _defaultVertices = [-3.4899999999999998, 4.630000000000001, 1, 0, 0, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, -4.630000000000001, 1, 0.5453125, 0.7234375];

        width = 6.9799999999999995;
        height = 9.260000000000002;
        clusterName = "combat knife";
        texture = $globals.$TEXTURES.combatknife;
        name = "combat knife";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class GLOCK_20 extends _Gun_ {

        static _properties = {
            fireRate: 1,
            bulletSpeed: 5,
            damage: 10,
            accuracy: 5,
            nozzelLength: 13,
            capacity: 15,
            reloadTime: 3
        }

        static _defaultVertices = [-4.390000000000001, 3.0900000000000003, 1, 0, 0, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, -3.0900000000000003, 1, 0.6859375000000001, 0.965625];

        width = 8.780000000000001;
        height = 6.180000000000001;
        name = "$globals.glock 20";
        clusterName = "$globals.glock 20";
        texture = $globals.$TEXTURES.$globals.glock20;

        constructor(initialX, initialY, initialRotation, bullets) {
            super(initialX, initialY, initialRotation);
            this.bullets = bullets ?? 15;
        }
    }

    export class GP_K100 extends _Gun_ {

        static _defaultVertices = [-7.4, 3.0900000000000003, 1, 0, 0, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, -3.0900000000000003, 1, 0.578125, 0.965625];

        width = 14.8;
        height = 6.180000000000001;
        name = "gp k100";
        clusterName = "gp k100";
        texture = $globals.$TEXTURES.gpk100;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    export class NXR_44_MAG extends _Gun_ {

        static _defaultVertices = [-6.910000000000001, 3.44, 1, 0, 0, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, -3.44, 1, 0.5398437500000001, 0.5375];

        width = 13.820000000000002;
        height = 6.88;
        clusterName = "nxr 44 mag";
        texture = $globals.$TEXTURES.nxr44mag;
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
        texture = $globals.$TEXTURES.kc357;
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
        texture = $globals.$TEXTURES.usp45;
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
        texture = $globals.$TEXTURES.pickupring;

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
            this.body = [
                [-7.0200000000000005, 4.28, 1, 0, 0, 0, 7.0200000000000005, 4.28, 1, 0.5484375, 0, 0, -7.0200000000000005, -4.28, 1, 0, 0.66875, 0, 7.0200000000000005, 4.28, 1, 0.5484375, 0, 0, -7.0200000000000005, -4.28, 1, 0, 0.66875, 0, 7.0200000000000005, -4.28, 1, 0.5484375, 0.66875, 0],
                [-7.12, 21.5, 1, -0.00390625, -0.001953125, 0, 6.920000000000001, 21.5, 1, 0.54453125, -0.001953125, 0, -7.12, -21.299999999999997, 1, -0.00390625, 0.833984375, 0, 6.920000000000001, 21.5, 1, 0.54453125, -0.001953125, 0, -7.12, -21.299999999999997, 1, -0.00390625, 0.833984375, 0, 6.920000000000001, -21.299999999999997, 1, 0.54453125, 0.833984375, 0]
            ];

            this.eyes = [
                [-2.58, 3.2800000000000002, 1, 0.17265625, 0.078125, 1, 2.8200000000000003, 3.2800000000000002, 1, 0.38359375, 0.078125, 1, -2.58, 1.3800000000000008, 1, 0.17265625, 0.2265625, 1, 2.8200000000000003, 3.2800000000000002, 1, 0.38359375, 0.078125, 1, -2.58, 1.3800000000000008, 1, 0.17265625, 0.2265625, 1, 2.8200000000000003, 1.3800000000000008, 1, 0.38359375, 0.2265625, 1]
            ];

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
                baseSpeed: 1,
                speed: 1,
                armor: 0,
                invinsible: false,
                kills: 0,
                passive: false,
                aggressive: false,
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
                    engaged: false
                },
                path: {
                    current: [],
                    index: 0,
                    engaged: false,
                    start: undefined,
                    end: undefined
                },
                targetId: undefined,
                target: {
                    current: undefined,
                    id: [],
                    engaged: false
                },
                reload: {
                 time: 0,
                 limit: 0,
                 progress: 0,
                 reloading: false
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
                targetUpdateAnimation: new LoopAnimation(function() {
                    const map = (this.map || $CURRENT_MAP);

                    if (this.state.attack.multiple) {
                        let targetDistance = this.state.attack.engageDistance,
                            target;

                        for (let i in map.avatars) {
                            if (map.avatars[i].id === this.id) continue;

                            let {
                                offsetX: targetX,
                                offsetY: targetY
                            } = map.avatars[i].trans;
                            let dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY);
                            if (((this.state.target.id.includes(this.map.avatars[i].state.targetId) && !this.state.attack.invertTargets) || (!this.state.target.id.includes(this.map.avatars[i].state.targetId) && this.state.attack.invertTargets)) && dist < targetDistance) {                   
                                targetDistance = dist;
                                target = map.avatars[i];
                            }
                        }
                     
                        if ((targetDistance === this.state.attack.engageDistance && this.state.target.engaged && this.state.attack.forget) || target === undefined) this.disengageTarget();

                        if (this.state.target.current !== target) {
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

                    this.rotate((Math.atan2(this.state.goto.y - this.trans.offsetY, this.state.goto.x - this.trans.offsetX) - 1.5708) * 180 / Math.PI);

                    this.translate(tx, ty);

                    if (this.state.goto.x === this.trans.offsetX && this.state.goto.y === this.trans.offsetY) this.disengageGoto();
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
                    this.state.position.body.texture = 5;
                }, function() {
                    this.state.position.body.texture = 4;
                }], this, [0.05, 0.05], function() {
                    this.state.position.body.texture = 4;
                }, 0.5),
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
                        texture: 0,
                        vertices: 0
                    },
                    eyes: {
                        texture: 0,
                        vertices: 0
                    }
                }
            }

            this.textures = [];

            ext.bindVertexArrayOES(this.vao);

            this.buffer = $globals.gl.createBuffer();
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array([...this.body[this.state.position.body.vertices], ...this.eyes[this.state.position.eyes.vertices]]), $globals.gl.STATIC_DRAW);

            this.textures[0] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE0);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[0]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatar);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            this.textures[1] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE1);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[1]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatarblinking);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            this.textures[2] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE2);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[2]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatarwalking1);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            this.textures[3] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE3);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[3]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatarwalking2);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            this.textures[4] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE4);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[4]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatardrawweapon);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            this.textures[5] = $globals.gl.createTexture();

            $globals.gl.activeTexture($globals.gl.TEXTURE5);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[5]);
            $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.avatardraw$globals.glock20pullback);
            //$globals.gl.generateMipmap($globals.gl.TEXTURE_2D);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
            $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 24, 0); // 20
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 24, 12);
            $globals.gl.vertexAttribPointer(locations.textrUnit, 1, $globals.gl.FLOAT, false, 24, 20);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
            $globals.gl.enableVertexAttribArray(locations.textrUnit);
            $globals.gl.disableVertexAttribArray(locations.offset);
            $globals.gl.useProgram(program);
        }

        translate(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
            this.nameObj.translate(x, y);
            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
        }

        rotate(a) {
            a = a * Math.PI / 180;
            this.trans.rotation = a;
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
        }

        postLink() {

            this.state.targetUpdateAnimation.rate = this.state.attack.reactionTime;

            this.state.fireAnimation = new LoopAnimation(function() {

                this.state.recoilAnimation.start();

                const map = (this.map || $CURRENT_MAP);
                const [initialX, initialY] = rotate(0, 1, (this.trans.rotation) * 180 / Math.PI);

                let r = random(this.state.equippedItems.mainTool.constructor._properties.accuracy || 0);
                r = (Math.random() < 0.5) ? -r : r;
                let [x, y, ro] = rotate(initialX, initialY, r);

                let [nx, ny] = rotate(0, this.state.equippedItems.mainTool.constructor._properties.nozzelLength, (this.trans.rotation) * 180 / Math.PI);

                map.link(new Bullet(nx + this.trans.offsetX, ny + this.trans.offsetY, ((this.trans.rotation) * 180 / Math.PI) + 90, (x) * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, (y) * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, this.state.equippedItems.mainTool.constructor._properties.damage, this));

                this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo--;

            }, this, 0);
        }

        hit(damage, x, y, owner) {
            if (!this.state.invinsible) {
                (this.state.armor > 0) ? this.state.armor -= damage: this.state.vitals.health -= damage;
                if (this.state.vitals.health <= 0) {
                    let a = (this.map ?? $CURRENT_MAP).avatars[owner.id];
                    if (a) a.state.kills += 1;
                    this.purgeItems(5);
                    this.delete();
                }
            }

           if (this.state.passive && !this.state.aggressive) {
             this.run();
           } else if (!this.state.target.id.includes(owner.state.targetId) && ($CURRENT_MAP || this.map).avatars[owner.id] && this.state.aggressive) {
            this.state.target.id.push(owner.state.targetId);
            this.state.target.engaged = true;
            this.state.attack.multiple = true;
           }
        }

        drawWeapon() {
            if (this.state.armed) {
                this.state.draw = true;
                this.state.position.body.texture = 4;
                this.state.position.body.vertices = 1;
            }
        }

        holsterWeapon() {
            if (this.state.armed) {
                this.state.draw = false;
                this.state.position.body.texture = 0;
                this.state.position.body.vertices = 0;
            }
        }

        addItem(item, slot) {
            let r = this.inventory.addItem(item, slot);
            if (this.inventory.count === 1) this.equipItem(slot ?? this.inventory.count - 1);
            return r;
        }

        removeItem(slot) {
            let item = this.inventory.ejectItem(slot);

            switch (item.type) {
                case "gun": {
                    if (item.slot === this.state.equippedItems.mainTool.slot) {
                        this.state.armed = false;
                        this.state.equippedItems.mainTool = undefined;
                    }
                };
                break;
            }
 
            item.ring.trans.offsetX = item.trans.offsetX = this.trans.offsetX+random(10,true);
            item.ring.trans.offsetY = item.trans.offsetY = this.trans.offsetY+random(10,true);
            item.trans.rotation = random(360);

            ($CURRENT_MAP || this.map).link(item);

            return true;
        } 

        purgeItems(limit) {
          for (let i = 0; i < limit; i++) {
            if (this.inventory.items[i]) this.removeItem(i); 
          }
        }

        equipItem(slot) {
            let item = this.inventory.items[slot];

            if (item) {
                switch (item.type) {
                    case "gun": {
                        this.state.armed = true;
                        this.state.equippedItems.mainTool = item;
                        this.state.fireAnimation.rate = 0.5 / this.state.equippedItems.mainTool.constructor._properties.fireRate;
                    }
                    break;
                }

                return true;
            }
            return false;
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
                this.state.position.body.texture = 4;
                this.state.position.body.vertices = 1;
            }

            if (this.state.fire && this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo) {
                this.state.fireAnimation.run();
                this.state.recoilAnimation.run();
            }

            if (this.state.recording.useRecording) this.state.recordAnimation.run();
            if (this.state.goto.engaged) this.state.gotoAnimation.run();

            // walk to path
            walk: if (this.state.path.engaged && !this.state.goto.engaged) {
                    if (this.state.recording.useRecording) this.pauseRecording(); 
 
                let {
                    x,
                    y
                } = this.state.path.current[this.state.path.index];
                if (this.map.GRAPH.find(x, y).blocked === false) {
                    this.goto(x + 5, y - 5);
                } else if (this.state.path.index === 0) {
                    this.disengagePath();
                } else {
                    this.findPathTo(this.state.path.end.x, this.state.path.end.y);
                    break walk;
                }

                this.state.path.index++;
                if (this.state.path.index === this.state.path.current.length) this.disengagePath();
            }

            // attack target(s)

            if (this.state.target.id.length > 0) this.state.targetUpdateAnimation.run();

            attack: if (this.state.target.current && this.state.target.engaged) {
              
                const m = this.map || $CURRENT_MAP;
                if (this.map.avatars[this.state.target.current.id]) {

                    const {
                        offsetX: targetX,
                        offsetY: targetY
                    } = this.state.target.current.trans, dist = distance(this.trans.offsetX, this.trans.offsetY, targetX, targetY);
                    if (dist > this.state.attack.disengageDistance) {
                        this.disengageTarget();
                    } else if (dist > this.state.attack.engageDistance) {
                        this.state.speed = this.state.baseSpeed * this.state.attack.attackSpeed;
                        this.state.fire = false;
                        if (!this.state.openCarry && this.state.draw) this.holsterWeapon();
                        if (!this.state.path.engaged) this.findPathTo(targetX + m.centerX, targetY + m.centerY);
                    } else if (dist < this.state.attack.settleDistance) {
                        if (this.state.path.engaged) this.disengagePath();
                        this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                        if (!this.state.draw) {
                            this.drawWeapon();
                            this.state.fire = true;
                        }
                    } else if (dist < this.state.attack.slowdownDistance) {
                        this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                        if (!this.state.draw) {
                            this.drawWeapon();
                            this.state.fire = true;
                        }
                        this.state.speed = (this.state.baseSpeed / 3) * this.state.attack.attackSpeed;
                    } else if (dist < this.state.attack.engageDistance) {
                        this.state.speed = this.state.baseSpeed * this.state.attack.attackSpeed;
                        this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                        if (!this.state.draw) {
                            this.drawWeapon();
                            this.state.fire = true;
                        }
                        if (!this.state.path.engaged) this.findPathTo(targetX + m.centerX, targetY + m.centerY);
                    }

                    break attack;
                }

                this.disengageTarget();
            }

        }

        render() {
            this.nameObj.render();

            $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
            ext.bindVertexArrayOES(this.vao);
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array([...this.body[this.state.position.body.vertices], ...this.eyes[this.state.position.eyes.vertices]]), $globals.gl.STATIC_DRAW);

            $globals.gl.activeTexture($globals.gl.TEXTURE0);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[this.state.position.body.texture]);
            $globals.gl.activeTexture($globals.gl.TEXTURE1);
            $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textures[this.state.position.eyes.texture]);
            $globals.gl.useProgram(program);

            $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, 12);
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
            this.disengagePath();

            if (this.state.openCarry) {
                this.drawWeapon();
            } else {
                this.holsterWeapon();
            }
        }
  
        run() {
          if (!this.state.path.engaged) {
            let {x, y} = ($CURRENT_MAP || this.map).GRAPH.getRandomPoint();            
            this.findPathTo(x,y);
          }
        }

        findPathTo(x, y) {

            this.disengagePath();
            let p = false;

            if ((x >= -this.map.width / 2 && x < this.map.width / 2) && (y <= this.map.height / 2 && y > -this.map.height / 2)) {
                this.state.path.start = this.map.GRAPH.getPoint(this.trans.offsetX + this.map.centerX, this.trans.offsetY + this.map.centerY);
                this.state.path.end = this.map.GRAPH.getPoint(x, y);

                p = this.map.GRAPH.getPath(this.state.path.start.unit, this.state.path.end.unit);
                if (!p) return p;

                this.state.path.current = p.path;
                this.state.path.current.unshift({
                    x: this.state.path.start.x,
                    y: this.state.path.start.y
                });

                if (p.result) {
                    this.state.path.index = 0;
                    this.state.path.engaged = true;
                }
            }
            return p;
        }

        disengagePath() {
            this.state.path.start = undefined;
            this.state.path.end = undefined;
            this.state.path.current = [];
            this.state.path.index = 0;
            this.state.path.engaged = false;

            this.disengageGoto();
        }

        gotoAvatar() {
            return this.findPathTo(this.map.centerX, this.map.centerY);
        }

        delete() {
            this.map.unlink(this.id);
        }
    }

    // Class for invisible barriers
    export class Barrier {
        constructor(x, y, width, height) {
            this.segments = [
                [0, 0, width, height]
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
    }

    // class for visible barriers
    export class VisibleBarrier extends _Object_ {
        constructor(initialX, initialY, width, height, color = [40, 40, 40, 1.0]) {
            super([], function() {

                this.vertices = cut([
                    [-width / 2, -height / 2, width, height]
                ], false, [1], true);
                this.width = width;
                this.height = height;
                this.color = color;

                this.buffer = $globals.gl.createBuffer();
                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);

                $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 12, 0);
                $globals.gl.enableVertexAttribArray(locations.coords);
                $globals.gl.disableVertexAttribArray(locations.tcoords);
                $globals.gl.disableVertexAttribArray(locations.textrUnit);

                $globals.gl.useProgram(program);
            }, function() {
                ext.bindVertexArrayOES(this.vao);
                $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
                $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
                $globals.gl.uniform4fv(locations.color, [...fromRGB(this.color)]);
                $globals.gl.uniform1i(locations.lines, 1);

                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.activeTexture($globals.gl.TEXTURE0);
                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.useProgram(program);

                $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.vertices.length / 3);
                $globals.gl.uniform1i(locations.lines, 0);
                $globals.gl.uniform4fv(locations.color, [0, 0, 0, 0]);
            }, width, height, initialX, initialY, 0);
            this.segments = [
                [-width / 2, -height / 2, width, height]
            ];
            this.obstacle = true;
            this.name = "visible barrier";
            this.type = "barrier";
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

    // class for map creation
    export class _Map_ {

        static _recording = {
            isRecording: false,
            recording: []
        };

        constructor(width, height, root = true) {
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
            this.locations = {};
            this.clusters = {};
            this.interactables = {};
            this.GRAPH = new Graph(this.units.width, this.units.height);
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
        }

        render() {
            $globals.gl.uniform1f(locations.scale, 1);
            this.groundPlate.render();
            $globals.gl.uniform1f(locations.scale, scale);
            $globals.gl.uniform1f(locations.darkness, this.darkness + $globals.globalDarkness);

            if (_Map_._recording.isRecording) _Map_._recording.recording.push($CURRENT_MAP.centerX, $CURRENT_MAP.centerY, $AVATAR.trans.rotation * 180 / Math.PI, $AVATAR.state.walking);

            this.renderBottomLayer();

            for (let i in this.objects) {

                let ob = this.objects[i];
                if (ob.preRender && !this.freeze) ob.preRender();

                if (!(ob instanceof Barrier || ob instanceof Trigger) && !ob.bottomLayer && !ob.topLayer && !ob.hasCluster && !ob.hidden && this.show) {
                    ob.render();
                }
            }
        }

        renderTopLayer() {
            if (this.show) {
                for (let i in this.objects) {

                    let ob = this.objects[i];

                    if (!(ob instanceof Barrier || ob instanceof Trigger) && !ob.bottomLayer && ob.topLayer && !ob.hasCluster && !ob.hidden) {
                        ob.render();
                    }
                }

                if (!this._lineMatrix.hidden) this._lineMatrix.render();
            }
        }

        renderBottomLayer() {
            if (this.show) {
                for (let i in this.objects) {

                    let ob = this.objects[i];

                    if (!(ob instanceof Barrier || ob instanceof Trigger) && !ob.topLayer && ob.bottomLayer && !ob.hasCluster && !ob.hidden) {
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
                            if (!this.clusters[obj.clusterName]) this.registerCluster(obj.clusterName, new obj.clusterType(obj.texture, obj.topLayer));
                            obj.cluster = this.clusters[obj.clusterName];
                            obj.cluster.bottomLayer = obj.bottomLayer;
                            obj.cluster.topLayer = obj.topLayer;
                            obj.clusterIndex = this.clusters[obj.clusterName].link(obj.constructor._defaultVertices, -this.clusters[obj.clusterName].trans.offsetX + obj.trans.offsetX, -this.clusters[obj.clusterName].trans.offsetY + obj.trans.offsetY, obj.trans.rotation);
                        };
                        break;
                        case _InstancedCluster_: {
                            if (!this.clusters[obj.clusterName]) this.registerCluster(obj.clusterName, new obj.clusterType(obj.constructor._defaultVertices, obj.texture, obj.type === "light"));
                            obj.cluster = this.clusters[obj.clusterName];
                            obj.cluster.bottomLayer = obj.bottomLayer;
                            obj.cluster.topLayer = obj.topLayer;
                            obj.clusterIndex = this.clusters[obj.clusterName].link(-this.clusters[obj.clusterName].trans.offsetX + obj.trans.offsetX, -this.clusters[obj.clusterName].trans.offsetY + obj.trans.offsetY, obj.trans.rotation);
                        };
                        break;
                        case _MixedStaticCluster_: {
                            if (!this.clusters[obj.clusterName]) this.registerCluster(obj.clusterName, new obj.clusterType(_MixedStaticCluster_.groupings[obj.grouping]));
                            obj.cluster = this.clusters[obj.clusterName];
                            obj.cluster.bottomLayer = obj.bottomLayer;
                            obj.cluster.topLayer = obj.topLayer;
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
                if (obj.interactable) this.interactables[obj.id] = obj;
                if (obj.type === "avatar") this.avatars[obj.id] = obj;

                if (obj.isCluster) obj.linked = true;

                if (obj.postLink) obj.postLink();

                if (obj.obstacle && obj.name !== "avatar") {
                    for (let i of obj.segments) {
                        this.GRAPH.evalObstacle((i[0] + obj.trans.offsetX) + this.centerX, (-(i[1]) + obj.trans.offsetY) + this.centerY, i[2], i[3]);
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
                if (this.objects[id].hasCluster) {
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
                            frame = frame.concat([ob.text, ob.roomIndex, ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI)]);
                            break;
                        case "visible barrier":
                            frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.width, ob.height, ob.color]);
                            break;
                        case "street light":
                            frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation, ob._color]);
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
                        for (let segment of this.obstacles[i].segments) {

                            let [ox,
                                oy,
                                ow,
                                oh
                            ] = segment;

                            ox = (0 + ox) + this.obstacles[i].trans.offsetX;
                            ox += ow / 2;
                            oy = (0 - oy) + this.obstacles[i].trans.offsetY;
                            oy -= oh / 2;

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
        ]) {
            // attach any default objects or clusters for all maps, etc.
            this._bulletMatrix = new _BulletCluster_([-0.9, 0.4, 1, 0, 0, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, -0.4, 1, 0.5625, 0.5], $globals.$TEXTURES.bullet);
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
                let exit = new Door(false, -1, 0, (this.height / 2) + 9.2);
                exit.exclude = true;
                let light = new LightSwitch(25, (this.height / 2) + 12);
                light.exclude = true;

                this.link(exit);
                this.link(light);
            }

            return this;
        }
    }

    export class Text extends _Object_ {
        constructor(text, size = 30, color, initialX, initialY, initialRotation, textureSrc, segments) {
            super([], function() {
                let textData = createText(text, size);

                this.vertices = textData.vertices;
                this.text = text;
                this.width = textData.width;
                this.height = textData.height;
                this.color = color || [0, 0, 0, 1];
                this.size = size;

                this.buffer = $globals.gl.createBuffer();
                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);

                this.texture = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.font);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

                $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0); // 20
                $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
                $globals.gl.enableVertexAttribArray(locations.coords);
                $globals.gl.enableVertexAttribArray(locations.tcoords);
                $globals.gl.disableVertexAttribArray(locations.offset);
                $globals.gl.disableVertexAttribArray(locations.textrUnit);

                $globals.gl.useProgram(program);
            }, function() {
                ext.bindVertexArrayOES(this.vao);
                $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
                $globals.gl.uniform1f(locations.rotation, this.trans.rotation);

                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.activeTexture($globals.gl.TEXTURE0);
                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.useProgram(program);
                $globals.gl.uniform4fv(locations.color, this._color);
                $globals.gl.uniform1i(locations.textColor, 1);

                $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.vertices.length / 5);
                $globals.gl.uniform4fv(locations.color, [0, 0, 0, 0]);
                $globals.gl.uniform1i(locations.textColor, 0);
            }, undefined, undefined, initialX, initialY, initialRotation);
            this.textureSrc = textureSrc;
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
            $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
            $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);
            $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0); // 20
            $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
            $globals.gl.enableVertexAttribArray(locations.coords);
            $globals.gl.enableVertexAttribArray(locations.tcoords);
        }

        set color(code) {
            this._color = fromRGB(code);
        }
    }

    /* GAME CONTROL ELEMENTS */

    export class _Button_ extends _Object_ {
        constructor(textureSrc, textureActiveSrc, initialX, initialY, action, radius) {
            super([-8.571428571428571, 8.571428571428571, 1, 0, 0, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, -8.571428571428571, 1, 1, 1], function() {

                this.buffer = $globals.gl.createBuffer();
                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, new Float32Array(this.vertices), $globals.gl.STATIC_DRAW);

                this.texture = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureSrc);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

                this.textureActive = $globals.gl.createTexture();

                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textureActive);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, textureActiveSrc);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

                $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0); // 20
                $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);
                $globals.gl.enableVertexAttribArray(locations.coords);
                $globals.gl.enableVertexAttribArray(locations.tcoords);
                $globals.gl.disableVertexAttribArray(locations.offset);
                $globals.gl.disableVertexAttribArray(locations.textrUnit);
                $globals.gl.useProgram(program);
            }, function() {
                ext.bindVertexArrayOES(this.vao);
                $globals.gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
                $globals.gl.uniform1f(locations.rotation, this.trans.rotation);
                $globals.gl.uniform1f(locations.scale, this.scale);

                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                $globals.gl.activeTexture($globals.gl.TEXTURE0);
                if (this.active) {
                    $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.textureActive);
                } else {
                    $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                }
                $globals.gl.useProgram(program);

                $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, this.vertices.length / 5);
            }, radius * 2, radius * 2, initialX, initialY, 0);
            this.type = "button";
            this.scale = 1;
            this.radius = radius;
            this.action = action;
        }
    }

    export class _Joystick_ extends _Object_ {

        constructor(left, scale = 1) {
            super([
                0, 0, 1, 0, 0, 30, 0, 1, 1, 0, 0, 30, 1, 0, 1, 30, 0, 1, 1, 0, 0, 30, 1, 0, 1, 30, 30, 1, 1, 1
            ], function() {

                this.buffer = $globals.gl.createBuffer();
                $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);

                this.texture = $globals.gl.createTexture();
                $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                $globals.gl.texImage2D($globals.gl.TEXTURE_2D, 0, $globals.gl.RGBA, $globals.gl.RGBA, $globals.gl.UNSIGNED_BYTE, $globals.$TEXTURES.joystick_disc);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MAG_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_MIN_FILTER, $globals.gl.LINEAR);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_S, $globals.gl.CLAMP_TO_EDGE);
                $globals.gl.texParameteri($globals.gl.TEXTURE_2D, $globals.gl.TEXTURE_WRAP_T, $globals.gl.CLAMP_TO_EDGE);

                $globals.gl.vertexAttribPointer(locations.coords, 3, $globals.gl.FLOAT, false, 20, 0);
                $globals.gl.vertexAttribPointer(locations.tcoords, 2, $globals.gl.FLOAT, false, 20, 12);

                $globals.gl.enableVertexAttribArray(locations.coords);
                $globals.gl.enableVertexAttribArray(locations.tcoords);
                $globals.gl.disableVertexAttribArray(locations.offset);
                $globals.gl.disableVertexAttribArray(locations.textrUnit);

            }, function() {
                if (this.base.anchored) {
                    ext.bindVertexArrayOES(this.vao);
                    $globals.gl.uniform2fv(locations.translation, [this.base.x * scale, this.base.y * scale]);
                    $globals.gl.uniform1f(locations.rotation, 0);
                    $globals.gl.uniform1f(locations.scale, this.scale);

                    $globals.gl.bindBuffer($globals.gl.ARRAY_BUFFER, this.buffer);
                    $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, this.vertices, $globals.gl.DYNAMIC_DRAW);
                    $globals.gl.activeTexture($globals.gl.TEXTURE0);
                    $globals.gl.bindTexture($globals.gl.TEXTURE_2D, this.texture);
                    $globals.gl.useProgram(program);
                    $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, 6);

                    $globals.gl.uniform2fv(locations.translation, [this.thumb.x * scale, this.thumb.y * scale]);
                    $globals.gl.bufferData($globals.gl.ARRAY_BUFFER, this.thumbVertices, $globals.gl.DYNAMIC_DRAW);
                    $globals.gl.drawArrays($globals.gl.TRIANGLES, 0, 6);

                    if ($CURRENT_MAP.move) {
                        if (left) {
                            $CURRENT_MAP.translate((this.distance.x * this.scale) * movementMultFactor, (this.distance.y * this.scale) * movementMultFactor);
                        }

                        $AVATAR.trans.rotation = this.rotation;
                    }

                }
            }, 30, 30);
            this.base = {
                x: 0,
                y: 0,
                width: 30 / scale,
                height: 30 / scale,
                anchored: false,
                radius: 15 / scale
            };
            this.scale = scale;
            this.thumb = {
                x: 0,
                y: 0,
                width: 16.66 / scale,
                height: 16.66 / scale
            };
            this.thumbVertices = new Float32Array([0, 0, 1, 0, 0, 16.666666666666668, 0, 1, 1, 0, 0, 16.666666666666668, 1, 0, 1, 16.666666666666668, 0, 1, 1, 0, 0, 16.666666666666668, 1, 0, 1, 16.666666666666668, 16.666666666666668, 1, 1, 1]);
            this.distance = {
                x: 0,
                y: 0,
                absolute: 0
            };
            this.rotation = undefined;
            this.ratio = 0;
            this.left = left;
            this.id = undefined;
        }

        unanchor() {
            this.base.anchored = false;

            // deactivate player firing when the left joystick is lifted 
            if (!this.left && $CURRENT_MAP.move) {
                $AVATAR.state.fire = false;
            }
        }

        translate(x, y) {

            if (!this.base.anchored) {

                this.base.x = x - this.base.width / 2;
                this.base.y = y - this.base.height / 2;
                this.base.anchored = true;
            }
            this.thumb.x = x - this.thumb.width / 2;
            this.thumb.y = y - this.thumb.height / 2;

            this.distance.absolute = Math.round(distance(this.base.x + this.base.width / 2, this.base.y + this.base.height / 2, x, y));

            // activate player firing state when the left joystick is at the edge, and viceversa
            if (!this.left && $CURRENT_MAP.move) {
                if (this.distance.absolute === this.base.radius && $AVATAR.state.armed) {
                    $AVATAR.state.fire = true;
                } else {
                    $AVATAR.state.fire = false;
                }
            }

            this.distance.x = ((this.thumb.x + (this.thumb.width / 2)) - (this.base.x + (this.base.width / 2)));
            this.distance.y = ((this.thumb.y + (this.thumb.height / 2)) - (this.base.y + (this.base.height / 2)));
            this.rotation = Math.atan2((this.thumb.y + this.thumb.width / 2) - (this.base.y + this.base.height / 2), (this.thumb.x + this.thumb.width / 2) - (this.base.x + this.base.width / 2)) - 1.5708;
            this.ratio = this.distance.x / this.distance.y;
        }
    }

