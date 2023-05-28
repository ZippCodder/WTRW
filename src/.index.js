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
window.onload = async () => {

    /* MAIN SETUP */

    const canvas = document.querySelector("canvas");
    window.gl = canvas.getContext("webgl");
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let log = document.querySelector("textarea");
    let loadingScreen = document.querySelector("#loading-screen");
    let gameStats = document.querySelector("#game-stats");
    let info = document.querySelector("p");
    let consoleActive = false;

    // MAIN GLOBAL ENTITIES
    
    window.$JOYSTICK_L = null;
    window.$JOYSTICK_R = null; 
    window.$CURRENT_MAP = null;
    window.$ACTION_BUTTON = null; 
    window.$AVATAR = null;
    window.$USER_MESSAGE = null;
    window._MAP_ = null;

    // STORAGE FOR GAME ELEMENTS AND ONSCREEN CONTROLS 
    const _OBJECTS_ = [];
    const _CONTROLS_ = [];

    // Main setup...
    window.vw = window.innerWidth,
    window.vh = window.innerHeight;
    window.ma = Math.max(vw, vh);
    window.mi = Math.min(vw, vh);
    window.scale = 1.2;
    window.joystickSizes = {
        left: 1.5,
        right: 1.5
    };
    window.bulletResolution = 0.001;
    window.ra = ma / mi;
    window.xPercent = null;
    window.yPercent = null;
    window.movementMultFactor = 0.05;
    window.globalDarkness = 0;
    window.useTransition = true;
    window.mapAnchor = {
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

    window.pWidth = 2 / xPercent;
    window.pHeight = 2 / yPercent;

    console.log(gl.getSupportedExtensions());
    window.ext = gl.getExtension("OES_vertex_array_object");
    window.instExt = gl.getExtension("ANGLE_instanced_arrays");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    window.textureSources = {
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

    await import("./objects.js");

    // Left joystick
    $JOYSTICK_L = new _Joystick_(true, joystickSizes.left);

    // Right joystick
    $JOYSTICK_R = new _Joystick_(false, joystickSizes.right);

    $AVATAR = new Avatar("R O B I N H O O D");
    $AVATAR.postLink();

    /* INSTANTIATE INITIAL MAP */

   // _MAP_ = new _Map_(780, 280).init();
    let _MAP_ = new _Map_(500, 500).init();
    $CURRENT_MAP = _MAP_;
    _MAP_.showGeometry();

    _MAP_.avatars[$AVATAR.id] = $AVATAR;
    $AVATAR.state.targetId = $AVATAR.id;
    $AVATAR.addItem(new GLOCK_20(0,0,0,100));

    let id = genObjectId();

    let b = new Avatar("Raymond Bassingwinger", 10, 10);
    _MAP_.link(b);
    b.state.attack.engageDistance = 500;
    b.state.attack.disengageDistance = 500;
    b.state.attack.attackSpeed = 1;
    b.state.armor = 5000;
    b.state.passive = true;
    b.state.aggressive = false;
    b.state.targetUpdateAnimation.rate = 0.2;
    b.addItem(new GLOCK_20(0, 0, 0, 2000));
    b.state.fireAnimation.rate = 0.5 / 10;
    b.killTarget([id],true);
 
  /*  for (let i = 0; i <= 30; i++) {
        let a = new Avatar(String(i), random(250, true), random(250, true));
        _MAP_.link(a);
        a.state.attack.engageDistance = 300;
        a.state.attack.disengageDistance = 500;
        a.state.attack.attackSpeed = 1;
        a.state.agressive = true;
        a.state.targetUpdateAnimation.rate = 1;
        a.addItem(new GLOCK_20(0, 0, 0, 2000));
        a.state.fireAnimation.rate = 0.5 / 1;
        a.state.targetId = id;
        a.killTarget([b.id]);
    } 
*/
     _MAP_.parseLayoutScript(Map1);
 
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
