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
      normalizeRotation
  } from "/src/scripts/lib.js";

  import {
      Map1,
      Map2
  } from "/src/scripts/maps.js";

  import {
      _Map_,
      Avatar,
      House1,
      UrbanFence,
      UrbanFenceHalf,
      UrbanFenceVertical,
      RoadRail,
      RoadRailVertical,
      PicnicTable,
      StreetLight,
      Chair,
      Table,
      GLOCK_20,
      Text,
      VisibleBarrier,
      DownwardLight,
      Barrier,
      Laptop,
      BlackBook,
      WhiteBook,
      NXR_44_MAG,
      GP_K100,
      KC_357,
      USP_45,
      Grass,
      Grass2,
      Rocks1,
      Rocks2,
      BulletShell,
      Plus100,
      KitchenKnife,
      AssassinsKnife,
      Bot,
      Floor,
      Bench, 
      ConvenienceStore,
      Bush,
      GunStore,
      CombatKnife,
      BasicArmour,
      MercenaryArmour, 
      SwatArmour,
      DX_9, 
      NOSS_7,   
      FURS_55, 
      X6_91, 
      Money, 
      Shed, 
      SmallPlant, 
      Door, 
      Trigger, 
      MedKit
  } from "/src/scripts/objects.js";

  $AVATAR = new Avatar("- - - - -");
  $AVATAR.postLink();
  $AVATAR.inventory.cash = parseInt(localStorage.getItem("player-cash")) || 0;

  const firstNames = ["Dave", "Richee", "Brenda", "Stacy", "Skylar", "Malcom", "Steven", "Brandon", "Halee", "Kaylee", "Peter", "Kate", "Hannah", "Joy", "Lenny", "Leon", "Teddy", "Amanda", "Pablo", "Emma", "Chloe", "Harry", "Mia", "Larry", "Lisa", "Camela", "Lacey", "Daniel", "Danny", "Riley", "Jacob", "Jane", "Lilly", "Rebecca", "Beatrice", "Brandy", "Bianca", "Lauren", "Grace", "Andie"];
  const lastNames = ["Davidson", "Jackson", "Olvedo", "Cabello", "Kabrick", "Rich", "Dotson", "Latins", "Emmit", "James", "Havana", "York", "Ross", "Jean", "Masons", "Umada", "Gerannd", "Roberts", "Robby", "Lane", "Shery", "Munick", "Lamoss","Price", "Ross", "Gaines", "Holmes", "Hanes", "Ommis"];

  function getName() {
      return `${firstNames[random(firstNames.length)]} ${lastNames[random(lastNames.length)]}`;
  }

  $MAP = new _Map_(500, 500, true, "Downtown SmallVille").init();

  $CURRENT_MAP = $MAP;

  const enemySpawnLoop = new LoopAnimation(function() {
      if ($MAP.SUB_MAPS[0].avatarCount < $MAX_ENEMIES) {

          let {
              x,
              y
          } = $MAP.SUB_MAPS[0].GRAPH.getRandomPoint();

          let a = new Bot(getName(), (x + 5) - $MAP.SUB_MAPS[0].centerX, (y - 5) - $MAP.SUB_MAPS[0].centerY);
          $MAP.SUB_MAPS[0].link(a);
          a.state.attack.engageDistance = 300;
          a.state.attack.disengageDistance = 500;
          a.state.attack.attackSpeed = 1;
          a.state.armour = 0;
          a.state.aggressive = true;
          a.state.passive = false;
          a.state.openCarry = false;
          a.state.killValue = 100;
          a.state.targetUpdateAnimation.rate = 1 / 5;

          let weapon;
  
          if (Math.random() < 0.5) {
            console.log("a");
            weapon = [new GLOCK_20, new GP_K100, new KC_357, new KitchenKnife][random(4)];
            a.state.killValue = 125; 
          } else if (Math.random() <  0.8) {
            console.log("b");
            weapon = [new DX_9, new NXR_44_MAG, new FURS_55, new CombatKnife][random(4)];
            a.state.killValue = 176;
           } else {
            console.log("c");
            weapon = [new NOSS_7, new X6_91, new USP_45][random(4)];
            a.state.killValue = 208;
           }

          a.addItem(weapon);

          if (Math.random() < 0.5) {
           if (Math.random() < 0.5) a.addItem(new Money);
           if (Math.random() < 0.5) a.addItem(new Money);
           if (Math.random() < 0.5) a.addItem(new Money);
          }
 
          a.equipItem(0);
          a.state.targetId = a.id;
          a.state.aggressive = true;
          a.state.baseSpeed = 0.5;
          a.state.attack.attackSpeed = 2;
          a.state.runningSpeed = 3;
          a.wander(x + 5, y + 5);
          a.killTarget([a.id], true, true);
      }
  }, window, 10);

  const timeDisplay = document.querySelector("#mapTime p");
  const meridiemDisplay = document.querySelector("#mapTime small");

  window.globalTime = 360;

  $MAP.darkness = (globalTime < 1080) ? Math.max(20 - ((globalTime*5)*0.012),1):Math.min(((globalTime-1080)*5)*0.012,20);
   
  const dayCycleLoop = new LoopAnimation(function() {

    if (globalTime > 1130) {
      $MAP.lighting = true;
    } else if (globalTime > 180 && globalTime < 1130) {
      $MAP.lighting = false;
    }

    if (globalTime < 1080) {
      $MAP.darkness = ($MAP.darkness > 1) ? $MAP.darkness-0.012:1;
    } else if (globalTime > 1080) {
      $MAP.darkness = ($MAP.darkness < 20) ? $MAP.darkness+0.012:20;
    }
  }, window, 0.5);


  const timeUpdateLoop = new LoopAnimation(function() {
   globalTime++;

   let hour = Math.floor(globalTime/60), minute = globalTime - (Math.floor(globalTime/60)*60);

   if (hour > 23) globalTime = 0;

   timeDisplay.innerText = `${(hour || 12) - ((hour > 12) ? 12:0)}:${((minute <= 9) ? "0":"") + minute}`;
   meridiemDisplay.innerText = `${(globalTime <= 1440 && globalTime >= 720) ? "pm":"am"}`;

  }, window, 2.5);

 const spectatingLoop = new LoopAnimation(function() {
     requestTransition((function() {
      $CURRENT_MAP.move = true;
      let {x, y} = $CURRENT_MAP.GRAPH.getRandomPoint();
      let {centerX, centerY} = $CURRENT_MAP;
      $CURRENT_MAP.translate(x - centerX, y - centerY);
     }).bind(this));
 }, window, 5);

 const sitLoop = new LoopAnimation(function() {
    let id = Object.keys($CURRENT_MAP.avatars)[random($CURRENT_MAP.avatarCount)];
    let avatar = $CURRENT_MAP.avatars[id];   

    if (Math.random() < 0.5 && avatar && avatar !== $AVATAR && avatar !== $ACTIVE_DIALOGUE_PARTY) avatar.sit();
 }, window, 5);

 const crimeLoop = new LoopAnimation(function() {
    let attacker = $CURRENT_MAP.avatars[Object.keys($CURRENT_MAP.avatars)[random($CURRENT_MAP.avatarCount)]];
    let victim = $CURRENT_MAP.avatars[Object.keys($CURRENT_MAP.avatars)[random($CURRENT_MAP.avatarCount)]];

  if (attacker !== $AVATAR && attacker !== victim && attacker && !attacker.state.target.engaged && victim && Math.random() < 0.5 && attacker !== $ACTIVE_DIALOGUE_PARTY && victim !== $ACTIVE_DIALOGUE_PARTY) {
    attacker.state.hostile = true;
    attacker.killTarget([victim.id],true,(Math.random < 0.5) ? true:false);
  }
 }, window, 60);

  $MAP.lighting = false;
  $ACTIVE_DIALOGUE_PARTY = Object.values($CURRENT_MAP.avatars)[5];

  $GAME_LOOP = function() {
      //sitLoop.run();
     // crimeLoop.run();
      if ($SPECTATING) spectatingLoop.run();
      enemySpawnLoop.run();
      timeUpdateLoop.run();
      dayCycleLoop.run();
  };

  $AVATAR.addItem(new GP_K100);
  $AVATAR.addItem(new MedKit);
  $MAP.addSubMap(new _Map_(200, 300, false).init());
  
  $CURRENT_MAP = $MAP.SUB_MAPS[0];
  noclip = true; 
  
  function startGame() {
   $CURRENT_MAP.avatars[$AVATAR.id] = $AVATAR;
   $CURRENT_MAP.obstacles[$AVATAR.id] = $AVATAR;
   $CURRENT_MAP.noclip = false; 
  }

  let floor = new Floor(0, 0, 200, 300, 0);
  floor.exclude = true;
  $CURRENT_MAP.link(floor);

  let storeTrigger = new Trigger(-41, 32, function() {
   toggleStore();
  });
  storeTrigger.minDistance = 20;
  
  $CURRENT_MAP.parseLayoutScript('{"layout":[["Stopper",-4.968123754830524,-11.642147200153744,0],["Stopper",5.0068762451693445,-11.642147200153744,0],["Stopper",4.995840685507723,-17.435925800193658,0],["Stopper",-4.970729962474261,-17.48882950041893,0],["Stopper",-64.97338162174306,58.353239167880275,0],["Stopper",-54.998381621742546,58.353239167880275,0],["Stopper",-55.022188260092584,52.53772154738225,0],["Stopper",-64.99718826009315,52.46272154738226,0],["Stopper",54.96323087637594,58.396367018015525,0],["Stopper",64.9856055640258,58.328402661344484,0],["Stopper",54.970839110331006,52.39958741207259,0],["Stopper",64.94583911033098,52.39958741207259,0],["Stopper",-64.96070390198186,-81.62769596459114,0],["Stopper",-55.060703901981334,-81.6276959645912,0],["Stopper",-64.98215012526153,-87.517999801071,0],["Stopper",-55.00715012526107,-87.517999801071,0],["Stopper",54.96061981539591,-81.63124010692164,0],["Stopper",65.01061981539564,-81.63124010692164,0],["Stopper",54.96826133529199,-87.54303469073525,0],["Stopper",65.01826133529167,-87.54303469073525,0],["Stopper",-4.973104590093451,82.45807839879484,0],["Stopper",5.001895409906503,82.45807839879484,0],["Stopper",-5.011922069721644,-107.59234825456933,0],["Stopper",4.96307793027831,-107.59234825456933,0],["Stopper",-25.032974694338726,32.56046841759937,0],["Stopper",24.99202530566076,32.48546841759932,0],["Stopper",-25.01918094897855,-57.55363551846824,0],["Stopper",25.005819051020964,-57.55363551846824,0],["Stopper",75.02981819758477,-11.630013608901265,0],["Stopper",75.0079625300979,-17.546483815455233,0],["Stopper",-74.9987056800858,-11.626991951081038,0],["Stopper",-75.01187154085008,-17.553269159333226,0],["Stopper",39.940378465842606,-14.641126274398374,0],["Stopper",-40.08462153415735,-14.641126274398374,0],["UrbanFence",-76.13178126119027,164.26393170706342,0],["UrbanFence",76.11821873881132,164.26393170706342,0],["UrbanFenceVertical",102.21252223042413,150.28247264565337,0],["UrbanFenceVertical",102.21252223042413,121.93247264565358,0],["UrbanFenceVertical",102.21252223042413,93.80747264565372,0],["UrbanFenceVertical",102.21252223042413,65.53247264565415,0],["UrbanFenceVertical",102.21252223042413,37.332472645654335,0],["UrbanFenceVertical",102.21252223042413,9.057472645654723,0],["UrbanFenceVertical",102.21252223042413,-18.91752735434477,0],["UrbanFenceVertical",102.21252223042413,-47.26752735434559,0],["UrbanFenceVertical",102.21252223042413,-75.6175273543451,0],["UrbanFenceVertical",102.21252223042413,-103.96752735434568,0],["UrbanFenceVertical",102.21252223042413,-132.2425273543459,0],["UrbanFenceVertical",102.21252223042413,-152.26752735434548,0],["UrbanFence",76.23095612274983,-164.27592185565828,0],["UrbanFence",28.192870584778483,-164.24312406153143,0],["UrbanFence",-19.742789587000896,-164.30746388975155,0],["UrbanFence",-47.792789587001145,-164.30746388975155,0],["UrbanFence",-76.05712941522177,-164.31812406153136,0],["UrbanFenceVertical",-102.17701868186583,150.2642388085558,0],["UrbanFenceVertical",-102.14187885694474,121.95899276647052,0],["UrbanFenceVertical",-102.11152457619477,93.6663048667478,0],["UrbanFenceVertical",-102.17585370977582,65.35803048722364,0],["UrbanFenceVertical",-102.20464734651489,37.11561398900649,0],["UrbanFenceVertical",-102.17901582450713,8.795994190687079,0],["UrbanFenceVertical",-102.13892034222482,-19.497864882538863,0],["UrbanFenceVertical",-102.16198233564108,-47.68009800852906,0],["UrbanFenceVertical",-102.13793520444239,-75.90228436071399,0],["UrbanFenceVertical",-102.16243853158988,-104.2303331943106,0],["UrbanFenceVertical",-102.18981590761575,-124.83533117326901,0],["UrbanFenceVertical",-102.17493164306069,-152.22325082013128,0],["VisibleBarrier",-3.025606445059549,-184.38955501562629,250,60,[40,40,40,1]],["GunStore",-0.045680388151311035,147.13182684386135,0]],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":1,"children":[{"layout":[["Chair",-41.21913854872671,43.066218385561534,0],["Bot","Bobby [Store Clerk]",-41.21913854872671,44.066218385561335,180],["SmallTable",-41.42243482697396,30.289206785887103,0],["Laptop",-41.384652167540416,32.47737548989524,179.95445075348283],["Table",39.85619824951602,-9.256090450512133,0],["Table",-39.86880175048298,-9.182786580841835,0],["Table",0.044553865771767676,-9.451090450512197,0],["GLOCK_20",-49.16270744270445,-11.104079559872204,0],["GP_K100",-40.16270744270431,-11.029079559872216,0],["KC_357",-33.18770744270462,-11.404079559872187,0],["USP_45",-5.437719232032016,-10.50407595840828,-360.00005841965395],["NXR_44_MAG",-0.8627074427050165,-11.029079559872216,0],["FURS_55",6.937292557295278,-11.029079559872216,0],["CombatKnife",-0.2585728487757457,-2.6301288936519853,-89.53285307490205],["KitchenKnife",-40.292420818164764,-2.3428783687048735,269.86013818397777],["NOSS_7",33.35764334426089,-11.131669563537983,0],["X6_91",39.507643344261005,-10.906669563537989,0],["DX_9",47.90764334426088,-11.056669563537994,0],["AssassinsKnife",39.606478774349576,-2.9007748391813806,-90.3573288955767],["Table",-39.8380475984305,-34.35371761213173,0],["Table",0.016952401569199083,-34.384402023085386,0],["Table",39.84195240156928,-34.384402023085386,0],["MedKit",-46.330688002606415,-30.561653831551794,359.72319648805075],["Syringe",-46.3073759230603,-37.33770300083924,89.76875261265886],["AmmoBox",-46.24310331718781,-28.056635432225036,359.6935447347863],["MultiAmmoBox",-33.994778339008846,-30.123932930351657,-0.0047768384417725684],["RemoteExplosive",-10.862498874426068,-29.95810276177859,-359.66294535814086],["RemoteDetonator",-8.469191696144108,-37.72484597723701,269.81381348722124],["GreyBackpack",2.6971169851149623,-31.47638864641314,360.23373289320017],["WhiteBackpack",5.009965751377791,-31.425223782375326,-359.97793675455137],["BlackBackpack",7.323258668114738,-31.438831345841663,0.8049284082323425],["ProximityExplosive",-6.080515684631873,-29.980843553945803,360.29936320009006],["BasicArmour",30.920930405084505,-30.61824003659727,360.5257173608089],["SwatArmour",39.981230912170425,-30.647917268281148,0.25755168822556485],["MercenaryArmour",48.8688254850404,-30.603636806837855,359.8276684613199],["Floor",-5.081567451900897,56.60444481129717,200,100,1]],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]}]}');
  $MAP_DISPLAY.update();

  $CURRENT_MAP.SUB_MAPS[0].link(storeTrigger);
