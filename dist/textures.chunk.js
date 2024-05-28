"use strict";(self.webpackChunkWTRW=self.webpackChunkWTRW||[]).push([[218],[(e,t,a)=>{a.a(e,(async(e,s)=>{try{function r(e){return r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(e)}function u(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function x(e,t){for(var a=0;a<t.length;a++){var s=t[a];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,n(s.key),s)}}function n(e){var t=p(e,"string");return"symbol"==r(t)?t:t+""}function p(e,t){if("object"!=r(e)||!e)return e;var a=e[Symbol.toPrimitive];if(void 0!==a){var s=a.call(e,t||"default");if("object"!=r(s))return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}a.r(t),a.d(t,{default:()=>i});var i=function(){return e=function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{mipmap:!1,repeat:!1};u(this,e),this.count=0,this.index=[],this.settings=t},t=[{key:"addTexture",value:function(e,t){var a=this,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{mipmap:void 0,repeat:void 0,context:void 0},i=this,r=s.context||window.gl;return new Promise((function(u,x){var n=new Image;n.src=t;var p=(s.repeat||a.settings.repeat)&&!1!==s.repeat?r.REPEAT:s.textureWrapS||a.settings.textureWrapS||r.CLAMP_TO_EDGE,A=(s.repeat||a.settings.repeat)&&!1!==s.repeat?r.REPEAT:s.textureWrapT||a.settings.textureWrapT||r.CLAMP_TO_EDGE,_=s.minFilter||a.settings.minFilter||r.LINEAR;_=(s.mipmap||a.settings.mipmap)&&!1!==s.mipmap?s.minFilter||a.settings.minFilter||r.LINEAR_MIPMAP_NEAREST:_;var c=s.magFilter||a.settings.magFilter||r.LINEAR;n.onload=function(){i[e]=r.createTexture(),r.bindTexture(r.TEXTURE_2D,i[e]),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,n),(s.mipmap||i.settings.mipmap)&&!1!==s.mipmap&&r.generateMipmap(r.TEXTURE_2D),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,c),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,_),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,p),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,A),i[e].id=i.count++,i.index.push(i[e]),u(i[e])}}))}},{key:"deleteTexture",value:function(e){delete this[e],this.count--}}],t&&x(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e;var e,t}();window.textures={},textures.controls=new i({mipmap:!0}),await textures.controls.addTexture("joystick_disc","/public/images/textures/joystick_disc.png"),textures.misc=new i,await textures.misc.addTexture("font","/public/images/textures/mainfont.png"),await textures.misc.addTexture("pickupring","/public/images/textures/PICKUP_RING.png"),textures.skins=new i,await textures.skins.addTexture("avatar","/public/images/textures/MAIN_AVATAR_DEFAULT.png"),await textures.skins.addTexture("avatarblinking","/public/images/textures/MAIN_AVATAR_BLINKING.png"),await textures.skins.addTexture("avatarwalking1","/public/images/textures/MAIN_AVATAR_WALKING_1.png"),await textures.skins.addTexture("avatarwalking2","/public/images/textures/MAIN_AVATAR_WALKING_2.png"),await textures.skins.addTexture("avatardrawglock20","/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_1.png"),await textures.skins.addTexture("avatardrawglock20pullback","/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_2.png"),await textures.skins.addTexture("avatardrawgpk100","/public/images/textures/MAIN_AVATAR_DRAW_GPK100_1.png"),await textures.skins.addTexture("avatardrawgpk100pullback","/public/images/textures/MAIN_AVATAR_DRAW_GPK100_2.png"),await textures.skins.addTexture("avatardrawnxr44mag","/public/images/textures/MAIN_AVATAR_DRAW_NXR44MAG_1.png"),await textures.skins.addTexture("avatardrawnxr44magpullback","/public/images/textures/MAIN_AVATAR_DRAW_NXR44MAG_2.png"),await textures.skins.addTexture("avatarleftpunch1","/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_1.png"),await textures.skins.addTexture("avatarleftpunch2","/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_2.png"),await textures.skins.addTexture("avatarrightpunch1","/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_1.png"),await textures.skins.addTexture("avatarrightpunch2","/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_2.png"),await textures.skins.addTexture("avatarkitchenknife1","/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_1.png"),await textures.skins.addTexture("avatarkitchenknife2","/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_2.png"),await textures.skins.addTexture("avatarkitchenknife3","/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_3.png"),await textures.skins.addTexture("avatarkitchenknifewalking1","/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_WALKING_1.png"),await textures.skins.addTexture("avatarkitchenknifewalking2","/public/images/textures/MAIN_AVATAR_MELEE_KITCHEN_KNIFE_WALKING_2.png"),await textures.skins.addTexture("avatarassassinsknife1","/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_1.png"),await textures.skins.addTexture("avatarassassinsknife2","/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_2.png"),await textures.skins.addTexture("avatarassassinsknife3","/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_3.png"),await textures.skins.addTexture("avatarassassinsknifewalking1","/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_WALKING_1.png"),await textures.skins.addTexture("avatarassassinsknifewalking2","/public/images/textures/MAIN_AVATAR_MELEE_ASSASSINS_KNIFE_WALKING_2.png"),await textures.skins.addTexture("avatargrab","/public/images/textures/MAIN_AVATAR_GRAB.png"),await textures.skins.addTexture("grey_backpack_acc","/public/images/textures/GREY_BACKPACK_ACC.png"),await textures.skins.addTexture("black_backpack_acc","/public/images/textures/BLACK_BACKPACK_ACC.png"),await textures.skins.addTexture("white_backpack_acc","/public/images/textures/WHITE_BACKPACK_ACC.png"),await textures.skins.addTexture("avatardrawusp45","/public/images/textures/MAIN_AVATAR_DRAW_USP45_1.png"),await textures.skins.addTexture("avatardrawusp45pullback","/public/images/textures/MAIN_AVATAR_DRAW_USP45_2.png"),await textures.skins.addTexture("avatardrawkc357","/public/images/textures/MAIN_AVATAR_DRAW_KC357_1.png"),await textures.skins.addTexture("avatardrawkc357pullback","/public/images/textures/MAIN_AVATAR_DRAW_KC357_2.png"),await textures.skins.addTexture("avatardrawdx9","/public/images/textures/MAIN_AVATAR_DRAW_DX9_1.png"),await textures.skins.addTexture("avatardrawdx9pullback","/public/images/textures/MAIN_AVATAR_DRAW_DX9_2.png"),await textures.skins.addTexture("avatardrawfurs55","/public/images/textures/MAIN_AVATAR_DRAW_FURS55_1.png"),await textures.skins.addTexture("avatardrawfurs55pullback","/public/images/textures/MAIN_AVATAR_DRAW_FURS55_2.png"),await textures.skins.addTexture("avatardrawnoss7","/public/images/textures/MAIN_AVATAR_DRAW_NOSS7_1.png"),await textures.skins.addTexture("avatardrawnoss7pullback","/public/images/textures/MAIN_AVATAR_DRAW_NOSS7_2.png"),await textures.skins.addTexture("avatardrawx691","/public/images/textures/MAIN_AVATAR_DRAW_X691_1.png"),await textures.skins.addTexture("avatardrawx691pullback","/public/images/textures/MAIN_AVATAR_DRAW_X691_2.png"),await textures.skins.addTexture("avatarcombatknife1","/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_1.png"),await textures.skins.addTexture("avatarcombatknife2","/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_2.png"),await textures.skins.addTexture("avatarcombatknife3","/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_3.png"),await textures.skins.addTexture("avatarcombatknifewalking1","/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_WALKING_1.png"),await textures.skins.addTexture("avatarcombatknifewalking2","/public/images/textures/MAIN_AVATAR_MELEE_COMBAT_KNIFE_WALKING_2.png"),textures.objects=new i,await textures.objects.addTexture("nxr44mag","/public/images/textures/NXR_44_MAG.png"),await textures.objects.addTexture("gpk100","/public/images/textures/GP_K100.png"),await textures.objects.addTexture("usp45","/public/images/textures/USP_45.png"),await textures.objects.addTexture("glock20","/public/images/textures/GLOCK_20.png"),await textures.objects.addTexture("dx9","/public/images/textures/DX_9.png"),await textures.objects.addTexture("furs55","/public/images/textures/FURS_55.png"),await textures.objects.addTexture("noss7","/public/images/textures/NOSS_7.png"),await textures.objects.addTexture("x691","/public/images/textures/X6_91.png"),await textures.objects.addTexture("kc357","/public/images/textures/KC_357.png"),await textures.objects.addTexture("kitchenknife","/public/images/textures/KITCHEN_KNIFE.png"),await textures.objects.addTexture("assassinsknife","/public/images/textures/ASSASSINS_KNIFE.png"),await textures.objects.addTexture("combatknife","/public/images/textures/COMBAT_KNIFE.png"),await textures.objects.addTexture("laptop","/public/images/textures/LAPTOP.png"),await textures.objects.addTexture("greybackpack","/public/images/textures/GREY_BACKPACK.png"),await textures.objects.addTexture("whitebackpack","/public/images/textures/WHITE_BACKPACK.png"),await textures.objects.addTexture("blackbackpack","/public/images/textures/BLACK_BACKPACK.png"),await textures.objects.addTexture("remoteexplosive","/public/images/textures/REMOTE_EXPLOSIVE.png"),await textures.objects.addTexture("proximityexplosive","/public/images/textures/PROXIMITY_EXPLOSIVE.png"),await textures.objects.addTexture("remotedetonator","/public/images/textures/REMOTE_DETONATOR.png"),await textures.objects.addTexture("syringe","/public/images/textures/SYRINGE.png"),await textures.objects.addTexture("medkit","/public/images/textures/MED_KIT.png"),await textures.objects.addTexture("basicarmour","/public/images/textures/BASIC_ARMOUR.png"),await textures.objects.addTexture("mercenaryarmour","/public/images/textures/MERCENARY_ARMOUR.png"),await textures.objects.addTexture("swatarmour","/public/images/textures/SWAT_ARMOUR.png"),await textures.objects.addTexture("ammobox","/public/images/textures/AMMO_BOX.png"),await textures.objects.addTexture("multiammobox","/public/images/textures/MULTI_AMMO_BOX.png"),await textures.objects.addTexture("gunstore","/public/images/textures/GUNSTORE.png"),await textures.objects.addTexture("table","/public/images/textures/TABLE.png"),await textures.objects.addTexture("smalltable","/public/images/textures/SMALL_TABLE.png"),await textures.objects.addTexture("stopper","/public/images/textures/STOPPER.png"),await textures.objects.addTexture("chair","/public/images/textures/CHAIR.png"),await textures.objects.addTexture("door","/public/images/textures/DOOR.png"),await textures.objects.addTexture("lightswitch","/public/images/textures/LIGHT_SWITCH.png"),await textures.objects.addTexture("bullet","/public/images/textures/BULLET.png"),await textures.objects.addTexture("bulletshell","/public/images/textures/BULLETSHELL.png"),await textures.objects.addTexture("fences","/public/images/textures/fences.png"),await textures.objects.addTexture("floortile","/public/images/textures/FLOOR_TILE.png",{repeat:!0}),await textures.objects.addTexture("woodfloortile","/public/images/textures/WOOD_FLOOR_TILE.png",{repeat:!0}),await textures.objects.addTexture("crosstile","/public/images/textures/CROSS_TILE.png",{repeat:!0}),await textures.objects.addTexture("money","/public/images/textures/MONEY.png"),s()}catch(A){s(A)}}),1)}]]);