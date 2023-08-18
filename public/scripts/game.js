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
  } from "/public/scripts/lib.js";

  import {
      Map1,
      Map2
  } from "/public/scripts/maps.js";

  import {
      _Map_,
      Avatar,
      House1,
      UrbanFence,
      UrbanFenceHalf,
      UrbanFenceVertical,
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
      Book1,
      Book2,
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
      Floor
  } from "/public/scripts/objects.js";

  $AVATAR = new Avatar("R O B I N H O O D");
  $AVATAR.postLink();

  // Game setup and initialization

  $MAP = new _Map_(500, 500).init();
  //$MAP.parseLayoutScript(Map1);

  $CURRENT_MAP = $MAP;
  //$MAP.showGeometry();
  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $MAP.obstacles[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  //$AVATAR.addItem(new GP_K100(0, 0, 0, 1000));
  //$AVATAR.equipItem(0);
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  $MAP.parseLayoutScript("{\"layout\":[[\"UrbanFence\",-16.16610633925979,31.560644915054848,0],[\"House1\",-195.57837280614586,112.60723741422827,0],[\"Text\",\"Abacrombie\",5,[0,0,0,1],-83.40972815963225,41.17754164195111,0,false],[\"Text\",\"<= Park\",5,[0,0,0,1],-35.17687296453943,87.61193164633653,0,false],[\"Text\",\"efjeifjiej\",30,[0,0,0,1],-13.474200463935283,31.12887156897963,0,false],[\"Chair\",-15.619140381875006,31.019264262988305,0],[\"Table\",-15.619140381875006,31.019264262988305,0],[\"VisibleBarrier\",32.845243168118486,47.3662770746958,5,60,[12,132,123]],[\"VisibleBarrier\",32.845243168118486,47.3662770746958,5,60,[12,132,123,1]],[\"VisibleBarrier\",21.42903008064576,1.0190305764656422,30,5,[172,102,12,1]],[\"VisibleBarrier\",8.458547303838287,66.93912826030756,30,5,[172,80,12,1]],[\"VisibleBarrier\",-1.816414064535401,60.15912826030872,5,30,[122,231,142,1]],[\"PicnicTable\",68.46760718699902,96.28513345428155,0],[\"GLOCK_20\",-25.619120347952894,58.89857695029464,320],[\"Table\",-23.241577135040977,71.88105261748919,0],[\"GP_K100\",-54.7045056245703,63.46741989755523,272],[\"GP_K100\",-7.999999999999353,-40.99999999999869,72],[\"GP_K100\",22.000000000000796,27.99999999999898,216],[\"GP_K100\",-144.999999999993,-157.99999999999133,47],[\"GP_K100\",13.99999999999929,-42.99999999999912,345],[\"GP_K100\",46.000000000002586,-4.000000000000249,299],[\"GP_K100\",-106.99999999999636,-2.0000000000002522,193],[\"GP_K100\",-146.99999999999304,0.9999999999998614,191],[\"GP_K100\",17.00000000000003,-8.000000000000103,34],[\"GP_K100\",28.000000000000654,-9.000000000000028,305],[\"GP_K100\",-150.99999999999227,7.999999999998872,95],[\"GP_K100\",-130.99999999999528,-2.0000000000002522,233],[\"GP_K100\",68.00000000001245,2.9999999999993783,63],[\"GP_K100\",-43.000000000000114,63.99999999999895,60],[\"GP_K100\",-77.99999999999802,-56.999999999999076,5],[\"GP_K100\",-102.66666666666362,-9.999999999999709,170],[\"GP_K100\",-26.999999999999826,-102.9999999999981,292],[\"GP_K100\",-39.00000000000021,55.99999999999913,87],[\"GP_K100\",-11.999999999999723,0.9999999999998614,337],[\"GP_K100\",-80.99999999999808,3.6666666666660106,139],[\"GP_K100\",-99.99999999999667,9.999999999998922,299],[\"GP_K100\",-76.99999999999791,-10.999999999998838,20],[\"GP_K100\",-68.99999999999751,-6.000000000000114,269],[\"GP_K100\",-95.99999999999658,40.99999999999807,135],[\"GP_K100\",-108.99999999999613,17.999999999998597,352],[\"GP_K100\",-92.9999999999973,65.99999999999902,356],[\"GP_K100\",-99.66666666666313,58.33333333333226,122],[\"GP_K100\",-169.33333333332595,23.666666666665314,67],[\"GP_K100\",-171.6666666666588,26.333333333332,29],[\"GP_K100\",-157.99999999999227,5.999999999999236,282],[\"GP_K100\",-166.99999999999255,3.9999999999993143,132],[\"UrbanFence\",-73.45171211783592,-2.552601592467795,0],[\"UrbanFenceVertical\",-48.11296216815024,15.9273984075315,0],[\"UrbanFenceVertical\",-47.374528802765155,73.15486260298219,0],[\"UrbanFence\",-73.58041093700051,84.53620178363812,0],[\"UrbanFenceVertical\",-100.89719128798615,64.50792622995749,0],[\"StreetLight\",-71.68013014396567,53.743771111631546,0,null],[\"StreetLight\",-9.036236074661879,-9.31325454301135,0,null],[\"Text\",\"Do\",[255,0,0,1],[0,0,0,1],-30.801261056592185,-68.01960069078622,0,false],[\"Text\",\"Do\",10,[255,0,0,1],-30.801261056592185,-68.01960069078622,0,false],[\"Text\",\"You\",10,[0,0,255,1],-19.115177060143715,-67.41992950326208,0,false],[\"Text\",\"Remember\",10,[0,255,255,1],8.782042821910593,-67.4123473634137,0,false],[\"Text\",\"Now\",10,[0,255,0,1],33.50992824735383,-67.40223784361591,0,false],[\"Floor\",-74.17341094048307,42.32377111163059,60,80,0],[\"Avatar\",\"ENEMY [KILL BOT]\",-55.66666666666667,45.66666666666662,174.38198328510887],[\"VisibleBarrier\",-60.818572477834515,-53.21820996056938,30,40,[230,12,141,1]],[\"VisibleBarrier\",0.7396572285850525,-78.04967089780682,50,50,[20,122,241,1]],[\"VisibleBarrier\",-133.76074046885964,-18.435263895105752,30,20,[231,212,41,1]],[\"VisibleBarrier\",-178.2612113382628,-54.95983807329104,30,20,[231,212,41,1]],[\"VisibleBarrier\",-118.28256984404871,-53.29386630786938,20,20,[102,21,241,1]],[\"VisibleBarrier\",-156.251397495433,39.694035412080964,70,20,[102,21,241,1]],[\"VisibleBarrier\",-198.1834523794659,0.030168034528486487,40,40,[102,231,41,1]],[\"VisibleBarrier\",106.24495700670829,58.23185728439182,60,10,[102,231,41,1]],[\"VisibleBarrier\",74.0532962448604,14.905349670332184,60,10,[202,31,41,1]],[\"VisibleBarrier\",70.97070848177609,-35.81475568588739,60,10,[202,31,241,1]]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":true,\"nodes\":3,\"children\":[{\"layout\":[[\"GLOCK_20\",39.488276047252995,45.52638214311445,-246.96549517830974],[\"StreetLight\",-26.639279762915923,36.096100624342704,0,null],[\"StreetLight\",52.45381206521982,30.130220253659786,0,null],[\"Table\",6.049283909013738,23.323133951137798,0],[\"Laptop\",13.475957357845683,20.701929271135164,-157.60566451974609],[\"Book1\",-4.755782155026874,20.725845976825198,344.4132744958508],[\"Book2\",-4.565458225089954,22.21057852132749,38.28255072830086],[\"USP_45\",-12.863352752601836,42.89514890950326,-92.34812999765457],[\"GLOCK_20\",0,0,284],[\"GLOCK_20\",0,0,290],[\"GLOCK_20\",0,0,184],[\"GLOCK_20\",0,0,93],[\"GLOCK_20\",0,0,13],[\"GLOCK_20\",0,0,195],[\"GLOCK_20\",0,0,256],[\"GLOCK_20\",0,0,16],[\"GLOCK_20\",0,0,357],[\"GLOCK_20\",0,0,266],[\"GLOCK_20\",0,0,106],[\"GLOCK_20\",0,0,263],[\"GLOCK_20\",0,0,345],[\"GLOCK_20\",0,0,214],[\"GLOCK_20\",0,0,220],[\"GLOCK_20\",0,0,4],[\"GLOCK_20\",0,0,262],[\"GLOCK_20\",0,0,80],[\"GLOCK_20\",0,0,312],[\"GLOCK_20\",0,0,44],[\"GLOCK_20\",0,0,200],[\"GLOCK_20\",0,0,296],[\"GLOCK_20\",0,0,299],[\"GLOCK_20\",0,0,213],[\"GLOCK_20\",0,0,63],[\"GLOCK_20\",0,0,189],[\"GLOCK_20\",0,0,263],[\"GLOCK_20\",0,0,92],[\"GLOCK_20\",0,0,177],[\"GLOCK_20\",0,0,350]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]}]}");

  // $MAP.link(new Table(-50,0));
  // $MAP.link(new Table(0,0));

  //$MAP.darkness = 1;
  //$MAP.lighting = false; 

  //$MAP.showGeometry();
  let id = genObjectId();
  //$MAP.link(new Floor(0,0,80,40,0));
  //$MAP.showGeometry();
  /*
    let b = new Avatar("Keanu Reeves", 0, 50);
    $MAP.link(b);
    b.exclude = true;
    b.state.armor = 5000;
    b.state.aggressive = false;
    b.addItem(new GP_K100(0, 0, 0, 1000));
    b.equipItem(0);
    b.state.targetId = b.id;
    b.state.baseSpeed = 2;
    b.state.reloadTimeout.timingConfig[0] = 0.5 / 5;
    b.state.targetUpdateAnimation.rate = 0.5 / 5;
    b.state.openCarry = true;
    //b.state.fireAnimation.rate = 0.5 / 10;
    //b.killTarget([$AVATAR.id], true, true);
    b.translate(0, 30);
   */
  //$MAP.link(new Table(0,0));
  //$MAP.lighting = true;
  //$MAP.darkness = 10;
  /* 
   let c = new Avatar("Beatrice", 5, 5);
   $MAP.link(c);
   c.state.armor = 3000;
   c.state.aggressive = false;
   c.state.follow.settleDistance = 20;
   c.state.follow.rush = true;
   c.addItem(new GLOCK_20(0, 0, 0, 1000));
   c.state.targetId = b.id;
   c.follow($AVATAR.id);
   //c.killTarget([id], true);

   let d = new Avatar("Walter", 5, 5);
   $MAP.link(d);
   d.state.armor = 3000;
   d.state.aggressive = false;
   d.state.follow.settleDistance = 20;
   d.state.follow.rush = true;
   d.addItem(new GLOCK_20(0, 0, 0, 1000));
   d.state.targetId = b.id;
   d.follow($AVATAR.id);
   //c.killTarget([id], true);

   let e = new Avatar("Hammy Onion", 5, 5);
   $MAP.link(e);
   e.state.armor = 3000;
   e.state.aggressive = false;
   e.state.follow.settleDistance = 20;
   e.state.follow.rush = true;
   e.addItem(new GLOCK_20(0, 0, 0, 1000));
   e.state.targetId = b.id;
   e.follow($AVATAR.id);
   //c.killTarget([id], true); */

  //$MAP.link(new VisibleBarrier(0,0,40,40));
  //$MAP.link(new VisibleBarrier(-80,0,40,40));
  //$MAP.link(new VisibleBarrier(80,0,40,40));
  //$MAP.link(new VisibleBarrier(0,0,40,40));
  // $MAP.link(new VisibleBarrier(-80,0,40,40));
  //$MAP.link(new Chair(0,0));
  //$MAP.link(new VisibleBarrier(80,0,40,40));
  /*
      let c = new Avatar("Trinity", -20, 0);
      $MAP.link(c);
      c.state.attack.attackSpeed = 2;
      c.state.armor = 5000;
      c.state.aggressive = true;
      c.addItem(new GLOCK_20(0, 0, 0, 1000));
      c.state.fireAnimation.rate = 0.5 / 10;
      c.state.targetUpdateAnimation.rate = 1/5; 
      c.state.targetId = c.id;
      c.killTarget([id],true); */
  let a;

  const enemySpawnLoop = new LoopAnimation(function() {
      if ($MAP.avatarCount < 5) {
          let {
              x,
              y
          } = $MAP.GRAPH.getRandomPoint();

          a = new Avatar("ENEMY [KILL BOT]", x + 5, y - 5);
          $MAP.link(a);
          a.state.attack.engageDistance = 300;
          a.state.attack.disengageDistance = 500;
          a.state.attack.attackSpeed = 1;
          a.state.armor = 0;
          //a.state.aggressive = true;
          a.state.passive = false;
          a.state.openCarry = true;
          a.state.targetUpdateAnimation.rate = 1 / 5;
          a.addItem(new GP_K100(0, 0, 0, 1000));
          a.equipItem(0);
          a.state.targetId = id;
          //a.follow($AVATAR.id);
          a.killTarget([$AVATAR.id]);
      }
  }, window, 5);

  // $AVATAR.state.invinsible = true; 

  $GAME_LOOP = function() {
      enemySpawnLoop.run();
  };

  // Developer console

  let consoleActive = false;
  let log = document.querySelector("textarea");

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