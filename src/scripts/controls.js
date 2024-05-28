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
      normalizeRotation,
      Inventory,
      fromRGB,
      toRGB,
      rotate
  } from "/src/scripts/lib.js";

  const {
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
      Bench,
      Rocks1,
      Rocks2,
      BulletShell,
      Plus100,
      KitchenKnife,
      AssassinsKnife,
      Bot,
      Bush,
      ConvenienceStore,
      LightBush,
      MixedBush,
      Stopper,
      MetalFence,
      MetalFenceVertical,
      Atm,
      Gazebo,
      Floor,
      Shed,
      Tile,
      Syringe,
      Vendor1,
      _Joystick_,
      _Button_,
      House2,
      GunStore,
      GreyBackpack,
      WhiteBackpack,
      BlackBackpack,
      Whiteboard,
      Pinboard,
      SmallTable,
      MedKit,
      AmmoBox,
      MultiAmmoBox, 
      BasicArmour,
      MercenaryArmour, 
      SwatArmour,
      SteakAndFries, 
      DX_9,
      FURS_55,
      NOSS_7,
      X6_91,
      RemoteExplosive,
      RemoteDetonator, 
      ProximityExplosive,
      CombatKnife,
      Money, 
      Door, 
      LightSwitch, 
      SmallPlant
  } = await import("/src/scripts/objects.js");

  import _dialogues from "/src/scripts/dialogue.js";

  /* LOGIC FOR INTERACTION BUTTONS */

  const grabButton = document.querySelector(".grab-button");
  const actionButton = document.querySelector(".action-button");

  function toggleGrab(e) {
      e.preventDefault();

      if ($AVATAR.grab()) {
          grabButton.style.opacity = "0.5";
      } else {
          $AVATAR.drop();
          grabButton.style.opacity = "1";
      }
  }

  function runAction(e) {
      if (!$CURRENT_MAP.currentInteractable || $CURRENT_MAP.currentInteractable === $AVATAR.state.pickup.current) return;

      const i = $CURRENT_MAP.interactables[$CURRENT_MAP.currentInteractable.id];
      if (i) i.action();
      $CURRENT_MAP.updateInteractable();
  }

  grabButton.ontouchstart = toggleGrab;
  grabButton.onclick = toggleGrab;

  if (!$IS_MOBILE) {
   window.addEventListener("keydown",(e) => {
     if (e.code === "KeyE") runAction(e);
   });
  }

  actionButton.ontouchstart = runAction;
  actionButton.onclick = runAction;

  /* LOGIC FOR DIALOG CONTROLS AND PROCESS */

  const subtitles = document.querySelector(".subtitles");
  const optionsContainer = document.querySelector(".bottom-panel__options");
  const dialogueOption1 = document.querySelector(".option-1");
  const dialogueOption2 = document.querySelector(".option-2");
  const optionNavUp = document.querySelector(".nav-up");
  const optionNavDown = document.querySelector(".nav-down");
  const speakButton = document.querySelector(".speak-button");

  let selectedModule = 0;
  let selectedOption = 0;
  let currentOptions = [0, 1];
  let optionSelect = true;

  optionNavUp.onmousedown = function() {
      if (selectedOption > 0 && optionSelect) {
          selectedOption--;
          updateNav();

          if (selectedOption < currentOptions[0] && selectedOption < currentOptions[1]) {
              currentOptions = [selectedOption, selectedOption + 1];
          }

          dialogueOption1.style.color = (_dialogues[selectedModule].options[currentOptions[0]].enabled) ? "white" : "darkgray";
          dialogueOption2.style.color = (_dialogues[selectedModule].options[currentOptions[1]].enabled) ? "white" : "darkgray";

          dialogueOption1.innerText = (_dialogues[selectedModule].options[currentOptions[0]].label || _dialogues[selectedModule].options[currentOptions[0]].getContent());
          dialogueOption2.innerText = (_dialogues[selectedModule].options[currentOptions[1]].label || _dialogues[selectedModule].options[currentOptions[1]].getContent());

          if (selectedOption === currentOptions[0]) {
              dialogueOption1.style.backgroundColor = "#444444";
              dialogueOption2.style.backgroundColor = "#222222";

              return;
          }

          dialogueOption2.style.backgroundColor = "#444444";
          dialogueOption1.style.backgroundColor = "#222222";
      }
  }

  optionNavDown.onmousedown = function() {

      if (selectedOption < _dialogues[selectedModule].options.length - 1 && optionSelect) {
          selectedOption++;
          updateNav();

          if (selectedOption > currentOptions[0] && selectedOption > currentOptions[1]) {
              currentOptions = [selectedOption - 1, selectedOption];
          }

          dialogueOption1.style.color = (_dialogues[selectedModule].options[currentOptions[0]].enabled) ? "white" : "darkgray";
          dialogueOption2.style.color = (_dialogues[selectedModule].options[currentOptions[1]].enabled) ? "white" : "darkgray";

          dialogueOption1.innerText = (_dialogues[selectedModule].options[currentOptions[0]].label || _dialogues[selectedModule].options[currentOptions[0]].getContent());
          dialogueOption2.innerText = (_dialogues[selectedModule].options[currentOptions[1]].label || _dialogues[selectedModule].options[currentOptions[1]].getContent());

          if (selectedOption === currentOptions[0]) {
              dialogueOption1.style.backgroundColor = "#444444";
              dialogueOption2.style.backgroundColor = "#222222";

              return;
          }

          dialogueOption2.style.backgroundColor = "#444444";
          dialogueOption1.style.backgroundColor = "#222222";
      }
  }

  function updateOptions() {
      if (_dialogues[0]) {
          if (optionSelect) {
              dialogueOption1.innerText = (_dialogues[selectedModule].options[selectedOption].label || _dialogues[selectedModule].options[selectedOption].getContent());
              dialogueOption2.innerText = (_dialogues[selectedModule].options[selectedOption + 1].label || _dialogues[selectedModule].options[selectedOption + 1].getContent());
          } else {
              dialogueOption1.innerText = "...";
              dialogueOption2.innerText = "...";
          }

          updateNav();

          if (selectedOption === currentOptions[0]) {
              dialogueOption1.style.backgroundColor = "#444444";
              dialogueOption2.style.backgroundColor = "#222222";

              return;
          }

          dialogueOption2.style.backgroundColor = "#444444";
          dialogueOption1.style.backgroundColor = "#222222";
      }
  }

  function updateNav() {
      document.querySelector(".nav-up div").style.opacity = (selectedOption - 1 < 0) ? "0.5" : "1";
      document.querySelector(".nav-down div").style.opacity = (selectedOption + 1 > (_dialogues[selectedModule].options.length - 1)) ? "0.5" : "1";
  }

  function updateSubtitles(content, callback) {
      let characterName = (optionSelect) ? $AVATAR.character : $ACTIVE_DIALOGUE_PARTY.character;

      subtitles.innerHTML = `<strong>${characterName}:</strong> ...`;

      setTimeout(function() {
          let interval, pos = 0,
              str = content;

          interval = setInterval(function() {
              subtitles.innerHTML = `<strong>${characterName}:</strong> ` + str.slice(0, pos);
              pos++;

              if (pos > str.length) {
                  clearInterval(interval);
                  if (callback) callback();
              }
          }, 50);
      }, 1000);
  }

  function processResponse() {
      updateSubtitles(_dialogues[selectedModule].options[selectedOption].getContent(), function() {
          if (_dialogues[selectedModule].options[selectedOption].action) _dialogues[selectedModule].options[selectedOption].action();

          if (_dialogues[selectedModule].options[selectedOption].getDestination()) {
              setTimeout(function() {
                  let [mod, op] = _dialogues[selectedModule].options[selectedOption].getDestination();
                  updateSubtitles(_dialogues[mod].responses[op].getContent(), function() {
                      if (_dialogues[mod].responses[op].action) _dialogues[mod].responses[op].action();

                      if (_dialogues[mod].responses[op].getDestination()) {
                          selectedModule = _dialogues[mod].responses[op].getDestination()[0];
                          selectedOption = 0;
                          currentOptions = [0, 1];
                          optionSelect = true;
                          updateOptions();
                      }
                  });
              }, 1000);
          }
      });

      optionSelect = false;
      updateOptions();
  }

  optionsContainer.onclick = function() {
      if (optionSelect && $ACTIVE_DIALOGUE_PARTY && _dialogues[selectedModule].options[selectedOption].enabled) {
          processResponse();
      }
  }

  function startDialogue(e) {
    toggleNote("Sorry, we're working on that! Dialogue will be included in newer versions.");
    return;

      e.preventDefault();

      let res = undefined,
          dist = Infinity;

      for (let avatar in $CURRENT_MAP.avatars) {
          avatar = $CURRENT_MAP.avatars[avatar];

          if (avatar === $AVATAR || avatar.state.target.engaged) continue;

          let d = distance(0, 0, avatar.trans.offsetX, avatar.trans.offsetY);
          if ((d < dist || res === undefined) && d < 30) {
              res = avatar;
              dist = d;
          }
      }

      if (!res) return;

      $ACTIVE_DIALOGUE_PARTY = res;
      let [firstName, lastName] = res.character.split(" ");

      $ACTIVE_DIALOGUE_PARTY.firstName = firstName;
      $ACTIVE_DIALOGUE_PARTY.lastName = lastName;

      res.stopWander();
      res.stopSitting();
      if (res.state.path.engaged) res.disengagePath();

      res.state.rotationTarget = normalizeRotation((Math.atan2((0 - res.map.centerY) - (res.trans.offsetY - res.map.centerY), (0 - res.map.centerX) - (res.trans.offsetX - res.map.centerX)) * 180 / Math.PI) - 90);

      requestTransition(function() {
          document.querySelector("#mainControls").style.display = "none";
          document.querySelector("#dialogue").style.display = "block";
          subtitles.innerHTML = `<strong>${$AVATAR.character}:</strong> ...`;

          selectedModule = 0;
          selectedOption = 0;
          optionSelect = true;

          updateOptions();
      }, 10);
  }

  window.endDialogue = function(e) {
      if ($ACTIVE_DIALOGUE_PARTY) {

          $ACTIVE_DIALOGUE_PARTY.wander();
          $ACTIVE_DIALOGUE_PARTY = undefined;

          requestTransition(function() {
              document.querySelector("#mainControls").style.display = "block";
              document.querySelector("#dialogue").style.display = "none";

              $CURRENT_MAP.move = true;
          }, 10);
      }
  }

  speakButton.ontouchstart = startDialogue;
  speakButton.onclick = startDialogue;

  updateOptions();

  /* CRAFTING */

  const openCraftingButton = document.querySelectorAll(".controls-container__button").item(2);

  openCraftingButton.addEventListener("click",() => {
    toggleNote("Sorry, we're working on that! Crafting will be included in newer versions.");
  });

  /* MAP CONTROLS AND MINIMAP RENDERING */

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
      $MAP_DISPLAY.useWorldMap = false;
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

  let offsetAnchor = {
          x: 0,
          y: 0
      },
      move = false;

  function startDisplayMovement(e) {
      e.preventDefault();
      move = true;
   
      if (!$MAP_DISPLAY.useWorldMap) {
      offsetAnchor.x = ((e.touches) ? e.touches[0].clientX : e.clientX) + $MAP_DISPLAY.displayOffset.x;
      offsetAnchor.y = ((e.touches) ? e.touches[0].clientY : e.clientY) + $MAP_DISPLAY.displayOffset.y;
      } else {
      offsetAnchor.x = ((e.touches) ? e.touches[0].clientX : e.clientX) + $MAP_DISPLAY.worldMapOffset.x;
      offsetAnchor.y = ((e.touches) ? e.touches[0].clientY : e.clientY) + $MAP_DISPLAY.worldMapOffset.y;
      }
  }

  function moveDisplay(e) {
      e.preventDefault();

      if (move) {
       if (!$MAP_DISPLAY.useWorldMap) {
          $MAP_DISPLAY.displayOffset.x = offsetAnchor.x - ((e.touches) ? e.touches[0].clientX : e.clientX);
          $MAP_DISPLAY.displayOffset.y = offsetAnchor.y - ((e.touches) ? e.touches[0].clientY : e.clientY);

          updateCoordinates($CURRENT_MAP.centerX + $MAP_DISPLAY.displayOffset.x, $CURRENT_MAP.centerY - $MAP_DISPLAY.displayOffset.y);
       } else {
          $MAP_DISPLAY.worldMapOffset.x = offsetAnchor.x - ((e.touches) ? e.touches[0].clientX : e.clientX);
          $MAP_DISPLAY.worldMapOffset.y = offsetAnchor.y - ((e.touches) ? e.touches[0].clientY : e.clientY);

          updateCoordinates($MAP_DISPLAY.worldMapOffset.x, $MAP_DISPLAY.worldMapOffset.y);
       }
      }
  }

  function stopDisplayMovement(e) {
      e.preventDefault();
      move = false;
      offsetAnchor = {
          x: 0,
          y: 0
      };
  }

  function updateCoordinates(x, y) {
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
        attribute vec2 point;
        attribute vec2 tcoords;

        varying float colorCode;
        varying vec2 textrCoord;

        uniform float worldUnitX;
        uniform float worldUnitY;

        float x;
        float y;

        uniform vec2 translation;
        uniform float scale;
 
        void main() {
         float offsetX = translation.x; 
         float offsetY = translation.y;
         float size = scale;

         if (point[0] != 0.01) {
          offsetX = (point[0] + translation.x) / scale;
          offsetY = (point[1] + translation.y) / scale;
          size = 1.0;
         }

         x = (coords.x + offsetX)*worldUnitX;
         y = (coords.y + offsetY)*worldUnitY;
 
         gl_Position = vec4(x,y,1,size);
         textrCoord = vec2(tcoords[0],tcoords[1]);
         colorCode = color;
        }
  `;

  const fShaderSrc = `
        #version 100

        precision highp float;

        varying float colorCode;
        varying vec2 textrCoord;

        uniform vec4 color1; 
        uniform vec4 color2;
        uniform vec4 color3;
        uniform vec4 color4;
        uniform vec4 color5;
        uniform vec4 color6;
        uniform sampler2D texture;
        uniform sampler2D texture2;
        
        void main() {
         vec4 color = texture2D(texture,textrCoord);
        
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
          } else if (colorCode == 0.5) {
           color = texture2D(texture2,textrCoord);
           if (color[3] < 0.4) {
            color[0] = 0.0;
            color[1] = 0.0;
            color[2] = 0.0;
            color[3] = 0.0;
           }
          } else if (color[3] > 0.0) {
           color[0] = 0.7;
           color[1] = 0.7;
           color[2] = 0.7;
           color[3] = 1.0;
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

      mdgl.enable(mdgl.BLEND);
      mdgl.blendFunc(mdgl.ONE, mdgl.ONE_MINUS_SRC_ALPHA);

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
          tcoords: mdgl.getAttribLocation(mdProgram, "tcoords"),
          point: mdgl.getAttribLocation(mdProgram, "point"),
          color: mdgl.getAttribLocation(mdProgram, "color"),
          texture: mdgl.getUniformLocation(mdProgram, "texture"),
          texture2: mdgl.getUniformLocation(mdProgram, "texture2"),
      }

      mdgl.uniform1i(mdLocations.texture, 0);
      mdgl.uniform1i(mdLocations.texture2, 1);
      mdgl.uniform1f(mdLocations.scale, 1);
      mdgl.uniform2fv(mdLocations.translation, [0, 0]);
      mdgl.uniform4fv(mdLocations.color1, [0.39, 0.39, 0.39, 1]);
      mdgl.uniform4fv(mdLocations.color2, fromRGB([44, 143, 219, 1]));
      mdgl.uniform4fv(mdLocations.color3, fromRGB([219, 44, 44, 1]));
      mdgl.uniform4fv(mdLocations.color4, [0.7, 0.7, 0.7, 1]);
      mdgl.uniform4fv(mdLocations.color5, [1, 1, 1, 1]);
      mdgl.uniform4fv(mdLocations.color6, fromRGB([204, 44, 219, 1]));
      mdgl.uniform1f(mdLocations.worldUnitX, (worldUnitX / 4) + (worldUnitY / 4));
      mdgl.uniform1f(mdLocations.worldUnitY, (worldUnitX / 4) + (worldUnitY / 4));
      mdgl.vertexAttrib2fv(mdLocations.point, [0.01,0.01]);

                let t = mdgl.createTexture();

                mdgl.bindTexture(mdgl.TEXTURE_2D, t);
                mdgl.texImage2D(mdgl.TEXTURE_2D, 0, mdgl.RGBA, mdgl.RGBA, mdgl.UNSIGNED_BYTE, document.querySelector("#world-map"));
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_MAG_FILTER, mdgl.LINEAR);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_MIN_FILTER, mdgl.LINEAR);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_WRAP_S, mdgl.CLAMP_TO_EDGE);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_WRAP_T, mdgl.CLAMP_TO_EDGE);

                let t2 = mdgl.createTexture();

                mdgl.bindTexture(mdgl.TEXTURE_2D, t2);
                mdgl.texImage2D(mdgl.TEXTURE_2D, 0, mdgl.RGBA, mdgl.RGBA, mdgl.UNSIGNED_BYTE, document.querySelector("#pinpoint"));
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_MAG_FILTER, mdgl.LINEAR);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_MIN_FILTER, mdgl.LINEAR);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_WRAP_S, mdgl.CLAMP_TO_EDGE);
                mdgl.texParameteri(mdgl.TEXTURE_2D, mdgl.TEXTURE_WRAP_T, mdgl.CLAMP_TO_EDGE);

      return {
          buffer: mdgl.createBuffer(),
          vao: mdglExt.createVertexArrayOES(),
          ext: mdglExt,
          locations: mdLocations,
          texture: t,
          texture2: t2
      };
  }

  function renderDisplayContext(ctx, props) {
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      props.ext.bindVertexArrayOES(props.vao);

      ctx.uniform1f(props.locations.scale, ($MAP_DISPLAY.useInteractiveDisplay) ? (!$MAP_DISPLAY.useWorldMap) ? $MAP_DISPLAY.interactiveScale:$MAP_DISPLAY.worldMapScale : $MAP_DISPLAY.scale);
      ctx.uniform2fv(props.locations.translation, [($MAP_DISPLAY.useWorldMap) ? -$MAP_DISPLAY.worldMapOffset.x:(-$CURRENT_MAP.centerX - $MAP_DISPLAY.displayOffset.x), ($MAP_DISPLAY.useWorldMap) ? $MAP_DISPLAY.worldMapOffset.y:(-$CURRENT_MAP.centerY + $MAP_DISPLAY.displayOffset.y)]);

      ctx.activeTexture(ctx.TEXTURE0);
      ctx.bindTexture(ctx.TEXTURE_2D, props.texture);
      ctx.activeTexture(ctx.TEXTURE1);
      ctx.bindTexture(ctx.TEXTURE_2D, props.texture2);

      let bufferData = [...$MAP_DISPLAY.objectsVertices, ...$MAP_DISPLAY.avatarsVertices];

      if ($MAP_DISPLAY.useWorldMap) bufferData = [...$MAP_DISPLAY.mapVertices];

      ctx.bindBuffer(ctx.ARRAY_BUFFER, props.buffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(bufferData), ctx.DYNAMIC_DRAW);

      ctx.vertexAttribPointer(props.locations.coords, 3, ctx.FLOAT, false, 32, 0);
      ctx.vertexAttribPointer(props.locations.color, 1, ctx.FLOAT, false, 32, 12);
      ctx.vertexAttribPointer(props.locations.point, 2, ctx.FLOAT, false, 32, 16);
      ctx.vertexAttribPointer(props.locations.tcoords, 2, ctx.FLOAT, false, 32, 24);
      ctx.enableVertexAttribArray(0);
      ctx.enableVertexAttribArray(1);
      ctx.enableVertexAttribArray(2);
      ctx.enableVertexAttribArray(3);

      if (!$MAP_DISPLAY.useWorldMap) {
       ctx.disableVertexAttribArray(2);
       ctx.disableVertexAttribArray(3);
      }   

      ctx.drawArrays(ctx.TRIANGLES, 0, bufferData.length / 8);

      if ($MAP_DISPLAY.useWorldMap) {
       bufferData = [...$MAP_DISPLAY.pinpointVertices];

       ctx.bindBuffer(ctx.ARRAY_BUFFER, props.buffer);
       ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(bufferData), ctx.DYNAMIC_DRAW);
      
       ctx.drawArrays(ctx.TRIANGLES, 0, bufferData.length / 8);
      }

      if ($MAP_DISPLAY.waypoint.set && $CURRENT_MAP.id === $MAP_DISPLAY.waypoint.map && !$MAP_DISPLAY.useWorldMap) {
          if (distance($CURRENT_MAP.centerX, $CURRENT_MAP.centerY, $MAP_DISPLAY.waypoint.x, $MAP_DISPLAY.waypoint.y) < 30) {
              toggleWaypoint();
              return;
          }
          ctx.bindBuffer(ctx.ARRAY_BUFFER, props.buffer);
          ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([...$MAP_DISPLAY.waypointVertices]), ctx.DYNAMIC_DRAW);
          ctx.vertexAttribPointer(props.locations.coords, 3, ctx.FLOAT, false, 16, 0);
          ctx.vertexAttribPointer(props.locations.color, 1, ctx.FLOAT, false, 16, 12);
          ctx.enableVertexAttribArray(0);
          ctx.enableVertexAttribArray(1);

          ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, ($MAP_DISPLAY.waypointVertices.length) / 4);
      }
  }

  $MAP_DISPLAY = {
      scale: 2,
      interactiveScale: 7,
      worldMapScale: 7,
      useInteractiveDisplay: false,
      useWorldMap: false,
      displayOffset: {
          x: 0,
          y: 0
      },
      worldMapOffset: {
          x: 0, 
          y: 0
      },
      objectsVertices: [],
      avatarsVertices: [],
      waypointVertices: [],
      pinpointVertices: [],
      mapVertices: [-600,300,1,0,0.01,0.01,0,0,600,300,1,0,0.01,0.01,1,0,-600,-300,1,0,0.01,0.01,0,1,600,300,1,0,0.01,0.01,1,0,-600,-300,1,0,0.01,0.01,0,1,600,-300,1,0,0.01,0.01,1,1],
      waypoint: {
          x: 0,
          y: 0,
          set: false,
          map: undefined
      },
      colorCodes: {
          "door": 5,
          "building": 5,
          "visible barrier": 4,
      },
      updateWaypoint: function(x1, y1, x2, y2) {
          $MAP_DISPLAY.waypointVertices = [x1, y1, 1, 6, x1, y1 + 5, 1, 6, x2, y2, 1, 6, x2, y2 + 5, 1, 6, x1 + 5, y1, 1, 6, x1, y1, 1, 6, x2, y2, 1, 6, x2 + 5, y2, 1, 6];
      },
      addObject: function(obj) {
          let {
              offsetX,
              offsetY
          } = obj.trans, color = this.colorCodes[obj.name] || this.colorCodes[obj.type] || 1;

          this.objectsVertices = this.objectsVertices.concat(cut([
              [((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]
          ], false, [1, color, 0, 0, 0, 0], true));
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

              let {
                  offsetX,
                  offsetY
              } = obj.trans, color = this.colorCodes[obj.name] || this.colorCodes[obj.type] || 1;

              if (renderAvatars) {
                  this.avatarsVertices = this.avatarsVertices.concat(cut([
                      [((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]
                  ], false, [1, (obj.state.hostile) ? 3 : 2, 0, 0, 0, 0], true));
                  continue;
              }

              this.objectsVertices = this.objectsVertices.concat(cut([
                  [((-obj.width / 2) + offsetX) + $CURRENT_MAP.centerX, ((-obj.height / 2) + offsetY) + $CURRENT_MAP.centerY, obj.width, obj.height]
              ], false, [1, color, 0, 0, 0, 0], true));
          }

          if (this.waypoint.set) this.updateWaypoint($CURRENT_MAP.centerX, $CURRENT_MAP.centerY, this.waypoint.x, this.waypoint.y);
      },
      addPinpoint: function(x,y) {
        this.pinpointVertices.push(-8,16,1,0.5,x,y,0,0,8,16,1,0.5,x,y,1,0,-8,-16,1,0.5,x,y,0,1,8,16,1,0.5,x,y,1,0,-8,-16,1,0.5,x,y,0,1,8,-16,1,0.5,x,y,1,1);
      }, 
      render: function() {
          if (this.useInteractiveDisplay) {
              renderDisplayContext(mdContext2, mdContextProperties2);
              return;
          }
          renderDisplayContext(mdContext1, mdContextProperties1);
      }
  }

  $MAP_DISPLAY.addPinpoint(0,0);
  $MAP_DISPLAY.addPinpoint(-377,80);
  $MAP_DISPLAY.addPinpoint(-190,240);
  $MAP_DISPLAY.addPinpoint(-159,220);
  $MAP_DISPLAY.addPinpoint(61,172);
  $MAP_DISPLAY.addPinpoint(-412,55);
  $MAP_DISPLAY.addPinpoint(-313,39);
  $MAP_DISPLAY.addPinpoint(-297,8);
  $MAP_DISPLAY.addPinpoint(-268,75);
  $MAP_DISPLAY.addPinpoint(-292,-51);
  $MAP_DISPLAY.addPinpoint(-327,-19);
  $MAP_DISPLAY.addPinpoint(-544,-184);
  $MAP_DISPLAY.addPinpoint(-480,136);
  $MAP_DISPLAY.addPinpoint(-416,170);
  $MAP_DISPLAY.addPinpoint(-304,177);
  $MAP_DISPLAY.addPinpoint(-340,192);
  $MAP_DISPLAY.addPinpoint(-409,114);
  $MAP_DISPLAY.addPinpoint(-253,-192);
  $MAP_DISPLAY.addPinpoint(-220,-178);
  $MAP_DISPLAY.addPinpoint(-49,54);
  $MAP_DISPLAY.addPinpoint(338,144);
  $MAP_DISPLAY.addPinpoint(408,86);
  $MAP_DISPLAY.addPinpoint(398,-151);
  $MAP_DISPLAY.addPinpoint(451,-172);
  $MAP_DISPLAY.addPinpoint(543,167);

  const mdContextProperties1 = setDisplayContext(mdContext1);
  const mdContextProperties2 = setDisplayContext(mdContext2);

  window.updateDisplayViewport = function() {
      let {
          width,
          height
      } = interactiveMap.getBoundingClientRect();
      let maxVi = Math.max(width, height),
          minVi = Math.min(width, height);
      let viRatio = maxVi / minVi;
      let viUnitX = (maxVi === width) ? 0.01 + (0.01 / viRatio) : 0.01 + (0.01 * viRatio);
      let viUnitY = (maxVi === width) ? 0.01 + (0.01 * viRatio) : 0.01 + (0.01 / viRatio);

      mdContext2.uniform1f(mdContextProperties2.locations.worldUnitX, viUnitX);
      mdContext2.uniform1f(mdContextProperties2.locations.worldUnitY, viUnitY);

      interactiveMap.width = width * 2;
      interactiveMap.height = height * 2;
      mdContext2.viewport(0, 0, width * 2, height * 2);
  }


  function toggleWaypoint(e) {
      if (e) e.preventDefault();
      if ($MAP_DISPLAY.useWorldMap) return;

      if (!$MAP_DISPLAY.waypoint.set) {
          $MAP_DISPLAY.waypoint.x = $CURRENT_MAP.centerX + $MAP_DISPLAY.displayOffset.x;
          $MAP_DISPLAY.waypoint.y = $CURRENT_MAP.centerY - $MAP_DISPLAY.displayOffset.y;
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

    if (!$MAP_DISPLAY.useWorldMap) {
      if ($MAP_DISPLAY.interactiveScale - 0.5 > 1) $MAP_DISPLAY.interactiveScale -= 0.5;
    } else {
      if ($MAP_DISPLAY.worldMapScale - 0.5 > 1) $MAP_DISPLAY.worldMapScale -= 0.5;
    }
  }

  function mapZoomOut(e) {
      e.preventDefault();

    if (!$MAP_DISPLAY.useWorldMap) {
      if ($MAP_DISPLAY.interactiveScale + 0.5 < 15) $MAP_DISPLAY.interactiveScale += 0.5;
    } else {
      if ($MAP_DISPLAY.worldMapScale + 0.5 < 15) $MAP_DISPLAY.worldMapScale += 0.5;
    }
  }

  mapZoomInButton.ontouchstart = mapZoomIn;
  mapZoomInButton.onmousedown = mapZoomIn;

  mapZoomOutButton.ontouchstart = mapZoomOut;
  mapZoomOutButton.onmousedown = mapZoomOut;

  /* MONEY DISPLAY */

  const moneyDisplay = document.querySelector("#money");
  moneyDisplay.innerText = Math.round(localStorage.getItem("player-cash")) || 0;

  window.updateMoneyDisplay = function() {
   moneyDisplay.innerText = Math.round($AVATAR.inventory.cash);
   localStorage.setItem("player-cash", $AVATAR.inventory.cash.toString());
  }

  /* AMMO BUTTON AND RELOAD FUNCTIONALITY */

  let ammoDisplay = document.querySelector("#ammo-display");

  ammoDisplay.onmousedown = function() {
      $AVATAR.reload();
  }

  ammoDisplay.ontouchstart = function() {
      $AVATAR.reload();
  }

  window.showAmmoDisplay = function() {
      ammoDisplay.style.display = "flex";
  }

  window.hideAmmoDisplay = function() {
      ammoDisplay.style.display = "none";
  }

  window.disableReloadDisplay = function() {
      document.querySelector("#ammo-display img").style.display = "none";
      document.querySelector("#ammo-display div").style.display = "flex";
  }

  window.enableReloadDisplay = function() {
      document.querySelector("#ammo-display div").style.display = "none";
      document.querySelector("#ammo-display img").style.display = "block";
  }

  window.updateAmmoDisplay = function() {
      let gun = $AVATAR.state.equippedItems.mainTool;

      ammoDisplay.querySelector("p").style.color = (gun.constructor._properties.capacity === gun.reloadProgress) ? "#e30f00" : "white";
      ammoDisplay.querySelector("p").innerText = `${Math.min(gun.constructor._properties.capacity - gun.reloadProgress, $AVATAR.inventory.weapons[gun.name].ammo)}/${$AVATAR.inventory.weapons[gun.name].ammo}`;
  }

  /* ARMOUR DISPLAY FUNCTIONALITY */

  let armourDisplay = document.querySelector("#armour-display");

  window.showArmourDisplay = function() {
      armourDisplay.style.display = "flex";
  }

  window.hideArmourDisplay = function() {
      armourDisplay.style.display = "none";
  }

  window.updateArmourDisplay = function() {
    armourDisplay.querySelector("p").innerText = `${$AVATAR.state.armour}`;
  }


  /* HEALTH BAR DISPLAY */

  $HEALTH_BAR = document.querySelector("#healthbar");

  window.updateHealthBar = function() {
      $HEALTH_BAR.style.width = `${Math.round(aisofb($AVATAR.state.vitals.health,100))}%`;
  }

  /* JOYSTICK AND BUTTON CONTROLS LOGIC */


  $JOYSTICK_L = new _Joystick_(true, joystickSizes.left, fixedJoysticks, joystickPositions.left);

  if ($IS_MOBILE) {

  $JOYSTICK_R = new _Joystick_(false, joystickSizes.right, fixedJoysticks, joystickPositions.right);

  $RELOAD_BUTTON = new _Button_(textures.controls.reloadbutton, textures.controls.reloadbuttonactive, (worldWidth / 2) - 38, -(worldHeight / 2) + 20, function(pX, pY) {
      if (this.enabled) {
          $AVATAR.reload();
          this.enabled = false;
      }
  }, 8.5, 1.4, false, [-6, 6, 1, 0, 0, 6, 6, 1, 0.9375, 0, -6, -6, 1, 0, 0.9375, 6, 6, 1, 0.9375, 0, -6, -6, 1, 0, 0.9375, 6, -6, 1, 0.9375, 0.9375]);
  $RELOAD_BUTTON.hidden = true;

  $AVATAR_MODE_BUTTON = new _Button_(textures.controls.avatarmode2, textures.controls.avatarmode1, (worldWidth / 2) - 10, (worldHeight / 2) - 15, function(pX, pY) {
      this.on = !this.on;
      $AVATAR.state.hostile = !$AVATAR.state.hostile;
  }, 9, 1.5, true, [-4.5, 4.5, 1, 0, 0, 4.5, 4.5, 1, 0.703125, 0, -4.5, -4.5, 1, 0, 0.703125, 4.5, 4.5, 1, 0.703125, 0, -4.5, -4.5, 1, 0, 0.703125, 4.5, -4.5, 1, 0.703125, 0.703125]);
  $AVATAR_MODE_BUTTON.hidden = true;

  $DROP_ITEM_BUTTON = new _Button_(textures.controls.dropitem1, textures.controls.dropitem2, (worldWidth / 2) - 35, -(worldHeight / 2) + 30, function(pX, pY) {
      $AVATAR.drop();
  }, 8.5, 1.4, false, [-6, 6, 1, 0, 0, 6, 6, 1, 0.9375, 0, -6, -6, 1, 0, 0.9375, 6, 6, 1, 0.9375, 0, -6, -6, 1, 0, 0.9375, 6, -6, 1, 0.9375, 0.9375]);
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

      if (!buttonPress && !$ACTIVE_DIALOGUE_PARTY) moveJoystick(e);
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

  window.addEventListener("contextmenu", function(e) {
      e.preventDefault();
  });
}

  /* INVENTORY CONTROLS AND MANAGMENT LOGIC */

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
      updateDescription();
  }

  inventoryCloseButton.onmousedown = closeInventory;
  inventoryButton.onmousedown = openInventory;

  inventoryCloseButton.ontouchstart = closeInventory;
  inventoryButton.ontouchstart = openInventory;


  /* CONSOLE CONTROLS AND COMMAND LOGIC */

  const consoleContainer = document.querySelector("#console");
  const consoleButton = document.querySelector("#console-button");
  const consoleCloseButton = document.querySelector("#console-close");
  const consoleSendButton = document.querySelector("#console-send");
  const consoleInput = document.querySelector("#console-input");
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

  const itemPlacementQueue = [];

  const placeItemButton = document.querySelector("#place-item");

  placeItemButton.onmousedown = placeItem;
  placeItemButton.ontouchstart = placeItem;

  function placeItem(e) {
      e.preventDefault();
      if (itemPlacementQueue.length) {
          let item = itemPlacementQueue.pop();

          item.translate($MAP_DISPLAY.displayOffset.x, -$MAP_DISPLAY.displayOffset.y);
          $CURRENT_MAP.link(item);

          if (!itemPlacementQueue.length) placeItemButton.style.display = "none";
      }
  }

  function sendSystemMessage(content = "Script ran sucessfully.") {
      let msg = consoleMessageTemplate.content.cloneNode(true);

      if (content.length < 1) return;

      msg.querySelector("div").setAttribute("class", "console__message--system");
      msg.querySelector("strong").innerHTML = "WTRW@System: ";
      msg.querySelector("i").innerText = content;
      consoleMessages.appendChild(msg);
  }

  function evalCommand(cmd) {
      let command = cmd.replace("cmd", "").trim(),
          result = "command not found!",
          prefix = command.split(" ")[0];

      command = command.replace(prefix, "").trim();

      switch (prefix) {
          case "maximize": {
              document.body.requestFullscreen();
          };
          break;
          case "run": {
              try {
                  result = eval(command);
              } catch (err) {
                  result = `Couldn't run that script! Error: ${err}`;
              }
          };
          break;
          case "carry": {
            $CURRENT_MAP.CARRY = $CURRENT_MAP.locateObject(command) || undefined; 
            result = `Carrying ${command || "nothing"}...`;
            $MAP_DISPLAY.update();
          };
          break; 
          case "add": {
              try {
                  $CURRENT_MAP.link(eval("new " + command.replace("add", "").trim()));
                  result = command + " added."
              } catch (err) {
                  result = "Object not found!";
              }
          };
          break;
          case "place": {
              try {
                  itemPlacementQueue.unshift(eval("new " + command.replace("add", "").trim()));
                  placeItemButton.style.display = "inline-block";
                  result = command + " added to placement queue. Use '+' on the selected map coordinates."
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
              result = "God mode " + (($AVATAR.state.invinsible) ? "activated." : "deactivated.");
          };
          break;
          case "printlayout": {
              result = $MAP.printLayoutScript();
          };
          break;
          case "noclip": {
              noclip = !noclip;
              result = "No clip " + ((noclip) ? "activated." : "deactivated.");
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

      msg.querySelector("div").addEventListener("dblclick", (e) => {
          consoleInput.value = content;
      });

      if (content.length < 1) return;

      msg.querySelector("strong").innerHTML = $AVATAR.character + "@User: ";
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


  /* DATA BINDING FOR INVENTORY */

  const itemDescriptions = {
      default: "<strong>Pro tip:</strong> Click an item to select it and see a full description of its properties and usage.</br></br>Oh wait, what items? You're a noob lol.",
      "glock 20": "<h3><u>GLOCK 20</u></h3>A simple, compact and lightweight handgun built for self defense and petty crime. Careful, there's no saftey!",
      "usp 45": "<h3><u>USP 45</u></h3>Powerful high powered scilenced pistol. The most elegible option for a slick assassin.",
      "nxr 44 mag": "<h3><u>NXR_44_MAG</u></h3>High powered, large revolver. Go play sheriff with this I guess. This town ain't big enough for...nevermind.",
      "gp k100": "<h3><u>GP K100</u></h3>This quick and reliable handgun features good capacity, and a basic scilencer and is perfect for a good ol' gun-fight.",
      "kc 357": "<h3><u>KC 357</u></h3> Need a reliable side arm? Try this lightweight revolver with good durability and a long lasting build. Sensetive trigger so, watch it bro. Don't really have anything funny to say here.",
      "kitchen knife": "<h3><u>Kitchen Knife</u></h3>Your run-of-the-mill, single edged cooking knife. Go use this to slice some veggies...or somthing else.",
      "assassins knife": "<h3><u>Assassin's Knife</u></h3>One of the sharpest of blades with a fine edge built for the hand of a professional. This top-of-the-line knife can make quick work of any enemy with minimal armour.",
      "syringe": "<h3><u>Syringe</u></h3>Basic medicine for rapid health regain and quick injection.",
      "med kit": "<h3><u>Med Kit</u></h3>A fully equipped medical store, good for thorough treatment of injuries and heavy health regain. A couple of these on hand will keep your medicinal needs covered. And I know what you're thinking..the answer is no. You can't drink rubbing alcohol.",
      "grey backpack": "<h3><u>Grey Backpack</u></h3>A light backpack. Essential for collecting useful items to ensure survival.",
      "white backpack": "<h3><u>White Backpack</u></h3>Intermediate backpack with high capacity. A preference for many tacticians.",
      "black backpack": "<h3><u>Black Backpack</u></h3>This heavy-duty, military-grade backpack is the clear choice for professionals of all expertises. Never again will you have to decide between what to keep, and what to drop.",
      "ammo box": "<h3><u>Ammo Box</u></h3>Best for a quick bullet refill in the middle of intense battel. Use this to increase the bullet count for the currently equipped weapon by a given factor.",
      "multi ammo box": "<h3><u>Multi Ammo Box</u></h3>An army grade ammunition store, with a variety of calibers for all types of arms. Use this to increase the bullet count for all weapons in your inventory by a given factor.",
      "basic armour": "<h3><u>Basic Armour</u></h3>Lightweight armour built for protection from close calls and bullet scathes. I mean, I wouldn't go looking for trouble or anything with this on though. Then again, pfft, do whatever you want lol.",
      "mercenary armour": "<h3><u>Mercenary Armour</u></h3>Top quality armour made to withstand large blows. Used by soldiers, mercenaries, S.W.A.T and now you. You're in the big leagues now son.",
      "swat armour": "<h3><u>S.W.A.T Armour</u></h3>Ok, I now I know I used S.W.A.T. in the description for the mercenary armour but, hear me out...I ran out of soldier names. Look just, point is, this is some decent armour. not the best, but decent. Shut up and wear it.",
      "dx 9": "<h3><u>DX 9</u></h3> High end handgun built to be light and reliable, and features a light trigger which alows for no hesitation. High capacity, quick fire and decent damage. You can't beat it!",
      "x6 91": "<h3><u>X6 91</u></h3> A powerful firearm made for battling multiple foes with heavy armour. Moderate capacity, sky-high damage. Try this one on for size.",
      "noss 7": "<h3><u>NOSS 7</u></h3> This scilenced pistol puts most others to shame by taking speed to the next level. It features an extended magazine allowing for a split-second mag dump of epic proportions. Not very accurate though.",
      "furs 55": "<h3><u>FURS 55</u></h3> Try on this oldschool revolver pulled right out of a Clint Eastwood film. Good capacity and acceptable damage. Take of that what you will.",
      "remote detonator": "<h3><u>Remote Detonator</u></h3> Use <i>\"Equip\"</i> on this object to detonate all currently armed explosives. </br></br>Don't lose this, because you'll only ever need one.",
      "remote explosive": "<h3><u>Remote Explosive</u></h3> A powerful nitroglycerin based explosive, used for building traps and taking out a large number of enemies.</br></br> Use <i>\"Equip\"</i> to arm and place the explosive. You'll need a <i>Remote Detonator</i> to detonate it.</br></br>Careful, you'll want to stand way back.",
      "proximity explosive": "<h3><u>Proximity Explosive</u></h3> A powerful C-4 based explosive rigged to a motion sensor.</br></br> Use <i>\"Equip\"</i> to arm and place the explosive. Any enemy within close proximity will cause the explosive to detonate, no remote needed. </br></br>The sensor will be active 3 seconds after being armed.",
      "combat knife": "<h3><u>Combat Knife</u></h3> A common choice of melee used by hunters to mercy-kill deer, and by soldiers to get the job done. Features good durabilty, and good damage.",
      "money": "<h3><u>Money</u></h3> It's money. If you need me to explain any further you probably shouldn't have it. Use <i>\"Equip\"</i> to add the specified amount into your cash balance."
  }

  let equippedIndex = Infinity,
      selectedIndex = undefined,
      lastIndex = undefined,
      switchMode = false;

  function equipSlot(i) {
      if (!$AVATAR.equipItem(i)) return;
      if ($IS_MOBILE && $AVATAR.state.equippedItems.mainTool && $AVATAR.state.equippedItems.mainTool.type === "gun") {
        $AVATAR.drawWeapon();
      }

      if (equippedIndex < 5) {
          quickAccessItems.item(equippedIndex).classList.remove("controls-container__item--equipped");
      }
      inventoryItems.item(equippedIndex).style.borderBottom = "none";

      if (equippedIndex !== i) {
          if (i < 5) {
              quickAccessItems.item(i).classList.add("controls-container__item--equipped");
          }
          inventoryItems.item(i).style.borderBottom = "3px solid white";

          equippedIndex = i;
      } else {
          $AVATAR.unequipItem(i);
          equippedIndex = Infinity;
      }

      updateDescription();
  }

  const quickAccessItems = document.querySelectorAll(".controls-container__item");
  let inventoryItems = document.querySelectorAll(".main-inventory__item");
  const controlButtonsContainer = document.querySelector(".main-inventory__buttons");
  const itemDescription = document.querySelector(".main-inventory__description-content");
  let controlSwitchButton;

  window.updateDescription = function(getDescription, itemData) {

      let item = itemData || $AVATAR.inventory.items[lastIndex];
      let itemName = item?.name;

      let d = itemDescriptions[itemName] || itemDescriptions["default"];

      if (item && d) {
         if (item.type === "cash") {
              d = d + `</br></br><strong>Amount _____ ${item.amount}$</strong>`;
         } else if (item.type === "armour") {
              let {
                integrity
              } = item.constructor._properties;

              d = d + `</br></br><strong>Strength _____ ${item.constructor._properties.strength}</strong>`;

              if (getDescription) return d;

              d = d.concat((item === $AVATAR.state.equippedItems.armour) ? "<br><br><i>Equipped</i>" : "<br><br><i>Not Equipped</i>");

              d = d.concat(`</br><i>Integrity ${Math.round(aisofb(item.integrity,item.constructor._properties.strength))}%</i>`);
         } else if (item.type === "ammo") {
              let {
                increase
              } = item.constructor._properties;

              d = d + `</br></br><strong>Increase _____ capacity x${increase}</strong>`;

              if (getDescription) return d;

              d = d.concat((item.used) ? "<br><br><i>Empty</i>" : "<br><br><i>Full</i>");
         } else if (item.type === "medicine") {
              let {
                  regain
              } = item.constructor._properties;

              d = d + `</br></br><strong>Regain _____ ${regain}</strong>`;

              if (getDescription) return d;

              d = d.concat((item.used) ? "<br><br><i>Used</i>" : "<br><br><i>New</i>");
          } else if (item.type === "backpack") {
              let {
                  capacity
              } = item.constructor._properties;

              d = d + `</br></br><strong>Capacity _____ ${capacity}</strong>`;

              if (getDescription) return d;

              d = d.concat((item === $AVATAR.state.equippedItems.mainTool || item === $AVATAR.state.equippedItems.accessory1) ? "<br><br><i>Equipped</i>" : "<br><br><i>Not Equipped</i>");

          } else if (item.type === "knife") {
              let {
                  damage, 
                  durability
              } = item.constructor._properties;

              d = d + `</br></br><strong>Damage _____ ${damage}</strong></br><strong>Durability _____ ${durability}</strong>`;

              if (getDescription) return d;

              d = d.concat((item === $AVATAR.state.equippedItems.mainTool || item === $AVATAR.state.equippedItems.accessory1) ? "<br><br><i>Equipped</i>" : "</br></br><i>Not Equipped</i>");
              d = d.concat(`</br><i>Integrity ${item.integrity}%</i>`);

          } else if (item.type === "gun") {
              let {
                  damage,
                  fireRate,
                  accuracy,
                  capacity
              } = item.constructor._properties;

              d = d + `</br></br><strong>Damage _____ ${damage}</strong></br><strong>Fire Rate _____ ${fireRate}</strong></br><strong>Accuracy _____ ${accuracy}</strong></br><strong>Capacity _____ ${capacity}</strong>`;

              if (getDescription) return d;

              d = d.concat((item === $AVATAR.state.equippedItems.mainTool || item === $AVATAR.state.equippedItems.accessory1) ? "<br><br><i>Equipped</i>" : "<br><br><i>Not Equipped</i>");
          }
      }

      if (getDescription) return d;

      itemDescription.innerHTML = d;
  }

  function selectSlot(i) {
      if (!$AVATAR.inventory.items[i] && !switchMode) return;

      controlButtonsContainer.style.opacity = 1;
      inventoryItems.item(selectedIndex).style.backgroundColor = "rgba(0,0,0,0.2)";
      inventoryItems.item(i).style.backgroundColor = "rgba(0,0,0,0.4)";

      if (switchMode) {
          $AVATAR.inventory.swapItems(selectedIndex, i);
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
      lastIndex = i;

      updateDescription();
  }

  window.setInventoryCapacity = function(n) {
      if (n > $AVATAR.inventory.slots) {
          for (let i = $AVATAR.inventory.slots + 1; i <= n; i++) {
              let slot = document.createElement("div");
              slot.setAttribute("id", `inv-item-${i}`);
              slot.setAttribute("class", "main-inventory__item");
              slot.onclick = function() {
                  selectSlot(i - 1);
              }

              inventoryItemsContainer.appendChild(slot);
          }
      } else if (n < $AVATAR.inventory.slots) {
          for (let i = n; i < $AVATAR.inventory.slots; i++) {
              inventoryItems.item(i).remove();
          }
      }

      inventoryItems = document.querySelectorAll(".main-inventory__item");
      $AVATAR.inventory.slots = n;

      if (selectedIndex > 14) selectedIndex = 0;
  }


  for (let i = 0; i < quickAccessItems.length; i++) {
      quickAccessItems.item(i).ontouchstart = function(e) {
          e.preventDefault();
          equipSlot(i);
      }

      quickAccessItems.item(i).onclick = function(e) {
          e.preventDefault();
          equipSlot(i);
      }
  }

  for (let i = 0; i < inventoryItems.length; i++) {
      inventoryItems.item(i).onclick = function() {
          selectSlot(i);
      }
  }

  window.updateInventoryItem = function(slot, name, drop) {
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
          quickAccessItems.item(slot).classList.remove("controls-container__item--equipped");
          quickAccessItems.item(slot).style.backgroundImage = `none`;
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

      lastIndex = undefined;
      updateDescription();
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


  const switchMap = document.querySelector("#switch-map");
  const goTo = document.querySelector("#goto");

  switchMap.onclick = function() {
       if (!$MAP_DISPLAY.useWorldMap) {
        $MAP_DISPLAY.useWorldMap = true;
        goTo.style.opacity = 1;
        setWaypointButton.style.opacity = 0.5; 
        switchMap.innerText = "Local Map"; 
          
        updateCoordinates($MAP_DISPLAY.worldMapOffset.x, $MAP_DISPLAY.worldMapOffset.y);
        return;
       }
  
       $MAP_DISPLAY.useWorldMap = false; 
       goTo.style.opacity = 0.5;
       setWaypointButton.style.opacity = 1; 
       switchMap.innerText = "World Map";
 
       updateCoordinates($MAP_DISPLAY.displayOffset.x, $MAP_DISPLAY.displayOffset.y);
  }

// Store controls

const storeContainer = document.querySelector("#store");
const closeStoreButton = document.querySelector("#store-close");
const storeItemsContainer = document.querySelector(".store__items");
const storeItemTemplate = document.querySelector("#store-item-template");

let currentStoreItem = undefined;
let highlightedItem = undefined;

closeStoreButton.onclick = function() {
 toggleStore();
}

window.toggleStore = function(s) {
if (storeContainer.style.display !== "grid") {
 document.querySelector("#store-cash").innerHTML = "$"+Math.round($AVATAR.inventory.cash);
 document.querySelector("#store-bank").innerHTML = "$"+Math.round($AVATAR.inventory.bank);
 storeContainer.style.display = "grid";
 return;  
} 
 storeContainer.style.display = "none";
}

function updateStore(s) {
 let items = storeItemsContainer.querySelectorAll(".store__item");
 
 currentStoreItem = s[0];

 items.forEach((item) => {
  item.remove();
 });

 for (let i of s) {
  let content = storeItemTemplate.content.cloneNode(true);
  let storeItem = content.querySelector(".store__item");

   if (i === s[0]) {
    highlightedItem = storeItem;
    highlightedItem.style.background = "#555555";
   }
  
  storeItem.addEventListener("click",function() {
   updateCheckout(i);

   highlightedItem.style.background = "rgba(0,0,0,0.2)";
   highlightedItem = storeItem;
   highlightedItem.style.background = "#555555";
  });

  content.querySelector(".item__icon").setAttribute("src",`/public/images/icons/${i.name.replaceAll(" ","_")}_icon.png`);
  content.querySelector(".item__name").innerText = i.title;

  storeItemsContainer.appendChild(content);
 }

 updateCheckout(currentStoreItem);
}

const itemTitle = document.querySelector(".item__title u"); 
const itemPrice = document.querySelector(".item__price"); 
const itemIcon = document.querySelector(".info-box__icon");
const itemTotal = document.querySelector("#item-total");
const infoDescription = document.querySelector(".info-box__description p");
const itemQuantity = document.querySelector("#item-quantity");
const purchaseButton = document.querySelector("#item-purchase");

function updateCheckout(storeItem) {
 let {name, title, price, type} = storeItem;

 itemTitle.innerText = title;
 itemPrice.innerText = "Price: $" + price;
 itemIcon.src = `/public/images/icons/${name.replaceAll(" ","_")}_icon.png`;
 itemTotal.innerText = "$" + price;
 infoDescription.innerHTML = updateDescription(true, {name: name, type: type, constructor: (type === "gun") ? eval(title.replaceAll(" ","_")):eval(title.replaceAll(" ",""))});

 itemQuantity.value = 1;
 currentStoreItem = storeItem;
}

 purchaseButton.onclick = function() {
 if (itemQuantity.value > ($AVATAR.inventory.slots - $AVATAR.inventory.count)) {
 toggleNote("Sorry, we couldn't make this purchase! You dont have enough space in your inventory to hold these items. Try dropping a few things you dont need.");
  return; 
 } else if (currentStoreItem.price > $AVATAR.inventory.cash) {
 toggleNote("You dont have enough money to make this purchase! Try getting a job you bum.");
  return; 
}

 for (let i = 0; i < itemQuantity.value; i++) {
  $AVATAR.addItem(eval(`new ${currentStoreItem.title.replaceAll(" ","")}`));
 }

 $AVATAR.inventory.cash -= currentStoreItem.price;
 updateMoneyDisplay();
 toggleNote(`Purchase successful! ${itemQuantity.value} ${currentStoreItem.name + ((itemQuantity.value > 1) ? "s were":" was")} added to your inventory.`);
}

itemQuantity.addEventListener("change",function() {
 itemTotal.innerText = "$" + Math.round(itemQuantity.value * currentStoreItem.price);
});

updateStore([
{name: "glock 20", title: "GLOCK_20", price: 50.00, type: "gun"}, 
{name: "kc 357", title: "KC_357", price: 45.50, type: "gun"}, 
{name: "gp k100", title: "GP_K100", price: 130.15, type: "gun"}, 
{name: "nxr 44 mag", title: "NXR_44_MAG", price: 233.50, type: "gun"}, 
{name: "usp 45", title: "USP_45", price: 543.50, type: "gun"}, 
{name: "dx 9", title: "DX_9", price: 385.00, type: "gun"}, 
{name: "noss 7", title: "NOSS_7", price: 880.50, type: "gun"},
{name: "x6 91", title: "X6_91", price: 742.30, type: "gun"},
{name: "furs 55", title: "FURS_55", price: 190.00, type: "gun"}, 
{name: "x6 91", title: "X6_91", price: 742.30, type: "gun"},  
{name: "kitchen knife", title: "KitchenKnife", price: 30.50, type: "knife"},
{name: "combat knife", title: "CombatKnife", price: 95.00, type: "knife"},
{name: "assassins knife", title: "AssassinsKnife", price: 420.90, type: "knife"},
{name: "remote explosive", title: "RemoteExplosive", price: 120.00, type: "explosive"},
{name: "proximity explosive", title: "ProximityExplosive", price: 185.00, type: "explosive"},
{name: "remote detonator", title: "RemoteDetonator", price: 342.00, type: "detonator"},
{name: "basic armour", title: "BasicArmour", price: 480.50, type: "armour"},
{name: "swat armour", title: "SwatArmour", price: 620.00, type: "armour"},
{name: "mercenary armour", title: "MercenaryArmour", price: 852.50, type: "armour"},
{name: "grey backpack", title: "GreyBackpack", price: 240.00, type: "backpack"},
{name: "white backpack", title: "WhiteBackpack", price: 380.40, type: "backpack"},
{name: "black backpack", title: "BlackBackpack", price: 520.00, type: "backpack"},
{name: "syringe", title: "Syringe", price: 42.00, type: "medicine"},
{name: "med kit", title: "MedKit", price: 120.00, type: "medicine"},
]);

// note logic 

const noteContainer = document.querySelector(".note-wrapper");
const closeNoteButton = document.querySelector("#note-close");
const noteContent = document.querySelector(".note__content p");
const noteTitle = document.querySelector(".note__content-title"); 
const noteImage = document.querySelector(".note__image");

let noteCallback;

window.toggleNote = function(content, callback, title, image) {
 noteContent.innerText = content;
 noteContainer.style.display = "flex";
 noteCallback = callback; 
 
 if (title) {
  noteTitle.style.display = "block"; 
  noteTitle.innerText = title; 
 } else {
  noteTitle.style.display = "none";
 }

 if (image) {
  noteImage.style.display = "block";  
  noteImage.src = image;
 } else {
  noteImage.style.display = "none";
 } 
}

closeNoteButton.addEventListener("click",() => {
 noteContainer.style.display = "none";
 if (noteCallback) noteCallback(); 
});

// desktop controls 
if (!$IS_MOBILE) { 

const desktopMovementFactor = 1;
let movementX = 0, movementY = 0;
let wKeyDown = false, aKeyDown = false, sKeyDown = false, dKeyDown = false, position = {x: $JOYSTICK_L.position.x, y: $JOYSTICK_L.position.y};

$JOYSTICK_L.desktopMovementCallback = function() {
 if ($ACTIVE_DIALOGUE_PARTY) return;

          if (wKeyDown && position.y) {
           position.y += desktopMovementFactor; 
          }
          if (aKeyDown) {
           position.x -= desktopMovementFactor;
          } 
          if (sKeyDown) {
           position.y -= desktopMovementFactor; 
          }
          if (dKeyDown) {
           position.x += desktopMovementFactor; 
          }

          let {
              width,
              height,
              x,
              y,
              radius
          } = $JOYSTICK_L.base;

          let d = distance(x, y, position.x, position.y),
              t = radius / d;

          if ($JOYSTICK_L.base.anchored) {
              if (d > radius) {
                  position.x = (((1 - t) * x) + (t * position.x));
                  position.y = (((1 - t) * y) + (t * position.y));
              }
          }

          if ((d < radius) || $JOYSTICK_L.base.anchored || $JOYSTICK_L.fixed) $JOYSTICK_L.translate(position.x, position.y);
}

let controlKeys = ["w", "a", "s", "d"];
let mouseDown = false; 

window.addEventListener("keydown", (e) => {
 if (consoleContainer.style.display === "grid") return; 

 if (e.code === "KeyR" && $AVATAR.state.equippedItems.mainTool) {
  $AVATAR.reload();
 }
 if (e.code === "KeyQ") {
  toggleGrab(e);
 }
 if (e.code === "KeyP") {
  $PAUSED = !$PAUSED;
 }
 if ($AVATAR.state.equippedItems.mainTool && e.code === "KeyX") {
  $AVATAR.dropItem($AVATAR.state.equippedItems.mainTool.slot);
 }
 if (/\d/.test(e.key.toLowerCase())) {
  equipSlot((Number(e.key)) ? Number(e.key - 1):9);
 }
 if (!controlKeys.includes(e.key.toLowerCase())) return; 

 eval(`${e.key.toLowerCase()}KeyDown = ${true}`);
 $JOYSTICK_L.desktopMovementAnimation.active = true; 
});

window.addEventListener("keyup", (e) => {
 if (!controlKeys.includes(e.key.toLowerCase())) return; 

 eval(`${e.key.toLowerCase()}KeyDown = ${false}`);
 if (!wKeyDown && !aKeyDown && !sKeyDown && !dKeyDown) {
   $AVATAR.state.walking = false;
   $JOYSTICK_L.desktopMovementAnimation.active = false; 
   $JOYSTICK_L.unanchor();
   $JOYSTICK_L.fix();
   position = {x: $JOYSTICK_L.position.x, y: $JOYSTICK_L.position.y};
 }
});

      canvas.addEventListener("mousemove", (e) => {
        if ($AVATAR.state.equippedItems.mainTool || $AVATAR.state.punching || $AVATAR.state.sitting || mouseDown) $AVATAR.trans.rotation = Math.atan2(e.pageX - (window.innerWidth/2), e.pageY - (window.innerHeight/2)) + 3.14159;
      });

      canvas.addEventListener("mousedown", () => {
         mouseDown = true; 
            if (!$AVATAR.state.pickup.current) {
                if ($AVATAR.state.armed) {
                    $AVATAR.state.fire = true;
                } else if ($AVATAR.state.melee) {
                    $AVATAR.state.stabbing = true;
                } else {
                    $AVATAR.state.punching = true;
                }
            } else {
                $AVATAR.state.fire = false;
                $AVATAR.state.punching = false;
                $AVATAR.state.stabbing = false;
            }
      });

      canvas.addEventListener("mouseup", () => {
            mouseDown = false; 
            $AVATAR.state.fire = false;
            $AVATAR.state.punching = false;
            $AVATAR.state.stabbing = false;
      });
}

window.updateCoordsDisplay = function() {
 document.querySelector("#coords").innerText = `x:${Math.round($CURRENT_MAP.centerX)}, y:${Math.round($CURRENT_MAP.centerY)}`;
}


const settings = document.querySelector("#settings");
const openSettingsButton = document.querySelectorAll(".controls-container__button").item(3);
const closeSettingsButton = document.querySelector("#settings-close");

function openSettings() {
 settings.style.display = "grid"; 
}

function closeSettings() {
 settings.style.display = "none";
}

openSettingsButton.onclick = openSettings;
closeSettingsButton.onclick = closeSettings;

const onscreenMapStyleSetting = document.querySelector("#onscreen-map-style-setting");
const zoomSetting = document.querySelector("#zoom-setting");
const graphicsQualitySetting = document.querySelector("#graphics-quality-setting");
const musicSetting = document.querySelector("#music-setting");
const volumeSetting = document.querySelector("#volume-setting");
const joysticksSetting = document.querySelector("#joysticks-setting");
const fullscreenSetting = document.querySelector("#fullscreen-setting");
const pauseSetting = document.querySelector("#pause-setting");

fullscreenSetting.onchange = function() {
 if (fullscreenSetting.checked) {
  document.body.requestFullscreen(); 
  return; 
 }
 document.exitFullscreen(); 
}

pauseSetting.onchange = function() {
 $PAUSED = pauseSetting.checked;
}

onscreenMapStyleSetting.selectedIndex = $SETTINGS.onscreenMapStyle;
zoomSetting.value = $SETTINGS.zoom;
graphicsQualitySetting.selectedIndex = $SETTINGS.graphicsQuality;
musicSetting.selectedIndex = $SETTINGS.music;
volumeSetting.value = $SETTINGS.volume*10;
joysticksSetting.selectedIndex = $SETTINGS.joysticks; 

onscreenMapStyleSetting.onchange = function() {
 $SETTINGS.onscreenMapStyle = onscreenMapStyleSetting.selectedIndex; 
 updateOnscreenMapStyle();
 saveSettings();
};

musicSetting.onchange = function() {
 $SETTINGS.music = musicSetting.selectedIndex;
 
 if ($SETTINGS.music) {
  currentTrack.pause();
 } else {
  playNextTrack();
 }

 saveSettings();
}

zoomSetting.onchange = function() {
 $SETTINGS.zoom = zoomSetting.value; 
 updateZoom();
 saveSettings();
}

volumeSetting.onchange = function() {
 $SETTINGS.volume = volumeSetting.value/10; 
 currentTrack.volume = $SETTINGS.volume; 
 saveSettings();
}

graphicsQualitySetting.onchange = function() {
 $SETTINGS.graphicsQuality = graphicsQualitySetting.selectedIndex;
 saveSettings();
}

joysticksSetting.onchange = function() {
 $SETTINGS.joysticks = joysticksSetting.selectedIndex;
 saveSettings();
}

function saveSettings() {
 localStorage.setItem("game-settings", JSON.stringify($SETTINGS));
}

function updateOnscreenMapStyle() {
 document.querySelector("#mapInfo").style.background = ["none", "red", "#00ff15", "#00fffb", "#ff8800"][$SETTINGS.onscreenMapStyle];
}

function updateZoom() {
 scale = zoomSetting.value;  
}

function applySettings() {
 updateOnscreenMapStyle();
}

applySettings();

window.updateCombatStats = function() {
 document.querySelector(".onscreen-stats__kills").innerText = $AVATAR.state.kills; 
 document.querySelector(".onscreen-stats__score").innerText = $SCORE; 
}

// title card

const titleCard = document.querySelector(".title-card-wrapper");
const titlePlayButton = document.querySelector(".play__button");
const usernameInput = document.querySelector(".play__username");
usernameInput.value = $PLAYER_NAME || "";
const onScreenPlayerName = document.querySelector(".onscreen-stats__player"); 
const scoreDisplay = document.querySelector(".content__score");
const highscoreDisplay = document.querySelector(".content__highscore");
highscoreDisplay.innerText = `Your current highscore: ${$HIGHSCORE}`;

titlePlayButton.onclick = function() {
if ($CONTENT_LOADED && !$TRANSITIONING) {
 titleCard.style.display = "none";
 onScreenPlayerName.innerText = usernameInput.value || "Unnamed Human";
 localStorage.setItem("player-name", usernameInput.value);
 $SPECTATING = false;
 $AVATAR.nameObj.update(usernameInput.value);
 $AVATAR.character = usernameInput.value; 
 $AVATAR.respawn();
}
}

const titleSettingsButton = document.querySelector(".buttons__settings");
titleSettingsButton.onclick = openSettings;

const titleHelpButton = document.querySelector(".buttons__help");
titleHelpButton.onclick = function() {
  toggleNote("Use 'E' on desktop or the 'A' button to interact with an object. The 'A' button at the right of the screen will light up with an interaction is avaliable when you're close enough to an object. This works when for things like entering doors or adding items to your inventory.", function() {
   toggleNote("Use 'Q' on desktop or the 'G' button to pick up an item to carry it. Use the key a second time to drop the item.", function() {
      toggleNote("Kill as many enemies as you can to gain the highest score possible. Use the gun store at the top of the map to buy and access more weapons.\n\nGo into settings to see more information on controls.", false, "Objective.", "/public/images/combat.png"); 
   }, "Grabbing", "/public/images/grabbing.png")
},"Interaction", "/public/images/interaction.png"); 
}

window.returnToTitleScreen = function() {
 titleCard.style.display = "flex";
 onScreenPlayerName.innerText = "- - - - -";
 $SPECTATING = true; 
 noclip = true; 

 if ($SCORE > $HIGHSCORE) {
  $HIGHSCORE = $SCORE;
  localStorage.setItem("highscore", $HIGHSCORE);
 }

 scoreDisplay.innerText = `Your score: ${$SCORE}`;
 scoreDisplay.style.display = "block";
 highscoreDisplay.innerText = `Your current highscore: ${$HIGHSCORE}`;

 $SCORE = 0;

 $AVATAR.state.kills = 0; 
 $AVATAR.state.totalDamage = 0;
 updateCombatStats(); 
}

