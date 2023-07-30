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
  $AVATAR.state.targetId = $AVATAR.id;
  $AVATAR.addItem(new GP_K100(0, 0, 0, 1000));
  $AVATAR.equipItem(0);
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  //$MAP.parseLayoutScript("{\"layout\":[[\"UrbanFence\",-16.166106339260274,31.5606449150552,0],[\"House1\",-195.57837280614882,112.60723741422726,0],[\"Text\",\"Abacrombie\",5,[0,0,0,1],-83.40972815963279,41.17754164195101,0,false],[\"Text\",\"<= Park\",5,[0,0,0,1],-35.17687296454001,87.6119316463358,0,false],[\"Text\",\"efjeifjiej\",30,[0,0,0,1],-13.47420046393578,31.12887156897994,0,false],[\"Chair\",-15.619140381875418,31.019264262988642,0],[\"Table\",-15.619140381875418,31.019264262988642,0],[\"VisibleBarrier\",32.84524316811838,47.36627707469563,5,60,[12,132,123]],[\"VisibleBarrier\",32.84524316811838,47.36627707469563,5,60,[12,132,123,1]],[\"VisibleBarrier\",21.429030080645482,1.0190305764656102,30,5,[172,102,12,1]],[\"VisibleBarrier\",8.458547303839062,66.93912826030626,30,5,[172,80,12,1]],[\"VisibleBarrier\",-1.8164140645356852,60.15912826030727,5,30,[122,231,142,1]],[\"PicnicTable\",68.46760718699892,96.28513345428084,0],[\"GLOCK_20\",-25.61912034795366,58.89857695029332,320],[\"Table\",-23.24157713504176,71.8810526174882,0],[\"GP_K100\",-54.704505624570956,63.467419897554024,272],[\"GP_K100\",-7.99999999999968,-40.999999999998785,72],[\"GP_K100\",22.00000000000066,27.999999999999424,216],[\"GP_K100\",-144.9999999999933,-157.99999999999224,47],[\"GP_K100\",13.999999999999453,-42.999999999998984,345],[\"GP_K100\",46.000000000003375,-4.00000000000027,299],[\"GP_K100\",-106.99999999999704,-2.0000000000003695,193],[\"GP_K100\",-146.99999999999324,0.9999999999998295,191],[\"GP_K100\",16.99999999999998,-8.000000000000071,34],[\"GP_K100\",28.00000000000059,-8.999999999999972,305],[\"GP_K100\",-150.9999999999925,7.999999999998877,95],[\"GP_K100\",-130.99999999999554,-2.0000000000003695,233],[\"GP_K100\",68.0000000000125,2.9999999999994174,63],[\"GP_K100\",-43.00000000000072,63.99999999999777,60],[\"GP_K100\",-77.99999999999885,-56.99999999999893,5],[\"GP_K100\",-102.66666666666438,-9.999999999999716,170],[\"GP_K100\",-27.00000000000042,-102.99999999999878,292],[\"GP_K100\",-39.00000000000088,55.99999999999783,87],[\"GP_K100\",-12.000000000000163,0.9999999999998295,337],[\"GP_K100\",-80.99999999999875,3.6666666666660888,139],[\"GP_K100\",-99.99999999999767,9.999999999998934,299],[\"GP_K100\",-76.9999999999986,-10.999999999999048,20],[\"GP_K100\",-68.99999999999818,-6.000000000000071,269],[\"GP_K100\",-95.99999999999747,40.999999999997954,135],[\"GP_K100\",-108.9999999999969,17.999999999998664,352],[\"GP_K100\",-92.99999999999784,65.99999999999777,356],[\"GP_K100\",-99.66666666666407,58.33333333333087,122],[\"GP_K100\",-169.3333333333258,23.66666666666557,67],[\"GP_K100\",-171.66666666665878,26.333333333332398,29],[\"GP_K100\",-157.99999999999227,5.9999999999992895,282],[\"GP_K100\",-166.99999999999227,3.9999999999994316,132],[\"UrbanFence\",-73.45171211783656,-2.55260159246788,0],[\"UrbanFenceVertical\",-48.11296216815082,15.927398407531541,0],[\"UrbanFenceVertical\",-47.37452880276568,73.1548626029811,0],[\"UrbanFence\",-73.58041093700116,84.536201783637,0],[\"UrbanFenceVertical\",-100.89719128798697,64.5079262299562,0],[\"StreetLight\",-71.68013014396627,53.74377111163043,0,null],[\"StreetLight\",-9.036236074662263,-9.313254543011396,0,null],[\"Text\",\"Do\",[255,0,0,1],[0,0,0,1],-30.80126105659241,-68.01960069078592,0,false],[\"Text\",\"Do\",10,[255,0,0,1],-30.80126105659241,-68.01960069078592,0,false],[\"Text\",\"You\",10,[0,0,255,1],-19.115177060144255,-67.41992950326173,0,false],[\"Text\",\"Remember\",10,[0,255,255,1],8.782042821911354,-67.41234736341335,0,false],[\"Text\",\"Now\",10,[0,255,0,1],33.509928247353834,-67.40223784361555,0,false]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":true,\"nodes\":3,\"children\":[{\"layout\":[[\"GLOCK_20\",39.488276047252825,45.52638214311427,-246.96549517830974],[\"StreetLight\",-26.639279762916114,36.09610062434252,0,null],[\"StreetLight\",52.453812065219765,30.130220253659925,0,null],[\"Table\",6.049283909013635,23.32313395113784,0],[\"Laptop\",13.475957357845552,20.7019292711352,-157.60566451974609],[\"Book1\",-4.7557821550269015,20.725845976825234,344.4132744958508],[\"Book2\",-4.565458225089971,22.210578521327534,38.28255072830086],[\"USP_45\",-12.86335275260198,42.89514890950308,-92.34812999765457]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":5},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]}]}"); 
  //$MAP.translate(0, 0);
  //$MAP.showGeometry();

  let id = genObjectId();

  $MAP.link(new Floor(0,0,50,50,textures.objects.tile));

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
/*
  for (let i = 1; i <= 30; i++) {
      let {
          x,
          y
      } = $MAP.GRAPH.getRandomPoint();

      let a = new Avatar(String(i), x + 5, y - 5);
      $MAP.link(a);
      a.state.attack.engageDistance = 300;
      a.state.attack.disengageDistance = 500;
      a.state.attack.attackSpeed = 1;
      a.state.armor = 0;
      //a.state.aggressive = true;
      a.state.passive = false;
      a.state.targetUpdateAnimation.rate = 1 / 5;
      a.addItem(new GP_K100(0, 0, 0, 1000));
      a.equipItem(0);
      a.state.targetId = id;
      a.killTarget([$AVATAR.id]);
  }
*/
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
