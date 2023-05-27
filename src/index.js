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

import * as $globals from "./globals.js";

/*
 $globals.gl, 
 $JOYSTICK_L,
 $JOYSTICK_R, 
 $CURRENT_MAP,
 $ACTION_BUTTON,
 $AVATAR,
 $USER_MESSAGE,
 $TEXTURES,
 _MAP_
*/

import {
    Map1
} from "./maps.js";

import {
 _Object_,
 _StaticCluster_,
 _BulletCluster_,
 _InstancedCluster_,
 _MixedStaticCluster_,
 _LineMatrix_,
 _MixedStaticClusterClient_,
 _StaticClusterClient_,
 _InstancedClusterClient_,
 _BulletClusterClient_,
 DownwardLight,
 Bullet,
 Grass,
 Grass2,
 Rocks1,
 Rocks2,
 Book1,
 Book2,
 RoadRail,
 RoadRailVertical,
 StreetLight,
 Bench,
 Tile,
 LightSwitch,
 Chair,
 SmallPlant,
 RoadSign,
 Laptop,
 UrbanFence,
 UrbanFenceVertical,
 UrbanFenceHalf,
 PicnicTable,
 Road,
 RoadDouble,
 RoadCorner,
 RoadTriCorner,
 RoadQuadCorner,
 Door,
 Table,
 _Building_,
 GenericApartment,
 Cafe,
 Supermarket,
 _Pickup_,
 _Gun_,
 _Blade_,
 KitchenKnife,
 AssassinsKnife,
 CombatKnife,
 GLOCK_20,
 GP_K100,
 NXR_44_MAG,
 KC_357,
 USP_45,
 PickupRing,
 Avatar,
 Barrier,
 VisibleBarrier,
 Sensor,
 Trigger,
 _Map_,
 Text,
 _Button_,
 _Joystick_
} from "./objects.js";

import Graph from "./pathfinder.js";

window.onload = () => {

    /* MAIN SETUP */

    const canvas = document.querySelector("canvas");
    $globals.gl = canvas.getContext("webgl");

    $globals.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
   
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let log = document.querySelector("textarea");
    let loadingScreen = document.querySelector("#loading-screen");
    let gameStats = document.querySelector("#game-stats");
    let info = document.querySelector("p");
    let consoleActive = false;

    // MAIN GLOBAL ENTITIES
  
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

    const ext = $globals.gl.getExtension("OES_vertex_array_object");
    const instExt = $globals.gl.getExtension("ANGLE_instanced_arrays");

    $globals.gl.enable($globals.gl.BLEND);
    $globals.gl.blendFunc($globals.gl.ONE, $globals.gl.ONE_MINUS_SRC_ALPHA);

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

    const vShader = $globals.gl.createShader($globals.gl.VERTEX_SHADER);
    $globals.gl.shaderSource(vShader, vShaderSrc);
    $globals.gl.compileShader(vShader);
    let vsLog = $globals.gl.getShaderInfoLog(vShader);
    if (vsLog.length > 0) console.log(vsLog);

    const fShader = $globals.gl.createShader($globals.gl.FRAGMENT_SHADER);
    $globals.gl.shaderSource(fShader, fShaderSrc);
    $globals.gl.compileShader(fShader);
    let fsLog = $globals.gl.getShaderInfoLog(fShader);
    if (fsLog.length > 0) console.log(fsLog);

    let program = $globals.gl.createProgram();
    $globals.gl.attachShader(program, vShader);
    $globals.gl.attachShader(program, fShader);

    $globals.gl.linkProgram(program);
    $globals.gl.useProgram(program);

    const locations = {
        vw: $globals.gl.getUniformLocation(program, "vw"),
        vh: $globals.gl.getUniformLocation(program, "vh"),
        textr1: $globals.gl.getUniformLocation(program, "textr1"),
        textr2: $globals.gl.getUniformLocation(program, "textr2"),
        textr3: $globals.gl.getUniformLocation(program, "textr3"),
        textr4: $globals.gl.getUniformLocation(program, "textr4"),
        textr5: $globals.gl.getUniformLocation(program, "textr5"),
        textr6: $globals.gl.getUniformLocation(program, "textr6"),
        textr7: $globals.gl.getUniformLocation(program, "textr7"),
        textr8: $globals.gl.getUniformLocation(program, "textr8"),
        coords: $globals.gl.getAttribLocation(program, "coords"),
        tcoords: $globals.gl.getAttribLocation(program, "tcoords"),
        textrUnit: $globals.gl.getAttribLocation(program, "textrUnit"),
        offset: $globals.gl.getAttribLocation(program, "offset"),
        translation: $globals.gl.getUniformLocation(program, "translation"),
        scale: $globals.gl.getUniformLocation(program, "scale"),
        rotation: $globals.gl.getUniformLocation(program, "rotation"),
        lines: $globals.gl.getUniformLocation(program, "lines"),
        darkness: $globals.gl.getUniformLocation(program, "darkness"),
        transparency: $globals.gl.getUniformLocation(program, "transparency"),
        color: $globals.gl.getUniformLocation(program, "color"),
        textColor: $globals.gl.getUniformLocation(program, "textColor"),
        lightColor: $globals.gl.getUniformLocation(program, "lightColor")
    }

    $globals.gl.uniform1f(locations.vw, window.innerWidth);
    $globals.gl.uniform1f(locations.vh, window.innerHeight);
    $globals.gl.uniform1i(locations.textr1, 0);
    $globals.gl.uniform1i(locations.textr2, 1);
    $globals.gl.uniform1i(locations.textr3, 2);
    $globals.gl.uniform1i(locations.textr4, 3);
    $globals.gl.uniform1i(locations.textr5, 4);
    $globals.gl.uniform1i(locations.textr6, 5);
    $globals.gl.uniform1i(locations.textr7, 6);
    $globals.gl.uniform1i(locations.textr8, 7);
    $globals.gl.uniform1f(locations.scale, scale);
    $globals.gl.uniform1f(locations.darkness, 1);
    $globals.gl.uniform1f(locations.transparency, 1);
    $globals.gl.uniform1i(locations.lines, 1);
    $globals.gl.uniform4fv(locations.color, [0, 0, 0, 0]);
    $globals.gl.uniform1i(locations.textColor, 0);
    $globals.gl.uniform4fv(locations.lightColor, [0, 0, 0, 0]);

    $globals.gl.vertexAttrib3fv(locations.offset, new Float32Array([0, 0, 0.001]));
    $globals.gl.vertexAttrib1f(locations.textrUnit, 0);

    $JOYSTICK_L = new _Joystick_(true, joystickSizes.left);
    $JOYSTICK_R = new _Joystick_(false, joystickSizes.right);

    $AVATAR = new Avatar("R O B I N H O O D");
    $AVATAR.postLink();

    //let _MAP_ = new _Map_(780, 280).init();
    _MAP_ = new _Map_(500, 500).init();
    $CURRENT_MAP = _MAP_;
    _MAP_.showGeometry();

    _MAP_.avatars[$AVATAR.id] = $AVATAR;
    $AVATAR.state.targetId = $AVATAR.id;
    $AVATAR.addItem(new GLOCK_20(0,0,0,100));

    let b = new Avatar("Raymond Bassingwinger", 10, 10);
    _MAP_.link(b);
    b.state.attack.engageDistance = 500;
    b.state.attack.disengageDistance = 500;
    b.state.attack.attackSpeed = 1;
    b.state.armor = 500;
    b.state.passive = false;
    b.state.aggressive = false;
    b.state.targetUpdateAnimation.rate = 0.2;
    b.addItem(new GLOCK_20(0, 0, 0, 2000));
    b.state.fireAnimation.rate = 0.5 / 10;
    b.killTarget([$AVATAR.id],true,true);

    for (let i = 0; i <= 10; i++) {
        let a = new Avatar(String(i), random(250, true), random(250, true));
        _MAP_.link(a);
        a.state.attack.engageDistance = 300;
        a.state.attack.disengageDistance = 500;
        a.state.attack.attackSpeed = 1;
        a.state.targetUpdateAnimation.rate = 1;
        a.addItem(new GLOCK_20(0, 0, 0, 2000));
        a.state.fireAnimation.rate = 0.5 / 1;
        a.killTarget([b.id]);
    } 

    // _MAP_.parseLayoutScript(Map1);

    //_MAP_.parseLayoutScript('{"layout":[["UrbanFence",271.0879889290084,58.43034822153565,0],["UrbanFence",223.09077455916437,58.454031036092985,0],["UrbanFenceVertical",197.15759794932524,44.454083635396316,0],["UrbanFenceVertical",197.109598541555,16.453220833195896,0],["UrbanFenceVertical",197.11907212331243,-11.712250337980901,0],["UrbanFenceVertical",297.08221127858917,44.48119585448016,0],["PicnicTable",267.72763277957375,25.260583276241825,0],["PicnicTable",224.6437852785337,25.124816188075876,0],["UrbanFenceHalf",207.15109088428957,-26.068661460666082,0],["GenericApartment",251.10047513706493,-33.34161266221511,0],["UrbanFenceHalf",307.0323938166734,30.164540220889602,0],["SmallPlant",267.6656358570138,29.080583276241615,0],["SmallPlant",224.33134907530297,28.944816188075645,0],["UrbanFenceVertical",317.0021020026218,13.924327857998033,0],["Tile",301.07526496142475,-10.227442696404443,0],["Tile",300.3654721065627,-25.57562440456454,0],["Tile",295.55949940752515,-38.75559248800612,0],["Tile",302.6918126672156,-50.262255807178036,0],["Tile",292.9638454535602,3.9282759896615747,0],["Road",204.69834054661993,-88.4041519718025,0],["Road",254.2215877889212,-88.40966118118963,0],["Road",303.7732700384985,-88.41092221272955,0],["Road",166.12035826530825,-49.768664176420145,90],["Road",342.51035686916856,-49.76419471140565,90],["Road",342.4599684926115,-0.16451344589124695,90],["RoadTriCorner",166.14295828417505,-88.39946128316292,0],["Road",166.13765212980763,-0.18021664345717303,90],["Road",166.13180344057912,49.33197281632345,90],["Road",342.42398397471965,49.3779575374892,90],["RoadCorner",342.4139752770315,88.08677426262857,90],["Road",303.6669795957031,88.04237787410973,0],["Road",254.10522980346448,88.04799449363175,0],["Road",204.7565618233487,88.02824597881325,0],["RoadSign",189.22445089461996,-54.51198076301458,0],["Road",127.42549574699066,-88.4347816260396,0],["UrbanFence",17.267547062625017,58.40244167762255,0],["UrbanFence",-30.729667307217248,58.42612449217988,0],["UrbanFenceVertical",-56.662843917055554,44.42617709148321,0],["UrbanFenceVertical",-56.710843324825575,16.42531428928302,0],["UrbanFenceVertical",-56.70136974306813,-11.740156881893324,0],["UrbanFenceVertical",43.26176941222053,44.45328931056706,0],["PicnicTable",13.90719091319205,25.232676732329175,0],["PicnicTable",-29.17665658784952,25.096909644163226,0],["UrbanFenceHalf",-46.669350982089576,-26.096568004578504,0],["GenericApartment",-2.719966729314283,-33.36951920612768,0],["UrbanFenceHalf",53.21195195030674,30.13663367697698,0],["SmallPlant",13.845193990631987,29.052676732328738,0],["SmallPlant",-29.489092791079543,28.91690964416274,0],["UrbanFenceVertical",63.1816601362581,13.896421314085611,0],["Tile",47.25482309505438,-10.255349240317095,0],["Tile",46.54503024019459,-25.603530948476962,0],["Tile",41.739057541156654,-38.783499031918545,0],["Tile",48.87137080084618,-50.290162351090686,0],["Tile",39.14340358718948,3.900369445748925,0],["Road",-49.122101319758876,-88.43205851571498,0],["Road",0.40114592254329295,-88.43756772510223,0],["Road",49.95282817212859,-88.43882875664202,0],["RoadTriCorner",88.6641190273575,-88.42117541176289,0],["Road",-87.70008360108069,-49.796570720332596,90],["Road",88.68991500280286,-49.79210125531807,90],["Road",88.63952662624534,-0.1924199898038963,90],["RoadTriCorner",-87.67748358221321,-88.4273678270754,0],["Road",-87.68278973658109,-0.20812318736959545,90],["Road",-87.68863842580983,49.30406627241083,90],["Road",88.60354210835366,49.350050993576296,90],["Road",49.846537729333164,88.0144713301964,0],["Road",0.284787937086179,88.02008794971819,0],["Road",-49.063880043029876,88.00033943489991,0],["RoadSign",-64.59599097175982,-54.53988730692723,0],["Road",127.36059296890096,87.92040828431307,0],["RoadTriCorner",166.10032647752223,87.984319515226,180],["RoadTriCorner",88.57804230183255,87.99159932421988,180],["Bench",126.98951486903132,38.4988265228022,0],["Bench",126.98951486903132,-1.501173477200623,0],["Bench",126.98951486903132,-41.501173477198854,0],["StreetLight",108.44001110539403,43.698588060526426,0,[255,255,255,1]],["StreetLight",-66.29346885334309,68.36153553462361,0,[100,25,255,1]],["StreetLight",318.9679408550266,-42.12429608612106,0,[255,255,255,1]],["Grass",249.03716640102252,3.2321422720556447,0],["Grass",213.82029122736003,-6.589934589736936,0],["Grass",210.28234998617796,-3.7814944239056585,0],["Grass",206.25686132508798,37.72051333121112,0],["Grass",308.3205888170574,9.261608144380986,0],["Grass",310.3221020026225,-1.7896943752439785,0],["Grass",293.0559327995687,-55.70225438834707,0],["Grass",313.7879408550246,-65.94897678781432,0],["Grass",230.1505543772064,-65.94540796773525,0],["Grass",196.27779399107874,-50.40572596156008,0],["Grass",186.09928924296042,51.466690428200515,0],["Grass",142.44344580579698,65.48505189152127,0],["Grass",115.10356509559577,51.50818510985071,0],["Grass",107.10036364426787,5.833838599360842,0],["Grass",108.6780791083327,-4.709125743513393,0],["Grass",147.2562301852447,-55.71826883448314,0],["Grass",113.62001110539313,-70.49204929696717,0],["Grass",66.67789163846538,64.63775393553819,0],["Grass",69.28568057327554,-35.081729803048276,0],["Grass",47.4447923059146,-67.62340523878736,0],["Grass",-59.31599097175814,-66.06016273682935,0],["Grass",-49.5690440928975,-57.68437169184251,0],["Grass",-67.12507019770058,-1.7031151478659718,0],["Grass",-70.23962082400729,61.723377744014236,0],["Grass",52.787957645649726,9.568702598262565,0],["Grass",-7.4732202402292565,-3.630609941074087,0],["Grass",-7.9659256214324365,39.31502663618435,0],["Grass",-42.46002828995892,3.943855805699904,0],["Grass",-37.73352242051562,2.3113006601216433,0],["Rocks1",232.90409519477038,1.618369218588295,205],["Rocks2",289.42468185407,39.491451780073376,56],["Rocks2",299.8929449628549,-1.1212751847472506,75],["Rocks1",292.5835483436171,-7.2297318258758505,54],["Rocks1",303.229739118017,-40.274395612352315,73],["Rocks2",256.6440780734892,-61.36811693740436,232],["Rocks1",183.247404070804,-50.878846892173044,289],["Rocks2",185.29308573277092,34.107631775729686,80],["Rocks2",128.21408205864472,62.67154307275937,291],["Rocks1",136.0313166227955,15.072832361261185,209],["Rocks2",140.52359065223092,-23.77626806978234,257],["Rocks1",112.81924443449574,-57.02141193947769,337],["Rocks1",59.986198021110624,-61.40811879083789,72],["Rocks2",-37.39996672931891,-45.24951920612941,85],["Rocks1",-65.56387860863464,39.28153553462486,230],["Rocks2",57.67480892685276,58.190995686340216,54],["Rocks1",69.86166013625724,3.8159277152112057,124],["Rocks2",52.58746445534564,-36.571837782312954,289],["Rocks2",42.023929322167476,-51.913312964287655,279],["Rocks1",36.61719207652166,-2.6851365982746387,83],["Rocks2",36.531951950305285,34.34617270233167,202],["Rocks1",-10.062937485729966,16.80327709569471,319],["Rocks1",-39.34265845724808,-5.889519206130116,327],["Grass2",250.81484865068617,0.2579249529321128,0],["Grass2",297.1825983460973,-62.17369798586955,0],["Grass2",194.3028944687403,-56.78088599803461,0],["Grass2",140.24445596014192,60.17534345998372,0],["Grass2",116.8325313139749,-66.48354707569429,0],["Grass2",49.66085618299802,-62.774819361577244,0],["Grass2",-41.59281267606791,-1.9522637398124503,0],["Grass2",-6.437125119891096,37.35085739805003,0],["Grass2",-50.85863309267057,-65.27336910146734,0],["RoadCorner",342.4715725386795,-88.41368718125564,0],["RoadTriCorner",-87.7299972101285,88.04420514227589,180],["Road",-126.4645811404787,88.02546500132219,0],["Road",-126.3870448887849,-88.43722034708334,0],["UrbanFence",-236.54305875936873,58.380122187886116,0],["UrbanFence",-284.5402731292143,58.40380500244366,0],["UrbanFenceVertical",-310.47344973905246,44.40385760174631,0],["UrbanFenceVertical",-310.5214491468225,16.402994799544754,0],["UrbanFenceVertical",-310.5119755650648,-11.762476371632953,0],["UrbanFenceVertical",-210.548836409784,44.43096982083016,0],["PicnicTable",-239.90341490880354,25.210357242590483,0],["PicnicTable",-282.9872624098469,25.074590154424477,0],["UrbanFenceHalf",-300.47995680408843,-26.118887494318574,0],["GenericApartment",-256.5305725513132,-33.3918386958662,0],["UrbanFenceHalf",-200.59865387169765,30.114314187238715,0],["SmallPlant",-239.9654118313635,29.030357242590245,0],["SmallPlant",-283.29969861307706,28.894590154424474,0],["UrbanFenceVertical",-190.62894568574882,13.87410182434692,0],["Tile",-206.5557827269499,-10.277668730056499,0],["Tile",-207.26557558180937,-25.625850438217245,0],["Tile",-212.07154828084734,-38.80581852165658,0],["Tile",-204.93923502115825,-50.3124818408302,0],["Tile",-214.6672022348116,3.8780499560108868,0],["Road",-302.9327071417576,-88.45437800545405,0],["Road",-253.4094598994546,-88.45988721484117,0],["Road",-203.85777764987478,-88.46114824638097,0],["RoadTriCorner",-165.1464867946439,-88.44349490150184,0],["Road",-341.5106894230698,-49.818890210071885,90],["Road",-165.12069081919842,-49.81442074505739,90],["Road",-165.1710791957556,-0.21473947954238914,90],["Road",-341.4933955585704,-0.23044267710831567,90],["Road",-341.4992442477987,49.28174678267458,90],["Road",-165.20706371364722,49.327731503840305,90],["Road",-203.96406809266995,87.99215184045882,0],["Road",-253.52581788491116,87.99776845998083,0],["Road",-302.8744858650288,87.9780199451621,0],["RoadCorner",-341.4614764687262,88.01342298136736,180],["RoadSign",-318.4065967937549,-54.562206796667084,0],["RoadTriCorner",-165.2216617024013,88.0128780493438,180],["RoadCorner",-341.5406534296555,-88.48213892715263,-90],["Grass",309.9550341918807,62.93574567206141,0],["Grass2",316.4722470497849,56.771142404231746,0],["Grass",-12.526808916677517,-67.6873409905131,0],["Bench",-126.4904851309707,-41.51985303619751,0],["Bench",-126.49048513097024,-0.7632602957119619,0],["Bench",-126.49048513097047,38.96204981322523,0],["StreetLight",-145.15235645850143,43.54930960785598,0,[0,255,255,1]],["StreetLight",108.24667634039957,-36.3465110307524,0,[255,0,255,1]],["StreetLight",-145.5404665649874,-36.34591210179921,0,[50,1005,100,1]],["StreetLight",-319.94249369778726,68.26877651753497,0,[255,255,255,1]],["Grass",-108.99770498840189,-62.437616871262065,0],["Grass",-122.16947304578594,-55.179470513154484,0],["Grass2",-116.19637477162725,-65.00163319258594,0],["Grass",-136.20251517427488,-20.437337578922183,0],["Grass",-109.14089284304873,-11.936003404941186,0],["Grass2",-109.04171156622283,-20.16618837292512,0],["Grass2",-123.22651007837075,22.097079081612765,0],["Grass",-133.64768005414865,14.17049708601867,0],["Grass",-111.05892021285398,64.98929161774164,0],["Grass",-117.37997015670491,59.49522938036718,0],["Grass2",-137.6742745399559,59.08757872436597,0],["Rocks1",-108.05684834804309,41.29989857775649,161],["Rocks2",-143.17048513096717,-29.762183791216444,225],["Rocks2",-199.73068531586352,-57.32051309763695,205],["Rocks1",-202.54040558287727,-35.7058935252483,242],["Rocks1",-219.41075866548724,-15.870743766789431,181],["Rocks1",-203.68386816706757,-1.417149467263911,354],["Rocks1",-214.3485028382463,11.434314187234914,147],["Grass",-219.332561516175,39.70012218788371,0],["Grass2",-224.07712189789325,35.990357242592275,0],["Grass",-261.90642432215134,4.672710253541892,0],["Grass",-246.25248709548902,-3.2572877354857033,0],["Grass",-272.7303985671154,39.72380500244127,0],["Grass2",-264.3072624098473,33.99094405681646,0],["Rocks1",-303.83197556506485,-4.148644195542798,17],["Rocks2",-303.37586151493616,37.82962407259298,79],["Rocks2",-258.5834149088026,18.816682857970104,138],["Grass",-197.17400863813134,-24.407922101347786,0],["Grass",-185.9855761478371,-59.56458214853316,0],["Grass",-190.77933106630712,-63.92375679171664,0],["Grass2",-183.5249805256541,-65.07432592986346,0],["Grass",-225.9562691623042,-63.33036852254735,0],["Grass",-296.7357517409096,-50.51359868759701,0],["Grass",-307.91689167050635,-57.670123083621725,0],["Grass2",-294.7147815307322,-60.792701340758505,0],["Rocks2",-309.85026028233045,-69.3975300460855,206],["Grass",-322.09646557293723,23.5920787052316,0],["Grass2",-317.29270037591454,17.34941236240605,0],["Rocks1",-318.79073350003426,-18.458623390494047,20],["Grass",-323.63013903277187,63.534502462945575,0],["Grass2",-317.1534497390514,57.441301367864675,0],["Grass",-190.57052991015587,53.809803240687636,0],["Grass2",-197.0694967170988,59.876441885715586,0],["Rocks2",-187.01710497174298,68.2595913430192,300],["Rocks2",-139.07185458102714,71.9666850116235,281],["StreetLight",188.00871074273346,67.9669925054405,0,[255,255,255,1]],["RoadRail",-369.00687676232684,133.48250862898686,0],["RoadRail",-316.2068767623254,133.48250862898686,0],["RoadRail",-289.80687676232714,133.48250862898686,0],["RoadRail",-263.40687676232744,133.48250862898686,0],["RoadRail",-342.60687676232595,133.48250862898686,0],["RoadRail",-237.00687676232553,133.48250862898686,0],["RoadRail",-210.606876762326,133.48250862898686,0],["RoadRail",-184.20687676232694,133.48250862898686,0],["RoadRail",-157.80687676232628,133.48250862898686,0],["RoadRail",-131.40687676233136,133.48250862898686,0],["RoadRail",-105.00687676233426,133.48250862898686,0],["RoadRail",-78.6068767623317,133.48250862898686,0],["RoadRail",-52.206876762326495,133.48250862898686,0],["RoadRail",-25.806876762323878,133.48250862898686,0],["RoadRail",0.5931232376765792,133.48250862898686,0],["RoadRail",26.993123237675224,133.48250862898686,0],["RoadRail",53.39312323767612,133.48250862898686,0],["RoadRail",79.79312323767563,133.48250862898686,0],["RoadRail",106.19312323767367,133.48250862898686,0],["RoadRail",132.59312323766986,133.48250862898686,0],["RoadRail",158.99312323767427,133.48250862898686,0],["RoadRail",185.39312323767388,133.48250862898686,0],["RoadRail",211.79312323767397,133.48250862898686,0],["RoadRail",238.19312323767005,133.48250862898686,0],["RoadRail",264.5931232376714,133.48250862898686,0],["RoadRail",290.99312323766765,133.48250862898686,0],["RoadRail",317.39312323766325,133.48250862898686,0],["RoadRail",343.793123237667,133.48250862898686,0],["RoadRail",370.19942227132645,133.48135015908366,0],["RoadRail",-369.0677033230082,-135.52431560640886,0],["RoadRail",-316.26770332300583,-135.52431560640886,0],["RoadRail",-289.86770332300824,-135.52431560640886,0],["RoadRail",-263.46770332300844,-135.52431560640886,0],["RoadRail",-342.6677033230066,-135.52431560640886,0],["RoadRail",-237.06770332300619,-135.52431560640886,0],["RoadRail",-210.66770332300678,-135.52431560640886,0],["RoadRail",-184.2677033230093,-135.52431560640886,0],["RoadRail",-157.8677033230074,-135.52431560640886,0],["RoadRail",-131.46770332301134,-135.52431560640886,0],["RoadRail",-105.067703323014,-135.52431560640886,0],["RoadRail",-78.66770332301101,-135.52431560640886,0],["RoadRail",-52.26770332300692,-135.52431560640886,0],["RoadRail",-25.86770332300453,-135.52431560640886,0],["RoadRail",0.532296676995017,-135.52431560640886,0],["RoadRail",26.93229667699514,-135.52431560640886,0],["RoadRail",53.33229667699575,-135.52431560640886,0],["RoadRail",79.73229667699475,-135.52431560640886,0],["RoadRail",106.13229667699211,-135.52431560640886,0],["RoadRail",132.53229667698898,-135.52431560640886,0],["RoadRail",158.93229667699396,-135.52431560640886,0],["RoadRail",185.33229667699277,-135.52431560640886,0],["RoadRail",211.73229667699275,-135.52431560640886,0],["RoadRail",238.13229667699008,-135.52431560640886,0],["RoadRail",264.53229667699145,-135.52431560640886,0],["RoadRail",290.9322966769882,-135.52431560640886,0],["RoadRail",317.3322966769844,-135.52431560640886,0],["RoadRail",343.73229667698723,-135.52431560640886,0],["RoadRail",370.1385957106456,-135.52547407631218,0],["Grass",-348.44526140134866,-116.82447066935941,0],["Grass",-320.03409111479965,-108.44153875578878,0],["Grass",-317.64123636234484,-109.8712720263301,0],["Grass2",-319.2892206547527,-115.33974656411294,0],["Grass",-281.857997760821,-109.2480747931378,0],["Grass",-258.0868412371262,-116.10077307373167,0],["Grass",-290.40569222360494,-124.25184643456204,0],["Grass2",-286.0996852549235,-122.00878509942636,0],["Grass2",-272.00172065969394,-117.64298581713783,0],["Grass2",-363.2984235281719,-111.77843897949317,0],["Rocks1",-333.855356384892,-112.43204273029225,70],["Rocks1",-226.4786695400342,-108.87882296383218,28],["Rocks1",-120.76133047271021,-121.1760484125356,359],["Rocks2",-187.97344183378078,-120.67584296027213,139],["Rocks2",-304.3446950284254,-116.5915928417118,3],["Grass",-211.01132102447588,-118.07854645092037,0],["Grass",-224.3960868593339,-122.07359903458048,0],["Grass2",-211.9603985769012,-111.30876070992714,0],["Grass",-148.47817359803025,-106.23721313060462,0],["Grass",-162.22790454776884,-112.46698153426347,0],["Grass2",-145.6703251493709,-116.64477845522138,0],["Grass",-78.17516166213943,-111.67532669944178,0],["Grass",-48.69339860343978,-121.35066497062452,0],["Grass2",-70.63199054890902,-118.89695322005997,0],["Rocks1",-30.03029707871587,-109.27148357149643,126],["Rocks1",30.181227141827375,-124.25741402413918,331],["Grass2",-6.890335946421363,-120.03319655774581,0],["Grass",5.794246810819416,-111.25415743334783,0],["Grass",-22.264273688213212,-116.64041643330778,0],["Grass",-260.5344929655002,-66.36737573554701,0],["Grass",-107.99542253205912,12.74952648206427,0],["Grass",-145.6489947665553,-67.00796532161053,0],["Grass",-99.93652433565764,-110.0149115658366,0],["Grass",94.29919105248236,-110.28112527297867,0],["Grass",84.61149096372029,-120.49120446224508,0],["Grass2",77.6340228060863,-109.37533830254942,0],["Grass",57.88839923562537,-111.94465821151083,0],["Grass",151.774689641479,-111.85107993749905,0],["Grass",126.70679553636333,-122.25675185881535,0],["Grass",123.33816302442057,-112.87231635332732,0],["Grass2",172.38116999838394,-117.36234668244225,0],["Rocks2",146.2532720427234,-120.07136737066561,150],["Grass",217.12549572068093,-110.78945676210206,0],["Grass",202.21185746428762,-122.21490080980182,0],["Grass2",194.49476781608416,-113.2072542318097,0],["Grass",280.16161417898167,-107.60081175242526,0],["Grass",243.3479527018263,-125.3443156064079,0],["Grass2",242.67117093872437,-111.34131102612203,0],["Rocks1",261.31843067115034,-118.14217024838057,250],["Grass",330.95427053373106,-110.4762397502478,0],["Grass",287.28127737706086,-123.39726222892413,0],["Grass2",305.761518615589,-118.63007778376058,0],["Rocks1",374.06548792857467,-122.2659577468864,210],["Grass",346.5685558018949,-120.28034892520579,0],["Grass2",371.94028554007053,-96.45785166224104,0],["Grass",367.14793458240905,-81.60893276669196,0],["Grass",374.8957219579135,-70.81195836130136,0],["Grass2",366.0908119120929,-50.98141591335235,0],["Grass",375.49490581132505,-25.685329196866295,0],["Grass2",363.5895917093813,-34.44558322629534,0],["Grass",373.8408653948416,-38.356977486060224,0],["Rocks1",367.4978143693576,-9.306527884816092,321],["Rocks1",364.4263929665031,41.912838748871586,40],["Rocks2",377.33796993140544,72.8947598399599,180],["Grass",374.7827505910081,9.020086140927013,0],["Grass",365.50497879425035,57.14944482711173,0],["Grass2",376.57294124826916,31.68518500679321,0],["Grass",365.1076622635879,117.5642622234933,0],["Grass2",377.0486280026651,107.68577607521024,0],["Grass",368.9923942530426,100.5764444957828,0],["Grass",-360.03123022585083,-83.27425348441778,0],["Grass",-374.1689742633126,-58.47301807373002,0],["Grass2",-370.1233213291045,-71.4357597138224,0],["Rocks2",-365.9829105064567,-93.59775582580329,73],["Grass",-361.47171803840473,-35.761077342990674,0],["Grass",-369.3411906789426,16.85601676053571,0],["Grass",-361.0569334965027,7.208384850691878,0],["Grass2",-369.0053837639983,3.019953494857155,0],["Rocks2",-369.2537501959185,-17.489133906994148,288],["Rocks1",-359.95878358387387,34.44962227165915,68],["Grass",-372.6547344009003,63.783788150802245,0],["Grass",-361.9891857471974,54.90144379230006,0],["Grass2",-370.1313279419889,53.03037135225335,0],["Grass",-356.1170393346966,118.06579476825578,0],["Grass",-366.5226633317106,102.58104782950103,0],["Grass2",-367.43297212340934,118.71174349970967,0],["Rocks1",-364.3193565504151,84.05419260710819,75],["Grass",345.98021484190025,120.60805194783178,0],["Grass",289.8158678618108,109.63808691674456,0],["Grass",280.21817345713936,117.63865495634701,0],["Grass2",311.4704289786942,117.03456704207173,0],["Rocks1",331.7439938533997,110.75427118600783,292],["Grass",180.76361124037868,121.08124340918845,0],["Grass",193.63004774928038,108.60767298681318,0],["Grass2",199.8969813867585,117.98029255412965,0],["Grass",253.17374474846744,112.08739287055127,0],["Rocks1",228.23368765411516,112.84528660705115,95],["Grass",86.80149239853228,118.85912795635231,0],["Grass",104.15192539400162,107.59872672811139,0],["Grass2",111.90019663171037,117.55040579232553,0],["Rocks1",149.85545034056756,111.89429295205568,35],["Rocks2",122.54556828915878,123.30250862898845,61],["Grass2",158.58389408681725,119.1400618669183,0],["Grass",7.501608756844291,123.30250862898822,0],["Grass",27.427089242408176,114.56988055247129,0],["Grass",-15.668717699328134,113.01760286332751,0],["Grass2",1.8757632875126191,111.94650823875699,0],["Rocks2",64.44514400824957,110.91482779001174,48],["Grass",-108.42849311017311,122.22034513163142,0],["Grass",-90.1705243885028,106.58813454543883,0],["Grass",-46.0194153224342,117.07834262173756,0],["Grass2",-54.15176748740164,112.32713140338947,0],["Grass2",-81.8505693768317,117.61723809111805,0],["Rocks1",-123.19776295065807,111.41083569493125,37],["Grass",-217.76252974308554,119.75786755097147,0],["Grass",-169.24941366678115,122.54097521230635,0],["Grass",-192.84623713488082,113.97848186396817,0],["Grass",-140.85592518795264,106.01992091651684,0],["Grass2",-140.8740698282161,122.92817583825267,0],["Grass2",-173.43651507518462,109.75481979647427,0],["Grass2",-267.1247196740243,110.15397647661499,0],["Grass2",-244.86878500590592,114.07124791073278,0],["Grass2",-252.56437896974487,121.39052256671876,0],["Grass",-293.4525498794936,117.47422700726605,0],["Rocks1",-261.3747948146364,115.7612105235992,128],["Rocks2",-67.53116377275495,115.76386964859515,27],["Rocks2",-343.4159468158112,110.05961960311825,185],["Grass",-314.5764944360413,119.2857794312194,0],["Grass2",-304.61912104118636,112.4577962101595,0],["RoadRailVertical",-383.8876147328611,126.47446521333605,0],["RoadRailVertical",-383.8876147328611,109.47446521333663,0],["RoadRailVertical",-383.8876147328611,92.47446521333877,0],["RoadRailVertical",-383.8876147328611,75.47446521333882,0],["RoadRailVertical",-383.8876147328611,58.47446521334054,0],["RoadRailVertical",-383.8876147328611,41.47446521334026,0],["RoadRailVertical",-383.8876147328611,24.47446521333938,0],["RoadRailVertical",-383.8876147328611,7.474465213341205,0],["RoadRailVertical",-383.8876147328611,-9.525534786658879,0],["RoadRailVertical",-383.8876147328611,-26.525534786659254,0],["RoadRailVertical",-383.8876147328611,-43.52553478666044,0],["RoadRailVertical",-383.8876147328611,-60.52553478666258,0],["RoadRailVertical",-383.8876147328611,-77.52553478666218,0],["RoadRailVertical",-383.8876147328611,-94.52553478666248,0],["RoadRailVertical",-383.8876147328611,-111.52553478666273,0],["RoadRailVertical",-383.8876147328611,-128.52553478666462,0],["RoadRailVertical",385.04817374032615,126.45248818033794,0],["RoadRailVertical",385.04817374032615,109.45248818033858,0],["RoadRailVertical",385.04817374032615,92.45248818034248,0],["RoadRailVertical",385.04817374032615,75.45248818034247,0],["RoadRailVertical",385.04817374032615,58.452488180342456,0],["RoadRailVertical",385.04817374032615,41.45248818034212,0],["RoadRailVertical",385.04817374032615,24.452488180341327,0],["RoadRailVertical",385.04817374032615,7.452488180343408,0],["RoadRailVertical",385.04817374032615,-9.547511819656817,0],["RoadRailVertical",385.04817374032615,-26.54751181965708,0],["RoadRailVertical",385.04817374032615,-43.54751181965826,0],["RoadRailVertical",385.04817374032615,-60.54751181966035,0],["RoadRailVertical",385.04817374032615,-77.54751181966,0],["RoadRailVertical",385.04817374032615,-94.54751181966041,0],["RoadRailVertical",385.04817374032615,-111.5475118196605,0],["RoadRailVertical",385.04817374032615,-128.5475118196624,0],["RoadSign",102.09499356568472,120.98153145930841,0],["RoadSign",-153.0633689770882,120.94969903188347,0],["Text","Whatever",3,[0,255,255,1],0,0,0,false],["StreetLight",55.72755581445399,-37.80419354728114,0,[0,255,255,1]],["StreetLight",86.72417631823888,-8.911297617405733,0,[255,255,255,1]],["VisibleBarrier",76.05362283073049,-40.298709390481086,40,40,[12,134,235,0.4]],["VisibleBarrier",125.62824238528907,-20.529325933134885,40,40,[68,134,235,0.4]],["VisibleBarrier",91.70977612251792,-6.531138776774041,40,40,[68,134,235,0.4]],["Text","Blah blah blahr megeddon",1,[0,0,0,1],45.81205704307217,-29.718224018329657,0,false],["StreetLight",-6.891326289547738,27.34038861173749,0,[255,255,0]],["StreetLight",-50.18284391705555,39.9461244921802,0,[255,0,0,1]],["StreetLight",96.29363901674724,-97.17350746516267,0,[0,255,0,1]]],"settings":{"groundColor":[255,255,255,1],"lighting":true,"darkness":6},"root":true,"nodes":3,"children":[{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]}]}');

    /* RENDERING PIPELINE FUNCTIONS */

    // OBJECTS AND CONTROLS ARRAY AT TOP OF FILE

    $ACTION_BUTTON = new _Button_($TEXTURES.actionbutton, $TEXTURES.actionbuttonactive, (pWidth / 2) - 15, 0, function(pX, pY) {
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
        $globals.gl.uniform1f(locations.darkness, 1);
        $USER_MESSAGE.preRender();
        if (!$USER_MESSAGE.hidden) {
            $globals.gl.uniform1f(locations.scale, 1);
            $USER_MESSAGE.render();
            $globals.gl.uniform1f(locations.scale, scale);
        }

        _CONTROLS_.forEach(v => {
            if (!v.hidden) {
                v.render();
            }
        });
        $globals.gl.uniform1f(locations.darkness, $CURRENT_MAP.darkness + globalDarkness);
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
        $globals.gl.clear($globals.gl.COLOR_BUFFER_BIT);

        $globals.gl.uniform1f(locations.scale, scale);

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
