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

    let $JOYSTICK_L, $JOYSTICK_R, $CURRENT_MAP, $ACTION_BUTTON, $AVATAR, $USER_MESSAGE;

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
    let movementMultFactor = 0.05;
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
                this.map.lighting = true;
                this.map.darkness = 5;
                this.on = false;
                return;
            }
            this.map.lighting = false;
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

        static _properties = {
            fireRate: 1,
            bulletSpeed: 5,
            damage: 10,
            accuracy: 5,
            nozzelLength: 13,
            capacity: 15
        }

        static _defaultVertices = [-4.390000000000001, 3.0900000000000003, 1, 0, 0, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, 3.0900000000000003, 1, 0.6859375000000001, 0, -4.390000000000001, -3.0900000000000003, 1, 0, 0.965625, 4.390000000000001, -3.0900000000000003, 1, 0.6859375000000001, 0.965625];

        width = 8.780000000000001;
        height = 6.180000000000001;
        name = "glock 20";
        clusterName = "glock 20";
        texture = textureSources.glock20;

        constructor(initialX, initialY, initialRotation, bullets) {
            super(initialX, initialY, initialRotation);
            this.bullets = bullets ?? 15;
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
            this.linked = false;
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
                rotationAnimation: new LoopAnimation(function() {
                  if (this.state.rotation < this.state.baseRotation) {
                    this.state.rotation /= 2;
                  }
                },this,0.2), 
                targetUpdateAnimation: new LoopAnimation(function() {
                  const map = (this.map || $CURRENT_MAP);
 
                  if (this.state.attack.multiple) {
                    let targetDistance = this.state.attack.engageDistance, target;

                   for (let i in map.avatars) {
                     let {offsetX: targetX, offsetY: targetY} = map.avatars[i].trans;
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
                     let {offsetX: targetX, offsetY: targetY} = map.avatars[this.state.target.id[0]].trans;
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
              
           this.state.targetUpdateAnimation.rate = this.state.attack.reactionTime;           
 
            this.state.fireAnimation = new LoopAnimation(function() {

                this.state.recoilAnimation.start();

                const map = (this.map || $CURRENT_MAP);
                const [initialX, initialY] = rotate(0, 1, (this.trans.rotation) * 180 / Math.PI);

                let r = random(this.state.equippedItems.mainTool.constructor._properties.accuracy || 0);
                r = (Math.random() < 0.5) ? -r : r;
                let [x, y, ro] = rotate(initialX, initialY, r);

                let [nx, ny] = rotate(0, this.state.equippedItems.mainTool.constructor._properties.nozzelLength, (this.trans.rotation) * 180 / Math.PI);

                map.link(new Bullet(nx + this.trans.offsetX, ny + this.trans.offsetY, ((this.trans.rotation) * 180 / Math.PI) + 90, (x) * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, (y) * this.state.equippedItems.mainTool.constructor._properties.bulletSpeed, this.state.equippedItems.mainTool.constructor._properties.damage));

                this.inventory.weapons[this.state.equippedItems.mainTool.name].ammo--;

            }, this, 0.5 / (this.state.equippedItems.mainTool?.constructor._properties.fireRate) || 0);

        }

        hit(damage, x, y) {
            if (!this.state.invinsible) {
                this.state.vitals.health -= damage;
                if (this.state.vitals.health <= 0) this.delete();

                if (Math.random() > 1) {
                    let r = Math.random();
                    (this.map ?? $CURRENT_MAP).link(new((r < 0.66) ? (r < 0.33) ? Blood2 : Blood1 : Blood3)(this.trans.offsetX, this.trans.offsetY));
                }
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

            return true;
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
                        this.drawWeapon();
                        this.state.fire = true;
                    } else if (dist < this.state.attack.slowdownDistance) {
                        this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                        this.drawWeapon();
                        this.state.fire = true;
                        this.state.speed = (this.state.baseSpeed / 3) * this.state.attack.attackSpeed;
                    } else if (dist < this.state.attack.engageDistance) {
                        this.state.speed = this.state.baseSpeed * this.state.attack.attackSpeed;
                        this.trans.rotation = Math.atan2((targetY - m.centerY) - (this.trans.offsetY - m.centerY), (targetX - m.centerX) - (this.trans.offsetX - m.centerX)) - 1.5708;
                        this.drawWeapon();
                        this.state.fire = true;
                        if (!this.state.path.engaged) this.findPathTo(targetX + m.centerX, targetY + m.centerY);
                    }

                    break attack;
                }

                this.disengageTarget();
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

        killTarget(ids, multiple, invert) {
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
               
               return true;
            }

            return false;
        }

        disengageTarget() {
            this.state.target.engaged = false;
            this.state.target.current = undefined;
            this.state.speed = this.state.baseSpeed;
            this.state.fire = false;
            this.disengagePath();

            if (this.openCarry) {
                this.drawWeapon();
            } else {
                this.holsterWeapon();
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
        }

        gotoAvatar() {
            return this.findPathTo(this.map.centerX, this.map.centerY);
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

    // Left joystick
    $JOYSTICK_L = new _Joystick_(true, joystickSizes.left);

    // Right joystick
    $JOYSTICK_R = new _Joystick_(false, joystickSizes.right);

    $AVATAR = new Avatar("R O B I N H O O D");
    $AVATAR.postLink();

    /* INSTANTIATE INITIAL MAP */

    //let _MAP_ = new _Map_(780, 280).init();
    let _MAP_ = new _Map_(500, 500).init();
    $CURRENT_MAP = _MAP_;
    _MAP_.showGeometry();

    $AVATAR.state.targetId = $AVATAR.id;
    _MAP_.avatars[$AVATAR.id] = $AVATAR;    

    for (let i = 0; i < 10; i++) {
      let a = new Avatar(String(i),random(250,true),random(250,true));
      _MAP_.link(a);
      a.state.targetId = a.id;
      a.addItem(new GLOCK_20(0,0,0,1000));
      a.killTarget([$AVATAR.id],true,true);
    } 
  
   // _MAP_.parseLayoutScript(Map1);

    // _MAP_.parseLayoutScript('{"layout":[["UrbanFence",271.0879889290084,58.43034822153565,0],["UrbanFence",223.09077455916437,58.454031036092985,0],["UrbanFenceVertical",197.15759794932524,44.454083635396316,0],["UrbanFenceVertical",197.109598541555,16.453220833195896,0],["UrbanFenceVertical",197.11907212331243,-11.712250337980901,0],["UrbanFenceVertical",297.08221127858917,44.48119585448016,0],["PicnicTable",267.72763277957375,25.260583276241825,0],["PicnicTable",224.6437852785337,25.124816188075876,0],["UrbanFenceHalf",207.15109088428957,-26.068661460666082,0],["GenericApartment",251.10047513706493,-33.34161266221511,0],["UrbanFenceHalf",307.0323938166734,30.164540220889602,0],["SmallPlant",267.6656358570138,29.080583276241615,0],["SmallPlant",224.33134907530297,28.944816188075645,0],["UrbanFenceVertical",317.0021020026218,13.924327857998033,0],["Tile",301.07526496142475,-10.227442696404443,0],["Tile",300.3654721065627,-25.57562440456454,0],["Tile",295.55949940752515,-38.75559248800612,0],["Tile",302.6918126672156,-50.262255807178036,0],["Tile",292.9638454535602,3.9282759896615747,0],["Road",204.69834054661993,-88.4041519718025,0],["Road",254.2215877889212,-88.40966118118963,0],["Road",303.7732700384985,-88.41092221272955,0],["Road",166.12035826530825,-49.768664176420145,90],["Road",342.51035686916856,-49.76419471140565,90],["Road",342.4599684926115,-0.16451344589124695,90],["RoadTriCorner",166.14295828417505,-88.39946128316292,0],["Road",166.13765212980763,-0.18021664345717303,90],["Road",166.13180344057912,49.33197281632345,90],["Road",342.42398397471965,49.3779575374892,90],["RoadCorner",342.4139752770315,88.08677426262857,90],["Road",303.6669795957031,88.04237787410973,0],["Road",254.10522980346448,88.04799449363175,0],["Road",204.7565618233487,88.02824597881325,0],["RoadSign",189.22445089461996,-54.51198076301458,0],["Road",127.42549574699066,-88.4347816260396,0],["UrbanFence",17.267547062625017,58.40244167762255,0],["UrbanFence",-30.729667307217248,58.42612449217988,0],["UrbanFenceVertical",-56.662843917055554,44.42617709148321,0],["UrbanFenceVertical",-56.710843324825575,16.42531428928302,0],["UrbanFenceVertical",-56.70136974306813,-11.740156881893324,0],["UrbanFenceVertical",43.26176941222053,44.45328931056706,0],["PicnicTable",13.90719091319205,25.232676732329175,0],["PicnicTable",-29.17665658784952,25.096909644163226,0],["UrbanFenceHalf",-46.669350982089576,-26.096568004578504,0],["GenericApartment",-2.719966729314283,-33.36951920612768,0],["UrbanFenceHalf",53.21195195030674,30.13663367697698,0],["SmallPlant",13.845193990631987,29.052676732328738,0],["SmallPlant",-29.489092791079543,28.91690964416274,0],["UrbanFenceVertical",63.1816601362581,13.896421314085611,0],["Tile",47.25482309505438,-10.255349240317095,0],["Tile",46.54503024019459,-25.603530948476962,0],["Tile",41.739057541156654,-38.783499031918545,0],["Tile",48.87137080084618,-50.290162351090686,0],["Tile",39.14340358718948,3.900369445748925,0],["Road",-49.122101319758876,-88.43205851571498,0],["Road",0.40114592254329295,-88.43756772510223,0],["Road",49.95282817212859,-88.43882875664202,0],["RoadTriCorner",88.6641190273575,-88.42117541176289,0],["Road",-87.70008360108069,-49.796570720332596,90],["Road",88.68991500280286,-49.79210125531807,90],["Road",88.63952662624534,-0.1924199898038963,90],["RoadTriCorner",-87.67748358221321,-88.4273678270754,0],["Road",-87.68278973658109,-0.20812318736959545,90],["Road",-87.68863842580983,49.30406627241083,90],["Road",88.60354210835366,49.350050993576296,90],["Road",49.846537729333164,88.0144713301964,0],["Road",0.284787937086179,88.02008794971819,0],["Road",-49.063880043029876,88.00033943489991,0],["RoadSign",-64.59599097175982,-54.53988730692723,0],["Road",127.36059296890096,87.92040828431307,0],["RoadTriCorner",166.10032647752223,87.984319515226,180],["RoadTriCorner",88.57804230183255,87.99159932421988,180],["Bench",126.98951486903132,38.4988265228022,0],["Bench",126.98951486903132,-1.501173477200623,0],["Bench",126.98951486903132,-41.501173477198854,0],["StreetLight",108.44001110539403,43.698588060526426,0,[255,255,255,1]],["StreetLight",-66.29346885334309,68.36153553462361,0,[100,25,255,1]],["StreetLight",318.9679408550266,-42.12429608612106,0,[255,255,255,1]],["Grass",249.03716640102252,3.2321422720556447,0],["Grass",213.82029122736003,-6.589934589736936,0],["Grass",210.28234998617796,-3.7814944239056585,0],["Grass",206.25686132508798,37.72051333121112,0],["Grass",308.3205888170574,9.261608144380986,0],["Grass",310.3221020026225,-1.7896943752439785,0],["Grass",293.0559327995687,-55.70225438834707,0],["Grass",313.7879408550246,-65.94897678781432,0],["Grass",230.1505543772064,-65.94540796773525,0],["Grass",196.27779399107874,-50.40572596156008,0],["Grass",186.09928924296042,51.466690428200515,0],["Grass",142.44344580579698,65.48505189152127,0],["Grass",115.10356509559577,51.50818510985071,0],["Grass",107.10036364426787,5.833838599360842,0],["Grass",108.6780791083327,-4.709125743513393,0],["Grass",147.2562301852447,-55.71826883448314,0],["Grass",113.62001110539313,-70.49204929696717,0],["Grass",66.67789163846538,64.63775393553819,0],["Grass",69.28568057327554,-35.081729803048276,0],["Grass",47.4447923059146,-67.62340523878736,0],["Grass",-59.31599097175814,-66.06016273682935,0],["Grass",-49.5690440928975,-57.68437169184251,0],["Grass",-67.12507019770058,-1.7031151478659718,0],["Grass",-70.23962082400729,61.723377744014236,0],["Grass",52.787957645649726,9.568702598262565,0],["Grass",-7.4732202402292565,-3.630609941074087,0],["Grass",-7.9659256214324365,39.31502663618435,0],["Grass",-42.46002828995892,3.943855805699904,0],["Grass",-37.73352242051562,2.3113006601216433,0],["Rocks1",232.90409519477038,1.618369218588295,205],["Rocks2",289.42468185407,39.491451780073376,56],["Rocks2",299.8929449628549,-1.1212751847472506,75],["Rocks1",292.5835483436171,-7.2297318258758505,54],["Rocks1",303.229739118017,-40.274395612352315,73],["Rocks2",256.6440780734892,-61.36811693740436,232],["Rocks1",183.247404070804,-50.878846892173044,289],["Rocks2",185.29308573277092,34.107631775729686,80],["Rocks2",128.21408205864472,62.67154307275937,291],["Rocks1",136.0313166227955,15.072832361261185,209],["Rocks2",140.52359065223092,-23.77626806978234,257],["Rocks1",112.81924443449574,-57.02141193947769,337],["Rocks1",59.986198021110624,-61.40811879083789,72],["Rocks2",-37.39996672931891,-45.24951920612941,85],["Rocks1",-65.56387860863464,39.28153553462486,230],["Rocks2",57.67480892685276,58.190995686340216,54],["Rocks1",69.86166013625724,3.8159277152112057,124],["Rocks2",52.58746445534564,-36.571837782312954,289],["Rocks2",42.023929322167476,-51.913312964287655,279],["Rocks1",36.61719207652166,-2.6851365982746387,83],["Rocks2",36.531951950305285,34.34617270233167,202],["Rocks1",-10.062937485729966,16.80327709569471,319],["Rocks1",-39.34265845724808,-5.889519206130116,327],["Grass2",250.81484865068617,0.2579249529321128,0],["Grass2",297.1825983460973,-62.17369798586955,0],["Grass2",194.3028944687403,-56.78088599803461,0],["Grass2",140.24445596014192,60.17534345998372,0],["Grass2",116.8325313139749,-66.48354707569429,0],["Grass2",49.66085618299802,-62.774819361577244,0],["Grass2",-41.59281267606791,-1.9522637398124503,0],["Grass2",-6.437125119891096,37.35085739805003,0],["Grass2",-50.85863309267057,-65.27336910146734,0],["RoadCorner",342.4715725386795,-88.41368718125564,0],["RoadTriCorner",-87.7299972101285,88.04420514227589,180],["Road",-126.4645811404787,88.02546500132219,0],["Road",-126.3870448887849,-88.43722034708334,0],["UrbanFence",-236.54305875936873,58.380122187886116,0],["UrbanFence",-284.5402731292143,58.40380500244366,0],["UrbanFenceVertical",-310.47344973905246,44.40385760174631,0],["UrbanFenceVertical",-310.5214491468225,16.402994799544754,0],["UrbanFenceVertical",-310.5119755650648,-11.762476371632953,0],["UrbanFenceVertical",-210.548836409784,44.43096982083016,0],["PicnicTable",-239.90341490880354,25.210357242590483,0],["PicnicTable",-282.9872624098469,25.074590154424477,0],["UrbanFenceHalf",-300.47995680408843,-26.118887494318574,0],["GenericApartment",-256.5305725513132,-33.3918386958662,0],["UrbanFenceHalf",-200.59865387169765,30.114314187238715,0],["SmallPlant",-239.9654118313635,29.030357242590245,0],["SmallPlant",-283.29969861307706,28.894590154424474,0],["UrbanFenceVertical",-190.62894568574882,13.87410182434692,0],["Tile",-206.5557827269499,-10.277668730056499,0],["Tile",-207.26557558180937,-25.625850438217245,0],["Tile",-212.07154828084734,-38.80581852165658,0],["Tile",-204.93923502115825,-50.3124818408302,0],["Tile",-214.6672022348116,3.8780499560108868,0],["Road",-302.9327071417576,-88.45437800545405,0],["Road",-253.4094598994546,-88.45988721484117,0],["Road",-203.85777764987478,-88.46114824638097,0],["RoadTriCorner",-165.1464867946439,-88.44349490150184,0],["Road",-341.5106894230698,-49.818890210071885,90],["Road",-165.12069081919842,-49.81442074505739,90],["Road",-165.1710791957556,-0.21473947954238914,90],["Road",-341.4933955585704,-0.23044267710831567,90],["Road",-341.4992442477987,49.28174678267458,90],["Road",-165.20706371364722,49.327731503840305,90],["Road",-203.96406809266995,87.99215184045882,0],["Road",-253.52581788491116,87.99776845998083,0],["Road",-302.8744858650288,87.9780199451621,0],["RoadCorner",-341.4614764687262,88.01342298136736,180],["RoadSign",-318.4065967937549,-54.562206796667084,0],["RoadTriCorner",-165.2216617024013,88.0128780493438,180],["RoadCorner",-341.5406534296555,-88.48213892715263,-90],["Grass",309.9550341918807,62.93574567206141,0],["Grass2",316.4722470497849,56.771142404231746,0],["Grass",-12.526808916677517,-67.6873409905131,0],["Bench",-126.4904851309707,-41.51985303619751,0],["Bench",-126.49048513097024,-0.7632602957119619,0],["Bench",-126.49048513097047,38.96204981322523,0],["StreetLight",-145.15235645850143,43.54930960785598,0,[0,255,255,1]],["StreetLight",108.24667634039957,-36.3465110307524,0,[255,0,255,1]],["StreetLight",-145.5404665649874,-36.34591210179921,0,[50,1005,100,1]],["StreetLight",-319.94249369778726,68.26877651753497,0,[255,255,255,1]],["Grass",-108.99770498840189,-62.437616871262065,0],["Grass",-122.16947304578594,-55.179470513154484,0],["Grass2",-116.19637477162725,-65.00163319258594,0],["Grass",-136.20251517427488,-20.437337578922183,0],["Grass",-109.14089284304873,-11.936003404941186,0],["Grass2",-109.04171156622283,-20.16618837292512,0],["Grass2",-123.22651007837075,22.097079081612765,0],["Grass",-133.64768005414865,14.17049708601867,0],["Grass",-111.05892021285398,64.98929161774164,0],["Grass",-117.37997015670491,59.49522938036718,0],["Grass2",-137.6742745399559,59.08757872436597,0],["Rocks1",-108.05684834804309,41.29989857775649,161],["Rocks2",-143.17048513096717,-29.762183791216444,225],["Rocks2",-199.73068531586352,-57.32051309763695,205],["Rocks1",-202.54040558287727,-35.7058935252483,242],["Rocks1",-219.41075866548724,-15.870743766789431,181],["Rocks1",-203.68386816706757,-1.417149467263911,354],["Rocks1",-214.3485028382463,11.434314187234914,147],["Grass",-219.332561516175,39.70012218788371,0],["Grass2",-224.07712189789325,35.990357242592275,0],["Grass",-261.90642432215134,4.672710253541892,0],["Grass",-246.25248709548902,-3.2572877354857033,0],["Grass",-272.7303985671154,39.72380500244127,0],["Grass2",-264.3072624098473,33.99094405681646,0],["Rocks1",-303.83197556506485,-4.148644195542798,17],["Rocks2",-303.37586151493616,37.82962407259298,79],["Rocks2",-258.5834149088026,18.816682857970104,138],["Grass",-197.17400863813134,-24.407922101347786,0],["Grass",-185.9855761478371,-59.56458214853316,0],["Grass",-190.77933106630712,-63.92375679171664,0],["Grass2",-183.5249805256541,-65.07432592986346,0],["Grass",-225.9562691623042,-63.33036852254735,0],["Grass",-296.7357517409096,-50.51359868759701,0],["Grass",-307.91689167050635,-57.670123083621725,0],["Grass2",-294.7147815307322,-60.792701340758505,0],["Rocks2",-309.85026028233045,-69.3975300460855,206],["Grass",-322.09646557293723,23.5920787052316,0],["Grass2",-317.29270037591454,17.34941236240605,0],["Rocks1",-318.79073350003426,-18.458623390494047,20],["Grass",-323.63013903277187,63.534502462945575,0],["Grass2",-317.1534497390514,57.441301367864675,0],["Grass",-190.57052991015587,53.809803240687636,0],["Grass2",-197.0694967170988,59.876441885715586,0],["Rocks2",-187.01710497174298,68.2595913430192,300],["Rocks2",-139.07185458102714,71.9666850116235,281],["StreetLight",188.00871074273346,67.9669925054405,0,[255,255,255,1]],["RoadRail",-369.00687676232684,133.48250862898686,0],["RoadRail",-316.2068767623254,133.48250862898686,0],["RoadRail",-289.80687676232714,133.48250862898686,0],["RoadRail",-263.40687676232744,133.48250862898686,0],["RoadRail",-342.60687676232595,133.48250862898686,0],["RoadRail",-237.00687676232553,133.48250862898686,0],["RoadRail",-210.606876762326,133.48250862898686,0],["RoadRail",-184.20687676232694,133.48250862898686,0],["RoadRail",-157.80687676232628,133.48250862898686,0],["RoadRail",-131.40687676233136,133.48250862898686,0],["RoadRail",-105.00687676233426,133.48250862898686,0],["RoadRail",-78.6068767623317,133.48250862898686,0],["RoadRail",-52.206876762326495,133.48250862898686,0],["RoadRail",-25.806876762323878,133.48250862898686,0],["RoadRail",0.5931232376765792,133.48250862898686,0],["RoadRail",26.993123237675224,133.48250862898686,0],["RoadRail",53.39312323767612,133.48250862898686,0],["RoadRail",79.79312323767563,133.48250862898686,0],["RoadRail",106.19312323767367,133.48250862898686,0],["RoadRail",132.59312323766986,133.48250862898686,0],["RoadRail",158.99312323767427,133.48250862898686,0],["RoadRail",185.39312323767388,133.48250862898686,0],["RoadRail",211.79312323767397,133.48250862898686,0],["RoadRail",238.19312323767005,133.48250862898686,0],["RoadRail",264.5931232376714,133.48250862898686,0],["RoadRail",290.99312323766765,133.48250862898686,0],["RoadRail",317.39312323766325,133.48250862898686,0],["RoadRail",343.793123237667,133.48250862898686,0],["RoadRail",370.19942227132645,133.48135015908366,0],["RoadRail",-369.0677033230082,-135.52431560640886,0],["RoadRail",-316.26770332300583,-135.52431560640886,0],["RoadRail",-289.86770332300824,-135.52431560640886,0],["RoadRail",-263.46770332300844,-135.52431560640886,0],["RoadRail",-342.6677033230066,-135.52431560640886,0],["RoadRail",-237.06770332300619,-135.52431560640886,0],["RoadRail",-210.66770332300678,-135.52431560640886,0],["RoadRail",-184.2677033230093,-135.52431560640886,0],["RoadRail",-157.8677033230074,-135.52431560640886,0],["RoadRail",-131.46770332301134,-135.52431560640886,0],["RoadRail",-105.067703323014,-135.52431560640886,0],["RoadRail",-78.66770332301101,-135.52431560640886,0],["RoadRail",-52.26770332300692,-135.52431560640886,0],["RoadRail",-25.86770332300453,-135.52431560640886,0],["RoadRail",0.532296676995017,-135.52431560640886,0],["RoadRail",26.93229667699514,-135.52431560640886,0],["RoadRail",53.33229667699575,-135.52431560640886,0],["RoadRail",79.73229667699475,-135.52431560640886,0],["RoadRail",106.13229667699211,-135.52431560640886,0],["RoadRail",132.53229667698898,-135.52431560640886,0],["RoadRail",158.93229667699396,-135.52431560640886,0],["RoadRail",185.33229667699277,-135.52431560640886,0],["RoadRail",211.73229667699275,-135.52431560640886,0],["RoadRail",238.13229667699008,-135.52431560640886,0],["RoadRail",264.53229667699145,-135.52431560640886,0],["RoadRail",290.9322966769882,-135.52431560640886,0],["RoadRail",317.3322966769844,-135.52431560640886,0],["RoadRail",343.73229667698723,-135.52431560640886,0],["RoadRail",370.1385957106456,-135.52547407631218,0],["Grass",-348.44526140134866,-116.82447066935941,0],["Grass",-320.03409111479965,-108.44153875578878,0],["Grass",-317.64123636234484,-109.8712720263301,0],["Grass2",-319.2892206547527,-115.33974656411294,0],["Grass",-281.857997760821,-109.2480747931378,0],["Grass",-258.0868412371262,-116.10077307373167,0],["Grass",-290.40569222360494,-124.25184643456204,0],["Grass2",-286.0996852549235,-122.00878509942636,0],["Grass2",-272.00172065969394,-117.64298581713783,0],["Grass2",-363.2984235281719,-111.77843897949317,0],["Rocks1",-333.855356384892,-112.43204273029225,70],["Rocks1",-226.4786695400342,-108.87882296383218,28],["Rocks1",-120.76133047271021,-121.1760484125356,359],["Rocks2",-187.97344183378078,-120.67584296027213,139],["Rocks2",-304.3446950284254,-116.5915928417118,3],["Grass",-211.01132102447588,-118.07854645092037,0],["Grass",-224.3960868593339,-122.07359903458048,0],["Grass2",-211.9603985769012,-111.30876070992714,0],["Grass",-148.47817359803025,-106.23721313060462,0],["Grass",-162.22790454776884,-112.46698153426347,0],["Grass2",-145.6703251493709,-116.64477845522138,0],["Grass",-78.17516166213943,-111.67532669944178,0],["Grass",-48.69339860343978,-121.35066497062452,0],["Grass2",-70.63199054890902,-118.89695322005997,0],["Rocks1",-30.03029707871587,-109.27148357149643,126],["Rocks1",30.181227141827375,-124.25741402413918,331],["Grass2",-6.890335946421363,-120.03319655774581,0],["Grass",5.794246810819416,-111.25415743334783,0],["Grass",-22.264273688213212,-116.64041643330778,0],["Grass",-260.5344929655002,-66.36737573554701,0],["Grass",-107.99542253205912,12.74952648206427,0],["Grass",-145.6489947665553,-67.00796532161053,0],["Grass",-99.93652433565764,-110.0149115658366,0],["Grass",94.29919105248236,-110.28112527297867,0],["Grass",84.61149096372029,-120.49120446224508,0],["Grass2",77.6340228060863,-109.37533830254942,0],["Grass",57.88839923562537,-111.94465821151083,0],["Grass",151.774689641479,-111.85107993749905,0],["Grass",126.70679553636333,-122.25675185881535,0],["Grass",123.33816302442057,-112.87231635332732,0],["Grass2",172.38116999838394,-117.36234668244225,0],["Rocks2",146.2532720427234,-120.07136737066561,150],["Grass",217.12549572068093,-110.78945676210206,0],["Grass",202.21185746428762,-122.21490080980182,0],["Grass2",194.49476781608416,-113.2072542318097,0],["Grass",280.16161417898167,-107.60081175242526,0],["Grass",243.3479527018263,-125.3443156064079,0],["Grass2",242.67117093872437,-111.34131102612203,0],["Rocks1",261.31843067115034,-118.14217024838057,250],["Grass",330.95427053373106,-110.4762397502478,0],["Grass",287.28127737706086,-123.39726222892413,0],["Grass2",305.761518615589,-118.63007778376058,0],["Rocks1",374.06548792857467,-122.2659577468864,210],["Grass",346.5685558018949,-120.28034892520579,0],["Grass2",371.94028554007053,-96.45785166224104,0],["Grass",367.14793458240905,-81.60893276669196,0],["Grass",374.8957219579135,-70.81195836130136,0],["Grass2",366.0908119120929,-50.98141591335235,0],["Grass",375.49490581132505,-25.685329196866295,0],["Grass2",363.5895917093813,-34.44558322629534,0],["Grass",373.8408653948416,-38.356977486060224,0],["Rocks1",367.4978143693576,-9.306527884816092,321],["Rocks1",364.4263929665031,41.912838748871586,40],["Rocks2",377.33796993140544,72.8947598399599,180],["Grass",374.7827505910081,9.020086140927013,0],["Grass",365.50497879425035,57.14944482711173,0],["Grass2",376.57294124826916,31.68518500679321,0],["Grass",365.1076622635879,117.5642622234933,0],["Grass2",377.0486280026651,107.68577607521024,0],["Grass",368.9923942530426,100.5764444957828,0],["Grass",-360.03123022585083,-83.27425348441778,0],["Grass",-374.1689742633126,-58.47301807373002,0],["Grass2",-370.1233213291045,-71.4357597138224,0],["Rocks2",-365.9829105064567,-93.59775582580329,73],["Grass",-361.47171803840473,-35.761077342990674,0],["Grass",-369.3411906789426,16.85601676053571,0],["Grass",-361.0569334965027,7.208384850691878,0],["Grass2",-369.0053837639983,3.019953494857155,0],["Rocks2",-369.2537501959185,-17.489133906994148,288],["Rocks1",-359.95878358387387,34.44962227165915,68],["Grass",-372.6547344009003,63.783788150802245,0],["Grass",-361.9891857471974,54.90144379230006,0],["Grass2",-370.1313279419889,53.03037135225335,0],["Grass",-356.1170393346966,118.06579476825578,0],["Grass",-366.5226633317106,102.58104782950103,0],["Grass2",-367.43297212340934,118.71174349970967,0],["Rocks1",-364.3193565504151,84.05419260710819,75],["Grass",345.98021484190025,120.60805194783178,0],["Grass",289.8158678618108,109.63808691674456,0],["Grass",280.21817345713936,117.63865495634701,0],["Grass2",311.4704289786942,117.03456704207173,0],["Rocks1",331.7439938533997,110.75427118600783,292],["Grass",180.76361124037868,121.08124340918845,0],["Grass",193.63004774928038,108.60767298681318,0],["Grass2",199.8969813867585,117.98029255412965,0],["Grass",253.17374474846744,112.08739287055127,0],["Rocks1",228.23368765411516,112.84528660705115,95],["Grass",86.80149239853228,118.85912795635231,0],["Grass",104.15192539400162,107.59872672811139,0],["Grass2",111.90019663171037,117.55040579232553,0],["Rocks1",149.85545034056756,111.89429295205568,35],["Rocks2",122.54556828915878,123.30250862898845,61],["Grass2",158.58389408681725,119.1400618669183,0],["Grass",7.501608756844291,123.30250862898822,0],["Grass",27.427089242408176,114.56988055247129,0],["Grass",-15.668717699328134,113.01760286332751,0],["Grass2",1.8757632875126191,111.94650823875699,0],["Rocks2",64.44514400824957,110.91482779001174,48],["Grass",-108.42849311017311,122.22034513163142,0],["Grass",-90.1705243885028,106.58813454543883,0],["Grass",-46.0194153224342,117.07834262173756,0],["Grass2",-54.15176748740164,112.32713140338947,0],["Grass2",-81.8505693768317,117.61723809111805,0],["Rocks1",-123.19776295065807,111.41083569493125,37],["Grass",-217.76252974308554,119.75786755097147,0],["Grass",-169.24941366678115,122.54097521230635,0],["Grass",-192.84623713488082,113.97848186396817,0],["Grass",-140.85592518795264,106.01992091651684,0],["Grass2",-140.8740698282161,122.92817583825267,0],["Grass2",-173.43651507518462,109.75481979647427,0],["Grass2",-267.1247196740243,110.15397647661499,0],["Grass2",-244.86878500590592,114.07124791073278,0],["Grass2",-252.56437896974487,121.39052256671876,0],["Grass",-293.4525498794936,117.47422700726605,0],["Rocks1",-261.3747948146364,115.7612105235992,128],["Rocks2",-67.53116377275495,115.76386964859515,27],["Rocks2",-343.4159468158112,110.05961960311825,185],["Grass",-314.5764944360413,119.2857794312194,0],["Grass2",-304.61912104118636,112.4577962101595,0],["RoadRailVertical",-383.8876147328611,126.47446521333605,0],["RoadRailVertical",-383.8876147328611,109.47446521333663,0],["RoadRailVertical",-383.8876147328611,92.47446521333877,0],["RoadRailVertical",-383.8876147328611,75.47446521333882,0],["RoadRailVertical",-383.8876147328611,58.47446521334054,0],["RoadRailVertical",-383.8876147328611,41.47446521334026,0],["RoadRailVertical",-383.8876147328611,24.47446521333938,0],["RoadRailVertical",-383.8876147328611,7.474465213341205,0],["RoadRailVertical",-383.8876147328611,-9.525534786658879,0],["RoadRailVertical",-383.8876147328611,-26.525534786659254,0],["RoadRailVertical",-383.8876147328611,-43.52553478666044,0],["RoadRailVertical",-383.8876147328611,-60.52553478666258,0],["RoadRailVertical",-383.8876147328611,-77.52553478666218,0],["RoadRailVertical",-383.8876147328611,-94.52553478666248,0],["RoadRailVertical",-383.8876147328611,-111.52553478666273,0],["RoadRailVertical",-383.8876147328611,-128.52553478666462,0],["RoadRailVertical",385.04817374032615,126.45248818033794,0],["RoadRailVertical",385.04817374032615,109.45248818033858,0],["RoadRailVertical",385.04817374032615,92.45248818034248,0],["RoadRailVertical",385.04817374032615,75.45248818034247,0],["RoadRailVertical",385.04817374032615,58.452488180342456,0],["RoadRailVertical",385.04817374032615,41.45248818034212,0],["RoadRailVertical",385.04817374032615,24.452488180341327,0],["RoadRailVertical",385.04817374032615,7.452488180343408,0],["RoadRailVertical",385.04817374032615,-9.547511819656817,0],["RoadRailVertical",385.04817374032615,-26.54751181965708,0],["RoadRailVertical",385.04817374032615,-43.54751181965826,0],["RoadRailVertical",385.04817374032615,-60.54751181966035,0],["RoadRailVertical",385.04817374032615,-77.54751181966,0],["RoadRailVertical",385.04817374032615,-94.54751181966041,0],["RoadRailVertical",385.04817374032615,-111.5475118196605,0],["RoadRailVertical",385.04817374032615,-128.5475118196624,0],["RoadSign",102.09499356568472,120.98153145930841,0],["RoadSign",-153.0633689770882,120.94969903188347,0],["Text","Whatever",3,[0,255,255,1],0,0,0,false],["StreetLight",55.72755581445399,-37.80419354728114,0,[0,255,255,1]],["StreetLight",86.72417631823888,-8.911297617405733,0,[255,255,255,1]],["VisibleBarrier",76.05362283073049,-40.298709390481086,40,40,[12,134,235,0.4]],["VisibleBarrier",125.62824238528907,-20.529325933134885,40,40,[68,134,235,0.4]],["VisibleBarrier",91.70977612251792,-6.531138776774041,40,40,[68,134,235,0.4]],["Text","Blah blah blahr megeddon",1,[0,0,0,1],45.81205704307217,-29.718224018329657,0,false],["StreetLight",-6.891326289547738,27.34038861173749,0,[255,255,0]],["StreetLight",-50.18284391705555,39.9461244921802,0,[255,0,0,1]],["StreetLight",96.29363901674724,-97.17350746516267,0,[0,255,0,1]]],"settings":{"groundColor":[255,255,255,1],"lighting":true,"darkness":6},"root":true,"nodes":3,"children":[{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]}]}');

    /* RENDERING PIPELINE FUNCTIONS */

    // OBJECTS AND CONTROLS ARRAY AT TOP OF FILE

    $ACTION_BUTTON = new _Button_(textureSources.actionbutton, textureSources.actionbuttonactive, (pWidth / 2) - 15, 0, function(pX, pY) {
        const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
        if (i) i.action();
    }, 8.5);
    $ACTION_BUTTON.hidden = true;

    $USER_MESSAGE = new Text("messages will show here!", 30, [0, 0, 0, 1], 0, (pHeight / 2 - 15), 0);
    $USER_MESSAGE.hidden = true;
    $USER_MESSAGE.animation = new MultiFrameLinearAnimation([function() {
        this.hidden = false;
    }, function() {
        this.hidden = true;
    }], $USER_MESSAGE, [0, 2]);
    $USER_MESSAGE.preRender = function() {
        $USER_MESSAGE.animation.run();
    }
    $USER_MESSAGE.showMessage = function(message, color) {
        $USER_MESSAGE.color = color || $USER_MESSAGE._color;
        $USER_MESSAGE.update(message);
        $USER_MESSAGE.animation.start();
    }

    _OBJECTS_.push($AVATAR);

    function renderObjects() {
        _OBJECTS_.forEach(v => {
            if (v.preRender) v.preRender();
            v.render();
        });
    }

    function renderControls() {
        gl.uniform1f(locations.darkness, 1);
        $USER_MESSAGE.preRender();
        if (!$USER_MESSAGE.hidden) {
            gl.uniform1f(locations.scale, 1);
            $USER_MESSAGE.render();
            gl.uniform1f(locations.scale, scale);
        }

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
