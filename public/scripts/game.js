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

  $AVATAR = new Avatar("R O B I N H O O D");
  $AVATAR.postLink();

  /* INSTANTIATE INITIAL MAP */

  //$MAP = new _Map_(780, 280).init();
  $MAP = new _Map_(200, 200).init();
  //$MAP.parseLayoutScript(Map2);
  $CURRENT_MAP = $MAP;
  $MAP.showGeometry();

  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  $AVATAR.addItem(new GLOCK_20(0,0,0,100));
  $AVATAR.state.fireAnimation.rate = 0.5 / 10;

  let id = genObjectId();

 //$MAP.GRAPH.blocked.push(8,12,13,14,18);
// $MAP.GRAPH.getPath(488,1857);
// console.log(performance.now()-t1);

/*
  let b = new Avatar("Keanu Reeves", 5, 5);
  $MAP.link(b);
  b.state.attack.engageDistance = 500;
  b.state.attack.disengageDistance = 200;
  b.state.attack.attackSpeed = 3;
  b.state.armor = 3000;
  b.state.passive = false;
  b.state.aggressive = true;
  b.state.attack.forget = true;
  b.state.targetUpdateAnimation.rate = 0.2;
  b.addItem(new GLOCK_20(0, 0, 0, 1000));
  b.state.fireAnimation.rate = 0.5 / 10;
  b.state.targetId = b.id; 
  b.killTarget([id],true);
*/
 // $MAP.link(new VisibleBarrier(10,10,10,10));
 // console.log(b.findPathTo(-30,-30));

    let c = new Avatar("Trinity", -20, 0);
    $MAP.link(c);
    c.state.attack.engageDistance = 500;
    c.state.attack.disengageDistance = 500;
    c.state.attack.attackSpeed = 2;
    c.state.armor = 5000;
    c.state.passive = false;
    c.state.aggressive = true;
    c.state.targetUpdateAnimation.rate = 0.2;
    c.addItem(new GLOCK_20(0, 0, 0, 1000));
    c.state.fireAnimation.rate = 0.5 / 10;
    c.state.targetId = c.id;
    c.killTarget([id],true); 

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
        a.killTarget([c.id]);
    } 
