import {
    LoopAnimation,
    Transition
} from "/src/scripts/lib.js";

import isMobile from "/node_modules/ismobilejs/esm/isMobile.js";

import "../styles/styles.css";

window.onload = async () => {
    if (!localStorage.getItem("game-settings")) {
        localStorage.setItem("game-settings", JSON.stringify({
            onscreenMapStyle: 0,
            zoom: 1.2,
            graphicsQuality: 0,
            music: 0,
            volume: 0.5,
            joysticks: 0
        }));
    }

    window.$SETTINGS = JSON.parse(localStorage.getItem("game-settings"));
    window.canvas = document.querySelector("#gameArea");
    window.sharpness = ($SETTINGS.graphicsQuality == 0) ? 1 : ($SETTINGS.graphicsQuality == 1) ? 0.5 : 2;

    canvas.width = window.innerWidth * sharpness;
    canvas.height = window.innerHeight * sharpness;

    window.gl = canvas.getContext("webgl");

    gl.viewport(0, 0, window.innerWidth * sharpness, window.innerHeight * sharpness);

    window.$OBJECTS = [];
    window.$CONTROLS = [];
    window.$JOYSTICK_L = null;
    window.$JOYSTICK_R = null;
    window.$CURRENT_MAP = null;
    window.$ACTION_BUTTON = null;
    window.$RELOAD_BUTTON = null;
    window.$SCORE = 0;
    window.$MAX_ENEMIES = 10;
    window.$CONTENT_LOADED = false;
    window.$HIGHSCORE = localStorage.getItem("highscore") || 0;
    window.$PLAYER_NAME = localStorage.getItem("player-name");
    window.$AVATAR_MODE_BUTTON = null;
    window.$DROP_ITEM_BUTTON = null;
    window.$AVATAR = null;
    window.$ACTIVE_DIALOGUE_PARTY = null;
    window.$MAP = null;
    window.$MAP_DISPLAY = null;
    window.$PAUSED = false;
    window.$TIME_FACTOR = 1;
    window.$SPECTATING = true;
    window.$CREATIVE_MODE = false;
    window.$HEALTH_BAR = null;
    window.$TRANSITIONING = false;
    window.$GAME_LOOP = function() {};
    window.$IS_MOBILE = isMobile(navigator.userAgent).any;
    window.$MOUSE_POSITION = {
        x: 0,
        y: 0
    };
    window.scale = $SETTINGS.zoom;
    window.bulletResolution = 0.001;
    window.movementMultFactor = 0.05;
    window.globalDarkness = 0;
    window.noclip = false;
    window.fadeTransition = new Transition(globalDarkness, [70, 0], 0.05);
    window.useTransition = true;
    window.joystickSizes = {
        left: 1.5,
        right: 1.5
    };
    window.fixedJoysticks = $SETTINGS.joysticks;
    window.controlTransparency = 1;
    window.ext = gl.getExtension("OES_vertex_array_object");
    window.instExt = gl.getExtension("ANGLE_instanced_arrays");

    function setWorldMeasurements() {
        window.viewportWidth = window.innerWidth;
        window.viewportHeight = window.innerHeight;
        window.maxViewport = Math.max(viewportWidth, viewportHeight);
        window.minViewport = Math.min(viewportWidth, viewportHeight);

        window.viewportRatio = maxViewport / minViewport;
        window.worldUnitX = (maxViewport === viewportWidth) ? 0.01 + (0.01 / viewportRatio) : 0.01 + (0.01 * viewportRatio);
        window.worldUnitY = (maxViewport === viewportWidth) ? 0.01 + (0.01 * viewportRatio) : 0.01 + (0.01 / viewportRatio);
        window.worldWidth = 2 / worldUnitX;
        window.worldHeight = 2 / worldUnitY;
        window.joystickPositions = {
            left: {
                x: ($IS_MOBILE) ? (-worldWidth / 2) + 20 : (-worldWidth / 2) - 50,
                y: ($IS_MOBILE) ? (-worldHeight / 2) + 20 : (-worldHeight / 2) - 50
            },
            right: {
                x: (worldWidth / 2) - 20,
                y: (-worldHeight / 2) + 20
            }
        };

        if (maxViewport === viewportHeight) {
            joystickPositions.left.y += 10;
            joystickPositions.right.y += 10;
        }
    }

    setWorldMeasurements();

    window.onresize = function() {
        gl.viewport(0, 0, window.innerWidth * sharpness, window.innerHeight * sharpness);

        canvas.width = window.innerWidth * sharpness;
        canvas.height = window.innerHeight * sharpness;

        setWorldMeasurements();

        if ($JOYSTICK_L && $JOYSTICK_R) {
            $JOYSTICK_L.position = Object.create(joystickPositions.left);
            $JOYSTICK_R.position = Object.create(joystickPositions.right);
        }

        if (fixedJoysticks) {
            $JOYSTICK_L.fix();
            $JOYSTICK_R.fix();
        }

        gl.uniform1f(locations.worldUnitX, worldUnitX);
        gl.uniform1f(locations.worldUnitY, worldUnitY);

        if (window.updateDisplayViewport) updateDisplayViewport();
    }

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
            $TRANSITIONING = false;
            return;
        }

        let difference = Math.abs(globalDarkness - points[phase]);

        if (phase === 1) globalDarkness -= (globalDarkness || 1) / transitionSpeed;
        if (phase === 0) globalDarkness += (globalDarkness || 1) / transitionSpeed;

        if (Math.abs(globalDarkness - points[phase]) < 0.01 || (globalDarkness > points[phase] && phase === 0)) {
            globalDarkness = points[phase];
        }
    }, undefined, 0.005);

    window.requestTransition = function(c, speed = 2) {
        if (!$TRANSITIONING) {
            $CURRENT_MAP.move = false;

            if (!useTransition) {
                c();
                return;
            }

            callback = c;
            transitionSpeed = speed;
            $TRANSITIONING = true;
        }
    };

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
 
        float texCoordX;
        float texCoordY;

        float x;
        float y;
        mat2 rm;

        uniform vec2 translation;
        uniform float rotation;
        uniform float scale;
        uniform vec2 size;
        uniform vec2 textureRange;

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
               
        if (offset[2] == 0.001) {
            r = rotation;
        }

        x = (cos(r)*x)+(-sin(r)*y);
        y = (sin(r)*tempX)+(cos(r)*y);
        }

        void resize() {
         x *= size[0];
         y *= size[1];
        }

        void setTextureRange() {

          texCoordX = tcoords[0];
          texCoordY = tcoords[1];
 
          float textureRangeX = (textureRange.x - 1.0)/2.0;
          float textureRangeY = (textureRange.y - 1.0)/2.0;

         if (textureRangeX > 0.0) {
           if (texCoordX > 0.5) {
             texCoordX += textureRangeX;
           } else if (texCoordX < 0.5) {
             texCoordX -= textureRangeX;
           }
         }

         if (textureRangeY > 0.0) {
           if (texCoordY > 0.5) {
             texCoordY += textureRangeY;
           } else if (texCoordY < 0.5) {
             texCoordY -= textureRangeY;
           }
         }
        }

        void main() {

        x = coords.x;
        y = coords.y;
 
        /* Pipeline Functions */

        resize();
        rotate();
        translate();
        setTextureRange();

        x *= worldUnitX;
        y *= worldUnitY;

        gl_Position = vec4(x,y,coords.z,scale);
        textrCoords = vec2(texCoordX, texCoordY);
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

          float d = 1.0/fragment[0];

          fragment[0] = lightColor[0]/d;
          fragment[1] = lightColor[1]/d;
          fragment[2] = lightColor[2]/d;
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
        lightColor: gl.getUniformLocation(program, "lightColor"),
        size: gl.getUniformLocation(program, "size"),
        textureRange: gl.getUniformLocation(program, "textureRange")
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
    gl.uniform2fv(locations.size, [1, 1]);
    gl.uniform2fv(locations.textureRange, [0, 0]);

    gl.vertexAttrib3fv(locations.offset, new Float32Array([0, 0, 0.001]));
    gl.vertexAttrib1f(locations.textrUnit, 0);

    await import( /* webpackChunkName: "textures.chunk" */ "/src/scripts/textures.js");
    await import( /* webpackChunkName: "objects.chunk" */ "/src/scripts/objects.js");
    await import( /* webpackChunkName: "sounds.chunk" */ "/src/scripts/sounds.js");
    await import( /* webpackChunkName: "controls.chunk" */ "/src/scripts/controls.js");
    await import( /* webpackChunkName: "game.chunk" */ "/src/scripts/game.js");

    function renderObjects() {
        $OBJECTS.forEach(v => {
            if (v.preRender) v.preRender();
            if (!v.hidden) v.render();
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
    if ($IS_MOBILE) $CONTROLS.push($JOYSTICK_R, $RELOAD_BUTTON, $AVATAR_MODE_BUTTON, $DROP_ITEM_BUTTON);

    let playButton = document.querySelector(".play__button");
    let loader = document.querySelector(".play__loader");
    let gameStats = document.querySelector("#game-stats");
    let globalFrameRun = 0;
    let frameRate = 0;
    let frameRateMarker = performance.now();
    let times = [],
        average, total = 0;
    let T1, T2;

    window.init = function() {
        if (!$PAUSED) {
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
            if ($TRANSITIONING) transitionAnimation.run();
            if (fadeTransition.transitioning) {
                globalDarkness = fadeTransition.run();
            }
            $CURRENT_MAP?.render();
            renderObjects();
            $CURRENT_MAP?.renderTopLayer();
            renderControls();

            $GAME_LOOP();

            $MAP_DISPLAY.update(true);
            $MAP_DISPLAY.render();

            T2 = performance.now();

            gameStats.innerHTML = `FPS: ${frameRate}`;
            globalFrameRun++;
            times.push(T2 - T1);
        }

        requestAnimationFrame(init);
    }
    loader.style.display = "none";
    canvas.style.background = "white";
    playButton.innerText = "Play";
    $CONTENT_LOADED = true;
    init();
}