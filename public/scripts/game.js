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

  $MAP = new _Map_(100, 100).init();
  //$MAP.parseLayoutScript(Map1);
  
  $CURRENT_MAP = $MAP;
  //$MAP.showGeometry();
  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  //$AVATAR.addItem(new GP_K100(0, 0, 0, 1000));
  //$AVATAR.equipItem(0);
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  //$MAP.parseLayoutScript("{\"layout\":[[\"UrbanFence\",-16.16610633926031,31.560644915054986,0],[\"House1\",-195.57837280614814,112.60723741422647,0],[\"Text\",\"Abacrombie\",5,[0,0,0,1],-83.4097281596319,41.177541641950754,0,false],[\"Text\",\"<= Park\",5,[0,0,0,1],-35.17687296453997,87.61193164633546,0,false],[\"Text\",\"efjeifjiej\",30,[0,0,0,1],-13.474200463935759,31.128871568979733,0,false],[\"Chair\",-15.619140381875454,31.019264262988443,0],[\"Table\",-15.619140381875454,31.019264262988443,0],[\"VisibleBarrier\",32.845243168118714,47.36627707469543,5,60,[12,132,123]],[\"VisibleBarrier\",32.845243168118714,47.36627707469543,5,60,[12,132,123,1]],[\"VisibleBarrier\",21.429030080645703,1.0190305764656529,30,5,[172,102,12,1]],[\"VisibleBarrier\",8.458547303839083,66.93912826030606,30,5,[172,80,12,1]],[\"VisibleBarrier\",-1.8164140645356497,60.1591282603069,5,30,[122,231,142,1]],[\"PicnicTable\",68.46760718699852,96.28513345428031,0],[\"GLOCK_20\",-25.619120347953654,58.89857695029299,320],[\"Table\",-23.241577135041766,71.88105261748794,0],[\"GP_K100\",-54.704505624570764,63.467419897553626,272],[\"GP_K100\",-7.999999999999645,-40.99999999999932,72],[\"GP_K100\",22.00000000000088,27.999999999999275,216],[\"GP_K100\",-144.9999999999926,-157.99999999999181,47],[\"GP_K100\",13.999999999999588,-42.99999999999953,345],[\"GP_K100\",46.0000000000033,-4.00000000000038,299],[\"GP_K100\",-106.99999999999604,-2.0000000000003944,193],[\"GP_K100\",-146.99999999999255,0.9999999999998721,191],[\"GP_K100\",17.000000000000185,-8.000000000000437,34],[\"GP_K100\",28.00000000000091,-9.000000000000352,305],[\"GP_K100\",-150.99999999999181,7.999999999998913,95],[\"GP_K100\",-130.9999999999947,-2.0000000000003944,233],[\"GP_K100\",68.00000000001208,2.9999999999994458,63],[\"GP_K100\",-43.00000000000061,63.999999999997385,60],[\"GP_K100\",-77.99999999999812,-56.99999999999942,5],[\"GP_K100\",-102.66666666666335,-10.000000000000082,170],[\"GP_K100\",-27.000000000000384,-102.99999999999879,292],[\"GP_K100\",-39.00000000000081,55.999999999997584,87],[\"GP_K100\",-12.000000000000142,0.9999999999998721,337],[\"GP_K100\",-80.9999999999979,3.6666666666661207,139],[\"GP_K100\",-99.9999999999966,9.999999999998956,299],[\"GP_K100\",-76.99999999999797,-10.999999999999385,20],[\"GP_K100\",-68.99999999999773,-6.0000000000003375,269],[\"GP_K100\",-95.99999999999639,40.999999999997684,135],[\"GP_K100\",-108.99999999999588,17.999999999998682,352],[\"GP_K100\",-92.99999999999673,65.99999999999751,356],[\"GP_K100\",-99.666666666663,58.33333333333057,122],[\"GP_K100\",-169.33333333332516,23.66666666666557,67],[\"GP_K100\",-171.6666666666581,26.333333333332316,29],[\"GP_K100\",-157.99999999999167,5.999999999999293,282],[\"GP_K100\",-166.99999999999164,3.9999999999994706,132],[\"UrbanFence\",-73.45171211783608,-2.552601592467905,0],[\"UrbanFenceVertical\",-48.11296216815065,15.927398407531527,0],[\"UrbanFenceVertical\",-47.37452880276552,73.15486260298083,0],[\"UrbanFence\",-73.58041093700069,84.53620178363668,0],[\"UrbanFenceVertical\",-100.89719128798592,64.50792622995586,0],[\"StreetLight\",-71.68013014396578,53.743771111630224,0,null],[\"StreetLight\",-9.036236074662241,-9.313254543011762,0,null],[\"Text\",\"Do\",[255,0,0,1],[0,0,0,1],-30.80126105659241,-68.01960069078619,0,false],[\"Text\",\"Do\",10,[255,0,0,1],-30.80126105659241,-68.01960069078619,0,false],[\"Text\",\"You\",10,[0,0,255,1],-19.115177060144248,-67.41992950326203,0,false],[\"Text\",\"Remember\",10,[0,255,255,1],8.78204282191139,-67.41234736341364,0,false],[\"Text\",\"Now\",10,[0,255,0,1],33.509928247354,-67.40223784361585,0,false],[\"Floor\",-74.1734109404832,42.323771111630236,60,80,0]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":true,\"nodes\":3,\"children\":[{\"layout\":[[\"GLOCK_20\",39.488276047252995,45.52638214311445,-246.96549517830974],[\"StreetLight\",-26.639279762915923,36.096100624342704,0,null],[\"StreetLight\",52.45381206521982,30.130220253659786,0,null],[\"Table\",6.049283909013738,23.323133951137798,0],[\"Laptop\",13.475957357845683,20.701929271135164,-157.60566451974609],[\"Book1\",-4.755782155026874,20.725845976825198,344.4132744958508],[\"Book2\",-4.565458225089954,22.21057852132749,38.28255072830086],[\"USP_45\",-12.863352752601836,42.89514890950326,-92.34812999765457]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]}]}");



  $MAP.link(new Table(-50,0));
  $MAP.link(new Table(0,0));

  //$MAP.darkness = 1;
  //$MAP.lighting = false; 
  $MAP.showGeometry();
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
 
  for (let i = 1; i <= 1; i++) {
      let {
          x,
          y
      } = $MAP.GRAPH.getRandomPoint();

      a = new Avatar(String(i), x + 5, y - 5);
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
      a.follow($AVATAR.id);
      //a.killTarget([$AVATAR.id]);
  }

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
