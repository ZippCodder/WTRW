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
      Map2
  } from "/public/scripts/maps.js";

  $AVATAR = new Avatar("R O B I N H O O D");
  $AVATAR.postLink();

  /* INSTANTIATE INITIAL MAP */

  // $MAP = new _Map_(780, 280).init();
  $MAP = new _Map_(500, 500).init();
  $CURRENT_MAP = $MAP;
  $MAP.showGeometry();

  $MAP.avatars[$AVATAR.id] = $AVATAR;
  $AVATAR.state.targetId = $AVATAR.id;
  $AVATAR.addItem(new GLOCK_20(0, 0, 0, 5000));
  $AVATAR.state.fireAnimation.rate = 0.5/20;

  let id = genObjectId();

  let b = new Avatar("Keanu Reeves", 20, 0);
  $MAP.link(b);
  b.state.attack.engageDistance = 500;
  b.state.attack.disengageDistance = 500;
  b.state.attack.attackSpeed = 1;
  b.state.armor = 5000;
  b.state.passive = false;
  b.state.aggressive = false;
  b.state.targetUpdateAnimation.rate = 0.2;
  b.addItem(new GLOCK_20(0, 0, 0, 2));
  b.state.fireAnimation.rate = 0.5 / 10;
  b.state.targetId = b.id;
  b.killTarget([id], true);

  let c = new Avatar("Trinity", -20, 0);
  $MAP.link(c);
  c.state.attack.engageDistance = 500;
  c.state.attack.disengageDistance = 500;
  c.state.attack.attackSpeed = 1;
  c.state.armor = 5000;
  c.state.passive = true;
  c.state.aggressive = true;
  c.state.targetUpdateAnimation.rate = 0.2;
  c.addItem(new GLOCK_20(0, 0, 0, 2));
  c.state.fireAnimation.rate = 0.5 / 10;
  c.state.targetId = c.id;
  c.killTarget([id], true);
/*
  for (let i = 0; i <= 50; i++) {
      let a = new Avatar(String(i), random(250, true), random(250, true));
      $MAP.link(a);
      a.state.attack.engageDistance = 300;
      a.state.attack.disengageDistance = 500;
      a.state.attack.attackSpeed = 1;
      a.state.aggressive = true;
      a.state.passive = false;
      a.state.targetUpdateAnimation.rate = 0.2;
      a.addItem(new GLOCK_20(0, 0, 0, 2000));
      a.state.fireAnimation.rate = 0.5 / 1;
      a.state.targetId = id;
      a.killTarget([b.id,c.id],true);
  } */