"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkWTRW"] = self["webpackChunkWTRW"] || []).push([["textures.chunk"],{

/***/ "./src/scripts/textures.js":
/*!*********************************!*\
  !*** ./src/scripts/textures.js ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ TextureContainer)\n/* harmony export */ });\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n// Texture managment\nvar TextureContainer = /*#__PURE__*/function () {\n  function TextureContainer() {\n    var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {\n      mipmap: false,\n      repeat: false\n    };\n    _classCallCheck(this, TextureContainer);\n    this.count = 0;\n    this.index = [];\n    this.settings = settings;\n  }\n  return _createClass(TextureContainer, [{\n    key: \"addTexture\",\n    value: function addTexture(name, src) {\n      var _this = this;\n      var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {\n        mipmap: undefined,\n        repeat: undefined,\n        context: undefined\n      };\n      var container = this,\n        gl = settings.context || window.gl;\n      return new Promise(function (res, rej) {\n        var img = new Image();\n        img.src = src;\n        var textureWrapS = (settings.repeat || _this.settings.repeat) && settings.repeat !== false ? gl.REPEAT : settings.textureWrapS || _this.settings.textureWrapS || gl.CLAMP_TO_EDGE;\n        var textureWrapT = (settings.repeat || _this.settings.repeat) && settings.repeat !== false ? gl.REPEAT : settings.textureWrapT || _this.settings.textureWrapT || gl.CLAMP_TO_EDGE;\n        var minFilter = settings.minFilter || _this.settings.minFilter || gl.LINEAR;\n        minFilter = (settings.mipmap || _this.settings.mipmap) && settings.mipmap !== false ? settings.minFilter || _this.settings.minFilter || gl.LINEAR_MIPMAP_NEAREST : minFilter;\n        var magFilter = settings.magFilter || _this.settings.magFilter || gl.LINEAR;\n        img.onload = function () {\n          container[name] = gl.createTexture();\n          gl.bindTexture(gl.TEXTURE_2D, container[name]);\n          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);\n          if ((settings.mipmap || container.settings.mipmap) && settings.mipmap !== false) gl.generateMipmap(gl.TEXTURE_2D);\n          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);\n          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);\n          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, textureWrapS);\n          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, textureWrapT);\n          container[name].id = container.count++;\n          container.index.push(container[name]);\n          res(container[name]);\n        };\n      });\n    }\n  }, {\n    key: \"deleteTexture\",\n    value: function deleteTexture(name) {\n      delete this[name];\n      this.count--;\n    }\n  }]);\n}();\n\nwindow.textures = {};\ntextures.controls = new TextureContainer({\n  mipmap: true\n});\nawait textures.controls.addTexture(\"joystick_disc\", \"/public/images/textures/joystick_disc.png\");\ntextures.misc = new TextureContainer();\nawait textures.misc.addTexture(\"font\", \"/public/images/textures/mainfont.png\");\nawait textures.misc.addTexture(\"pickupring\", \"/public/images/textures/PICKUP_RING.png\");\ntextures.skins = new TextureContainer();\nawait textures.skins.addTexture(\"avatar\", \"/public/images/textures/MAIN_AVATAR_DEFAULT.png\");\nawait textures.skins.addTexture(\"avatarblinking\", \"/public/images/textures/MAIN_AVATAR_BLINKING.png\");\nawait textures.skins.addTexture(\"avatarwalking1\", \"/public/images/textures/MAIN_AVATAR_WALKING_1.png\");\nawait textures.skins.addTexture(\"avatarwalking2\", \"/public/images/textures/MAIN_AVATAR_WALKING_2.png\");\nawait textures.skins.addTexture(\"avatardrawglock20\", \"/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_1.png\");\nawait textures.skins.addTexture(\"avatardrawglock20pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_2.png\");\nawait textures.skins.addTexture(\"avatardrawgpk100\", \"/public/images/textures/MAIN_AVATAR_DRAW_GPK100_1.png\");\nawait textures.skins.addTexture(\"avatardrawgpk100pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_GPK100_2.png\");\nawait textures.skins.addTexture(\"avatardrawnxr44mag\", \"/public/images/textures/MAIN_AVATAR_DRAW_NXR44MAG_1.png\");\nawait textures.skins.addTexture(\"avatardrawnxr44magpullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_NXR44MAG_2.png\");\nawait textures.skins.addTexture(\"avatarleftpunch1\", \"/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_1.png\");\nawait textures.skins.addTexture(\"avatarleftpunch2\", \"/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_2.png\");\nawait textures.skins.addTexture(\"avatarrightpunch1\", \"/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_1.png\");\nawait textures.skins.addTexture(\"avatarrightpunch2\", \"/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_2.png\");\nawait textures.skins.addTexture(\"avatarkitchenknife1\", \"/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_1.png\");\nawait textures.skins.addTexture(\"avatarkitchenknife2\", \"/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_2.png\");\nawait textures.skins.addTexture(\"avatarkitchenknife3\", \"/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_3.png\");\nawait textures.skins.addTexture(\"avatarkitchenknifewalking1\", \"/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_WALKING_1.png\");\nawait textures.skins.addTexture(\"avatarkitchenknifewalking2\", \"/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_WALKING_2.png\");\nawait textures.skins.addTexture(\"avatarassassinsknife1\", \"/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_1.png\");\nawait textures.skins.addTexture(\"avatarassassinsknife2\", \"/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_2.png\");\nawait textures.skins.addTexture(\"avatarassassinsknife3\", \"/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_3.png\");\nawait textures.skins.addTexture(\"avatarassassinsknifewalking1\", \"/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_WALKING_1.png\");\nawait textures.skins.addTexture(\"avatarassassinsknifewalking2\", \"/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_WALKING_2.png\");\nawait textures.skins.addTexture(\"avatargrab\", \"/public/images/textures/MAIN_AVATAR_GRAB.png\");\nawait textures.skins.addTexture(\"grey_backpack_acc\", \"/public/images/textures/GREY_BACKPACK_ACC.png\");\nawait textures.skins.addTexture(\"black_backpack_acc\", \"/public/images/textures/BLACK_BACKPACK_ACC.png\");\nawait textures.skins.addTexture(\"white_backpack_acc\", \"/public/images/textures/WHITE_BACKPACK_ACC.png\");\nawait textures.skins.addTexture(\"avatardrawusp45\", \"/public/images/textures/MAIN_AVATAR_DRAW_USP45_1.png\");\nawait textures.skins.addTexture(\"avatardrawusp45pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_USP45_2.png\");\nawait textures.skins.addTexture(\"avatardrawkc357\", \"/public/images/textures/MAIN_AVATAR_DRAW_KC357_1.png\");\nawait textures.skins.addTexture(\"avatardrawkc357pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_KC357_2.png\");\nawait textures.skins.addTexture(\"avatardrawdx9\", \"/public/images/textures/MAIN_AVATAR_DRAW_DX9_1.png\");\nawait textures.skins.addTexture(\"avatardrawdx9pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_DX9_2.png\");\nawait textures.skins.addTexture(\"avatardrawfurs55\", \"/public/images/textures/MAIN_AVATAR_DRAW_FURS55_1.png\");\nawait textures.skins.addTexture(\"avatardrawfurs55pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_FURS55_2.png\");\nawait textures.skins.addTexture(\"avatardrawnoss7\", \"/public/images/textures/MAIN_AVATAR_DRAW_NOSS7_1.png\");\nawait textures.skins.addTexture(\"avatardrawnoss7pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_NOSS7_2.png\");\nawait textures.skins.addTexture(\"avatardrawx691\", \"/public/images/textures/MAIN_AVATAR_DRAW_X691_1.png\");\nawait textures.skins.addTexture(\"avatardrawx691pullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_X691_2.png\");\nawait textures.skins.addTexture(\"avatarcombatknife1\", \"/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_1.png\");\nawait textures.skins.addTexture(\"avatarcombatknife2\", \"/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_2.png\");\nawait textures.skins.addTexture(\"avatarcombatknife3\", \"/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_3.png\");\nawait textures.skins.addTexture(\"avatarcombatknifewalking1\", \"/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_WALKING_1.png\");\nawait textures.skins.addTexture(\"avatarcombatknifewalking2\", \"/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_WALKING_2.png\");\nawait textures.skins.addTexture(\"avatardrawstubbyshotgun\", \"/public/images/textures/MAIN_AVATAR_DRAW_STUBBYSHOTGUN_1.png\");\nawait textures.skins.addTexture(\"avatardrawstubbyshotgunpullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_STUBBYSHOTGUN_2.png\");\nawait textures.skins.addTexture(\"avatardrawrobbershotgun\", \"/public/images/textures/MAIN_AVATAR_DRAW_ROBBERSHOTGUN_1.png\");\nawait textures.skins.addTexture(\"avatardrawrobbershotgunpullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_ROBBERSHOTGUN_2.png\");\nawait textures.skins.addTexture(\"avatardrawclassicshotgun\", \"/public/images/textures/MAIN_AVATAR_DRAW_CLASSICSHOTGUN_1.png\");\nawait textures.skins.addTexture(\"avatardrawclassicshotgunpullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_CLASSICSHOTGUN_2.png\");\nawait textures.skins.addTexture(\"avatardrawheavyshotgun\", \"/public/images/textures/MAIN_AVATAR_DRAW_HEAVYSHOTGUN_1.png\");\nawait textures.skins.addTexture(\"avatardrawheavyshotgunpullback\", \"/public/images/textures/MAIN_AVATAR_DRAW_HEAVYSHOTGUN_2.png\");\ntextures.objects = new TextureContainer();\nawait textures.objects.addTexture(\"robbershotgun\", \"/public/images/textures/ROBBER_SHOTGUN.png\");\nawait textures.objects.addTexture(\"stubbyshotgun\", \"/public/images/textures/STUBBY_SHOTGUN.png\");\nawait textures.objects.addTexture(\"nxr44mag\", \"/public/images/textures/NXR_44_MAG.png\");\nawait textures.objects.addTexture(\"gpk100\", \"/public/images/textures/GP_K100.png\");\nawait textures.objects.addTexture(\"usp45\", \"/public/images/textures/USP_45.png\");\nawait textures.objects.addTexture(\"glock20\", \"/public/images/textures/GLOCK_20.png\");\nawait textures.objects.addTexture(\"dx9\", \"/public/images/textures/DX_9.png\");\nawait textures.objects.addTexture(\"furs55\", \"/public/images/textures/FURS_55.png\");\nawait textures.objects.addTexture(\"noss7\", \"/public/images/textures/NOSS_7.png\");\nawait textures.objects.addTexture(\"x691\", \"/public/images/textures/X6_91.png\");\nawait textures.objects.addTexture(\"kc357\", \"/public/images/textures/KC_357.png\");\nawait textures.objects.addTexture(\"classicshotgun\", \"/public/images/textures/CLASSIC_SHOTGUN.png\");\nawait textures.objects.addTexture(\"heavyshotgun\", \"/public/images/textures/HEAVY_SHOTGUN.png\");\nawait textures.objects.addTexture(\"kitchenknife\", \"/public/images/textures/KITCHEN_KNIFE.png\");\nawait textures.objects.addTexture(\"assassinsknife\", \"/public/images/textures/ASSASSINS_KNIFE.png\");\nawait textures.objects.addTexture(\"combatknife\", \"/public/images/textures/COMBAT_KNIFE.png\");\nawait textures.objects.addTexture(\"laptop\", \"/public/images/textures/LAPTOP.png\");\nawait textures.objects.addTexture(\"steakandfries\", \"/public/images/textures/STEAK_AND_FRIES.png\");\nawait textures.objects.addTexture(\"greybackpack\", \"/public/images/textures/GREY_BACKPACK.png\");\nawait textures.objects.addTexture(\"whitebackpack\", \"/public/images/textures/WHITE_BACKPACK.png\");\nawait textures.objects.addTexture(\"blackbackpack\", \"/public/images/textures/BLACK_BACKPACK.png\");\nawait textures.objects.addTexture(\"remoteexplosive\", \"/public/images/textures/REMOTE_EXPLOSIVE.png\");\nawait textures.objects.addTexture(\"proximityexplosive\", \"/public/images/textures/PROXIMITY_EXPLOSIVE.png\");\nawait textures.objects.addTexture(\"remotedetonator\", \"/public/images/textures/REMOTE_DETONATOR.png\");\nawait textures.objects.addTexture(\"book1\", \"/public/images/textures/BOOK_1.png\");\nawait textures.objects.addTexture(\"book2\", \"/public/images/textures/BOOK_2.png\");\nawait textures.objects.addTexture(\"syringe\", \"/public/images/textures/SYRINGE.png\");\nawait textures.objects.addTexture(\"medkit\", \"/public/images/textures/MED_KIT.png\");\nawait textures.objects.addTexture(\"basicarmour\", \"/public/images/textures/BASIC_ARMOUR.png\");\nawait textures.objects.addTexture(\"mercenaryarmour\", \"/public/images/textures/MERCENARY_ARMOUR.png\");\nawait textures.objects.addTexture(\"swatarmour\", \"/public/images/textures/SWAT_ARMOUR.png\");\nawait textures.objects.addTexture(\"ammobox\", \"/public/images/textures/AMMO_BOX.png\");\nawait textures.objects.addTexture(\"multiammobox\", \"/public/images/textures/MULTI_AMMO_BOX.png\");\nawait textures.objects.addTexture(\"house1\", \"/public/images/textures/HOUSE_1.png\");\nawait textures.objects.addTexture(\"house2\", \"/public/images/textures/HOUSE_2.png\");\nawait textures.objects.addTexture(\"conveniencestore\", \"/public/images/textures/CONVENIENCE_STORE.png\");\nawait textures.objects.addTexture(\"gunstore\", \"/public/images/textures/GUNSTORE.png\");\nawait textures.objects.addTexture(\"table\", \"/public/images/textures/TABLE.png\");\nawait textures.objects.addTexture(\"smalltable\", \"/public/images/textures/SMALL_TABLE.png\");\nawait textures.objects.addTexture(\"whiteboard\", \"/public/images/textures/WHITEBOARD.png\");\nawait textures.objects.addTexture(\"pinboard\", \"/public/images/textures/PINBOARD.png\");\nawait textures.objects.addTexture(\"vendor1\", \"/public/images/textures/VENDOR_1.png\");\nawait textures.objects.addTexture(\"gazebo\", \"/public/images/textures/GAZEBO.png\");\nawait textures.objects.addTexture(\"shed\", \"/public/images/textures/SHED.png\");\nawait textures.objects.addTexture(\"bush\", \"/public/images/textures/BUSH.png\");\nawait textures.objects.addTexture(\"metalfence\", \"/public/images/textures/METAL_FENCE.png\");\nawait textures.objects.addTexture(\"metalfencevertical\", \"/public/images/textures/METAL_FENCE_VERTICAL.png\");\nawait textures.objects.addTexture(\"atm\", \"/public/images/textures/ATM.png\");\nawait textures.objects.addTexture(\"stopper\", \"/public/images/textures/STOPPER.png\");\nawait textures.objects.addTexture(\"lightbush\", \"/public/images/textures/LIGHT_BUSH.png\");\nawait textures.objects.addTexture(\"mixedbush\", \"/public/images/textures/MIXED_BUSH.png\");\nawait textures.objects.addTexture(\"chair\", \"/public/images/textures/CHAIR.png\");\nawait textures.objects.addTexture(\"picnictable\", \"/public/images/textures/PICNIC_TABLE.png\");\nawait textures.objects.addTexture(\"door\", \"/public/images/textures/DOOR.png\");\nawait textures.objects.addTexture(\"streetlight\", \"/public/images/textures/STREET_LIGHT.png\");\nawait textures.objects.addTexture(\"lightswitch\", \"/public/images/textures/LIGHT_SWITCH.png\");\nawait textures.objects.addTexture(\"bullet\", \"/public/images/textures/BULLET.png\");\nawait textures.objects.addTexture(\"bulletshell\", \"/public/images/textures/BULLETSHELL.png\");\nawait textures.objects.addTexture(\"fences\", \"/public/images/textures/fences.png\");\nawait textures.objects.addTexture(\"urbanfence\", \"/public/images/textures/URBAN_FENCE.png\");\nawait textures.objects.addTexture(\"urbanfencevertical\", \"/public/images/textures/URBAN_FENCE_VERTICAL.png\");\nawait textures.objects.addTexture(\"urbanfencehalf\", \"/public/images/textures/URBAN_FENCE_HALF.png\");\nawait textures.objects.addTexture(\"smallplant\", \"/public/images/textures/SMALL_PLANT.png\");\nawait textures.objects.addTexture(\"tile\", \"/public/images/textures/TILE.png\");\nawait textures.objects.addTexture(\"floortile\", \"/public/images/textures/FLOOR_TILE.png\", {\n  repeat: true\n});\nawait textures.objects.addTexture(\"woodfloortile\", \"/public/images/textures/WOOD_FLOOR_TILE.png\", {\n  repeat: true\n});\nawait textures.objects.addTexture(\"crosstile\", \"/public/images/textures/CROSS_TILE.png\", {\n  repeat: true\n});\nawait textures.objects.addTexture(\"grasstile\", \"/public/images/textures/GRASS_TILE.png\", {\n  repeat: true,\n  minFilter: gl.NEAREST\n});\nawait textures.objects.addTexture(\"candybar\", \"/public/images/textures/CANDY_BAR.png\", {\n  repeat: true,\n  minFilter: gl.NEAREST\n});\nawait textures.objects.addTexture(\"bench\", \"/public/images/textures/BENCH.png\");\nawait textures.objects.addTexture(\"money\", \"/public/images/textures/MONEY.png\");\nawait textures.objects.addTexture(\"grass1\", \"/public/images/textures/GRASS_1.png\");\nawait textures.objects.addTexture(\"grass2\", \"/public/images/textures/GRASS_2.png\");\nawait textures.objects.addTexture(\"rocks1\", \"/public/images/textures/ROCKS_1.png\");\nawait textures.objects.addTexture(\"rocks2\", \"/public/images/textures/ROCKS_2.png\");\nawait textures.objects.addTexture(\"roadrail\", \"/public/images/textures/ROAD_RAIL.png\");\nawait textures.objects.addTexture(\"roadrailvertical\", \"/public/images/textures/ROAD_RAIL_VERTICAL.png\");\nawait textures.objects.addTexture(\"downwardlight\", \"/public/images/textures/DOWNWARD_LIGHT.png\");\nawait textures.objects.addTexture(\"roads\", \"/public/images/textures/roads.png\");\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack://WTRW/./src/scripts/textures.js?");

/***/ })

}]);