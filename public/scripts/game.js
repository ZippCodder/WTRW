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
      Floor
  } from "/public/scripts/objects.js";

  $AVATAR = new Avatar("R O B I N H O O D");
  $AVATAR.postLink();

  const firstNames = ["Dave", "Richee", "Brenda", "Stacy", "Skylar", "Malcom", "Steven", "Brandon", "Halee", "Kaylee", "Peter", "Kate", "Hannah", "Joy", "Lenny", "Leon", "Teddy", "Amanda", "Pablo"];
  const lastNames = ["Davidson", "Jackson", "Olvedo", "Cabello", "Kabrick", "Rich", "Dotson", "Latins", "Emmit", "James", "Havana", "York", "Ross", "Jean", "Masons", "Umada", "Gerannd"];

  function getName() {
    return `${firstNames[random(firstNames.length)]} ${lastNames[random(lastNames.length)]}`;
  }

  // Game setup and initialization

  $MAP = new _Map_(500, 500, true, "Downtown SmallVille").init();
  //$MAP.parseLayoutScript(Map1);
  
  $CURRENT_MAP = $MAP;
  //$MAP.showGeometry();
  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $MAP.obstacles[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  $AVATAR.addItem(new GP_K100(0, 0, 0, 1000));
  $AVATAR.equipItem(0);
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  //$MAP.parseLayoutScript('{"layout":[["UrbanFence",-16.166106339259798,31.560644915054837,0],["House1",-195.57837280614572,112.60723741422862,0],["Text","Abacrombie",5,[0,0,0,1],-83.40972815963217,41.17754164195108,0,false],["Text","<= Park",5,[0,0,0,1],-35.17687296453943,87.6119316463369,0,false],["Text","efjeifjiej",30,[0,0,0,1],-13.47420046393529,31.128871568979605,0,false],["Chair",-15.619140381875013,31.019264262988287,0],["Table",-15.619140381875013,31.019264262988287,0],["VisibleBarrier",32.84524316811842,47.366277074695745,5,60,[12,132,123]],["VisibleBarrier",32.84524316811842,47.366277074695745,5,60,[12,132,123,1]],["VisibleBarrier",21.42903008064578,1.0190305764656387,30,5,[172,102,12,1]],["VisibleBarrier",8.458547303838287,66.93912826030765,30,5,[172,80,12,1]],["VisibleBarrier",-1.816414064535394,60.15912826030876,5,30,[122,231,142,1]],["PicnicTable",68.467607186999,96.28513345428192,0],["GLOCK_20",-25.619120347952865,58.89857695029468,320],["Table",-23.24157713504096,71.8810526174893,0],["GP_K100",-54.704505624570324,63.46741989755532,272],["GP_K100",-7.999999999999346,-40.9999999999986,72],["GP_K100",22.000000000000817,27.999999999998977,216],["GP_K100",-144.9999999999931,-157.9999999999913,47],["GP_K100",13.999999999999304,-42.99999999999903,345],["GP_K100",46.00000000000248,-4.000000000000227,299],["GP_K100",-106.99999999999639,-2.0000000000002274,193],["GP_K100",-146.99999999999312,0.9999999999998579,191],["GP_K100",17.000000000000057,-8.000000000000028,34],["GP_K100",28.00000000000069,-8.999999999999943,305],["GP_K100",-150.99999999999235,7.9999999999988916,95],["GP_K100",-130.9999999999953,-2.0000000000002274,233],["GP_K100",68.00000000001242,2.9999999999993747,63],["GP_K100",-43.000000000000114,63.999999999999034,60],["GP_K100",-77.99999999999795,-56.99999999999899,5],["GP_K100",-102.66666666666364,-9.99999999999963,170],["GP_K100",-26.999999999999808,-102.99999999999801,292],["GP_K100",-39.0000000000002,55.99999999999912,87],["GP_K100",-11.99999999999973,0.9999999999998579,337],["GP_K100",-80.99999999999798,3.666666666666032,139],["GP_K100",-99.99999999999673,9.99999999999892,299],["GP_K100",-76.99999999999785,-10.99999999999875,20],["GP_K100",-68.99999999999753,-6.000000000000057,269],["GP_K100",-95.99999999999656,40.99999999999804,135],["GP_K100",-108.99999999999616,17.999999999998607,352],["GP_K100",-92.99999999999724,65.99999999999912,356],["GP_K100",-99.66666666666319,58.33333333333229,122],["GP_K100",-169.33333333332584,23.66666666666532,67],["GP_K100",-171.6666666666587,26.333333333332007,29],["GP_K100",-157.99999999999233,5.999999999999233,282],["GP_K100",-166.99999999999238,3.9999999999993463,132],["UrbanFence",-73.45171211783591,-2.5526015924677665,0],["UrbanFenceVertical",-48.11296216815025,15.927398407531484,0],["UrbanFenceVertical",-47.37452880276516,73.15486260298235,0],["UrbanFence",-73.58041093700048,84.53620178363846,0],["UrbanFenceVertical",-100.8971912879862,64.50792622995758,0],["StreetLight",-71.68013014396567,53.7437711116315,0,null],["StreetLight",-9.036236074661879,-9.313254543011283,0,null],["Text","Do",[255,0,0,1],[0,0,0,1],-30.801261056592182,-68.01960069078612,0,false],["Text","Do",10,[255,0,0,1],-30.801261056592182,-68.01960069078612,0,false],["Text","You",10,[0,0,255,1],-19.115177060143715,-67.41992950326198,0,false],["Text","Remember",10,[0,255,255,1],8.782042821910593,-67.4123473634136,0,false],["Text","Now",10,[0,255,0,1],33.509928247353734,-67.40223784361581,0,false],["Floor",-74.17341094048302,42.32377111163055,60,80,0],["Bot","ENEMY [KILL BOT]",-55.666666666666686,45.66666666666657,174.38198328510887],["VisibleBarrier",-60.818572477834536,-53.2182099605693,30,40,[230,12,141,1]],["VisibleBarrier",0.7396572285850596,-78.04967089780673,50,50,[20,122,241,1]],["VisibleBarrier",-133.76074046885964,-18.435263895105635,30,20,[231,212,41,1]],["VisibleBarrier",-178.26121133826265,-54.959838073290946,30,20,[231,212,41,1]],["VisibleBarrier",-118.28256984404874,-53.29386630786929,20,20,[102,21,241,1]],["VisibleBarrier",-156.25139749543305,39.69403541208095,70,20,[102,21,241,1]],["VisibleBarrier",-198.18345237946576,0.030168034528486487,40,40,[102,231,41,1]],["VisibleBarrier",106.24495700670846,58.23185728439185,60,10,[102,231,41,1]],["VisibleBarrier",74.05329624486038,14.905349670332185,60,10,[202,31,41,1]],["VisibleBarrier",70.97070848177606,-35.81475568588729,60,10,[202,31,241,1]],["Bot","Neo",20.000000000000007,-29.999999999999872,0],["AssassinsKnife",39.99999999999991,0,36],["Bot","Neo",20,-30,0],["AssassinsKnife",40,0,0]],"settings":{"groundColor":[255,255,255,1],"lighting":true,"darkness":5},"root":true,"nodes":3,"children":[{"layout":[["GLOCK_20",39.488276047252995,45.52638214311445,-246.96549517830974],["StreetLight",-26.639279762915923,36.096100624342704,0,null],["StreetLight",52.45381206521982,30.130220253659786,0,null],["Table",6.049283909013738,23.323133951137798,0],["Laptop",13.475957357845683,20.701929271135164,-157.60566451974609],["BlackBook",-4.755782155026874,20.725845976825198,344.4132744958508],["WhiteBook",-4.565458225089954,22.21057852132749,38.28255072830086],["USP_45",-12.863352752601836,42.89514890950326,-92.34812999765457],["GLOCK_20",0,0,284],["GLOCK_20",0,0,290],["GLOCK_20",0,0,184],["GLOCK_20",0,0,93],["GLOCK_20",0,0,13],["GLOCK_20",0,0,195],["GLOCK_20",0,0,256],["GLOCK_20",0,0,16],["GLOCK_20",0,0,357],["GLOCK_20",0,0,266],["GLOCK_20",0,0,106],["GLOCK_20",0,0,263],["GLOCK_20",0,0,345],["GLOCK_20",0,0,214],["GLOCK_20",0,0,220],["GLOCK_20",0,0,4],["GLOCK_20",0,0,262],["GLOCK_20",0,0,80],["GLOCK_20",0,0,312],["GLOCK_20",0,0,44],["GLOCK_20",0,0,200],["GLOCK_20",0,0,296],["GLOCK_20",0,0,299],["GLOCK_20",0,0,213],["GLOCK_20",0,0,63],["GLOCK_20",0,0,189],["GLOCK_20",0,0,263],["GLOCK_20",0,0,92],["GLOCK_20",0,0,177],["GLOCK_20",0,0,350]],"settings":{"groundColor":[255,255,255,1],"lighting":true,"darkness":5},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":true,"darkness":5},"root":false,"nodes":0,"children":[]},{"layout":[],"settings":{"groundColor":[255,255,255,1],"lighting":false,"darkness":1},"root":false,"nodes":0,"children":[]}]}');

 // $MAP.link(new Table(-50,0));
 // $MAP.link(new Table(0,0));

  //$MAP.darkness = 1;
  //$MAP.lighting = false; 

  let id = genObjectId();
  //$MAP.link(new Floor(0,0,80,40,0));
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
 // $MAP.link(new Table(0,0));
 // $MAP.link(new StreetLight(50,0));
  //$MAP.lighting = true;
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
   c.killTarget([id], true); */

  //$MAP.link(new VisibleBarrier(0,0,40,40));
  //$MAP.link(new VisibleBarrier(-80,0,40,40));
  //$MAP.link(new VisibleBarrier(80,0,40,40));
  //$MAP.link(new VisibleBarrier(0,0,40,40));
  // $MAP.link(new VisibleBarrier(-80,0,40,40));
  //$MAP.link(new Chair(0,0));
  //$MAP.link(new VisibleBarrier(80,0,40,40));
  
      let c = new Bot("Trinity", -240+5, -240+5), b = new Bot("Neo", 20, -30);
  //    $MAP.link(c);

      c.state.armour = 500;
      //c.state.aggressive = true;
    //  c.addItem(new GLOCK_20(0,0,0,1000));
    //  c.equipItem(0);
  //    c.state.targetUpdateAnimation.rate = 1/5; 
  //    c.state.targetId = c.id;
       // c.wander(-240+5,-240+5);
    //  c.follow($AVATAR.id);
   //   c.killTarget([$AVATAR.id], true, true);

   //   $MAP.link(b);
      b.state.attack.attackSpeed = 1;
      b.state.armour = 0;
      //c.state.aggressive = true;
      b.state.targetId = b.id;
    
   let a;

movementMultFactor = 0.05;

const enemySpawnLoop = new LoopAnimation(function() {
  if ($MAP.avatarCount < 30) {

   let {
          x,
          y
      } = $MAP.GRAPH.getRandomPoint();
     
      a = new Bot(getName(), (x + 5) - $MAP.centerX, (y - 5) - $MAP.centerY);
      $MAP.link(a);
      a.state.attack.engageDistance = 300;
      a.state.attack.disengageDistance = 500;
      a.state.attack.attackSpeed = 1;
      a.state.armour = 0;
      //a.state.aggressive = true;
      a.state.passive = false;
      a.state.openCarry = true;
      a.state.targetUpdateAnimation.rate = 1 / 5;
      a.addItem(new GLOCK_20);
      a.equipItem(0);
      a.state.targetId = id;
      (Math.random() < 0.5) ? a.state.passive = true:a.state.aggressive = true;
      a.state.baseSpeed = 0.5;
      a.state.runningSpeed = 2;
      a.wander(x + 5, y + 5);
      //a.follow($AVATAR.id);
     // a.killTarget([$AVATAR.id, c.id]);
  }
}, window, 1);

$MAP.lighting = false; 
$MAP.darkness = 1;
/*
$MAP.SUB_MAPS[0].link(new KitchenKnife(40,0));
$MAP.SUB_MAPS[0].link(new KitchenKnife(40,0));
$MAP.SUB_MAPS[0].link(new KitchenKnife(40,0));
$MAP.SUB_MAPS[0].link(new KitchenKnife(40,0));
$MAP.SUB_MAPS[0].link(new KitchenKnife(40,0));
*/

$MAP.link(new VisibleBarrier(50,50,40,40));
$MAP.link(new VisibleBarrier(30,-70,60,60));
$MAP.link(new VisibleBarrier(-50,-90,70,70));
$MAP.link(new VisibleBarrier(-70,50,50,50));

//$MAP.link(new Floor(0,0,500,500,0));
$MAP.showGeometry();

 $AVATAR.state.armour = 1000;

 $GAME_LOOP = function() {
  enemySpawnLoop.run(); 
 };
