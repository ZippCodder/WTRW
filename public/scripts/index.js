import {
    LoopAnimation
} from "/public/scripts/lib.js";

/*
@TODO 
- Fix heavy lag with avatars when obstacle assessment is enabled
*/

window.onload = async () => {

    window.canvas = document.querySelector("canvas");
    window.gl = canvas.getContext("webgl");
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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

    window.requestTransition = function(c, speed = 2) {
        if (!useTransition) {
            c();
            return;
        }

        callback = c;
        transitionSpeed = speed;
        transitioning = true;
    }
    window.$OBJECTS = [];
    window.$CONTROLS = [];
    window.$JOYSTICK_L = null;
    window.$JOYSTICK_R = null;
    window.$CURRENT_MAP = null;
    window.$ACTION_BUTTON = null;
    window.$AVATAR = null;
    window.$MAP = null;
    window.viewportWidth = window.innerWidth;
    window.viewportHeight = window.innerHeight;
    window.maxViewport = Math.max(viewportWidth, viewportHeight);
    window.minViewport = Math.min(viewportWidth, viewportHeight);
    window.scale = 1.2;
    window.joystickSizes = {
        left: 1.5,
        right: 1.5
    };
    window.bulletResolution = 0.001;
    window.viewportRatio = maxViewport / minViewport;
    window.worldUnitX = (maxViewport === viewportWidth) ? 0.01 + (0.01 / viewportRatio) : 0.01 + (0.01 * viewportRatio);
    window.worldUnitY = (maxViewport === viewportWidth) ? 0.01 + (0.01 * viewportRatio) : 0.01 + (0.01 / viewportRatio);
    window.movementMultFactor = 0.05;
    window.globalDarkness = 0;
    window.useTransition = true;
    window.worldWidth = 2 / worldUnitX;
    window.worldHeight = 2 / worldUnitY;
    window.ext = gl.getExtension("OES_vertex_array_object");
    window.instExt = gl.getExtension("ANGLE_instanced_arrays");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const vShaderSrc = `
        #version 100

        precision highp float;

        attribute vec3 coords;
        attribute vec2 tcoords;
        attribute float textrUnit;
        attribute vec3 offset;

        varying vec2 textrCoords;
        varying float textr;

        uniform float worldUnitX;
        uniform float worldUnitY;

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
 
        /* Pipeline Functions */

        rotate();
        translate();

        x *= worldUnitX;
        y *= worldUnitY;

        gl_Position = vec4(x,y,coords.z,scale);
        textrCoords = tcoords;
        textr = textrUnit;
        }
        `;

    const fShaderSrc = `
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

    window.vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vShaderSrc);
    gl.compileShader(vShader);
    let vsLog = gl.getShaderInfoLog(vShader);
    if (vsLog.length > 0) console.log(vsLog);

    window.fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fShaderSrc);
    gl.compileShader(fShader);
    let fsLog = gl.getShaderInfoLog(fShader);
    if (fsLog.length > 0) console.log(fsLog);

    window.program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    window.locations = {
        worldUnitX: gl.getUniformLocation(program, "worldUnitX"),
        worldUnitY: gl.getUniformLocation(program, "worldUnitY"),
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

    window.textures = {
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
        avatardrawglock20pullback: document.querySelector("#avatardrawglock20pullback")
    }

    gl.uniform1f(locations.worldUnitX, worldUnitX);
    gl.uniform1f(locations.worldUnitY, worldUnitY);
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

    await import("/public/scripts/objects.js");
    await import("/public/scripts/game.js");
    await import("/public/scripts/controls.js");

    function renderObjects() {
        $OBJECTS.forEach(v => {
            if (v.preRender) v.preRender();
            v.render();
        });
    }

    function renderControls() {
        gl.uniform1f(locations.darkness, 1);
        $CONTROLS.forEach(v => {
            if (!v.hidden) {
                v.render();
            }
        });
        gl.uniform1f(locations.darkness, $CURRENT_MAP.darkness + globalDarkness);
    }

    $OBJECTS.push($AVATAR);
    $CONTROLS.push($JOYSTICK_L);
    $CONTROLS.push($JOYSTICK_R);
    $CONTROLS.push($ACTION_BUTTON);

    let loadingScreen = document.querySelector("#loading-screen");
    let gameStats = document.querySelector("#game-stats");
    let globalFrameRun = 0;
    let frameRate = 0;
    let frameRateMarker = performance.now();
    let times = [],
        average, total = 0;
    let T1, T2;

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

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(locations.scale, scale);
        if (transitioning) transitionAnimation.run();
        $CURRENT_MAP?.render();
        renderObjects();
        $CURRENT_MAP?.renderTopLayer();
        renderControls();

        T2 = performance.now();

        gameStats.innerHTML = `FPS: ${frameRate}, Time: ${T2-T1}`;
        globalFrameRun++;
        times.push(T2 - T1);

        requestAnimationFrame(init);
    }

    loadingScreen.style.display = "none";
    init();
}
