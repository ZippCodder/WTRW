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
      _Joystick_,
      _Button_
  } from "/public/scripts/objects.js";


  $JOYSTICK_L = new _Joystick_(true, joystickSizes.left, fixedJoysticks, {
      x: (-worldWidth / 2) + 20,
      y: (-worldHeight / 2) + 20
  });

  $JOYSTICK_R = new _Joystick_(false, joystickSizes.right, fixedJoysticks, {
      x: (worldWidth / 2) - 20,
      y: (-worldHeight / 2) + 20
  });

  $ACTION_BUTTON = new _Button_(textures.controls.actionbutton, textures.controls.actionbuttonactive, (worldWidth / 2) - 20, (-worldHeight / 2) + 39, function(pX, pY) {
      const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
      if (i) i.action();
  }, 18, 1.5, false, [-9,9,1,0,0,9,9,1,0.703125,0,-9,-9,1,0,0.703125,9,9,1,0.703125,0,-9,-9,1,0,0.703125,9,-9,1,0.703125,0.703125]);

  $RELOAD_BUTTON = new _Button_(textures.controls.reloadbutton, textures.controls.reloadbuttonactive, (worldWidth / 2) - 38, -(worldHeight / 2) + 20, function(pX, pY) {
      if (this.enabled) {
          $AVATAR.reload();
          this.enabled = false;
      }
  }, 8.5, 1.5, false, [-6,6,1,0,0,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,-6,1,0.9375,0.9375]);

  $AVATAR_MODE_BUTTON = new _Button_(textures.controls.avatarmode2, textures.controls.avatarmode1, (worldWidth / 2) - 10, (worldHeight / 2) - 15, function(pX, pY) {
      this.on = !this.on;
      $AVATAR.state.hostile = !$AVATAR.state.hostile;
  }, 9, 1.5, true, [-4.5,4.5,1,0,0,4.5,4.5,1,0.703125,0,-4.5,-4.5,1,0,0.703125,4.5,4.5,1,0.703125,0,-4.5,-4.5,1,0,0.703125,4.5,-4.5,1,0.703125,0.703125]);

  $DROP_ITEM_BUTTON = new _Button_(textures.controls.dropitem1, textures.controls.dropitem2, (worldWidth / 2) - 35, -(worldHeight / 2) + 30, function(pX, pY) {
      $AVATAR.drop();
  }, 8.5, 1.5, false, [-6,6,1,0,0,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,-6,1,0.9375,0.9375]);


  function moveJoystick(e, m = true) {
      e.preventDefault();

      let coords0 = e.touches[0],
          coords1 = e.touches[1];

      if ($JOYSTICK_L.base.anchored) {
          configure($JOYSTICK_L);
      } else if (m) {
          for (let i = 0; i < 2; i++) {
              if (e.touches[i]?.clientX < window.innerWidth / 2 && (e.touches[i]?.identifier !== $JOYSTICK_R.id)) {

                  $JOYSTICK_L.id = e.touches[i].identifier;
                  configure($JOYSTICK_L);
                  break;
              }
          }
      }

      if ($JOYSTICK_R.base.anchored) {
          configure($JOYSTICK_R);
      } else if (m) {
          for (let i = 0; i < 2; i++) {
              if (e.touches[i]?.clientX > window.innerWidth / 2 && (e.touches[i]?.identifier !== $JOYSTICK_L.id)) {
                  $JOYSTICK_R.id = e.touches[i].identifier;
                  configure($JOYSTICK_R);
                  break;
              }
          }
      }

      function configure(stick) {

          let touch;

          for (let i = 0; i < 2; i++) {
              if (e.touches[i]?.identifier === stick.id) {
                  touch = e.touches[i];
                  break;
              }
          }

          let pageX = touch.clientX;
          let pageY = touch.clientY;
          let pX = aofb(aisofb(pageX, window.innerWidth), worldWidth) - (worldWidth / 2);
          let pY = aofb(100 - aisofb(pageY, window.innerHeight), worldHeight) - (worldHeight / 2);

          let {
              width,
              height,
              x,
              y,
              radius
          } = stick.base;

          let d = distance(x, y, pX, pY),
              t = radius / d;

          if (stick.base.anchored) {
              if (d > radius) {
                  pX = (((1 - t) * x) + (t * pX));
                  pY = (((1 - t) * y) + (t * pY));
              }
          }

          if ((d < radius) || stick.base.anchored || !stick.fixed) stick.translate(pX, pY);
      }
  }

  canvas.addEventListener("touchstart", function(e) {
      e.preventDefault();
      let touch = e.touches[e.touches.length - 1];

      let pageX = touch.clientX;
      let pageY = touch.clientY;
      let pX = aofb(aisofb(pageX, window.innerWidth), worldWidth) - (worldWidth / 2);
      let pY = aofb(100 - aisofb(pageY, window.innerHeight), worldHeight) - (worldHeight / 2);

      let buttonPress = false;

      for (let i of $CONTROLS) {
          if (i instanceof _Button_ && !i.hidden && i.enabled && distance(pX, pY, i.trans.offsetX, i.trans.offsetY) < i.radius) {

              i.active = true;
              i.touch = touch.identifier;
              i.action(pX, pY);
              buttonPress = true;
          }
      }

      if (!buttonPress) moveJoystick(e);
  });

  canvas.addEventListener("touchmove", (e) => {
      moveJoystick(e, false);
  });

  canvas.addEventListener("touchend", (e) => {
      e.preventDefault();

      let ids = Object.values(e.touches).reduce((a, v) => {
          a.push(v.identifier)
      }, []);

      for (let i of $CONTROLS) {
          if (i instanceof _Button_ && i.active && !i.hidden && !ids?.includes(i.touch)) {

              i.active = false;
              if (i.postAction) i.postAction();
          }
      }

      let uL = false,
          uR = false;

      for (let i = 0; i < 2; i++) {
          if (e.touches[i]?.identifier === $JOYSTICK_L.id) {
              uL = true;
          }
          if (e.touches[i]?.identifier === $JOYSTICK_R.id) {
              uR = true;
          }
      }

      if (!uL) {
          $AVATAR.state.walking = false;
          $JOYSTICK_L.unanchor();
          $JOYSTICK_L.fix();
          $JOYSTICK_L.id = undefined;
      }

      if (!uR) {
          if ($CURRENT_MAP.move) $AVATAR.holsterWeapon();

          $JOYSTICK_R.unanchor();
          $JOYSTICK_R.fix();
          $JOYSTICK_R.id = undefined;
      }
  });


  const inventoryButton = document.querySelector("#inventory-button");
  const inventoryClose = document.querySelector(".main-inventory__close");
  const inventoryWindow = document.querySelector("#main-inventory");
  const inventoryItemsContainer = document.querySelector("#main-items-container");

  inventoryClose.ontouchstart = () => {
      inventoryWindow.style.display = "none";
  }

  inventoryButton.ontouchstart = () => {
      inventoryWindow.style.display = "grid";
  }
