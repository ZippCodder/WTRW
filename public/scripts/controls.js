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
      Floor,
      _Joystick_,
      _Button_
  } from "/public/scripts/objects.js";

  const mapContainer = document.querySelector("#map");
  const closeMapButton = document.querySelector("#map-close");
  const openMapButton = document.querySelectorAll(".controls-container__button").item(1);
  const setWaypointButton = document.querySelector("#set-waypoint");

  setWaypointButton.ontouchstart = toggleWaypoint;
  setWaypointButton.onclick = toggleWaypoint;

  closeMapButton.ontouchstart = hideMap;
  closeMapButton.onclick = hideMap;
  
  openMapButton.ontouchstart = showMap;
  openMapButton.onclick = showMap;

  function showMap(e) {
   e.preventDefault();
   updateMapData();

   $MAP_DISPLAY.useInteractiveDisplay = true;
   updateCoordinates($CURRENT_MAP.centerX + $MAP_DISPLAY.displayOffset.x, $CURRENT_MAP.centerY - $MAP_DISPLAY.displayOffset.y);
   mapContainer.style.display = "grid";
    
   updateDisplayViewport();
  }

  function hideMap(e) {
   e.preventDefault();
   $MAP_DISPLAY.useInteractiveDisplay = false;
   $MAP_DISPLAY.displayOffset.x = 0;
   $MAP_DISPLAY.displayOffset.y = 0;
   mapContainer.style.display = "none";
  }

  const mapDisplay = document.querySelector("#mapDisplay");
  const mdContext1 = mapDisplay.getContext("webgl");

  mapDisplay.width = 1000;
  mapDisplay.height = 1000;

  const interactiveMap = document.querySelector("#interactive-map");
  const mdContext2 = interactiveMap.getContext("webgl");

  interactiveMap.width = 1000;
  interactiveMap.height = 1000; 

  let offsetAnchor = {x: 0, y: 0}, move = false;

  function startDisplayMovement(e) {
    e.preventDefault();
    move = true;
    offsetAnchor.x = ((e.touches) ? e.touches[0].clientX:e.clientX) + $MAP_DISPLAY.displayOffset.x; 
    offsetAnchor.y = ((e.touches) ? e.touches[0].clientY:e.clientY) + $MAP_DISPLAY.displayOffset.y; 
  }

  function moveDisplay(e) {
   e.preventDefault();

   if (move) {
    $MAP_DISPLAY.displayOffset.x = offsetAnchor.x - ((e.touches) ? e.touches[0].clientX:e.clientX);
    $MAP_DISPLAY.displayOffset.y = offsetAnchor.y - ((e.touches) ? e.touches[0].clientY:e.clientY);

    updateCoordinates($CURRENT_MAP.centerX + $MAP_DISPLAY.displayOffset.x, $CURRENT_MAP.centerY - $MAP_DISPLAY.displayOffset.y);
   }
  }

  function stopDisplayMovement(e) {
    e.preventDefault();
    move = false;
    offsetAnchor = {x: 0, y: 0};
  }

  function updateCoordinates(x,y) {
    document.querySelector(".map__coordinates").innerText = `x:${Math.round(x)}, y:${Math.round(y)}`;
  }

  interactiveMap.ontouchstart = startDisplayMovement;
  interactiveMap.ontouchend = stopDisplayMovement;
  interactiveMap.ontouchmove = moveDisplay;

  interactiveMap.onmousedown = startDisplayMovement;
  interactiveMap.onmouseup = stopDisplayMovement;
  interactiveMap.onmousemove = moveDisplay;


  const vShaderSrc = `
        #version 100

        precision highp float;

        attribute vec3 coords;
        attribute float color;

        varying float colorCode;

        uniform float worldUnitX;
        uniform float worldUnitY;

        float x;
        float y;

        uniform vec2 translation;
        uniform float scale;
 
        void main() {

         x = (coords.x + translation.x)*worldUnitX;
         y = (coords.y + translation.y)*worldUnitY;

         gl_Position = vec4(x,y,1,scale);
         colorCode = color;
        }
  `;

  const fShaderSrc = `
        #version 100

        precision highp float;

        varying float colorCode;

        uniform vec4 color1; 
        uniform vec4 color2;
        uniform vec4 color3;
        uniform vec4 color4;
        uniform vec4 color5;
        uniform vec4 color6;
        
        void main() {
          vec4 color;
       
          if (colorCode == 1.0) {
           color = color1;
          } else if (colorCode == 2.0) {
           color = color2;
          } else if (colorCode == 3.0) {
           color = color3;
          } else if (colorCode == 4.0) {
           color = color4;
          } else if (colorCode == 5.0) {
           color = color5;
          } else if (colorCode == 6.0) {
           color = color6;
          }
     
         gl_FragColor = color;
        }
        `;

  function setDisplayContext(mdgl) {
    const mdglExt = mdgl.getExtension("OES_vertex_array_object");

    if (mdgl === mdContext1) {
     mdgl.viewport(0, 0, mapDisplay.width, mapDisplay.height); 
    } else {
     mdgl.viewport(0, 0, interactiveMap.width, interactiveMap.height); 
    }

    const mdVShader = mdgl.createShader(mdgl.VERTEX_SHADER);
    mdgl.shaderSource(mdVShader, vShaderSrc);
    mdgl.compileShader(mdVShader);
    let vsLog = mdgl.getShaderInfoLog(mdVShader);
    if (vsLog.length > 0) console.log(vsLog);

    const mdFShader = mdgl.createShader(mdgl.FRAGMENT_SHADER);
    mdgl.shaderSource(mdFShader, fShaderSrc);
    mdgl.compileShader(mdFShader);
    let fsLog = mdgl.getShaderInfoLog(mdFShader);
    if (fsLog.length > 0) console.log(fsLog);

    const mdProgram = mdgl.createProgram();
    mdgl.attachShader(mdProgram, mdVShader);
    mdgl.attachShader(mdProgram, mdFShader);

    mdgl.linkProgram(mdProgram);
    mdgl.useProgram(mdProgram);

    let mdLocations = {
      translation: mdgl.getUniformLocation(mdProgram, "translation"),
      scale: mdgl.getUniformLocation(mdProgram, "scale"),
      worldUnitX: mdgl.getUniformLocation(mdProgram, "worldUnitX"),
      worldUnitY: mdgl.getUniformLocation(mdProgram, "worldUnitY"),
      color1: mdgl.getUniformLocation(mdProgram, "color1"),
      color2: mdgl.getUniformLocation(mdProgram, "color2"),
      color3: mdgl.getUniformLocation(mdProgram, "color3"),
      color4: mdgl.getUniformLocation(mdProgram, "color4"),
      color5: mdgl.getUniformLocation(mdProgram, "color5"),
      color6: mdgl.getUniformLocation(mdProgram, "color6"),
      coords: mdgl.getAttribLocation(mdProgram, "coords"),
      color: mdgl.getAttribLocation(mdProgram, "color")
    }

    mdgl.uniform1f(mdLocations.scale, 1);
    mdgl.uniform2fv(mdLocations.translation, [0, 0]);
    mdgl.uniform4fv(mdLocations.color1, [0.4,0.4,0.4,1]);
    mdgl.uniform4fv(mdLocations.color2, fromRGB([44, 143, 219, 1]));
    mdgl.uniform4fv(mdLocations.color3, fromRGB([219, 44, 44, 1]));
    mdgl.uniform4fv(mdLocations.color4, [0.8,0.8,0.8,1]);
    mdgl.uniform4fv(mdLocations.color5, [1,1,1,1]);
    mdgl.uniform4fv(mdLocations.color6, fromRGB([204, 44, 219, 1]));
    mdgl.uniform1f(mdLocations.worldUnitX, (worldUnitX/4)+(worldUnitY/4));
    mdgl.uniform1f(mdLocations.worldUnitY, (worldUnitX/4)+(worldUnitY/4));

   return {buffer: mdgl.createBuffer(), vao: mdglExt.createVertexArrayOES(), ext: mdglExt, locations: mdLocations};
   }

   function renderDisplayContext(ctx, props) {
       ctx.clear(ctx.COLOR_BUFFER_BIT);
       props.ext.bindVertexArrayOES(props.vao);

       ctx.uniform1f(props.locations.scale, ($MAP_DISPLAY.useInteractiveDisplay) ? $MAP_DISPLAY.interactiveScale:$MAP_DISPLAY.scale);
       ctx.uniform2fv(props.locations.translation, [-$CURRENT_MAP.centerX - $MAP_DISPLAY.displayOffset.x, -$CURRENT_MAP.centerY + $MAP_DISPLAY.displayOffset.y]);

       ctx.bindBuffer(ctx.ARRAY_BUFFER, props.buffer);
       ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([...$MAP_DISPLAY.objectsVertices,...$MAP_DISPLAY.avatarsVertices]), ctx.DYNAMIC_DRAW);
       ctx.vertexAttribPointer(props.locations.coords, 3, ctx.FLOAT, false, 16, 0);
       ctx.vertexAttribPointer(props.locations.color, 1, ctx.FLOAT, false, 16, 12);
       ctx.enableVertexAttribArray(0);
       ctx.enableVertexAttribArray(1);
     
       ctx.drawArrays(ctx.TRIANGLES, 0, ($MAP_DISPLAY.objectsVertices.length+$MAP_DISPLAY.avatarsVertices.length)/4);
      
       if ($MAP_DISPLAY.waypoint.set && $CURRENT_MAP.id === $MAP_DISPLAY.waypoint.map) {   
        if (distance($CURRENT_MAP.centerX,$CURRENT_MAP.centerY,$MAP_DISPLAY.waypoint.x,$MAP_DISPLAY.waypoint.y) < 30) {
          toggleWaypoint();
          return;
        }
        ctx.bindBuffer(ctx.ARRAY_BUFFER, props.buffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([...$MAP_DISPLAY.waypointVertices]), ctx.DYNAMIC_DRAW);
        ctx.vertexAttribPointer(props.locations.coords, 3, ctx.FLOAT, false, 16, 0);
        ctx.vertexAttribPointer(props.locations.color, 1, ctx.FLOAT, false, 16, 12);
        ctx.enableVertexAttribArray(0);
        ctx.enableVertexAttribArray(1);

        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, ($MAP_DISPLAY.waypointVertices.length)/4);
       }
   }

    const mdContextProperties1 = setDisplayContext(mdContext1);
    const mdContextProperties2 = setDisplayContext(mdContext2);
  
  window.updateDisplayViewport = function() {
   let {width, height} = interactiveMap.getBoundingClientRect();
   let maxVi = Math.max(width, height), minVi = Math.min(width, height);
   let viRatio = maxVi / minVi;
   let viUnitX = (maxVi === width) ? 0.01 + (0.01 / viRatio) : 0.01 + (0.01 * viRatio);
   let viUnitY = (maxVi === width) ? 0.01 + (0.01 * viRatio) : 0.01 + (0.01 / viRatio);
   
    mdContext2.uniform1f(mdContextProperties2.locations.worldUnitX, viUnitX);
    mdContext2.uniform1f(mdContextProperties2.locations.worldUnitY, viUnitY);
 
   interactiveMap.width = width*4;
   interactiveMap.height = height*4; 
   mdContext2.viewport(0, 0, width*4, height*4); 
  }

    $MAP_DISPLAY = {
     scale: 2,
     interactiveScale: 7,
     useInteractiveDisplay: false, 
     displayOffset: {x: 0, y: 0},
     objectsVertices: [],
     avatarsVertices: [],
     waypointVertices: [],
     waypoint: {x: 0, y: 0, set: false, map: undefined},
     colorCodes: {
      "door": 5,
      "building": 5,
      "visible barrier": 4,    
     },
     updateWaypoint: function(x1,y1,x2,y2) {
      $MAP_DISPLAY.waypointVertices = [x1,y1,1,6,x1,y1+5,1,6,x2,y2,1,6,x2,y2+5,1,6,x1+5,y1,1,6,x1,y1,1,6,x2,y2,1,6,x2+5,y2,1,6];
     },
     addObject: function(obj) {
       let {offsetX,offsetY} = obj.trans, color = this.colorCodes[obj.name] || this.colorCodes[obj.type] || 1;  

       this.objectsVertices = this.objectsVertices.concat(cut([[((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]], false, [1, color], true));
     },
     update: function(renderAvatars) {
        if (renderAvatars) { 
          this.avatarsVertices = [];
        } else {
          this.objectsVertices = [];
        }
     
       for (let o in $CURRENT_MAP.obstacles) {
        let obj = $CURRENT_MAP.obstacles[o];

        if ((obj.type === "avatar" && !renderAvatars) || (obj.type !== "avatar" && renderAvatars) || obj.hideFromMap) continue;

        let {offsetX,offsetY} = obj.trans, color = this.colorCodes[obj.name] || this.colorCodes[obj.type] || 1; 
  
         if (renderAvatars) {
          this.avatarsVertices = this.avatarsVertices.concat(cut([[((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]], false, [1,(obj.state.hostile) ? 3:2], true));
          continue;
         } 

          this.objectsVertices = this.objectsVertices.concat(cut([[((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]], false, [1,color], true));
       }

      if (this.waypoint.set) this.updateWaypoint($CURRENT_MAP.centerX,$CURRENT_MAP.centerY,this.waypoint.x,this.waypoint.y);
     },   
     render: function() {
      if (this.useInteractiveDisplay) {
        renderDisplayContext(mdContext2, mdContextProperties2); 
        return;
      }
      renderDisplayContext(mdContext1, mdContextProperties1); 
     }
    } 

   function toggleWaypoint(e) {
    if (e) e.preventDefault();
    if (!$MAP_DISPLAY.waypoint.set) {
     $MAP_DISPLAY.waypoint.x = $CURRENT_MAP.centerX + $MAP_DISPLAY.displayOffset.x;     $MAP_DISPLAY.waypoint.y = $CURRENT_MAP.centerY - $MAP_DISPLAY.displayOffset.y;
     $MAP_DISPLAY.waypoint.map = $CURRENT_MAP.id;
     $MAP_DISPLAY.waypoint.set = true;

     setWaypointButton.innerText = "Unset Waypoint";
    } else {
    $MAP_DISPLAY.waypoint.set = false;
    $MAP_DISPLAY.waypoint.map = undefined;
    setWaypointButton.innerText = "Set Waypoint";
    }
   }

   function updateMapData() {
     document.querySelector("#map-name").innerText = $CURRENT_MAP.name;
     document.querySelector("#map-dimensions").innerText = `${$CURRENT_MAP.width}x${$CURRENT_MAP.height}`; 
     document.querySelector("#map-population").innerText = $CURRENT_MAP.avatarCount;
     document.querySelector("#map-rooms").innerText = $CURRENT_MAP.SUB_MAP_COUNT; 
     document.querySelector("#map-pickups").innerText = Object.keys($CURRENT_MAP.pickups).length;
     document.querySelector("#map-objects").innerText = $CURRENT_MAP.objectCount;
   }

   const mapZoomInButton = document.querySelector("#map-zoom-in");
   const mapZoomOutButton = document.querySelector("#map-zoom-out");

   function mapZoomIn(e) {
     e.preventDefault();
     
     if ($MAP_DISPLAY.interactiveScale - 0.5 > 1) $MAP_DISPLAY.interactiveScale -= 0.5;
   }

   function mapZoomOut(e) {
     e.preventDefault();
     if ($MAP_DISPLAY.interactiveScale + 0.5 < 15) $MAP_DISPLAY.interactiveScale += 0.5;
   }

   mapZoomInButton.ontouchstart = mapZoomIn;
   mapZoomInButton.onmousedown = mapZoomIn;

   mapZoomOutButton.ontouchstart = mapZoomOut;
   mapZoomOutButton.onmousedown = mapZoomOut;
   

  let ammoDisplay = document.querySelector("#ammo-display");

  window.showAmmoDisplay = function() {
     ammoDisplay.style.display = "flex";
  }

  window.hideAmmoDisplay = function() {
     ammoDisplay.style.display = "none";
  }

  window.updateAmmoDisplay = function() { 
   let gun = $AVATAR.state.equippedItems.mainTool;

   ammoDisplay.querySelector("p").style.color = (gun.constructor._properties.capacity === gun.reloadProgress) ? "#e30f00":"white";
   ammoDisplay.querySelector("p").innerText = `${(gun.constructor._properties.capacity - gun.reloadProgress)}/${$AVATAR.inventory.weapons[gun.name].ammo}`;
  }
 
 

  $HEALTH_BAR = document.querySelector("#healthbar");
  
  window.updateHealthBar = function() {
    $HEALTH_BAR.style.width = `${aisofb($AVATAR.state.vitals.health,100)}%`;
  }



  $JOYSTICK_L = new _Joystick_(true, joystickSizes.left, fixedJoysticks, joystickPositions.left);

  $JOYSTICK_R = new _Joystick_(false, joystickSizes.right, fixedJoysticks, joystickPositions.right);

  $ACTION_BUTTON = new _Button_(textures.controls.actionbutton, textures.controls.actionbuttonactive, (worldWidth / 2) - 20, (-worldHeight / 2) + 39, function(pX, pY) {
      const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
      if (i) i.action();
      $CURRENT_MAP.updateInteractable();
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

          if (!touch) return;

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

  window.onerror = (message, source, lineNumber, colNumber) => {
    sendSystemMessage(`${message} (${source})(${lineNumber}:${colNumber})`);
  }

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

 
  const consoleContainer = document.querySelector("#console");
  const consoleButton = document.querySelector("#console-button");
  const consoleCloseButton = document.querySelector("#console-close"); 
  const consoleSendButton = document.querySelector("#console-send");  const consoleInput = document.querySelector("#console-input");
  const consoleMessages = document.querySelector(".console__messages");
  const consoleMessageTemplate = document.querySelector("#message-template");
 
  function openConsole(e) {
    e.preventDefault();
    consoleContainer.style.display = "grid";
  }

  function closeConsole(e) {
    e.preventDefault();
    consoleContainer.style.display = "none";
  }

  let holdEnter = false;

  consoleInput.onkeydown = (e) => {
    if (e.key === "Enter" && !holdEnter) {
      sendMessage(e);
    } else if (e.key === "Shift") {
      holdEnter = true;
    }
  }

  consoleInput.onkeyup = (e) => {
    if (e.key === "Shift") holdEnter = false;
  } 

  function sendSystemMessage(content = "Script ran sucessfully.") {
    let msg = consoleMessageTemplate.content.cloneNode(true);

    if (content.length < 1) return;
    
    msg.querySelector("div").setAttribute("class","console__message--system");
    msg.querySelector("strong").innerHTML = "WTRW@System: "; 
    msg.querySelector("i").innerText = content;
    consoleMessages.appendChild(msg);
  }

  function evalCommand(cmd) {
   let command = cmd.replace("cmd","").trim(), result = "command not found!", prefix = command.split(" ")[0];

   command = command.replace(prefix,"").trim();

   switch (prefix) {
     case "run": {
        try {
         result = eval(command); 
         } catch (err) {
         result = "Couldn't run that script!";
        }
     };
     break;
     case "add": {
        try {
         $CURRENT_MAP.link(eval("new "+command.replace("add","").trim()));           result = command + " added."
         } catch (err) {
         result = "Object not found!";
        }
     };
     break;
     case "delete": {
       try {
         let obj = $CURRENT_MAP.locateObject(command);
         obj.delete();           
         result = `${command} (${obj.id}) deleted.`;
         } catch (err) {
         result = "Object not found!";
        }
     };
     break;
     case "godmode": {
      $AVATAR.state.invinsible = !$AVATAR.state.invinsible;
      result = "God mode " + (($AVATAR.state.invinsible) ? "activated.":"deactivated.");
     };
     break;
     case "printlayout": {
      result = $MAP.printLayoutScript();
     };
     break;
     case "noclip": {
      noclip = !noclip;
      result = "No clip " + ((noclip) ? "activated.":"deactivated.");
     }; 
     break;
     case "day": {
      $MAP.darkness = 1; 
      $MAP.lighting = false;
      result = "Daytime active."
     };
     break;
     case "evening": {
      $MAP.darkness = 2;
      $MAP.lighting = false;
      result = "Evening active."
     };
     break;
     case "night": {
      $MAP.darkness = 5;
      $MAP.lighting = true;
      result = "Nighttime active."
     }
   }

   return result;
  } 
 
  function sendMessage(e) {
    e.preventDefault();

    let content = consoleInput.value;

     let msg = consoleMessageTemplate.content.cloneNode(true);

     msg.querySelector("div").addEventListener("dblclick",(e) => {
      consoleInput.value = content;
     });

     if (content.length < 1) return;

     msg.querySelector("strong").innerHTML = $AVATAR.character+"@User: "; 
     msg.querySelector("i").innerText = content;
     consoleMessages.appendChild(msg);

    if (content.trim().startsWith("cmd")) {
     setTimeout(() => { 
       sendSystemMessage(evalCommand(content));
     }, 500);
    } 
 
    consoleInput.value = "";
  }

  consoleCloseButton.onmousedown = closeConsole;
  consoleButton.onmousedown = openConsole;
  
  consoleCloseButton.ontouchstart = closeConsole;
  consoleButton.ontouchstart = openConsole;

  consoleSendButton.ontouchstart = sendMessage;
  consoleSendButton.onmousedown = sendMessage;

  // Inventory data binding...

  const itemDescriptions = {
    default: "<strong>Pro tip:</strong> Click an item to select it and see a full description of its properties and usage.</br></br>Oh wait, what items? You're a noob lol.", 
   "glock 20": "<h3><u>GLOCK 20</u></h3>A simple, compact and lightweight handgun built for self defense and petty crime. Careful, there's no saftey!</br></br><strong>Damage _____ 18</strong></br><strong>Fire Rate _____ 1</strong></br><strong>Accuracy _____ 5</strong></br><strong>Capacity _____ 8</strong>",
   "gp k100": "<h3><u>GP K100</u></h3>This quick and reliable handgun features good capacity, and a basic scilencer and is perfect for a good ol' gun-fight.</br></br><strong>Damage _____ 25</strong></br><strong>Fire Rate _____ 3</strong></br><strong>Accuracy _____ 2</strong></br><strong>Capacity _____ 12</strong>",
   "kitchen knife": "<h3><u>Kitchen Knife</u></h3>Your run-of-the-mill, single edged cooking knife. Go use this to slice some veggies...or somthing else.</br></br><strong>Damage _____ 25</strong>",
   "assassins knife": "<h3><u>Assassin's Knife</u></h3>One of the sharpest of blades with a fine edge built for the hand of a professional. This top-of-the-line knife can make quick work of any enemy with minimal armour.</br></br><strong>Damage _____ 100</strong>"
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


 
 
