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
      GLOCK_20
  } from "/public/scripts/objects.js";

  $AVATAR = new Avatar("R O B I N H O O D");
  $AVATAR.postLink();

  // Game setup and initialization

  $MAP = new _Map_(500, 500).init();
  //$MAP.parseLayoutScript(Map1);

  $CURRENT_MAP = $MAP;
  $MAP.showGeometry();
  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  $AVATAR.addItem(new GLOCK_20(0, 0, 0, 1000));
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  $MAP.link(new House1);
  $MAP.translate(100, 0);

  let id = genObjectId();

  let b = new Avatar("Keanu Reeves", 0, 0);
  $MAP.link(b);
  b.exclude = true;
  b.state.armor = 3000;
  b.state.aggressive = true;
  b.state.follow.settleDistance = 20;
  b.state.follow.run = true;
  b.addItem(new GLOCK_20(0, 0, 0, 1000));
  b.state.targetId = b.id;
  //b.follow($AVATAR.id);
  //b.killTarget([id], true);

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
  //c.killTarget([id], true);

  // $MAP.link(new VisibleBarrier(10,10,10,10));
  // console.log(b.findPathTo(-30,-30));
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
  for (let i = 1; i <= 40; i++) {
      let {
          x,
          y
      } = $MAP.GRAPH.getRandomPoint();
      let a = new Avatar(String(i), x, y);
      $MAP.link(a);
      a.state.attack.engageDistance = 300;
      a.state.attack.disengageDistance = 500;
      a.state.attack.attackSpeed = 1;
      a.state.armor = 0;
      a.state.aggressive = false;
      a.state.passive = false;
      a.state.targetUpdateAnimation.rate = 0.2;
      a.addItem(new GLOCK_20(0, 0, 0, 1000));
      a.state.fireAnimation.rate = 0.5 / 1;
      a.state.targetId = id;
      a.killTarget([b.id]);
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
