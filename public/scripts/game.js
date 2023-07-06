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
      Barrier
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
  $AVATAR.addItem(new GLOCK_20(0, 0, 0, 1000));
  $AVATAR.state.reloadTimeout.timingConfig[0] = 0.5/5;
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  $MAP.parseLayoutScript("{\"layout\":[[\"Chair\",0,0,0],[\"VisibleBarrier\",79.9999999999999,0,40,40,[40,40,40,1]],[\"StreetLight\",38.699203287709274,9.099536998574237,0,null],[\"Text\",\"Welcome to the Real World\",10,[0,0,0,1],4.7497554982911385,44.43014810018445,0,false],[\"Text\",\"Welcome to the Real World\",10,[245,255,143,null],-13.05642616168079,32.38006470468627,0,false],[\"Text\",\"Welcome to the Real World\",10,[245,255,143,1],-13.05642616168079,32.38006470468627,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,1],10.49190331470944,20.806837333513762,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0.2],4.386183578591963,26.39996300465254,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0.5],4.386183578591963,26.39996300465254,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0.8],-16.69993428424891,13.407557204725336,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0.7],-21.45378094867793,9.069093307020452,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0.6],-25.665320026436987,3.403705276014364,0,false],[\"Text\",\"Welcome to the Real World\",10,[142,132,234,0],45.916226092950126,68.13810304203076,0,false],[\"VisibleBarrier\",10.526514745252825,103.97031990556872,100,5,[123,243,243,1]],[\"VisibleBarrier\",8.973985986901349,156.5825185075051,100,5,[123,243,243,1]],[\"VisibleBarrier\",-40.76698125553952,130.09976739312194,5,50,[253,132,122,1]],[\"VisibleBarrier\",61.24942730437391,129.78593285254092,5,50,[253,132,122,1]],[\"VisibleBarrier\",30.353832763960874,141.80803493791035,5,25,[70,97,100,1]],[\"VisibleBarrier\",-2.6346265561068805,141.73880688004908,5,25,[70,97,100,1]],[\"VisibleBarrier\",17.088756698450865,115.22086715483533,5,25,[70,97,100,1]],[\"VisibleBarrier\",-8.653431234060164,129.22996967193512,120,25,[70,97,10,1]],[\"VisibleBarrier\",-36.352889837856566,83.28489772820262,5,25,[30,144,255,1]],[\"VisibleBarrier\",19.290552965365997,75.1684556748579,5,25,[30,144,200,1]],[\"VisibleBarrier\",6.413629060947004,87.80306993267037,5,25,[30,144,200,1]],[\"VisibleBarrier\",-5.360167098704551,48.03170382229456,5,25,[30,144,200,1]],[\"VisibleBarrier\",-27.594919371931383,44.92848956958822,5,25,[30,144,200,1]]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":true,\"nodes\":0,\"children\":[]}"); 

  $MAP.translate(0, 0);

  let id = genObjectId();

  let b = new Avatar("Keanu Reeves", 0, 50);
  $MAP.link(b);
  b.exclude = true;
  b.state.armor = 5000;
  b.state.aggressive = false;
  b.addItem(new GLOCK_20(0, 0, 0, 1000));
  b.state.targetId = b.id;
  b.state.baseSpeed = 1;
  b.state.reloadTimeout.timingConfig[0] = 0.5/5;
  b.state.targetUpdateAnimation.rate = 0.5/5;
  b.state.fireAnimation.rate = 0.5 / 10; 
  //b.follow($AVATAR.id);
  b.killTarget([$AVATAR.id], true);
  //b.translate(0,30);

  $MAP.darkness = 1;
  $MAP.lighting = false;
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
  $MAP.showGeometry();
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
      let {x,y} = $MAP.GRAPH.getRandomPoint();
      
      let a = new Avatar(String(i), x+5, y-5);
      $MAP.link(a);
      a.state.attack.engageDistance = 300;
      a.state.attack.disengageDistance = 500;
      a.state.attack.attackSpeed = 1;
      a.state.armor = 0;
      a.state.aggressive = false;
      a.state.passive = false;
      a.state.targetUpdateAnimation.rate = 1/5;
      a.addItem(new GLOCK_20(0, 0, 0, 1000));
      a.state.fireAnimation.rate = 0.5 / 1;
      a.state.targetId = id;
      a.killTarget([b.id]);
  } */

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
