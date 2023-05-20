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
    rotate
} from "./lib.js";

import {
    Map1
} from "./maps.js";
import Graph from "./pathfinder.js";

/*
@TODO 
- Fix bullets going through walls at high speeds
- place objects animations and updates in preRender
*/

// Setup...
window.onload = () => {

    /* MAIN SETUP */

    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl");
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let log = document.querySelector("textarea");
    let loadingScreen = document.querySelector("#loading-screen");
    let gameStats = document.querySelector("#game-stats");
    let info = document.querySelector("p");
    let consoleActive = false;

    // MAIN GLOBAL ENTITIES

    let $JOYSTICK_L, $JOYSTICK_R, $CURRENT_MAP, $ACTION_BUTTON, $AVATAR;

    // STORAGE FOR GAME ELEMENTS AND ONSCREEN CONTROLS 
    const _OBJECTS_ = [];
    const _CONTROLS_ = [];

    // Main setup...
    let vw = window.innerWidth,
        vh = window.innerHeight;
    let ma = Math.max(vw, vh);
    let mi = Math.min(vw, vh);
    let scale = 1.2;
    let joystickSizes = {
        left: 1.5,
        right: 1.5
    };
    let bulletResolution = 0.001;
    let ra = ma / mi;
    let xPercent;
    let yPercent;
    let movementDivFactor = 4;
    let globalDarkness = 0;
    let useTransition = true;
    let mapAnchor = {
        x: 0,
        y: 0
    };

    if (ma == vw) {
        xPercent = 0.01 + (0.01 / ra);
        yPercent = 0.01 + (0.01 * ra);
    } else {
        xPercent = 0.01 + (0.01 * ra);
        yPercent = 0.01 + (0.01 / ra);
    }

    let pWidth = 2 / xPercent;
    let pHeight = 2 / yPercent;

    console.log(gl.getSupportedExtensions());
    const ext = gl.getExtension("OES_vertex_array_object");
    const instExt = gl.getExtension("ANGLE_instanced_arrays");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const textureSources = {
        avatar: document.querySelector("#avatar"),
        joystick_disc: document.querySelector("#joystick_disc"),
        building: document.querySelector("#building"),
        glock43x: document.querySelector("#glock43x"),
        krissvector: document.querySelector("#krissvector"),
        nxr44mag: document.querySelector("#nxr44mag"),
        gpk100: document.querySelector("#gpk100"),
        usp45: document.querySelector("#usp45"),
        glock20: document.querySelector("#glock20"),
        kc357: document.querySelector("#kc357"),
        cafe: document.querySelector("#cafe"),
        supermarket: document.querySelector("#supermarket"),
        genericapartment: document.querySelector("#genericapartment"),
        avatarblinking: document.querySelector("#avatarblinking"),
        avatarwalking1: document.querySelector("#avatarwalking1"),
        avatarwalking2: document.querySelector("#avatarwalking2"),
        kitchenknife: document.querySelector("#kitchenknife"),
        assassinsknife: document.querySelector("#assassinsknife"),
        combatknife: document.querySelector("#combatknife"),
        book1: document.querySelector("#book1"),
        book2: document.querySelector("#book2"),
        table: document.querySelector("#table"),
        laptop: document.querySelector("#laptop"),
        road: document.querySelector("#road"),
        roadcorner: document.querySelector("#roadcorner"),
        roadtricorner: document.querySelector("#roadtricorner"),
        roadquadcorner: document.querySelector("#roadquadcorner"),
        roaddouble: document.querySelector("#roaddouble"),
        bullet: document.querySelector("#bullet"),
        bulletshell: document.querySelector("#bulletshell"),
        roadsign: document.querySelector("#roadsign"),
        picnictable: document.querySelector("#picnictable"),
        doublecrosstile: document.querySelector("#doublecrosstile"),
        urbanfence: document.querySelector("#urbanfence"),
        urbanfencevertical: document.querySelector("#urbanfencevertical"),
        urbanfencehalf: document.querySelector("#urbanfencehalf"),
        smallplant: document.querySelector("#smallplant"),
        tile: document.querySelector("#tile"),
        streetlight: document.querySelector("#streetlight"),
        bench: document.querySelector("#bench"),
        grass1: document.querySelector("#grass1"),
        grass2: document.querySelector("#grass2"),
        rocks1: document.querySelector("#rocks1"),
        rocks2: document.querySelector("#rocks2"),
        font: document.querySelector("#font"),
        actionbutton: document.querySelector("#actionbutton"),
        actionbuttonactive: document.querySelector("#actionbuttonactive"),
        roadrail: document.querySelector("#roadrail"),
        roadrailvertical: document.querySelector("#roadrailvertical"),
        pickupring: document.querySelector("#pickupring"),
        chair: document.querySelector("#chair"),
        door: document.querySelector("#door"),
        lightswitch: document.querySelector("#lightswitch"),
        downwardlight: document.querySelector("#downwardlight"),
        avatardrawweapon: document.querySelector("#avatardrawweapon"),
        avatardrawglock20pullback: document.querySelector("#avatardrawglock20pullback"),
    }

    // main program

    let vShaderSrc = `
        #version 100

        precision highp float;

        attribute vec3 coords;
        attribute vec2 tcoords;
        attribute float textrUnit;
        attribute vec3 offset;

        varying vec2 textrCoords;
        varying float textr;

        uniform float vw;
        uniform float vh;

        float ma = max(vw,vh);
        float mi = min(vw,vh);
        float ra = ma/mi;
        float xPercent;
        float yPercent;
        float x;
        float y;
        mat2 rm;

        uniform vec2 translation;
        uniform float rotation;
        uniform float scale;

        void translate() {
        float transX = offset[0] + translation.x;
        float transY = offset[1] + translation.y;
        
        /* Set offset rotation to 0.001 to cancel instancing */
        
        if (offset[2] == 0.001) {
            transX = translation.x;
            transY = translation.y;
        }
        
        x += transX;
        y += transY;
        }

        void rotate() {

        float tempX = x;
        float r = offset[2];
        
        /* Set offset rotation to 10.0 to cancel instancing */
        
        if (offset[2] == 0.001) {
            r = rotation;
        }

        x = (cos(r)*x)+(-sin(r)*y);
        y = (sin(r)*tempX)+(cos(r)*y);
        }

        void main() {

        x = coords.x;
        y = coords.y;

        if (ma == vw) {
        xPercent = 0.01+(0.01/ra);
        yPercent = 0.01+(0.01*ra);
        } else {
        xPercent = 0.01+(0.01*ra);
        yPercent = 0.01+(0.01/ra);
        }

        /* Pipeline Functions */

        rotate();
        translate();

        x *= xPercent;
        y *= yPercent;

        gl_Position = vec4(x,y,coords.z,scale);
        textrCoords = tcoords;
        textr = textrUnit;
        }
        `;

    let fShaderSrc = `
        #version 100

        precision highp float;

        uniform sampler2D textr1;
        uniform sampler2D textr2;
        uniform sampler2D textr3;
        uniform sampler2D textr4;
        uniform sampler2D textr5;
        uniform sampler2D textr6;
        uniform sampler2D textr7;
        uniform sampler2D textr8;
        uniform vec4 color;
        uniform float darkness;
        uniform float transparency;
        uniform vec4 lightColor;
        uniform int lines;
        uniform int textColor;
        
        varying vec2 textrCoords;
        varying float textr;

        void main() {
        vec4 texture = texture2D(textr1,textrCoords);
        
        if (textr == 0.0) {
         texture = texture2D(textr1,textrCoords);
        } else if (textr == 1.0) {
            texture = texture2D(textr2,textrCoords);
        } else if (textr == 2.0) {
            texture = texture2D(textr3,textrCoords);
        } else if (textr == 3.0) {
            texture = texture2D(textr4,textrCoords);
        } else if (textr == 4.0) {
            texture = texture2D(textr5,textrCoords);
        } else if (textr == 5.0) {
            texture = texture2D(textr6,textrCoords);
        } else if (textr == 6.0) {
            texture = texture2D(textr7,textrCoords);
        } else if (textr == 7.0) {
            texture = texture2D(textr8,textrCoords);
        }
        
        vec4 fragment;
        
        if (lines == 0) {
            fragment = texture;
        } 
        
        if ((textColor == 1 && fragment[0] == 0.0 && fragment[1] == 0.0 && fragment[2] == 0.0 && fragment[3] > 0.0) || lines == 1) {
            fragment = color;
        }
        
          fragment[0] = fragment[0]/darkness;
          fragment[1] = fragment[1]/darkness;
          fragment[2] = fragment[2]/darkness;
          fragment[3] = fragment[3]*transparency;

        if (lightColor[3] != 0.0 && !(fragment[0] == 0.0 && fragment[1] == 0.0 && fragment[2] == 0.0 && fragment[3] == 0.0)) {
          fragment[0] = lightColor[0];
          fragment[1] = lightColor[1];
          fragment[2] = lightColor[2];
        }
                   
        gl_FragColor = fragment;
        }
        `;

    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vShaderSrc);
    gl.compileShader(vShader);
    let vsLog = gl.getShaderInfoLog(vShader);
    if (vsLog.length > 0) console.log(vsLog);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fShaderSrc);
    gl.compileShader(fShader);
    let fsLog = gl.getShaderInfoLog(fShader);
    if (fsLog.length > 0) console.log(fsLog);

    let program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    const locations = {
        vw: gl.getUniformLocation(program, "vw"),
        vh: gl.getUniformLocation(program, "vh"),
        textr1: gl.getUniformLocation(program, "textr1"),
        textr2: gl.getUniformLocation(program, "textr2"),
        textr3: gl.getUniformLocation(program, "textr3"),
        textr4: gl.getUniformLocation(program, "textr4"),
        textr5: gl.getUniformLocation(program, "textr5"),
        textr6: gl.getUniformLocation(program, "textr6"),
        textr7: gl.getUniformLocation(program, "textr7"),
        textr8: gl.getUniformLocation(program, "textr8"),
        coords: gl.getAttribLocation(program, "coords"),
        tcoords: gl.getAttribLocation(program, "tcoords"),
        textrUnit: gl.getAttribLocation(program, "textrUnit"),
        offset: gl.getAttribLocation(program, "offset"),
        translation: gl.getUniformLocation(program, "translation"),
        scale: gl.getUniformLocation(program, "scale"),
        rotation: gl.getUniformLocation(program, "rotation"),
        lines: gl.getUniformLocation(program, "lines"),
        darkness: gl.getUniformLocation(program, "darkness"),
        transparency: gl.getUniformLocation(program, "transparency"),
        color: gl.getUniformLocation(program, "color"),
        textColor: gl.getUniformLocation(program, "textColor"),
        lightColor: gl.getUniformLocation(program, "lightColor")
    }

    gl.uniform1f(locations.vw, window.innerWidth);
    gl.uniform1f(locations.vh, window.innerHeight);
    gl.uniform1i(locations.textr1, 0);
    gl.uniform1i(locations.textr2, 1);
    gl.uniform1i(locations.textr3, 2);
    gl.uniform1i(locations.textr4, 3);
    gl.uniform1i(locations.textr5, 4);
    gl.uniform1i(locations.textr6, 5);
    gl.uniform1i(locations.textr7, 6);
    gl.uniform1i(locations.textr8, 7);
    gl.uniform1f(locations.scale, scale);
    gl.uniform1f(locations.darkness, 1);
    gl.uniform1f(locations.transparency, 1);
    gl.uniform1i(locations.lines, 1);
    gl.uniform4fv(locations.color, [0, 0, 0, 0]);
    gl.uniform1i(locations.textColor, 0);
    gl.uniform4fv(locations.lightColor, [0, 0, 0, 0]);

    gl.vertexAttrib3fv(locations.offset, new Float32Array([0, 0, 0.001]));
    gl.vertexAttrib1f(locations.textrUnit, 0);

    /* CLASSES FOR CONSTRUCTING GAME ELEMENTS */

    // Game element base class
    class _Object_ {
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

    class _StaticCluster_ {
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

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

            this.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrc);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.disableVertexAttribArray(locations.offset);
            gl.disableVertexAttribArray(locations.textrUnit);
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

    class _BulletCluster_ {
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
                                    if (this.map.obstacles[o].hit) this.map.obstacles[o].hit(b.damage, b.rate.x, b.rate.y);
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

            this.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrc);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.disableVertexAttribArray(locations.textrUnit);
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
            gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(locations.offset);
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

    class _InstancedCluster_ {
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

            this.texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrc);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.disableVertexAttribArray(locations.textrUnit);
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
            gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(locations.offset);
        }

        link(xOffset = 0, yOffset = 0, rotation = 0) {

            let m = this.members * 3;

            this.offsets[m] = xOffset;
            this.offsets[m + 1] = yOffset;
            this.offsets[m + 2] = (-rotation) * (Math.PI / 180);

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

            ext.bindVertexArrayOES(this.vao);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.offsets), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(locations.offset, 3, gl.FLOAT, false, 12, 0);
            gl.enableVertexAttribArray(locations.offset);
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

    class _MixedStaticCluster_ {

        static groupings = {
            "0": [textureSources.road, textureSources.roaddouble, textureSources.roadcorner, textureSources.roadtricorner, textureSources.roadquadcorner],
            "1": [textureSources.urbanfence, textureSources.urbanfencevertical, textureSources.urbanfencehalf],
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

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

            for (let i = 0; i < textureSrcs.length; i++) {
                this.textures[i] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrcs[i]);
                //gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
                this.textures[this.textures.length] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.textures.at(-1));
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrc);
                //gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
        }

        translate(x, y) {
            this.trans.offsetX += x;
            this.trans.offsetY += y;
        }

        translateVertices(index, vertices, x = 0, y = 0, rotation = 0) {
            this.vertices[index] = offsetVertices(vertices, x, y, rotation, this.stride);

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

            if (!this.linked) {
                $CURRENT_MAP.link(this);
                this.linked = true;
            }

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

    class _LineMatrix_ {
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

    class _MixedStaticClusterClient_ {

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

    class _StaticClusterClient_ {

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

    class _InstancedClusterClient_ {

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

    class _BulletClusterClient_ {

        hasCluster = true;
        name = "bullet";
        id = genObjectId();
        exclude = true;

        constructor(initialX = 0, initialY = 0, initialRotation = 0, translationX = 0, translationY = 0, damage = 1) {
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

    class DownwardLight extends _Object_ {
        constructor(initialX, initialY, initialRotation, color) {
            super([], function() {

                this.vertices = [-35, 35, 1, 0, 0, 35, 35, 1, 1, 0, -35, -35, 1, 0, 1, 35, 35, 1, 1, 0, -35, -35, 1, 0, 1, 35, -35, 1, 1, 1];

                this.buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

                this.texture = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.downwardlight);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0); // 20
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

                gl.uniform1f(locations.darkness, this.map.darkness + globalDarkness);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.uniform4fv(locations.lightColor, [0, 0, 0, 0]);
            }, 70, 70, initialX, initialY, initialRotation);
            this.textureSrc = textureSources.downwardlight;
            this.name = "downward light";
            this.topLayer = true;
            this.color = color || [0, 0, 0, 0];
        }

        set color(code) {
          this._color = fromRGB(code); 
        }
    }

    class Bullet extends _BulletClusterClient_ {

        width = 1.8;
        height = 0.8;

        constructor(initialX, initialY, initialRotation, translationX, translationY, damage) {
            super(initialX, initialY, initialRotation, translationX, translationY, damage);
        }
    }

    class Grass extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        name = "grass";
        clusterName = "grass";
        texture = textureSources.grass1;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class Grass2 extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        name = "grass2";
        clusterName = "grass2";
        texture = textureSources.grass2;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class Rocks1 extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        clusterName = "three rocks";
        texture = textureSources.rocks1;
        name = "three rocks";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation || random(360));
        }
    }

    class Rocks2 extends _InstancedClusterClient_ {

        static _defaultVertices = [-1.5, 1.5, 1, 0, 0, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, 1.5, 1, 0.9375, 0, -1.5, -1.5, 1, 0, 0.9375, 1.5, -1.5, 1, 0.9375, 0.9375];

        width = 2;
        height = 2;
        clusterName = "two rocks";
        texture = textureSources.rocks2;
        name = "two rocks";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation || random(360));
        }
    }

    /* Misc props */

    class Book1 extends _InstancedClusterClient_ {

        static _defaultVertices = [-3.0100000000000002, 4.16, 1, 0, 0, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, -4.16, 1, 0.940625, 0.65];

        width = 6.0200000000000005;
        height = 8.32;
        name = "black book";
        clusterName = "black book";
        texture = textureSources.book1;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class Book2 extends _InstancedClusterClient_ {

        static _defaultVertices = [-3.0100000000000002, 4.16, 1, 0, 0, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, 4.16, 1, 0.940625, 0, -3.0100000000000002, -4.16, 1, 0, 0.65, 3.0100000000000002, -4.16, 1, 0.940625, 0.65];

        width = 6.0200000000000005;
        height = 8.32;
        name = "white book";
        clusterName = "white book";
        texture = textureSources.book2;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class RoadRail extends _InstancedClusterClient_ {

        static _defaultVertices = [-13.2, 5.7, 1, 0, 0, -9.799999999999999, 5.7, 1, 0.06640625, 0, -13.2, -5.7, 1, 0, 0.4453125, -9.799999999999999, 5.7, 1, 0.06640625, 0, -13.2, -5.7, 1, 0, 0.4453125, -9.799999999999999, -5.7, 1, 0.06640625, 0.4453125, 9.8, 5.7, 1, 0.44921875, 0, 13.2, 5.7, 1, 0.515625, 0, 9.8, -5.7, 1, 0.44921875, 0.4453125, 13.2, 5.7, 1, 0.515625, 0, 9.8, -5.7, 1, 0.44921875, 0.4453125, 13.2, -5.7, 1, 0.515625, 0.4453125, -10.2, 4.7, 1, 0.05859375, 0.0390625, 10.2, 4.7, 1, 0.45703125, 0.0390625, -10.2, -3.9000000000000004, 1, 0.05859375, 0.375, 10.2, 4.7, 1, 0.45703125, 0.0390625, -10.2, -3.9000000000000004, 1, 0.05859375, 0.375, 10.2, -3.9000000000000004, 1, 0.45703125, 0.375];

        width = 26.4;
        height = 11.4;
        clusterName = "road rail";
        texture = textureSources.roadrail;
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

    class RoadRailVertical extends _StaticClusterClient_ {

        static _defaultVertices = [-1.7, 12.7, 1, 0, 0, 1.7, 12.7, 1, 0.53125, 0, -1.7, -12.7, 1, 0, 0.49609375, 1.7, 12.7, 1, 0.53125, 0, -1.7, -12.7, 1, 0, 0.49609375, 1.7, -12.7, 1, 0.53125, 0.49609375];

        width = 3.4;
        height = 25.4;
        name = "road rail vertical";
        clusterName = "road rail vertical";
        texture = textureSources.roadrailvertical;
        obstacle = true;
        segments = [
            [-1.7, -12.7, 3.4, 25.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class StreetLight extends _StaticClusterClient_ {

        static _defaultVertices = [-15.5, 24.5, 1, 0, 0, 15.5, 24.5, 1, 0.60546875, 0, -15.5, -24.5, 1, 0, 0.95703125, 15.5, 24.5, 1, 0.60546875, 0, -15.5, -24.5, 1, 0, 0.95703125, 15.5, -24.5, 1, 0.60546875, 0.95703125];

        width = 31;
        height = 49;
        name = "street light";
        clusterName = "street light";
        texture = textureSources.streetlight;
        obstacle = true;
        segments = [
            [-0.7, 16.2, 1.4, 8]
        ];
        topLayer = true;
        on = false;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);

            this.lights = [new DownwardLight(this.trans.offsetX - 13, this.trans.offsetY - 11.5,0,[177,135,255,1]), new DownwardLight(this.trans.offsetX + 13, this.trans.offsetY - 11.5,0,[177,135,255,1])];
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

    class Bench extends _StaticClusterClient_ {

        static _defaultVertices = [-12.2, 7.7, 1, 0, 0, 12.2, 7.7, 1, 0.953125, 0, -12.2, -7.7, 1, 0, 0.6015625, 12.2, 7.7, 1, 0.953125, 0, -12.2, -7.7, 1, 0, 0.6015625, 12.2, -7.7, 1, 0.953125, 0.6015625];

        width = 24.4;
        height = 15.4;
        name = "bench";
        clusterName = "bench";
        texture = textureSources.bench;
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

    class Tile extends _StaticClusterClient_ {

        static _defaultVertices = [-4.2, 4.2, 1, 0, 0, 4.2, 4.2, 1, 0.65625, 0, -4.2, -4.2, 1, 0, 0.65625, 4.2, 4.2, 1, 0.65625, 0, -4.2, -4.2, 1, 0, 0.65625, 4.2, -4.2, 1, 0.65625, 0.65625];

        width = 8.4;
        height = 8.4;
        clusterName = "tile";
        texture = textureSources.tile;
        bottomLayer = true;
        name = "tile";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class LightSwitch extends _StaticClusterClient_ {

        static _defaultVertices = [-1.6, 2.4, 1, 0, 0, 1.6, 2.4, 1, 0.5, 0, -1.6, -2.4, 1, 0, 0.75, 1.6, 2.4, 1, 0.5, 0, -1.6, -2.4, 1, 0, 0.75, 1.6, -2.4, 1, 0.5, 0.75];

        width = 3.2;
        height = 4.8;
        clusterName = "light switch";
        texture = textureSources.lightswitch;
        name = "light switch";
        interactable = true;
        minDistance = 18;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }

        action() {
            if (this.map.darkness <= 1) {
                this.map.darkness = 5;
                this.on = false;
                return;
            }

            this.map.darkness = 1;
        }
    }

    class Chair extends _StaticClusterClient_ {

        static _defaultVertices = [-5.2, 7.5, 1, 0, 0, 5.2, 7.5, 1, 0.8125, 0, -5.2, -7.5, 1, 0, 0.5859375, 5.2, 7.5, 1, 0.8125, 0, -5.2, -7.5, 1, 0, 0.5859375, 5.2, -7.5, 1, 0.8125, 0.5859375];

        width = 10.4;
        height = 15;
        name = "chair";
        clusterName = "chair";
        texture = textureSources.chair;
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

    class SmallPlant extends _StaticClusterClient_ {

        static _defaultVertices = [-2.7, 0.5, 1, 0, 0.29296875, 2.7, 0.5, 1, 0.421875, 0.29296875, -2.7, -7.9, 1, 0, 0.62109375, 2.7, 0.5, 1, 0.421875, 0.29296875, -2.7, -7.9, 1, 0, 0.62109375, 2.7, -7.9, 1, 0.421875, 0.62109375, -2.7, 8.100000000000001, 1, 0, -0.00390625, 2.7, 8.100000000000001, 1, 0.421875, -0.00390625, -2.7, 0.09999999999999964, 1, 0, 0.30859375, 2.7, 8.100000000000001, 1, 0.421875, -0.00390625, -2.7, 0.09999999999999964, 1, 0, 0.30859375, 2.7, 0.09999999999999964, 1, 0.421875, 0.30859375];

        width = 5.4;
        height = 16;
        texture = textureSources.smallplant;
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

    class RoadSign extends _StaticClusterClient_ {

        static _defaultVertices = [-4, 15.4, 1, 0, 0, 4, 15.4, 1, 0.625, 0, -4, 4.6, 1, 0, 0.2109375, 4, 15.4, 1, 0.625, 0, -4, 4.6, 1, 0, 0.2109375, 4, 4.6, 1, 0.625, 0.2109375, -0.7999999999999998, 4.999999999999998, 1, 0.25, 0.203125, 0.7999999999999998, 4.999999999999998, 1, 0.375, 0.203125, -0.7999999999999998, -15.4, 1, 0.25, 0.6015625, 0.7999999999999998, 4.999999999999998, 1, 0.375, 0.203125, -0.7999999999999998, -15.4, 1, 0.25, 0.6015625, 0.7999999999999998, -15.4, 1, 0.375, 0.6015625];

        width = 8;
        height = 30.8;
        name = "road sign";
        clusterName = "road sign";
        texture = textureSources.roadsign;
        topLayer = true;
        obstacle = true;
        segments = [
            [-0.8, 10, 1.6, 5.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class Laptop extends _StaticClusterClient_ {

        static _defaultVertices = [-4.36, 4.86, 1, 0, 0, 4.36, 4.86, 1, 0.68125, 0, -4.36, -4.86, 1, 0, 0.759375, 4.36, 4.86, 1, 0.68125, 0, -4.36, -4.86, 1, 0, 0.759375, 4.36, -4.86, 1, 0.68125, 0.759375];

        width = 8.72;
        clusterName = "laptop";
        texture = textureSources.laptop;
        height = 9.72;
        name = "laptop";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class UrbanFence extends _MixedStaticClusterClient_ {

        static _defaultVertices = [-24.2, 14.2, 1, 0, 0, 0, 24.2, 14.2, 1, 0.9453125, 0, 0, -24.2, -14.2, 1, 0, 0.5546875, 0, 24.2, 14.2, 1, 0.9453125, 0, 0, -24.2, -14.2, 1, 0, 0.5546875, 0, 24.2, -14.2, 1, 0.9453125, 0.5546875, 0];

        width = 48.4;
        height = 28.4;
        name = "urban fence";
        obstacle = true;
        clusterName = "urban fence";
        grouping = 1;
        texture = textureSources.urbanfence;
        segments = [
            [-24.2, -14.2, 48.4, 28.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class UrbanFenceVertical extends _StaticClusterClient_ {

        static _defaultVertices = [-2.2, 28.2, 1, 0, 0, 1, 2.2, 28.2, 1, 0.6875, 0, 1, -2.2, -28.2, 1, 0, 0.55078125, 1, 2.2, 28.2, 1, 0.6875, 0, 1, -2.2, -28.2, 1, 0, 0.55078125, 1, 2.2, -28.2, 1, 0.6875, 0.55078125, 1];

        width = 4.4;
        height = 56.4;
        name = "urban fence vertical";
        clusterName = "urban fence";
        grouping = 1;
        texture = textureSources.urbanfencevertical;
        obstacle = true;
        segments = [
            [-2.2, -28.2, 4.4, 56.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class UrbanFenceHalf extends _StaticClusterClient_ {

        static _defaultVertices = [-12.2, 14.2, 1, 0, 0, 2, 12.2, 14.2, 1, 0.953125, 0, 2, -12.2, -14.2, 1, 0, 0.5546875, 2, 12.2, 14.2, 1, 0.953125, 0, 2, -12.2, -14.2, 1, 0, 0.5546875, 2, 12.2, -14.2, 1, 0.953125, 0.5546875, 2];

        width = 24.4;
        height = 28.4;
        name = "urban fence half";
        clusterName = "urban fence";
        grouping = 1;
        texture = textureSources.urbanfencehalf;
        obstacle = true;
        segments = [
            [-12.2, -14.2, 24.4, 28.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class PicnicTable extends _StaticClusterClient_ {

        static _defaultVertices = [-14.2, 6.300000000000001, 1, 0, 0.09375, -5.799999999999999, 6.300000000000001, 1, 0.1640625, 0.09375, -14.2, -12.1, 1, 0, 0.8125, -5.799999999999999, 6.300000000000001, 1, 0.1640625, 0.09375, -14.2, -12.1, 1, 0, 0.8125, -5.799999999999999, -12.1, 1, 0.1640625, 0.8125, -6.199999999999999, 8.7, 1, 0.15625, 0, 6.199999999999999, 8.7, 1, 0.3984375, 0, -6.199999999999999, -11.7, 1, 0.15625, 0.796875, 6.199999999999999, 8.7, 1, 0.3984375, 0, -6.199999999999999, -11.7, 1, 0.15625, 0.796875, 6.199999999999999, -11.7, 1, 0.3984375, 0.796875, 5.800000000000001, 6.300000000000001, 1, 0.390625, 0.09375, 14.2, 6.300000000000001, 1, 0.5546875, 0.09375, 5.800000000000001, -12.1, 1, 0.390625, 0.8125, 14.2, 6.300000000000001, 1, 0.5546875, 0.09375, 5.800000000000001, -12.1, 1, 0.390625, 0.8125, 14.2, -12.1, 1, 0.5546875, 0.8125, -8.2, -11.299999999999999, 1, 0.1171875, 0.78125, 8.2, -11.299999999999999, 1, 0.4375, 0.78125, -8.2, -15.7, 1, 0.1171875, 0.953125, 8.2, -11.299999999999999, 1, 0.4375, 0.78125, -8.2, -15.7, 1, 0.1171875, 0.953125, 8.2, -15.7, 1, 0.4375, 0.953125];

        width = 28.4;
        height = 17.4;
        name = "picnic table";
        obstacle = true;
        clusterName = "picnic table";
        texture = textureSources.picnictable;
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

    class Road extends _MixedStaticClusterClient_ {

        static _defaultVertices = [-25, 14.1, 1, 0, 0, 0, 25, 14.1, 1, 0.9765625, 0, 0, -25, -14.1, 1, 0, 0.55078125, 0, 25, 14.1, 1, 0.9765625, 0, 0, -25, -14.1, 1, 0, 0.55078125, 0, 25, -14.1, 1, 0.9765625, 0.55078125, 0];

        width = 50;
        height = 28.2;
        name = "road";
        clusterName = "road";
        bottomLayer = true;
        texture = textureSources.road;
        grouping = 0;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class RoadDouble extends _MixedStaticClusterClient_ {

        static _defaultVertices = [-25, 14.1, 1, 0, 0, 1, 25, 14.1, 1, 0.9765625, 0, 1, -25, -14.1, 1, 0, 0.55078125, 1, 25, 14.1, 1, 0.9765625, 0, 1, -25, -14.1, 1, 0, 0.55078125, 1, 25, -14.1, 1, 0.9765625, 0.55078125, 1];

        width = 50;
        height = 28.2;
        name = "road double";
        clusterName = "road";
        bottomLayer = true;
        texture = textureSources.roaddouble;
        grouping = 0;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class RoadCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 2, 14.1, 14.1, 1, 0.55078125, 0, 2, -14.1, -14.1, 1, 0, 0.55078125, 2, 14.1, 14.1, 1, 0.55078125, 0, 2, -14.1, -14.1, 1, 0, 0.55078125, 2, 14.1, -14.1, 1, 0.55078125, 0.55078125, 2];

        width = 28.2;
        height = 28.2;
        name = "road corner";
        bottomLayer = true;
        clusterName = "road";
        texture = textureSources.roadcorner;
        grouping = 0;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class RoadTriCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 3, 14.1, 14.1, 1, 0.55078125, 0, 3, -14.1, -14.1, 1, 0, 0.55078125, 3, 14.1, 14.1, 1, 0.55078125, 0, 3, -14.1, -14.1, 1, 0, 0.55078125, 3, 14.1, -14.1, 1, 0.55078125, 0.55078125, 3];

        width = 28.2;
        height = 28.2;
        name = "road tri corner";
        clusterName = "road";
        grouping = 0;
        bottomLayer = true;
        texture = textureSources.roadtricorner;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class RoadQuadCorner extends _StaticClusterClient_ {

        static _defaultVertices = [-14.1, 14.1, 1, 0, 0, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, 14.1, 1, 0.55078125, 0, 4, -14.1, -14.1, 1, 0, 0.55078125, 4, 14.1, -14.1, 1, 0.55078125, 0.55078125, 4];

        width = 28.2;
        height = 28.2;
        clusterName = "road";
        texture = textureSources.roadquadcorner;
        grouping = 0;
        bottomLayer = true;
        name = "road quad corner";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class Door extends _StaticClusterClient_ {

        static _defaultVertices = [-7.3, 10.2, 1, 0, 0, 7.3, 10.2, 1, 0.5703125, 0, -7.3, -10.2, 1, 0, 0.796875, 7.3, 10.2, 1, 0.5703125, 0, -7.3, -10.2, 1, 0, 0.796875, 7.3, -10.2, 1, 0.5703125, 0.796875];
        width = 14.6;
        height = 20.4;
        clusterName = "door";
        texture = textureSources.door;
        name = "door";
        obstacle = true;
        segments = [
            [-7.3, -0.2, 14.6, 9.4]
        ];
        topLayer = true;
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

    class Table extends _StaticClusterClient_ {

        static _defaultVertices = [-14.2, 9.3, 1, 0, 0, 14.2, 9.3, 1, 0.5546875, 0, -14.2, -7.1000000000000005, 1, 0, 0.640625, 14.2, 9.3, 1, 0.5546875, 0, -14.2, -7.1000000000000005, 1, 0, 0.640625, 14.2, -7.1000000000000005, 1, 0.5546875, 0.640625, -13.399999999999999, -6.700000000000001, 1, 0.015625, 0.625, -11, -6.700000000000001, 1, 0.0625, 0.625, -13.399999999999999, -9.3, 1, 0.015625, 0.7265625, -11, -6.700000000000001, 1, 0.0625, 0.625, -13.399999999999999, -9.3, 1, 0.015625, 0.7265625, -11, -9.3, 1, 0.0625, 0.7265625, 11, -6.700000000000001, 1, 0.4921875, 0.625, 13.400000000000002, -6.700000000000001, 1, 0.5390625, 0.625, 11, -9.3, 1, 0.4921875, 0.7265625, 13.400000000000002, -6.700000000000001, 1, 0.5390625, 0.625, 11, -9.3, 1, 0.4921875, 0.7265625, 13.400000000000002, -9.3, 1, 0.5390625, 0.7265625];

        width = 28.4;
        height = 18.6;
        name = "table";
        clusterName = "table";
        texture = textureSources.table;
        obstacle = true;
        segments = [
            [-14.2, -9.3, 28.4, 16.4]
        ];

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    /* Buildings */

    class _Building_ extends _StaticClusterClient_ {
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

    class GenericApartment extends _Building_ {

        static _defaultVertices = [-32.2, 23, 1, 0, 0, 32.2, 23, 1, 0.62890625, 0, -32.2, -7.4, 1, 0, 0.59375, 32.2, 23, 1, 0.62890625, 0, -32.2, -7.4, 1, 0, 0.59375, 32.2, -7.4, 1, 0.62890625, 0.59375, -30.200000000000003, -7, 1, 0.01953125, 0.5859375, 30.199999999999996, -7, 1, 0.609375, 0.5859375, -30.200000000000003, -21.4, 1, 0.01953125, 0.8671875, 30.199999999999996, -7, 1, 0.609375, 0.5859375, -30.200000000000003, -21.4, 1, 0.01953125, 0.8671875, 30.199999999999996, -21.4, 1, 0.609375, 0.8671875, 12.799999999999997, -21, 1, 0.439453125, 0.859375, 25.199999999999996, -21, 1, 0.560546875, 0.859375, 12.799999999999997, -26.4, 1, 0.439453125, 0.96484375, 25.199999999999996, -21, 1, 0.560546875, 0.859375, 12.799999999999997, -26.4, 1, 0.439453125, 0.96484375, 25.199999999999996, -26.4, 1, 0.560546875, 0.96484375];

        width = 64.4;
        height = 46;
        name = "generic apartment";
        clusterName = "generic apartment";
        texture = textureSources.genericapartment;
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

    class Cafe extends _Building_ {

        static _defaultVertices = [-40.2, 30.2, 1, 0, 0, 40.2, 30.2, 1, 0.78515625, 0, -40.2, -12.2, 1, 0, 0.4140625, 40.2, 30.2, 1, 0.78515625, 0, -40.2, -12.2, 1, 0, 0.4140625, 40.2, -12.2, 1, 0.78515625, 0.4140625, -38.2, -9.8, 1, 0.01953125, 0.390625, 38.2, -9.8, 1, 0.765625, 0.390625, -38.2, -30.2, 1, 0.01953125, 0.58984375, 38.2, -9.8, 1, 0.765625, 0.390625, -38.2, -30.2, 1, 0.01953125, 0.58984375, 38.2, -30.2, 1, 0.765625, 0.58984375];

        width = 80.4;
        height = 60.4;
        name = "cafe";
        clusterName = "cafe";
        texture = textureSources.cafe;
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

    class Supermarket extends _StaticClusterClient_ {

        static _defaultVertices = [-62.2, 26.2, 1, 0, 0, 62.2, 26.2, 1, 0.607421875, 0, -62.2, -8.2, 1, 0, 0.3359375, 62.2, 26.2, 1, 0.607421875, 0, -62.2, -8.2, 1, 0, 0.3359375, 62.2, -8.2, 1, 0.607421875, 0.3359375, -60.2, -7.800000000000001, 1, 0.009765625, 0.33203125, 60.2, -7.800000000000001, 1, 0.59765625, 0.33203125, -60.2, -26.2, 1, 0.009765625, 0.51171875, 60.2, -7.800000000000001, 1, 0.59765625, 0.33203125, -60.2, -26.2, 1, 0.009765625, 0.51171875, 60.2, -26.2, 1, 0.59765625, 0.51171875];

        width = 124.4;
        height = 52.4;
        name = "supermarket";
        clusterName = "supermarket";
        texture = textureSources.supermarket;
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

    class _Pickup_ extends _InstancedClusterClient_ {
        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, typeof initialRotation === "number" || random(360));

            this.ring = new PickupRing(this.trans.offsetX, this.trans.offsetY);
            this.ring.exclude = true;
        }

        pickup = true;

        postLink() {
            this.map.link(this.ring);
        }

        clean() {
            this.ring.delete();
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

    class _Gun_ extends _Pickup_ {

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }

        type = "gun";
    }

    class _Blade_ extends _Pickup_ {

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }

        type = "blade";
    }

    class KitchenKnife extends _Blade_ {

        static _defaultVertices = [-1.24, 6.57, 1, 0, 0, 1.24, 6.57, 1, 0.775, 0, -1.24, -6.57, 1, 0, 0.51328125, 1.24, 6.57, 1, 0.775, 0, -1.24, -6.57, 1, 0, 0.51328125, 1.24, -6.57, 1, 0.775, 0.51328125];

        width = 2.48;
        height = 13.14;
        clusterName = "kitchen knife";
        texture = textureSources.kitchenknife;
        name = "kitchen knife";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class AssassinsKnife extends _Blade_ {

        static _defaultVertices = [-1.73, 6.7700000000000005, 1, 0, 0, 1.73, 6.7700000000000005, 1, 0.540625, 0, -1.73, -6.7700000000000005, 1, 0, 0.52890625, 1.73, 6.7700000000000005, 1, 0.540625, 0, -1.73, -6.7700000000000005, 1, 0, 0.52890625, 1.73, -6.7700000000000005, 1, 0.540625, 0.52890625];

        width = 3.46;
        height = 13.540000000000001;
        name = "assassin's knife";
        clusterName = "assassin's knife";
        texture = textureSources.assassinsknife;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class CombatKnife extends _Blade_ {

        static _defaultVertices = [-3.4899999999999998, 4.630000000000001, 1, 0, 0, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, 4.630000000000001, 1, 0.5453125, 0, -3.4899999999999998, -4.630000000000001, 1, 0, 0.7234375, 3.4899999999999998, -4.630000000000001, 1, 0.5453125, 0.7234375];

        width = 6.9799999999999995;
        height = 9.260000000000002;
        clusterName = "combat knife";
        texture = textureSources.combatknife;
        name = "combat knife";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class GLOCK_20 extends _Gun_ {

        static _defaultVertices = [-4.390000000000001, 3.0900000000000003, 1, 0, 0, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, -3.0900000000000003, 1, 0.6859375000000001, 0.965625];

        width = 8.780000000000001;
        height = 6.180000000000001;
        name = "glock 20";
        clusterName = "glock 20";
        texture = textureSources.glock20;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class GP_K100 extends _Gun_ {

        static _defaultVertices = [-7.4, 3.0900000000000003, 1, 0, 0, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, 3.0900000000000003, 1, 0.578125, 0, -7.4, -3.0900000000000003, 1, 0, 0.965625, 7.4, -3.0900000000000003, 1, 0.578125, 0.965625];

        width = 14.8;
        height = 6.180000000000001;
        name = "gp k100";
        clusterName = "gp k100";
        texture = textureSources.gpk100;

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class NXR_44_MAG extends _Gun_ {

        static _defaultVertices = [-6.910000000000001, 3.44, 1, 0, 0, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, 3.44, 1, 0.5398437500000001, 0, -6.910000000000001, -3.44, 1, 0, 0.5375, 6.910000000000001, -3.44, 1, 0.5398437500000001, 0.5375];

        width = 13.820000000000002;
        height = 6.88;
        clusterName = "nxr 44 mag";
        texture = textureSources.nxr44mag;
        name = "nxr 44 mag";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class KC_357 extends _Gun_ {

        static _defaultVertices = [-4.26, 2.8, 1, 0, 0, 4.26, 2.8, 1, 0.665625, 0, -4.26, -2.8, 1, 0, 0.875, 4.26, 2.8, 1, 0.665625, 0, -4.26, -2.8, 1, 0, 0.875, 4.26, -2.8, 1, 0.665625, 0.875];

        width = 8.52;
        height = 5.6;
        clusterName = "kc 357";
        texture = textureSources.kc357;
        name = "kc 357";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class USP_45 extends _Gun_ {

        static _defaultVertices = [-8.15, 3.9300000000000006, 1, 0, 0, 8.15, 3.9300000000000006, 1, 0.63671875, 0, -8.15, -3.9300000000000006, 1, 0, 0.6140625000000001, 8.15, 3.9300000000000006, 1, 0.63671875, 0, -8.15, -3.9300000000000006, 1, 0, 0.6140625000000001, 8.15, -3.9300000000000006, 1, 0.63671875, 0.6140625000000001];

        width = 16.3;
        height = 7.860000000000001;
        clusterName = "usp 45";
        texture = textureSources.usp45;
        name = "usp 45";

        constructor(initialX, initialY, initialRotation) {
            super(initialX, initialY, initialRotation);
        }
    }

    class PickupRing extends _InstancedClusterClient_ {

        static _defaultVertices = [-4.28, 4.28, 1, 0, 0, 4.28, 4.28, 1, 0.66875, 0, -4.28, -4.28, 1, 0, 0.66875, 4.28, 4.28, 1, 0.66875, 0, -4.28, -4.28, 1, 0, 0.66875, 4.28, -4.28, 1, 0.66875, 0.66875];

        width = 8.56;
        height = 8.56;
        name = "pickup ring";
        clusterName = "pickup ring";
        texture = textureSources.pickupring;

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

    class Avatar {

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
            this.type = "avatar";
            this.name = "avatar";
            this.state = {
                speed: 1,
                armor: 0,
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
                recording: {
                    useRecording: false,
                    data: undefined,
                    frame: 0
                },
                walking: false,
                armed: true,
                draw: false,
                fire: false,
                weapon: {
                    fireRate: 1,
                    bulletSpeed: 2,
                    damage: 10,
                    accuracy: 5,
                    nozzelLength: 13
                },
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

            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...this.body[this.state.position.body.vertices], ...this.eyes[this.state.position.eyes.vertices]]), gl.STATIC_DRAW);

            this.textures[0] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatar);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            this.textures[1] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatarblinking);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            this.textures[2] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatarwalking1);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            this.textures[3] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatarwalking2);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            this.textures[4] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[4]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatardrawweapon);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            this.textures[5] = gl.createTexture();

            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[5]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.avatardrawglock20pullback);
            //gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 24, 0); // 20
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 24, 12);
            gl.vertexAttribPointer(locations.textrUnit, 1, gl.FLOAT, false, 24, 20);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
            gl.enableVertexAttribArray(locations.textrUnit);
            gl.disableVertexAttribArray(locations.offset);
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
            this.state.fireAnimation = new LoopAnimation(function() {
                this.state.recoilAnimation.start();

                let r = random(this.state.weapon.accuracy);
                r = (Math.random() < 0.5) ? -r : r;

                let [x, y, ro] = rotate($JOYSTICK_R.distance.x, $JOYSTICK_R.distance.y, r);
                let [nx, ny] = rotate(0, this.state.weapon.nozzelLength, ($JOYSTICK_R.rotation) * 180 / Math.PI);

                $CURRENT_MAP.link(new Bullet(nx, ny, ($JOYSTICK_R.rotation + 1.5708 + ro) * (180 / Math.PI), (x) * this.state.weapon.bulletSpeed, (y) * this.state.weapon.bulletSpeed, this.state.weapon.damage));

            }, this, 0.5 / this.state.weapon.fireRate);
        }

        hit(damage, x, y) {
            this.state.vitals.health -= damage;
            if (this.state.vitals.health <= 0) this.delete();

            if (Math.random() > 1) {
                let r = Math.random();
                (this.map ?? $CURRENT_MAP).link(new((r < 0.66) ? (r < 0.33) ? Blood2 : Blood1 : Blood3)(this.trans.offsetX, this.trans.offsetY));
            }
        }

        drawWeapon() {
            if (this.state.armed) this.state.draw = true;
            this.state.position.body.texture = 4;
            this.state.position.body.vertices = 1;
        }

        holsterWeapon() {
            this.state.draw = false;
            this.state.position.body.texture = 0;
            this.state.position.body.vertices = 0;
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

            if (this.state.fire) {
                this.state.fireAnimation.run();
            }

            this.state.recoilAnimation.run();

            if (this.state.recording.useRecording) this.state.recordAnimation.run();
            if (this.state.goto.engaged) this.state.gotoAnimation.run();
 
            // walk to path
          walk: if (this.state.path.engaged && !this.state.goto.engaged) {
        let {x,y} = this.state.path.current[this.state.path.index];            
            if (this.map.GRAPH.find(x,y).blocked === false) { 
             this.goto(x+5,y-5);
            } else if (this.state.path.index === 0) {
              this.disengagePath();
            } else {
             this.findPathTo(this.state.path.end.x,this.state.path.end.y);
             break walk;
            }

             this.state.path.index++; 
             if (this.state.path.index === this.state.path.current.length) this.disengagePath();
              }
        }

        render() {
            this.nameObj.render();

            gl.uniform2fv(locations.translation, [this.trans.offsetX, this.trans.offsetY]);
            gl.uniform1f(locations.rotation, this.trans.rotation);
            ext.bindVertexArrayOES(this.vao);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([...this.body[this.state.position.body.vertices], ...this.eyes[this.state.position.eyes.vertices]]), gl.STATIC_DRAW);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[this.state.position.body.texture]);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[this.state.position.eyes.texture]);
            gl.useProgram(program);

            gl.drawArrays(gl.TRIANGLES, 0, 12);
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

        findPathTo(x,y) {

          this.disengagePath();
          let p = false;

           if ((x >= -this.map.width/2 && x < this.map.width/2) && (y <= this.map.height/2 && y > -this.map.height/2)) {
           this.state.path.start = this.map.GRAPH.getPoint(this.trans.offsetX+this.map.centerX,this.trans.offsetY+this.map.centerY);
           this.state.path.end = this.map.GRAPH.getPoint(x,y);
           
           p = this.map.GRAPH.getPath(this.state.path.start.unit, this.state.path.end.unit);
           if (!p) return p; 

           this.state.path.current = p.path;
           this.state.path.current.unshift({x: this.state.path.start.x, y: this.state.path.start.y});
    
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
        }

        gotoAvatar() {
         return this.findPathTo(this.map.centerX,this.map.centerY);
        }

        delete() {
            this.map.unlink(this.id);
        }
    }

    // Class for invisible barriers
    class Barrier {
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
    class VisibleBarrier extends _Object_ {
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
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
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
    }

    // Invisible sensor for event triggers
    class Sensor extends Barrier {
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

    class Trigger {
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
    class _Map_ {

        static _recording = {
            isRecording: false,
            recording: []
        };

        constructor(width, height, root = true) {
            this.width = width;
            this.id = genObjectId();
            this.height = height;
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
            this.boxes = [];

            this.barriers = (root) ? [new Barrier(-(width / 2), (height / 2) + 20, width, 20), new Barrier(-(width / 2), -(height / 2), width, 20), new Barrier(-(width / 2) - 20, height / 2, 20, height), new Barrier((width / 2), height / 2, 20, height)] : [new VisibleBarrier((-width / 2) - 125, 0, 250, height + 10), new VisibleBarrier(0, -(height / 2) - 125, width + 500, 250), new VisibleBarrier((width / 2) + 125, 0, 250, height + 10), new VisibleBarrier(0, (height / 2) + 125, width + 500, 250), new VisibleBarrier(0, (height / 2) + 12, width, 24, [70, 70, 70, 1.0])];

            for (let i in this.barriers) {
                this.barriers[i].exclude = true;
                this.link(this.barriers[i]);
            }

            this.groundPlate = new VisibleBarrier(0, 0, 500, 500, this.groundColor);
        }

        render() {
            gl.uniform1f(locations.scale, 1);
            this.groundPlate.render();
            gl.uniform1f(locations.scale, scale);
            gl.uniform1f(locations.darkness, this.darkness + globalDarkness);

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
            for (let i in this.objects) {

                let ob = this.objects[i];

                if (!(ob instanceof Barrier || ob instanceof Trigger) && !ob.bottomLayer && ob.topLayer && !ob.hasCluster && !ob.hidden && this.show) {
                    ob.render();
                }
            }

            if (!this._lineMatrix.hidden) this._lineMatrix.render();
        }

        renderBottomLayer() {
            for (let i in this.objects) {

                let ob = this.objects[i];

                if (!(ob instanceof Barrier || ob instanceof Trigger) && !ob.topLayer && ob.bottomLayer && !ob.hasCluster && !ob.hidden && this.show) {
                    ob.render();
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

                if (obj.isCluster) obj.linked = true;

                if (obj.postLink) obj.postLink();
              
                if (obj.obstacle && obj.name !== "avatar") {
                 for (let i of obj.segments) { 
                  this.GRAPH.evalObstacle((i[0]+obj.trans.offsetX)+this.centerX,(-(i[1])+obj.trans.offsetY)+this.centerY,i[2],i[3]);
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
                this.objects[id].map = undefined;

                delete this.interactables[id];
                delete this.objects[id];
                delete this.obstacles[id];
                delete this.pickups[id];

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
                            frame = frame.concat([ob.text, ob.size, ob.color, ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI), false]);
                            break;
                        case "door":
                            frame = frame.concat([ob.text, ob.roomIndex, ob.trans.offsetX, ob.trans.offsetY, ob.trans.rotation * (180 / Math.PI)]);
                            break;
                        case "visible barrier":
                            frame = frame.concat([ob.trans.offsetX, ob.trans.offsetY, ob.width, ob.height, ob.color]);
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
            this._bulletMatrix = new _BulletCluster_([-0.9, 0.4, 1, 0, 0, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, 0.4, 1, 0.5625, 0, -0.9, -0.4, 1, 0, 0.5, 0.9, -0.4, 1, 0.5625, 0.5], textureSources.bullet);
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

                exit.topLayer = false;

                this.link(exit);
                this.link(light);
            }

            return this;
        }
    }

    class Text extends _Object_ {
        constructor(text, size = 30, color, initialX, initialY, initialRotation, textureSrc, segments) {
            super([], function() {
                let textData = createText(text, size);

                this.vertices = textData.vertices;
                this.text = text;
                this.width = textData.width;
                this.height = textData.height;
                this.color = color || [0, 0, 0, 1];
                this.size = size;

                this.buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

                this.texture = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.font);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0); // 20
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
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
            gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0); // 20
            gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);
            gl.enableVertexAttribArray(locations.coords);
            gl.enableVertexAttribArray(locations.tcoords);
        }

        set color(code) {
         this._color = fromRGB(code);
        }
    }

    /* GAME CONTROL ELEMENTS */

    class _Button_ extends _Object_ {
        constructor(textureSrc, textureActiveSrc, initialX, initialY, action, radius) {
            super([-8.571428571428571, 8.571428571428571, 1, 0, 0, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, 8.571428571428571, 1, 1, 0, -8.571428571428571, -8.571428571428571, 1, 0, 1, 8.571428571428571, -8.571428571428571, 1, 1, 1], function() {

                this.buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

                this.texture = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSrc);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                this.textureActive = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, this.textureActive);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureActiveSrc);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0); // 20
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
                gl.uniform1f(locations.scale, this.scale);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                gl.activeTexture(gl.TEXTURE0);
                if (this.active) {
                    gl.bindTexture(gl.TEXTURE_2D, this.textureActive);
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                }
                gl.useProgram(program);

                gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 5);
            }, radius * 2, radius * 2, initialX, initialY, 0);
            this.type = "button";
            this.scale = 1;
            this.radius = radius;
            this.action = action;
        }
    }

    class _Joystick_ extends _Object_ {

        constructor(left, scale = 1) {
            super([
                0, 0, 1, 0, 0, 30, 0, 1, 1, 0, 0, 30, 1, 0, 1, 30, 0, 1, 1, 0, 0, 30, 1, 0, 1, 30, 30, 1, 1, 1
            ], function() {

                this.buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

                this.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureSources.joystick_disc);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.vertexAttribPointer(locations.coords, 3, gl.FLOAT, false, 20, 0);
                gl.vertexAttribPointer(locations.tcoords, 2, gl.FLOAT, false, 20, 12);

                gl.enableVertexAttribArray(locations.coords);
                gl.enableVertexAttribArray(locations.tcoords);
                gl.disableVertexAttribArray(locations.offset);
                gl.disableVertexAttribArray(locations.textrUnit);

            }, function() {
                if (this.base.anchored) {
                    ext.bindVertexArrayOES(this.vao);
                    gl.uniform2fv(locations.translation, [this.base.x * scale, this.base.y * scale]);
                    gl.uniform1f(locations.rotation, 0);
                    gl.uniform1f(locations.scale, this.scale);

                    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                    gl.useProgram(program);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);

                    gl.uniform2fv(locations.translation, [this.thumb.x * scale, this.thumb.y * scale]);
                    gl.bufferData(gl.ARRAY_BUFFER, this.thumbVertices, gl.DYNAMIC_DRAW);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);

                    if ($CURRENT_MAP.move) {
                        if (left) {
                            $CURRENT_MAP.translate((this.distance.x * this.scale) / movementDivFactor, (this.distance.y * this.scale) / movementDivFactor);
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

            this.distance.x = ((this.thumb.x + (this.thumb.width / 2)) - (this.base.x + (this.base.width / 2))) / movementDivFactor;
            this.distance.y = ((this.thumb.y + (this.thumb.height / 2)) - (this.base.y + (this.base.height / 2))) / movementDivFactor;
            this.rotation = Math.atan2((this.thumb.y + this.thumb.width / 2) - (this.base.y + this.base.height / 2), (this.thumb.x + this.thumb.width / 2) - (this.base.x + this.base.width / 2)) - 1.5708;
            this.ratio = this.distance.x / this.distance.y;
        }
    }

    // Left joystick
    $JOYSTICK_L = new _Joystick_(true, joystickSizes.left);

    // Right joystick
    $JOYSTICK_R = new _Joystick_(false, joystickSizes.right);

    $AVATAR = new Avatar("R O B I N H O O D");
    $AVATAR.postLink();

    /* INSTANTIATE INITIAL MAP */

    let _MAP_ = new _Map_(780,280).init();
      $CURRENT_MAP = _MAP_;
    _MAP_.showGeometry();
    //_MAP_.parseLayoutScript(Map1);
    _MAP_.parseLayoutScript("{\"layout\":[[\"UrbanFence\",271.0879889290113,58.4303482215369,0],[\"UrbanFence\",223.09077455916594,58.454031036094236,0],[\"UrbanFenceVertical\",197.1575979493274,44.454083635397126,0],[\"UrbanFenceVertical\",197.10959854155715,16.453220833196177,0],[\"UrbanFenceVertical\",197.1190721233146,-11.712250337980525,0],[\"UrbanFenceVertical\",297.082211278594,44.48119585448097,0],[\"PicnicTable\",267.7276327795769,25.260583276242556,0],[\"PicnicTable\",224.64378527853523,25.124816188076608,0],[\"UrbanFenceHalf\",207.15109088429176,-26.068661460664842,0],[\"GenericApartment\",251.10047513706772,-33.341612662214,0],[\"UrbanFenceHalf\",307.0323938166791,30.16454022089072,0],[\"SmallPlant\",267.6656358570169,29.080583276242617,0],[\"SmallPlant\",224.33134907530456,28.944816188076636,0],[\"UrbanFenceVertical\",317.00210200262796,13.924327857998254,0],[\"Tile\",301.0752649614296,-10.227442696403983,0],[\"Tile\",300.3654721065678,-25.57562440456322,0],[\"Tile\",295.55949940753015,-38.755592488004616,0],[\"Tile\",302.6918126672202,-50.26225580717597,0],[\"Tile\",292.96384545356517,3.9282759896617847,0],[\"Road\",204.6983405466222,-88.40415197180101,0],[\"Road\",254.22158778892398,-88.40966118118814,0],[\"Road\",303.77327003850365,-88.41092221272805,0],[\"Road\",166.1203582653094,-49.76866417641816,90],[\"Road\",342.5103568691757,-49.76419471140367,90],[\"Road\",342.45996849261866,-0.16451344589125938,90],[\"RoadTriCorner\",166.1429582841762,-88.39946128316143,0],[\"Road\",166.13765212980877,-0.1802166434571859,90],[\"Road\",166.13180344058026,49.33197281632447,90],[\"Road\",342.4239839747268,49.3779575374902,90],[\"RoadCorner\",342.4139752770387,88.08677426263009,90],[\"Road\",303.66697959570814,88.04237787411125,0],[\"Road\",254.10522980346727,88.04799449363327,0],[\"Road\",204.75656182335098,88.02824597881477,0],[\"RoadSign\",189.2244508946215,-54.51198076301248,0],[\"Road\",127.42549574699115,-88.43478162603816,0],[\"UrbanFence\",17.267547062624956,58.4024416776238,0],[\"UrbanFence\",-30.729667307216012,58.42612449218113,0],[\"UrbanFenceVertical\",-56.662843917055824,44.42617709148403,0],[\"UrbanFenceVertical\",-56.710843324825845,16.4253142892833,0],[\"UrbanFenceVertical\",-56.7013697430684,-11.740156881892947,0],[\"UrbanFenceVertical\",43.261769412221085,44.45328931056787,0],[\"PicnicTable\",13.907190913191943,25.232676732329907,0],[\"PicnicTable\",-29.176656587848427,25.096909644163958,0],[\"UrbanFenceHalf\",-46.66935098208951,-26.096568004577264,0],[\"GenericApartment\",-2.7199667293140237,-33.36951920612656,0],[\"UrbanFenceHalf\",53.211951950307,30.1366336769781,0],[\"SmallPlant\",13.84519399063186,29.05267673232974,0],[\"SmallPlant\",-29.489092791078434,28.91690964416373,0],[\"UrbanFenceVertical\",63.18166013625846,13.896421314085831,0],[\"Tile\",47.25482309505491,-10.255349240316647,0],[\"Tile\",46.54503024019527,-25.603530948475644,0],[\"Tile\",41.73905754115687,-38.78349903191704,0],[\"Tile\",48.87137080084634,-50.29016235108862,0],[\"Tile\",39.14340358718954,3.900369445749135,0],[\"Road\",-49.122101319759054,-88.43205851571355,0],[\"Road\",0.40114592254317927,-88.43756772510079,0],[\"Road\",49.952828172128676,-88.43882875664059,0],[\"RoadTriCorner\",88.66411902735753,-88.42117541176145,0],[\"Road\",-87.70008360108062,-49.796570720330585,90],[\"Road\",88.68991500280289,-49.79210125531609,90],[\"Road\",88.63952662624537,-0.19241998980390917,90],[\"RoadTriCorner\",-87.67748358221314,-88.42736782707397,0],[\"Road\",-87.68278973658101,-0.20812318736960833,90],[\"Road\",-87.68863842580976,49.30406627241182,90],[\"Road\",88.60354210835374,49.35005099357732,90],[\"Road\",49.84653772933328,88.01447133019792,0],[\"Road\",0.2847879370860724,88.02008794971971,0],[\"Road\",-49.06388004303005,88.00033943490143,0],[\"RoadSign\",-64.59599097175987,-54.53988730692513,0],[\"Road\",127.36059296890141,87.92040828431459,0],[\"RoadTriCorner\",166.10032647752337,87.98431951522753,180],[\"RoadTriCorner\",88.57804230183262,87.9915993242214,180],[\"Bench\",126.98951486903172,38.49882652280307,0],[\"Bench\",126.98951486903172,-1.501173477200652,0],[\"Bench\",126.98951486903172,-41.50117347719749,0],[\"StreetLight\",108.44001110539418,43.69858806052727,0],[\"StreetLight\",-66.29346885334317,68.36153553462458,0],[\"StreetLight\",318.9679408550326,-42.124296086119706,0],[\"Grass\",249.03716640102522,3.2321422720557464,0],[\"Grass\",213.82029122736168,-6.589934589736799,0],[\"Grass\",210.28234998617995,-3.7814944239056025,0],[\"Grass\",206.2568613250902,37.72051333121206,0],[\"Grass\",308.3205888170632,9.261608144381139,0],[\"Grass\",310.3221020026286,-1.7896943752439967,0],[\"Grass\",293.05593279957355,-55.70225438834505,0],[\"Grass\",313.78794085503097,-65.94897678781217,0],[\"Grass\",230.15055437720775,-65.9454079677331,0],[\"Grass\",196.2777939910809,-50.40572596155801,0],[\"Grass\",186.09928924296122,51.46669042820177,0],[\"Grass\",142.4434458057978,65.48505189152223,0],[\"Grass\",115.10356509559594,51.508185109851965,0],[\"Grass\",107.10036364426807,5.833838599361027,0],[\"Grass\",108.67807910833287,-4.709125743513301,0],[\"Grass\",147.25623018524539,-55.718268834481115,0],[\"Grass\",113.62001110539325,-70.49204929696506,0],[\"Grass\",66.67789163846584,64.6377539355392,0],[\"Grass\",69.28568057327595,-35.08172980304697,0],[\"Grass\",47.44479230591513,-67.6234052387853,0],[\"Grass\",-59.315990971758254,-66.06016273682718,0],[\"Grass\",-49.56904409289774,-57.684371691840376,0],[\"Grass\",-67.12507019770064,-1.703115147865958,0],[\"Grass\",-70.23962082400732,61.72337774401541,0],[\"Grass\",52.7879576456499,9.568702598262679,0],[\"Grass\",-7.473220240228777,-3.6306099410740735,0],[\"Grass\",-7.965925621431964,39.31502663618517,0],[\"Grass\",-42.46002828995846,3.9438558057001103,0],[\"Grass\",-37.733522420514745,2.311300660121752,0],[\"Rocks1\",232.90409519477203,1.6183692185883487,205],[\"Rocks2\",289.42468185407375,39.49145178007422,56],[\"Rocks2\",299.8929449628601,-1.121275184747219,75],[\"Rocks1\",292.5835483436219,-7.2297318258758025,54],[\"Rocks1\",303.2297391180219,-40.27439561235086,73],[\"Rocks2\",256.64407807349215,-61.36811693740217,232],[\"Rocks1\",183.24740407080515,-50.878846892171005,289],[\"Rocks2\",185.29308573277171,34.107631775730745,80],[\"Rocks2\",128.21408205864532,62.67154307276043,291],[\"Rocks1\",136.03131662279665,15.072832361261433,209],[\"Rocks2\",140.52359065223192,-23.776268069781473,257],[\"Rocks1\",112.81924443449589,-57.02141193947558,337],[\"Rocks1\",59.98619802111106,-61.408118790835694,72],[\"Rocks2\",-37.39996672931805,-45.2495192061276,85],[\"Rocks1\",-65.56387860863472,39.28153553462568,230],[\"Rocks2\",57.67480892685323,58.19099568634148,54],[\"Rocks1\",69.86166013625765,3.8159277152113873,124],[\"Rocks2\",52.58746445534581,-36.571837782311476,289],[\"Rocks2\",42.02392932216778,-51.91331296428559,279],[\"Rocks1\",36.61719207652169,-2.685136598274614,83],[\"Rocks2\",36.53195195030531,34.34617270233275,202],[\"Rocks1\",-10.062937485729321,16.803277095695,319],[\"Rocks1\",-39.34265845724728,-5.889519206130089,327],[\"Grass2\",250.81484865068896,0.25792495293217144,0],[\"Grass2\",297.1825983461021,-62.173697985867285,0],[\"Grass2\",194.3028944687423,-56.780885998032495,0],[\"Grass2\",140.24445596014294,60.175343459984965,0],[\"Grass2\",116.83253131397501,-66.48354707569214,0],[\"Grass2\",49.66085618299809,-62.774819361575034,0],[\"Grass2\",-41.59281267606734,-1.9522637398124942,0],[\"Grass2\",-6.437125119890631,37.35085739805099,0],[\"Grass2\",-50.85863309267086,-65.27336910146522,0],[\"RoadCorner\",342.47157253868664,-88.41368718125415,0],[\"RoadTriCorner\",-87.72999721012837,88.0442051422774,180],[\"Road\",-126.46458114047752,88.02546500132371,0],[\"Road\",-126.38704488878372,-88.4372203470819,0],[\"UrbanFence\",-236.54305875936512,58.38012218788735,0],[\"UrbanFence\",-284.5402731292094,58.40380500244491,0],[\"UrbanFenceVertical\",-310.4734497390477,44.40385760174713,0],[\"UrbanFenceVertical\",-310.5214491468177,16.402994799545034,0],[\"UrbanFenceVertical\",-310.51197556506,-11.762476371632577,0],[\"UrbanFenceVertical\",-210.54883640978233,44.430969820830974,0],[\"PicnicTable\",-239.90341490879996,25.210357242591186,0],[\"PicnicTable\",-282.9872624098422,25.074590154425238,0],[\"UrbanFenceHalf\",-300.4799568040834,-26.11888749431735,0],[\"GenericApartment\",-256.5305725513094,-33.391838695865054,0],[\"UrbanFenceHalf\",-200.59865387169702,30.114314187239835,0],[\"SmallPlant\",-239.96541183135992,29.030357242591244,0],[\"SmallPlant\",-283.29969861307234,28.894590154425465,0],[\"UrbanFenceVertical\",-190.62894568574814,13.87410182434712,0],[\"Tile\",-206.55578272694845,-10.27766873005605,0],[\"Tile\",-207.26557558180775,-25.625850438215956,0],[\"Tile\",-212.071548280846,-38.80581852165508,0],[\"Tile\",-204.93923502115706,-50.312481840828134,0],[\"Tile\",-214.66720223481008,3.878049956011097,0],[\"Road\",-302.9327071417526,-88.45437800545261,0],[\"Road\",-253.40945989945112,-88.45988721483974,0],[\"Road\",-203.85777764987375,-88.46114824637954,0],[\"RoadTriCorner\",-165.14648679464437,-88.4434949015004,0],[\"Road\",-341.5106894230634,-49.818890210069874,90],[\"Road\",-165.120690819199,-49.81442074505538,90],[\"Road\",-165.17107919575608,-0.21473947954240202,90],[\"Road\",-341.49339555856403,-0.23044267710832855,90],[\"Road\",-341.4992442477923,49.28174678267559,90],[\"Road\",-165.2070637136477,49.32773150384133,90],[\"Road\",-203.96406809266887,87.99215184046034,0],[\"Road\",-253.5258178849076,87.99776845998235,0],[\"Road\",-302.8744858650238,87.97801994516362,0],[\"RoadCorner\",-341.4614764687198,88.01342298136888,180],[\"RoadSign\",-318.40659679375,-54.56220679666499,0],[\"RoadTriCorner\",-165.22166170240178,88.01287804934532,180],[\"RoadCorner\",-341.5406534296491,-88.4821389271512,-90],[\"Grass\",309.9550341918867,62.93574567206247,0],[\"Grass2\",316.4722470497912,56.7711424042327,0],[\"Grass\",-12.526808916676693,-67.68734099051107,0],[\"Bench\",-126.49048513096952,-41.519853036196146,0],[\"Bench\",-126.49048513096906,-0.7632602957119161,0],[\"Bench\",-126.49048513096929,38.9620498132261,0],[\"StreetLight\",-145.15235645850157,43.54930960785683,0],[\"StreetLight\",108.24667634039972,-36.34651103075093,0],[\"StreetLight\",-145.54046656498758,-36.34591210179774,0],[\"StreetLight\",-319.9424936977825,68.26877651753594,0],[\"Grass\",-108.99770498840061,-62.4376168712598,0],[\"Grass\",-122.1694730457848,-55.17947051315242,0],[\"Grass2\",-116.19637477162598,-65.00163319258382,0],[\"Grass\",-136.20251517427448,-20.437337578921365,0],[\"Grass\",-109.14089284304745,-11.936003404940738,0],[\"Grass2\",-109.04171156622155,-20.166188372924303,0],[\"Grass2\",-123.22651007836956,22.09707908161346,0],[\"Grass\",-133.64768005414797,14.170497086018838,0],[\"Grass\",-111.05892021285263,64.98929161774262,0],[\"Grass\",-117.37997015670376,59.495229380368414,0],[\"Grass2\",-137.67427453995566,59.08757872436729,0],[\"Rocks1\",-108.0568483480418,41.29989857775735,161],[\"Rocks2\",-143.1704851309674,-29.762183791215378,225],[\"Rocks2\",-199.73068531586296,-57.32051309763481,205],[\"Rocks1\",-202.54040558287642,-35.70589352524691,242],[\"Rocks1\",-219.4107586654851,-15.870743766788753,181],[\"Rocks1\",-203.68386816706658,-1.4171494672639398,354],[\"Rocks1\",-214.34850283824466,11.434314187235032,147],[\"Grass\",-219.33256151617286,39.70012218788459,0],[\"Grass2\",-224.0771218978902,35.99035724259335,0],[\"Grass\",-261.90642432214764,4.672710253542078,0],[\"Grass\",-246.25248709548532,-3.257287735485665,0],[\"Grass\",-272.7303985671109,39.72380500244216,0],[\"Grass2\",-264.3072624098434,33.990944056817526,0],[\"Rocks1\",-303.83197556505996,-4.1486441955427615,17],[\"Rocks2\",-303.3758615149313,37.82962407259389,79],[\"Rocks2\",-258.5834149087988,18.816682857970612,138],[\"Grass\",-197.17400863813054,-24.407922101346458,0],[\"Grass\",-185.98557614783596,-59.56458214853101,0],[\"Grass\",-190.77933106630644,-63.92375679171446,0],[\"Grass2\",-183.5249805256529,-65.07432592986135,0],[\"Grass\",-225.95626916230117,-63.33036852254512,0],[\"Grass\",-296.7357517409044,-50.51359868759494,0],[\"Grass\",-307.91689167050146,-57.67012308361959,0],[\"Grass2\",-294.7147815307272,-60.79270134075629,0],[\"Rocks2\",-309.8502602823257,-69.39753004608349,206],[\"Grass\",-322.0964655729319,23.592078705232268,0],[\"Grass2\",-317.29270037590965,17.34941236240642,0],[\"Rocks1\",-318.7907335000294,-18.45862339049321,20],[\"Grass\",-323.6301390327663,63.53450246294672,0],[\"Grass2\",-317.1534497390465,57.441301367865606,0],[\"Grass\",-190.5705299101552,53.8098032406888,0],[\"Grass2\",-197.069496717098,59.876441885716794,0],[\"Rocks2\",-187.01710497174173,68.25959134302016,300],[\"Rocks2\",-139.07185458102708,71.96668501162478,281],[\"StreetLight\",188.00871074273476,67.96699250544145,0],[\"RoadRail\",-369.0068767623215,133.4825086289895,0],[\"RoadRail\",-316.20687676232063,133.4825086289895,0],[\"RoadRail\",-289.80687676232225,133.4825086289895,0],[\"RoadRail\",-263.4068767623237,133.4825086289895,0],[\"RoadRail\",-342.6068767623198,133.4825086289895,0],[\"RoadRail\",-237.00687676232207,133.4825086289895,0],[\"RoadRail\",-210.60687676232436,133.4825086289895,0],[\"RoadRail\",-184.20687676232563,133.4825086289895,0],[\"RoadRail\",-157.80687676232668,133.4825086289895,0],[\"RoadRail\",-131.40687676233043,133.4825086289895,0],[\"RoadRail\",-105.00687676233309,133.4825086289895,0],[\"RoadRail\",-78.60687676233158,133.4825086289895,0],[\"RoadRail\",-52.2068767623268,133.4825086289895,0],[\"RoadRail\",-25.806876762322894,133.4825086289895,0],[\"RoadRail\",0.5931232376763766,133.4825086289895,0],[\"RoadRail\",26.993123237675277,133.4825086289895,0],[\"RoadRail\",53.393123237676434,133.4825086289895,0],[\"RoadRail\",79.79312323767596,133.4825086289895,0],[\"RoadRail\",106.19312323767389,133.4825086289895,0],[\"RoadRail\",132.59312323767094,133.4825086289895,0],[\"RoadRail\",158.99312323767538,133.4825086289895,0],[\"RoadRail\",185.39312323767467,133.4825086289895,0],[\"RoadRail\",211.7931232376759,133.4825086289895,0],[\"RoadRail\",238.19312323767195,133.4825086289895,0],[\"RoadRail\",264.59312323767443,133.4825086289895,0],[\"RoadRail\",290.9931232376717,133.4825086289895,0],[\"RoadRail\",317.3931232376694,133.4825086289895,0],[\"RoadRail\",343.79312323767414,133.4825086289895,0],[\"RoadRail\",370.19942227133384,133.4813501590863,0],[\"RoadRail\",-369.06770332300283,-135.5243156064059,0],[\"RoadRail\",-316.26770332300106,-135.5243156064059,0],[\"RoadRail\",-289.86770332300335,-135.5243156064059,0],[\"RoadRail\",-263.4677033230045,-135.5243156064059,0],[\"RoadRail\",-342.66770332300047,-135.5243156064059,0],[\"RoadRail\",-237.06770332300272,-135.5243156064059,0],[\"RoadRail\",-210.66770332300524,-135.5243156064059,0],[\"RoadRail\",-184.267703323008,-135.5243156064059,0],[\"RoadRail\",-157.8677033230078,-135.5243156064059,0],[\"RoadRail\",-131.46770332301045,-135.5243156064059,0],[\"RoadRail\",-105.06770332301284,-135.5243156064059,0],[\"RoadRail\",-78.66770332301093,-135.5243156064059,0],[\"RoadRail\",-52.267703323007225,-135.5243156064059,0],[\"RoadRail\",-25.86770332300351,-135.5243156064059,0],[\"RoadRail\",0.5322966769948287,-135.5243156064059,0],[\"RoadRail\",26.932296676995193,-135.5243156064059,0],[\"RoadRail\",53.33229667699604,-135.5243156064059,0],[\"RoadRail\",79.73229667699508,-135.5243156064059,0],[\"RoadRail\",106.13229667699233,-135.5243156064059,0],[\"RoadRail\",132.53229667699006,-135.5243156064059,0],[\"RoadRail\",158.93229667699507,-135.5243156064059,0],[\"RoadRail\",185.33229667699356,-135.5243156064059,0],[\"RoadRail\",211.73229667699468,-135.5243156064059,0],[\"RoadRail\",238.13229667699198,-135.5243156064059,0],[\"RoadRail\",264.53229667699446,-135.5243156064059,0],[\"RoadRail\",290.93229667699217,-135.5243156064059,0],[\"RoadRail\",317.33229667699055,-135.5243156064059,0],[\"RoadRail\",343.7322966769944,-135.5243156064059,0],[\"RoadRail\",370.13859571065296,-135.52547407630922,0],[\"Grass\",-348.44526140134184,-116.82447066935666,0],[\"Grass\",-320.03409111479476,-108.44153875578658,0],[\"Grass\",-317.64123636233995,-109.87127202632772,0],[\"Grass2\",-319.2892206547479,-115.33974656411041,0],[\"Grass\",-281.8579977608162,-109.24807479313546,0],[\"Grass\",-258.0868412371225,-116.10077307372913,0],[\"Grass\",-290.40569222360006,-124.25184643455921,0],[\"Grass2\",-286.0996852549189,-122.0087850994235,0],[\"Grass2\",-272.0017206596894,-117.64298581713504,0],[\"Grass2\",-363.29842352816644,-111.77843897949086,0],[\"Rocks1\",-333.85535638488597,-112.43204273028985,70],[\"Rocks1\",-226.4786695400311,-108.87882296382989,28],[\"Rocks1\",-120.76133047270906,-121.17604841253282,359],[\"Rocks2\",-187.97344183377976,-120.67584296026928,139],[\"Rocks2\",-304.3446950284206,-116.59159284170917,3],[\"Grass\",-211.0113210244744,-118.07854645091763,0],[\"Grass\",-224.39608685933086,-122.07359903457765,0],[\"Grass2\",-211.96039857689988,-111.30876070992477,0],[\"Grass\",-148.47817359803048,-106.23721313060219,0],[\"Grass\",-162.22790454776913,-112.46698153426104,0],[\"Grass2\",-145.67032514937114,-116.64477845521876,0],[\"Grass\",-78.17516166213935,-111.67532669943947,0],[\"Grass\",-48.69339860343996,-121.35066497062175,0],[\"Grass2\",-70.63199054890904,-118.89695322005721,0],[\"Rocks1\",-30.030297078714675,-109.27148357149406,126],[\"Rocks1\",30.181227141827566,-124.25741402413635,331],[\"Grass2\",-6.890335946420855,-120.03319655774297,0],[\"Grass\",5.79424681081937,-111.25415743334548,0],[\"Grass\",-22.2642736882123,-116.64041643330515,0],[\"Grass\",-260.5344929654963,-66.36737573554487,0],[\"Grass\",-107.99542253205783,12.749526482064402,0],[\"Grass\",-145.64899476655546,-67.00796532160848,0],[\"Grass\",-99.9365243356572,-110.01491156583427,0],[\"Grass\",94.29919105248229,-110.28112527297642,0],[\"Grass\",84.61149096372048,-120.49120446224225,0],[\"Grass2\",77.63402280608666,-109.3753383025471,0],[\"Grass\",57.88839923562584,-111.94465821150843,0],[\"Grass\",151.77468964147982,-111.85107993749668,0],[\"Grass\",126.70679553636373,-122.25675185881249,0],[\"Grass\",123.33816302442062,-112.87231635332492,0],[\"Grass2\",172.3811699983845,-117.36234668243952,0],[\"Rocks2\",146.25327204272418,-120.07136737066278,150],[\"Grass\",217.12549572068252,-110.7894567620998,0],[\"Grass\",202.21185746429006,-122.21490080979896,0],[\"Grass2\",194.49476781608615,-113.2072542318073,0],[\"Grass\",280.1616141789853,-107.60081175242308,0],[\"Grass\",243.34795270182832,-125.34431560640505,0],[\"Grass2\",242.67117093872633,-111.34131102611971,0],[\"Rocks1\",261.31843067115346,-118.14217024837782,250],[\"Grass\",330.954270533737,-110.47623975024555,0],[\"Grass\",287.28127737706467,-123.39726222892122,0],[\"Grass2\",305.7615186155945,-118.63007778375791,0],[\"Rocks1\",374.06548792858194,-122.26595774688354,210],[\"Grass\",346.5685558019024,-120.28034892520299,0],[\"Grass2\",371.9402855400779,-96.457851662239,0],[\"Grass\",367.14793458241655,-81.60893276668995,0],[\"Grass\",374.89572195792067,-70.81195836129925,0],[\"Grass2\",366.0908119121004,-50.98141591335034,0],[\"Grass\",375.4949058113321,-25.685329196865005,0],[\"Grass2\",363.5895917093887,-34.445583226294175,0],[\"Grass\",373.8408653948489,-38.35697748605872,0],[\"Rocks1\",367.49781436936513,-9.306527884815676,321],[\"Rocks1\",364.4263929665105,41.91283874887249,40],[\"Rocks2\",377.33796993141215,72.89475983996115,180],[\"Grass\",374.78275059101526,9.020086140927116,0],[\"Grass\",365.50497879425785,57.14944482711271,0],[\"Grass2\",376.57294124827587,31.685185006794356,0],[\"Grass\",365.1076622635954,117.56426222349558,0],[\"Grass2\",377.04862800267193,107.68577607521246,0],[\"Grass\",368.9923942530501,100.57644449578453,0],[\"Grass\",-360.0312302258449,-83.27425348441582,0],[\"Grass\",-374.1689742633076,-58.47301807372785,0],[\"Grass2\",-370.12332132909927,-71.43575971382026,0],[\"Rocks2\",-365.98291050645133,-93.59775582580136,73],[\"Grass\",-361.47171803839905,-35.76107734298928,0],[\"Grass\",-369.34119067893727,16.856016760535994,0],[\"Grass\",-361.05693349649704,7.208384850692101,0],[\"Grass2\",-369.00538376399294,3.0199534948572975,0],[\"Rocks2\",-369.25375019591314,-17.48913390699336,288],[\"Rocks1\",-359.95878358386796,34.4496222716602,68],[\"Grass\",-372.6547344008953,63.7837881508033,0],[\"Grass\",-361.9891857471918,54.90144379230137,0],[\"Grass2\",-370.13132794198367,53.030371352254676,0],[\"Grass\",-356.1170393346902,118.06579476825809,0],[\"Grass\",-366.52266333170525,102.58104782950261,0],[\"Grass2\",-367.4329721234039,118.71174349971199,0],[\"Rocks1\",-364.3193565504095,84.0541926071096,75],[\"Grass\",345.98021484190764,120.60805194783424,0],[\"Grass\",289.8158678618145,109.63808691674686,0],[\"Grass\",280.218173457143,117.63865495634928,0],[\"Grass2\",311.47042897870034,117.03456704207397,0],[\"Rocks1\",331.7439938534056,110.75427118601004,292],[\"Grass\",180.76361124038,121.08124340919093,0],[\"Grass\",193.63004774928226,108.6076729868154,0],[\"Grass2\",199.89698138676079,117.98029255413192,0],[\"Grass\",253.17374474847003,112.0873928705536,0],[\"Rocks1\",228.23368765411652,112.84528660705342,95],[\"Grass\",86.80149239853239,118.85912795635465,0],[\"Grass\",104.15192539400172,107.5987267281136,0],[\"Grass2\",111.90019663171051,117.55040579232781,0],[\"Rocks1\",149.85545034056824,111.89429295205801,35],[\"Rocks2\",122.54556828915878,123.30250862899075,61],[\"Grass2\",158.58389408681842,119.14006186692063,0],[\"Grass\",7.501608756844217,123.30250862899052,0],[\"Grass\",27.42708924240823,114.56988055247345,0],[\"Grass\",-15.668717699327267,113.01760286332973,0],[\"Grass2\",1.8757632875125694,111.94650823875932,0],[\"Rocks2\",64.44514400825003,110.91482779001399,48],[\"Grass\",-108.42849311017181,122.22034513163379,0],[\"Grass\",-90.17052438850254,106.588134545441,0],[\"Grass\",-46.01941532243406,117.07834262173984,0],[\"Grass2\",-54.15176748740197,112.32713140339175,0],[\"Grass2\",-81.85056937683191,117.61723809112033,0],[\"Rocks1\",-123.19776295065688,111.41083569493355,37],[\"Grass\",-217.76252974308358,119.75786755097386,0],[\"Grass\",-169.24941366678115,122.54097521230881,0],[\"Grass\",-192.84623713487974,113.97848186397039,0],[\"Grass\",-140.85592518795272,106.019920916519,0],[\"Grass2\",-140.8740698282162,122.92817583825507,0],[\"Grass2\",-173.436515075184,109.75481979647654,0],[\"Grass2\",-267.1247196740202,110.1539764766172,0],[\"Grass2\",-244.86878500590234,114.071247910735,0],[\"Grass2\",-252.5643789697412,121.39052256672133,0],[\"Grass\",-293.45254987948863,117.47422700726833,0],[\"Rocks1\",-261.3747948146326,115.76121052360136,128],[\"Rocks2\",-67.53116377275492,115.7638696485973,27],[\"Rocks2\",-343.41594681580506,110.05961960312047,185],[\"Grass\",-314.5764944360365,119.28577943122173,0],[\"Grass2\",-304.6191210411814,112.45779621016177,0],[\"RoadRailVertical\",-383.88761473285575,126.47446521333848,0],[\"RoadRailVertical\",-383.88761473285575,109.4744652133389,0],[\"RoadRailVertical\",-383.88761473285575,92.47446521334012,0],[\"RoadRailVertical\",-383.88761473285575,75.4744652133403,0],[\"RoadRailVertical\",-383.88761473285575,58.47446521334179,0],[\"RoadRailVertical\",-383.88761473285575,41.47446521334112,0],[\"RoadRailVertical\",-383.88761473285575,24.474465213340068,0],[\"RoadRailVertical\",-383.88761473285575,7.474465213341406,0],[\"RoadRailVertical\",-383.88761473285575,-9.525534786658508,0],[\"RoadRailVertical\",-383.88761473285575,-26.525534786658035,0],[\"RoadRailVertical\",-383.88761473285575,-43.52553478665911,0],[\"RoadRailVertical\",-383.88761473285575,-60.525534786660366,0],[\"RoadRailVertical\",-383.88761473285575,-77.52553478666019,0],[\"RoadRailVertical\",-383.88761473285575,-94.52553478666053,0],[\"RoadRailVertical\",-383.88761473285575,-111.52553478666044,0],[\"RoadRailVertical\",-383.88761473285575,-128.5255347866616,0],[\"RoadRailVertical\",385.04817374033195,126.45248818034037,0],[\"RoadRailVertical\",385.04817374033195,109.45248818034082,0],[\"RoadRailVertical\",385.04817374033195,92.45248818034383,0],[\"RoadRailVertical\",385.04817374033195,75.45248818034395,0],[\"RoadRailVertical\",385.04817374033195,58.45248818034371,0],[\"RoadRailVertical\",385.04817374033195,41.45248818034298,0],[\"RoadRailVertical\",385.04817374033195,24.452488180342016,0],[\"RoadRailVertical\",385.04817374033195,7.452488180343596,0],[\"RoadRailVertical\",385.04817374033195,-9.547511819656446,0],[\"RoadRailVertical\",385.04817374033195,-26.54751181965586,0],[\"RoadRailVertical\",385.04817374033195,-43.54751181965693,0],[\"RoadRailVertical\",385.04817374033195,-60.54751181965813,0],[\"RoadRailVertical\",385.04817374033195,-77.54751181965801,0],[\"RoadRailVertical\",385.04817374033195,-94.54751181965847,0],[\"RoadRailVertical\",385.04817374033195,-111.54751181965821,0],[\"RoadRailVertical\",385.04817374033195,-128.54751181965938,0],[\"RoadSign\",102.09499356568483,120.9815314593109,0],[\"RoadSign\",-153.06336897708854,120.94969903188596,0],[\"Text\",\"Whatever\",3,[0,0,0,1],0,0,0,false],[\"StreetLight\",55.72755581445438,-37.80419354727961,0],[\"StreetLight\",86.72417631823903,-8.911297617405449,0],[\"VisibleBarrier\",76.05362283073086,-40.29870939047963,40,40,[12,134,235,0.4]],[\"VisibleBarrier\",125.62824238528933,-20.529325933134054,40,40,[68,134,235,0.4]],[\"VisibleBarrier\",91.70977612251784,-6.531138776773915,40,40,[68,134,235,0.4]],[\"Text\",\"Blah blah blahr megeddon\",1,[230,245,23,1],45.81205704307287,-29.718224018328627,0,false],[\"StreetLight\",-6.891326289547273,27.340388611738312,0],[\"StreetLight\",-50.182843917055806,39.94612449218111,0]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":6},\"root\":true,\"nodes\":3,\"children\":[{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]}]}");

    /* RENDERING PIPELINE FUNCTIONS */

    // OBJECTS AND CONTROLS ARRAY AT TOP OF FILE

    $ACTION_BUTTON = new _Button_(textureSources.actionbutton, textureSources.actionbuttonactive, (pWidth / 2) - 15, 0, function(pX, pY) {
        if ($CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id]) {
            $CURRENT_MAP.currentInteractable.action();
        }
    }, 8.5);
    $ACTION_BUTTON.hidden = true;

    _OBJECTS_.push($AVATAR);

    function renderObjects() {
        _OBJECTS_.forEach(v => {
            if (v.preRender) v.preRender();
            v.render();
        });
    }

    function renderControls() {
        gl.uniform1f(locations.darkness, 1);
        _CONTROLS_.forEach(v => {
            if (!v.hidden) {
                v.render();
            }
        });
        gl.uniform1f(locations.darkness, $CURRENT_MAP.darkness + globalDarkness);
    }

    _CONTROLS_.push($JOYSTICK_L);
    _CONTROLS_.push($JOYSTICK_R);
    _CONTROLS_.push($ACTION_BUTTON);


    let globalFrameRun = 0;
    let frameRate = 0;
    let frameRateMarker = performance.now();
    let times = [],
        average, total = 0;
    let T1, T2;

    // function for transitioning between maps...

    let transitioning = false;
    let transitionSpeed;
    let phase = 0;
    let points = [50, 0];
    let callback = undefined;
    let transitionAnimation = new LoopAnimation(function() {
        if (globalDarkness === points[phase] && phase === 0) {
            callback();
            phase++;
        }

        if (globalDarkness === points[phase] && phase === 1) {
            phase = 0;
            transitioning = false;
            return;
        }

        if (phase === 1) globalDarkness -= (globalDarkness - points[phase]) / transitionSpeed;
        if (phase === 0) globalDarkness += (globalDarkness || 1) / transitionSpeed;

        if (Math.abs(globalDarkness - points[phase]) < 0.01 || (globalDarkness > points[phase] && phase === 0)) {
            globalDarkness = points[phase];
        }
    }, undefined, 0.005);

    function requestTransition(c, speed = 2) {
        if (!useTransition) {
            c();
            return;
        }

        callback = c;
        transitionSpeed = speed;
        transitioning = true;
    }

    // MAIN FUNCTION...

    function init() {

        if (performance.now() - frameRateMarker >= 1000) {
            frameRate = globalFrameRun;
            globalFrameRun = 0;
            frameRateMarker = performance.now();

            average = times.reduce((a, b) => {
                return a + b;
            }, 0) / times.length;
            times = [];
            total = 0;
        }

        T1 = performance.now();

        // ----------START----------
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform1f(locations.scale, scale);

        if (transitioning) transitionAnimation.run();

        $CURRENT_MAP?.render();
        renderObjects();
        $CURRENT_MAP?.renderTopLayer();

        renderControls();

        // ----------END----------

        T2 = performance.now();

        gameStats.innerHTML = `FPS: ${frameRate}`;
        globalFrameRun++;
        times.push(T2 - T1);

        requestAnimationFrame(init);
    }

    loadingScreen.style.display = "none";
    init();

    /* MOVEMENT PROCESSING */

    /*
    translate screen coordinates to world coordinates:
    
            let pageX = touch.clientX;
            let pageY = touch.clientY;
            let pX = aofb(aisofb(pageX, window.innerWidth), pWidth)-(pWidth/2);
            let pY = aofb(100-aisofb(pageY, window.innerHeight), pHeight)-(pHeight/2);
    */

    function moveJoystick(e, m = true) {
        e.preventDefault();
        // keep joystick thumb in bounds...

        let coords0 = e.touches[0],
            coords1 = e.touches[1];

        if ($JOYSTICK_L.base.anchored) {
            configure($JOYSTICK_L);
        } else if (m) {
            for (let i = 0; i < 2; i++) {
                if (e.touches[i]?.clientX < window.innerWidth / 2 && (e.touches[i]?.identifier !== $JOYSTICK_R.id)) {
                    // activate avatar walking
                    if ($CURRENT_MAP.move) $AVATAR.state.walking = true;

                    $JOYSTICK_L.id = e.touches[i].identifier;
                    configure($JOYSTICK_L);
                    break;
                }
            }
        }

        if ($JOYSTICK_R.base.anchored) {
            configure($JOYSTICK_R);
        } else if (m) {
            for (let i = 0; i < 2; i++) {
                if (e.touches[i]?.clientX > window.innerWidth / 2 && (e.touches[i]?.identifier !== $JOYSTICK_L.id)) {
                    // draw weapon
                    if ($CURRENT_MAP.move) $AVATAR.drawWeapon();

                    $JOYSTICK_R.id = e.touches[i].identifier;
                    configure($JOYSTICK_R);
                    break;
                }
            }
        }

        function configure(stick) {

            let touch;

            for (let i = 0; i < 2; i++) {
                if (e.touches[i]?.identifier === stick.id) {
                    touch = e.touches[i];
                    break;
                }
            }

            let pageX = touch.clientX;
            let pageY = touch.clientY;
            let pX = aofb(aisofb(pageX, window.innerWidth), pWidth) - (pWidth / 2);
            let pY = aofb(100 - aisofb(pageY, window.innerHeight), pHeight) - (pHeight / 2);

            if (stick.base.anchored) {
                let {
                    width,
                    height,
                    x,
                    y,
                    radius
                } = stick.base;
                x += width / 2;
                y += height / 2;

                let d = distance(x, y, pX, pY),
                    t = radius / d;

                if (d > radius) {
                    pX = (((1 - t) * x) + (t * pX));
                    pY = (((1 - t) * y) + (t * pY));
                }
            }

            stick.translate(pX, pY);
        }
    }

    canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        // Check for button presses 
        let touch = e.touches[e.touches.length - 1];

        let pageX = touch.clientX;
        let pageY = touch.clientY;
        let pX = aofb(aisofb(pageX, window.innerWidth), pWidth) - (pWidth / 2);
        let pY = aofb(100 - aisofb(pageY, window.innerHeight), pHeight) - (pHeight / 2);

        let buttonPress = false;

        for (let i of _CONTROLS_) {
            if (i instanceof _Button_ && !i.hidden && distance(pX, pY, i.trans.offsetX, i.trans.offsetY) < i.radius) {

                i.active = true;
                i.touch = touch.identifier;
                i.action(pX, pY);
                buttonPress = true;
            }
        }

        if (!buttonPress) moveJoystick(e);
    });

    canvas.addEventListener("touchmove", (e) => {
        moveJoystick(e, false);
    });

    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();

        // check for button touchends
        let ids = Object.values(e.touches).reduce((a, v) => {
            a.push(v.identifier)
        }, []);

        for (let i of _CONTROLS_) {
            if (i instanceof _Button_ && i.active && !i.hidden && !ids?.includes(i.touch)) {

                i.active = false;
                if (i.postAction) i.postAction();
            }
        }

        // lift joysticks

        let uL = false,
            uR = false;

        for (let i = 0; i < 2; i++) {
            if (e.touches[i]?.identifier === $JOYSTICK_L.id) {
                uL = true;
            }
            if (e.touches[i]?.identifier === $JOYSTICK_R.id) {
                uR = true;
            }
        }

        if (!uL) {
            // deactivate avatar walking
            $AVATAR.state.walking = false;

            $JOYSTICK_L.unanchor();
            $JOYSTICK_L.id = undefined;
        }
        if (!uR) {
            // holster weapon if armed
            if ($CURRENT_MAP.move) $AVATAR.holsterWeapon();

            $JOYSTICK_R.unanchor();
            $JOYSTICK_R.id = undefined;
        }
    });

    /* ONSCREEN CONTROLS */

    const inventoryButton = document.querySelector("#inventory-button");
    const inventoryClose = document.querySelector(".main-inventory__close");
    const inventoryWindow = document.querySelector("#main-inventory");
    const inventoryItemsContainer = document.querySelector("#main-items-container");

    inventoryClose.ontouchstart = () => {
        inventoryWindow.style.display = "none";
    }

    inventoryButton.ontouchstart = () => {
        inventoryWindow.style.display = "grid";
    }

    /* DEVELOPER COMMAND CONSOLE */

    function enableConsole() {
        let comms = [],
            commIndex, inputs = [],
            addedObjects = [];

        function activateConsole() {
            log.addEventListener("keydown",
                (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        comms.push(log.value.split(">").at(-1));
                        inputs.push(log.value.split(">").at(-1));
                        log.value = "";
                        commIndex = inputs.length;

                        if (inputs.at(-1).trim() === "clear") {
                            comms = [];
                            log.value = "";
                            log.value += "\n>";
                            comms.push("\n>");
                            log.setSelectionRange(log.value.length, log.value.length, "forward");
                        } else {
                            try {
                                let output = "\n" + JSON.stringify(eval(comms.at(-1)));
                                comms.push(output);
                            } catch (err) {
                                comms.push("\n" + err);
                            }

                            for (let i of comms) {
                                log.value += i;
                            }

                            log.value += "\n>";
                            comms.push("\n>");
                            log.setSelectionRange(log.value.length, log.value.length, "forward");
                        }
                    } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        commIndex--;

                        log.value = "";
                        for (let i of comms) {
                            log.value += i;
                        }
                        log.value += inputs[commIndex];
                    } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        commIndex++;

                        log.value = "";
                        for (let i of comms) {
                            log.value += i;
                        }
                        log.value += inputs[commIndex];
                    }
                });
        }

        activateConsole();

        window.addEventListener("keydown",
            (e) => {
                if (e.key === "`") {
                    if (log.style.display === "block") {
                        consoleActive = false;
                        console.log("Developer console disabled.");
                        log.style.display = "none";
                        log.blur();
                    } else {
                        consoleActive = true;
                        console.log("Developer console active.");
                        log.style.display = "block";
                        log.focus();
                        log.value += "\n>";
                        comms.push("\n>");
                    }
                } else if (e.key === "+" && scale - 0.1 >= 1 && !consoleActive) {
                    scale -= 0.1;
                } else if (e.key === "-" && scale + 0.1 <= 10 && !consoleActive) {
                    scale += 0.1;
                }
            });
    }

    enableConsole();
}
