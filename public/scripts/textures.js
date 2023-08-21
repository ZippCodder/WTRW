// Texture managment

class TextureContainer {
    constructor(settings = {mipmap: false, repeat: false}) {
        this.count = 0;
        this.index = [];
        this.settings = settings;
    }

    addTexture(name, src, settings = {mipmap: undefined, repeat: undefined}) {
        let container = this;

        return new Promise((res, rej) => {
            let img = new Image();
            img.src = src;

            let textureWrapS = ((settings.repeat || this.settings.repeat) && settings.repeat !== false) ? gl.REPEAT:(settings.textureWrapS || this.settings.textureWrapS || gl.CLAMP_TO_EDGE);

            let textureWrapT = ((settings.repeat || this.settings.repeat) && settings.repeat !== false) ? gl.REPEAT:(settings.textureWrapT || this.settings.textureWrapT || gl.CLAMP_TO_EDGE);

            let minFilter = settings.minFilter || this.settings.minFilter || gl.LINEAR;
            minFilter = ((settings.mipmap || this.settings.mipmap) && settings.mipmap !== false) ? settings.minFilter || this.settings.minFilter || gl.LINEAR_MIPMAP_NEAREST:minFilter;

            let magFilter = settings.magFilter || this.settings.magFilter || gl.LINEAR; 

            img.onload = function() {
                container[name] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, container[name]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          
                if ((settings.mipmap || container.settings.mipmap) && settings.mipmap !== false) gl.generateMipmap(gl.TEXTURE_2D);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, textureWrapS);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, textureWrapT);

                container.count++;
                container.index.push(container[name]);

                res();
            };
        });
    }

    deleteTexture(name) {
        delete this[name];
        this.count--;
    }
}

window.textures = {};

textures.controls = new TextureContainer({mipmap: true});

await textures.controls.addTexture("joystick_disc", "/public/images/textures/joystick_disc.png");
await textures.controls.addTexture("actionbutton", "/public/images/textures/ACTION_BUTTON_TEXTURE_1.png");
await textures.controls.addTexture("actionbuttonactive", "/public/images/textures/ACTION_BUTTON_TEXTURE_2.png");
await textures.controls.addTexture("reloadbutton", "/public/images/textures/RELOAD_BUTTON_TEXTURE_1.png");
await textures.controls.addTexture("reloadbuttonactive", "/public/images/textures/RELOAD_BUTTON_TEXTURE_2.png");
await textures.controls.addTexture("avatarmode1", "/public/images/textures/AVATAR_MODE_BUTTON_TEXTURE_1.png");
await textures.controls.addTexture("avatarmode2", "/public/images/textures/AVATAR_MODE_BUTTON_TEXTURE_2.png");
await textures.controls.addTexture("dropitem1", "/public/images/textures/DROP_ITEM_BUTTON_TEXTURE_1.png");
await textures.controls.addTexture("dropitem2", "/public/images/textures/DROP_ITEM_BUTTON_TEXTURE_2.png");

textures.misc = new TextureContainer();

await textures.misc.addTexture("font", "/public/images/textures/mainfont.png");
await textures.misc.addTexture("plus100", "/public/images/textures/PLUS_100.png");
await textures.misc.addTexture("pickupring", "/public/images/textures/PICKUP_RING.png");

textures.skins = new TextureContainer();

await textures.skins.addTexture("avatar", "/public/images/textures/MAIN_AVATAR_DEFAULT.png");
await textures.skins.addTexture("avatarblinking", "/public/images/textures/MAIN_AVATAR_BLINKING.png");
await textures.skins.addTexture("avatarwalking1", "/public/images/textures/MAIN_AVATAR_WALKING_1.png");
await textures.skins.addTexture("avatarwalking2", "/public/images/textures/MAIN_AVATAR_WALKING_2.png");
await textures.skins.addTexture("avatardrawglock20", "/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_1.png");
await textures.skins.addTexture("avatardrawglock20pullback", "/public/images/textures/MAIN_AVATAR_DRAW_GLOCK20_2.png");
await textures.skins.addTexture("avatardrawgpk100", "/public/images/textures/MAIN_AVATAR_DRAW_GPK100_1.png");
await textures.skins.addTexture("avatardrawgpk100pullback", "/public/images/textures/MAIN_AVATAR_DRAW_GPK100_2.png");
await textures.skins.addTexture("avatarleftpunch1", "/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_1.png");
await textures.skins.addTexture("avatarleftpunch2", "/public/images/textures/MAIN_AVATAR_LEFT_PUNCH_2.png");
await textures.skins.addTexture("avatarrightpunch1", "/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_1.png");
await textures.skins.addTexture("avatarrightpunch2", "/public/images/textures/MAIN_AVATAR_RIGHT_PUNCH_2.png");

textures.objects = new TextureContainer();

await textures.objects.addTexture("nxr44mag", "/public/images/textures/NXR_44_MAG.png");
await textures.objects.addTexture("gpk100", "/public/images/textures/GP_K100.png");
await textures.objects.addTexture("usp45", "/public/images/textures/USP_45.png");
await textures.objects.addTexture("glock20", "/public/images/textures/GLOCK_20.png");
await textures.objects.addTexture("kc357", "/public/images/textures/KC_357.png");
await textures.objects.addTexture("kitchenknife", "/public/images/textures/KITCHEN_KNIFE.png");
await textures.objects.addTexture("assassinsknife", "/public/images/textures/ASSASSINS_KNIFE.png");
await textures.objects.addTexture("combatknife", "/public/images/textures/COMBAT_KNIFE.png");
await textures.objects.addTexture("laptop", "/public/images/textures/LAPTOP.png");
await textures.objects.addTexture("book1", "/public/images/textures/BOOK_1.png");
await textures.objects.addTexture("book2", "/public/images/textures/BOOK_2.png");
await textures.objects.addTexture("house1", "/public/images/textures/house1.png");
await textures.objects.addTexture("table", "/public/images/textures/TABLE.png");
await textures.objects.addTexture("chair", "/public/images/textures/CHAIR.png");
await textures.objects.addTexture("picnictable", "/public/images/textures/PICNIC_TABLE.png");
await textures.objects.addTexture("door", "/public/images/textures/DOOR.png");
await textures.objects.addTexture("streetlight", "/public/images/textures/STREET_LIGHT.png");
await textures.objects.addTexture("lightswitch", "/public/images/textures/LIGHT_SWITCH.png");
await textures.objects.addTexture("bullet", "/public/images/textures/BULLET.png");
await textures.objects.addTexture("bulletshell", "/public/images/textures/BULLETSHELL.png");
await textures.objects.addTexture("fences", "/public/images/textures/fences.png");
await textures.objects.addTexture("roadsign", "/public/images/textures/ROAD_SIGN.png");
await textures.objects.addTexture("urbanfence", "/public/images/textures/URBAN_FENCE.png");
await textures.objects.addTexture("urbanfencevertical", "/public/images/textures/URBAN_FENCE_VERTICAL.png");
await textures.objects.addTexture("urbanfencehalf", "/public/images/textures/URBAN_FENCE_HALF.png");
await textures.objects.addTexture("smallplant", "/public/images/textures/SMALL_PLANT.png");
await textures.objects.addTexture("tile", "/public/images/textures/TILE.png");
await textures.objects.addTexture("floortile", "/public/images/textures/FLOOR_TILE.png", {repeat: true});
await textures.objects.addTexture("woodfloortile", "/public/images/textures/WOOD_FLOOR_TILE.png", {repeat: true});
await textures.objects.addTexture("bench", "/public/images/textures/BENCH.png");
await textures.objects.addTexture("grass1", "/public/images/textures/GRASS_1.png");
await textures.objects.addTexture("grass2", "/public/images/textures/GRASS_2.png");
await textures.objects.addTexture("rocks1", "/public/images/textures/ROCKS_1.png");
await textures.objects.addTexture("rocks2", "/public/images/textures/ROCKS_2.png");
await textures.objects.addTexture("roadrail", "/public/images/textures/ROAD_RAIL.png");
await textures.objects.addTexture("roadrailvertical", "/public/images/textures/ROAD_RAIL_VERTICAL.png");
await textures.objects.addTexture("downwardlight", "/public/images/textures/DOWNWARD_LIGHT.png");
await textures.objects.addTexture("roads", "/public/images/textures/roads.png");
await textures.objects.addTexture("bulletshell", "/public/images/textures/BULLETSHELL.png");
