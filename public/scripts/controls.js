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


  $JOYSTICK_L = new _Joystick_(true, joystickSizes.left, fixedJoysticks, joystickPositions.left);

  $JOYSTICK_R = new _Joystick_(false, joystickSizes.right, fixedJoysticks, joystickPositions.right);

  $ACTION_BUTTON = new _Button_(textures.controls.actionbutton, textures.controls.actionbuttonactive, (worldWidth / 2) - 20, (-worldHeight / 2) + 39, function(pX, pY) {
      const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
      if (i) i.action();
  }, 18, 1.5, false, [-9,9,1,0,0,9,9,1,0.703125,0,-9,-9,1,0,0.703125,9,9,1,0.703125,0,-9,-9,1,0,0.703125,9,-9,1,0.703125,0.703125]);
 
  $RELOAD_BUTTON = new _Button_(textures.controls.reloadbutton, textures.controls.reloadbuttonactive, (worldWidth / 2) - 38, -(worldHeight / 2) + 20, function(pX, pY) {
      if (this.enabled) {
          $AVATAR.reload();
          this.enabled = false;
      }
  }, 8.5, 1.4, false, [-6,6,1,0,0,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,-6,1,0.9375,0.9375]);
  $RELOAD_BUTTON.hidden = true;

  $AVATAR_MODE_BUTTON = new _Button_(textures.controls.avatarmode2, textures.controls.avatarmode1, (worldWidth / 2) - 10, (worldHeight / 2) - 15, function(pX, pY) {
      this.on = !this.on;
      $AVATAR.state.hostile = !$AVATAR.state.hostile;
  }, 9, 1.5, true, [-4.5,4.5,1,0,0,4.5,4.5,1,0.703125,0,-4.5,-4.5,1,0,0.703125,4.5,4.5,1,0.703125,0,-4.5,-4.5,1,0,0.703125,4.5,-4.5,1,0.703125,0.703125]);
  $AVATAR_MODE_BUTTON.hidden = true;

  $DROP_ITEM_BUTTON = new _Button_(textures.controls.dropitem1, textures.controls.dropitem2, (worldWidth / 2) - 35, -(worldHeight / 2) + 30, function(pX, pY) {
      $AVATAR.drop();
  }, 8.5, 1.4, false, [-6,6,1,0,0,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,6,1,0.9375,0,-6,-6,1,0,0.9375,6,-6,1,0.9375,0.9375]);
  $DROP_ITEM_BUTTON.hidden = true;


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


  window.addEventListener("contextmenu",function(e) {
   e.preventDefault(); 
  }); 

  const inventoryButton = document.querySelectorAll(".controls-container__button").item(0);
  const inventoryCloseButton = document.querySelector(".main-inventory__close");
  const inventoryWindow = document.querySelector("#main-inventory");
  const inventoryItemsContainer = document.querySelector("#main-items-container");

  function closeInventory(e) {
    e.preventDefault();
    inventoryWindow.style.display = "none";
  }
 
  function openInventory(e) {
    e.preventDefault();
    inventoryWindow.style.display = "grid";
  }

  inventoryCloseButton.onmousedown = closeInventory;
  inventoryButton.onmousedown = openInventory;
  
  inventoryCloseButton.ontouchstart = closeInventory;
  inventoryButton.ontouchstart = openInventory;

  // Inventory data binding...

  const itemDescriptions = {
    default: "<strong>Pro tip:</strong> Click an item to select it and see a full description of its properties and usage.</br></br>Oh wait, what items? You're a noob lol.", 
   "glock 20": "<h3><u>GLOCK 20</u></h3>A simple, compact and lightweight handgun built for self defense and petty crime. Careful, there's no saftey!</br></br><strong>Damage _____ 18</strong></br><strong>Fire Rate _____ 1</strong></br><strong>Accuracy _____ 5</strong></br><strong>Capacity _____ 8</strong>",
   "gp k100": "<h3><u>GP K100</u></h3>This quick and reliable handgun features good capacity, and a basic scilencer and is perfect for a good ol' gun-fight.</br></br><strong>Damage _____ 25</strong></br><strong>Fire Rate _____ 3</strong></br><strong>Accuracy _____ 2</strong></br><strong>Capacity _____ 12</strong>"
  }  

  let equippedIndex = Infinity, selectedIndex = undefined, switchMode = false;

  function equipSlot(i) {
    if (!$AVATAR.equipItem(i)) return;
  
    if (equippedIndex < 5) quickAccessItems.item(equippedIndex).style.backgroundColor = "rgba(0,0,0,0.3)";
    inventoryItems.item(equippedIndex).style.borderBottom = "none";

    if (equippedIndex !== i) {
     if (i < 5) quickAccessItems.item(i).style.backgroundColor = "rgba(0,0,0,0.5)";
     inventoryItems.item(i).style.borderBottom = "3px solid white";
 
     equippedIndex = i;
    } else {
     $AVATAR.unequipItem(i);
     equippedIndex = Infinity;
    }
  }

  const quickAccessItems = document.querySelectorAll(".controls-container__item");
  const inventoryItems = document.querySelectorAll(".main-inventory__item");
  const controlButtonsContainer = document.querySelector(".main-inventory__buttons");
  const itemDescription = document.querySelector(".main-inventory__description-content");
  let controlSwitchButton;
   
  function updateDescription(itemName) {
   if (!itemName) return;
   itemDescription.innerHTML = itemDescriptions[itemName];
  }

  function selectSlot(i) {
     if (!$AVATAR.inventory.items[i] && !switchMode) return;
 
     updateDescription($AVATAR.inventory.items[i]?.name); 

     controlButtonsContainer.style.opacity = 1;
     inventoryItems.item(selectedIndex).style.backgroundColor = "rgba(0,0,0,0.2)";
     inventoryItems.item(i).style.backgroundColor = "rgba(0,0,0,0.4)";

     if (switchMode) {
       $AVATAR.inventory.swapItems(selectedIndex,i);
       updateInventoryItem(selectedIndex, $AVATAR.inventory.items[selectedIndex]?.name); 
       updateInventoryItem(i, $AVATAR.inventory.items[i]?.name);

       if (equippedIndex === i) {
         equipSlot(selectedIndex);
       } else if (equippedIndex === selectedIndex) {
         equipSlot(i); 
       }

       controlSwitchButton.style.opacity = 1;
       switchMode = false;
     } 
 
     selectedIndex = i;
  }

  for (let i = 0; i < quickAccessItems.length; i++) {
   quickAccessItems.item(i).ontouchstart = function() {
     equipSlot(i);
   }
  }
 
  for (let i = 0; i < inventoryItems.length; i++) {
   inventoryItems.item(i).onclick = function() {
     selectSlot(i);
   }
  }

  window.updateInventoryItem = function (slot, name, drop) {
   if (!drop) {
    if (name) {
     if (slot < 5) quickAccessItems.item(slot).style.backgroundImage = `url(\"/public/images/icons/${name.replaceAll(" ","_")}_icon.png\")`;
     inventoryItems.item(slot).style.backgroundImage = `url(\"/public/images/icons/${name.replaceAll(" ","_")}_icon.png\")`;  
     } else {
    if (slot < 5) quickAccessItems.item(slot).style.backgroundImage = `none`;
     inventoryItems.item(slot).style.backgroundImage = `none`;  
    }
    return;
   }

   controlButtonsContainer.style.opacity = 0.5;  
 
   inventoryItems.item(slot).style.backgroundImage = "none";
   inventoryItems.item(slot).style.borderBottom = "none";
   inventoryItems.item(slot).style.backgroundColor = "rgba(0,0,0,0.2)";

   if (slot < 5) {
   quickAccessItems.item(slot).style.backgroundImage = "none";
   quickAccessItems.item(slot).style.backgroundColor = "rgba(0,0,0,0.3)";
   }

   selectedIndex = undefined;
  }

const controlEquipButton = document.querySelector(".main-inventory__controls-equip");
controlEquipButton.onclick = function() {
 equipSlot(selectedIndex);
}

const helpContainer = document.querySelector(".main-inventory__help");
const statsContainer = document.querySelector(".main-inventory__stats");
const descriptionContainer = document.querySelector(".main-inventory__description");
const viewStatsButton = document.querySelector(".main-inventory__view-stats");

function showHelp() {
 descriptionContainer.style.display = "none";
 statsContainer.style.display = "none";
 helpContainer.style.display = "block";
}

function showDescription() {
  descriptionContainer.style.display = "block";
  helpContainer.style.display = "none";
  statsContainer.style.display = "none";
  viewStatsButton.innerText = "View Stats";
}

function showStats() {
 descriptionContainer.style.display = "none";
 helpContainer.style.display = "none";
 statsContainer.style.display = "block";
 viewStatsButton.innerText = "View Desc";
}

viewStatsButton.onclick = function() {
  if (statsContainer.style.display !== "block") {
      showStats();
      return;
  }

  showDescription();
}

const controlHelpButton = document.querySelector(".main-inventory__controls-help");
controlHelpButton.onclick = function() {
 if (helpContainer.style.display !== "block") {
  showHelp();
  return;
 } 
 showDescription();
}

const controlDropButton = document.querySelector(".main-inventory__controls-drop");
controlDropButton.onclick = function() {
 controlSwitchButton.style.opacity = 1;
 switchMode = false;

 if (equippedIndex === selectedIndex) equippedIndex = Infinity;

 $AVATAR.dropItem(selectedIndex);
 updateDescription("default");
}

controlSwitchButton = document.querySelector(".main-inventory__controls-switch");
controlSwitchButton.onclick = function() {
 if (selectedIndex === undefined) return;

 if (!switchMode) {
   switchMode = true;
   controlSwitchButton.style.opacity = 0.5;
   return;
 }

 controlSwitchButton.style.opacity = 1;
 switchMode = false;
}


 
 
