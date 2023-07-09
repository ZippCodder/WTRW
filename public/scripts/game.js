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
      USP_45
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
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  $MAP.parseLayoutScript("{\"layout\":[[\"Laptop\",-70.44492940891534,21.434542136728332,90.10953153857479],[\"Book1\",-69.65757385330261,9.752560082037604,168.39417698885597],[\"Book2\",-69.71945649079207,10.531227880029931,-137.8605089131566],[\"GLOCK_20\",-96.93609305045486,9.52489284788031,171.09587517926883],[\"USP_45\",-94.53249999394674,6.775366016753999,282.6563146631903],[\"UrbanFence\",-16.166106339261283,31.560644915055743,0]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":true,\"nodes\":0,\"children\":[]}");

  $MAP.translate(0, 0);

  let id = genObjectId();
/*
  let b = new Avatar("Keanu Reeves", 0, 50);
  //$MAP.link(b);
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
  $MAP.lighting = false;     */
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
