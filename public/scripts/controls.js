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


  $JOYSTICK_L = new _Joystick_(true, joystickSizes.left);

  $JOYSTICK_R = new _Joystick_(false, joystickSizes.right);

  $ACTION_BUTTON = new _Button_(textures.actionbutton, textures.actionbuttonactive, (worldWidth / 2) - 15, 0, function(pX, pY) {
      const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
      if (i) i.action();
  }, 8.5);

  $RELOAD_BUTTON = new _Button_(textures.reloadbutton, textures.reloadbuttonactive, (worldWidth / 2) - 30, -15, function(pX, pY) {
     if (this.enabled) {
      $AVATAR.reload();
      this.enabled = false;
     } 
  }, 8.5, 2.2);
   
 $AVATAR_MODE_BUTTON = new _Button_(textures.avatarmode1, textures.avatarmode2, (worldWidth / 2) - 10, 15, function(pX, pY) {
   if (this.on) {
    this.on = false;
   } else {
    this.on = true;
   } 
  }, 8.5, 3, true);

 $DROP_ITEM_BUTTON = new _Button_(textures.dropitem1, textures.dropitem2, (worldWidth / 2) - 45, -15, function(pX, pY) {
   console.log("dropping item..."); 
  }, 8.5, 2.2);


  function moveJoystick(e, m = true) {
      e.preventDefault();

      let coords0 = e.touches[0],
          coords1 = e.touches[1];

      if ($JOYSTICK_L.base.anchored) {
          configure($JOYSTICK_L);
      } else if (m) {
          for (let i = 0; i < 2; i++) {
              if (e.touches[i]?.clientX < window.innerWidth / 2 && (e.touches[i]?.identifier !== $JOYSTICK_R.id)) {
                  if ($CURRENT_MAP.move) $AVATAR.state.walking = true;

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
                  if ($CURRENT_MAP.move) $AVATAR.drawWeapon();

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

          if (stick.base.anchored) {
              let {
                  width,
                  height,
                  x,
                  y,
                  radius
              } = stick.base;
              x += width / 2;
              y += height / 2;

              let d = distance(x, y, pX, pY),
                  t = radius / d;

              if (d > radius) {
                  pX = (((1 - t) * x) + (t * pX));
                  pY = (((1 - t) * y) + (t * pY));
              }
          }

          stick.translate(pX, pY);
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
          $JOYSTICK_L.id = undefined;
      }
      if (!uR) {
          if ($CURRENT_MAP.move) $AVATAR.holsterWeapon();

          $JOYSTICK_R.unanchor();
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
