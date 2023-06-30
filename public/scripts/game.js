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
      DownwardLight
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
  $AVATAR.state.fireAnimation.rate = 0.5 / 1;

  $MAP.parseLayoutScript("{\"layout\":[[\"House1\",0,0,0],[\"VisibleBarrier\",104.65972963347882,-4.629227292965737,30,30,[40,40,40,1]],[\"VisibleBarrier\",140.06546406950736,-66.48993304449547,30,30,[40,40,40,1]],[\"VisibleBarrier\",57.737212799645235,-137.80435610930397,30,30,[40,40,40,1]],[\"VisibleBarrier\",30.49889339597364,-92.3256223462499,30,30,[40,40,40,1]],[\"VisibleBarrier\",-70.13124774710568,-113.50482610897862,30,30,[40,40,40,1]],[\"VisibleBarrier\",-113.09985395136405,-63.48763711222286,30,30,[40,40,40,1]],[\"VisibleBarrier\",-139.07056946845407,-5.954409103396202,30,30,[40,40,40,1]],[\"VisibleBarrier\",-189.36861485003985,-65.97027694088032,30,30,[40,40,40,1]],[\"VisibleBarrier\",-18.393362390918725,-125.10420429600444,10,60,[40,40,40,1]],[\"VisibleBarrier\",-140.29049302814244,-145.62316880873908,10,60,[40,40,40,1]],[\"VisibleBarrier\",-175.49736906626873,-164.04558087378211,10,60,[40,40,40,1]],[\"VisibleBarrier\",94.10964351202755,-86.18373034044853,10,60,[40,40,40,1]],[\"VisibleBarrier\",158.44832504201412,32.04931320622346,10,60,[40,40,40,1]],[\"VisibleBarrier\",-151.10446535862133,-50.98076214780916,10,10,[40,40,40,1]],[\"VisibleBarrier\",-151.3391964427513,-91.55277110288282,10,10,[40,40,40,1]],[\"VisibleBarrier\",-182.39188487435814,-107.48221185761662,10,10,[40,40,40,1]],[\"VisibleBarrier\",-160.9511412308674,-120.75626540607927,10,10,[40,40,40,1]],[\"VisibleBarrier\",-115.64006249676648,-110.30281297693527,10,10,[40,40,40,1]],[\"VisibleBarrier\",-176.85053332252406,-33.53877788652507,10,10,[40,40,40,1]],[\"VisibleBarrier\",-100.2307103569419,-20.43271506124293,10,10,[40,40,40,1]],[\"VisibleBarrier\",-68.75748396403222,-75.90693343809664,10,10,[40,40,40,1]],[\"VisibleBarrier\",-93.39099519149228,-159.86101934773072,10,10,[40,40,40,1]],[\"VisibleBarrier\",12.651929735963648,-133.37110246053646,10,10,[40,40,40,1]],[\"VisibleBarrier\",66.51198185805235,-91.08163692091655,10,10,[40,40,40,1]],[\"VisibleBarrier\",142.3324992341639,-30.36612722154669,10,10,[40,40,40,1]],[\"StreetLight\",106.57927241621671,54.001223700790106,0,null],[\"StreetLight\",77.67863792028076,-79.26416062133629,0,null],[\"StreetLight\",-33.45092595319815,-48.52335096295401,0,null],[\"StreetLight\",-89.24068040908452,20.324730916273083,0,null],[\"StreetLight\",-91.91652804583156,104.38185423757541,0,null],[\"StreetLight\",34.370489967855534,131.0005146031299,0,null]],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":true,\"darkness\":10},\"root\":true,\"nodes\":3,\"children\":[{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]},{\"layout\":[],\"settings\":{\"groundColor\":[255,255,255,1],\"lighting\":false,\"darkness\":1},\"root\":false,\"nodes\":0,\"children\":[]}]}");
  $MAP.translate(100, 0);

  let id = genObjectId();

  let b = new Avatar("Keanu Reeves", 0, 50);
  $MAP.link(b);
  b.exclude = true;
  b.state.armor = 5000;
  b.state.aggressive = false;
  b.addItem(new GLOCK_20(0, 0, 0, 1000));
  b.state.targetId = b.id;
  b.state.baseSpeed = 3;
  b.state.reloadTimeout.timingConfig[0] = 0.5/5;
  b.state.targetUpdateAnimation.rate = 0.5/5;
  b.state.fireAnimation.rate = 0.5 / 10; 
  //b.follow($AVATAR.id);
  b.killTarget([id], true);

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

  for (let i = 1; i <= 40; i++) {
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
      a.killTarget([$AVATAR.id]);
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
