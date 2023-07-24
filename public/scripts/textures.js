// Texture managment

class TextureContainer {
    constructor() {
        this.count = 0;
    }

    addTexture(name, src) {
        let container = this;

        return new Promise((res, rej) => {
            let img = new Image();
            img.src = src;

            img.onload = function() {
                container[name] = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, container[name]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                container.count++;
                res();
            };
        });
    }

    deleteTexture(name) {
        delete this[name];
        this.count--;
    }
}

let furniture = new TextureContainer();

await furniture.addTexture("table", "/public/images/textures/TABLE.png");
await furniture.addTexture("house1", "/public/images/textures/house1.png");
await furniture.addTexture("chair", "/public/images/textures/CHAIR.png");
await furniture.addTexture("picnictable", "/public/images/textures/PICNIC_TABLE.png");
await furniture.addTexture("door", "/public/images/textures/DOOR.png");
await furniture.addTexture("streetlight", "/public/images/textures/STREET_LIGHT.png");
await furniture.addTexture("laptop", "/public/images/textures/LAPTOP.png");
await furniture.addTexture("lightswitch", "/public/images/textures/LIGHT_SWITCH.png");

window.tex = {
    furniture: furniture
}
