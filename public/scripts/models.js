import {
    draw,
    random
} from "/public/scripts/lib.js";

// functions for drawing textures for downloading and vertex mapping

/* texture sizes for mipmapping:

   64
   128
   256
   512
   1024 
   2048
   4096
   8192
   
   bookmarks: 
   
   @CONTROLS
   @FIREARMS
   @AVATARS
   @BUILDINGS 
   @OBJECTS
/2   
   NOTES:
   
   vertices and texture coords are generated using the draw() function from the editor. Input must be the main outer boxes of the object. Collision bounds will also be output for obstacles.
   
*/

// GLOBAL PROPERTIES FOR TEXTURES FOR THE SAME OBJECT TYPE 

const _PROPERTIES_ = {
    firearm: {
        size: 10
    },
    avatar: {
        size: 10
    },
    building: {
        size: 10
    },
    pickup: {
        size: 10
    },
    prop: {
        size: 10
    },
    control: {
        size: 10
    },
    general: {
        size: 10
    },
    text: {
        size: 1
    }
}

// extract texture data from drawn texture...

class TextureData {
    constructor(xOffset, yOffset, size, objectType, bodyDimensions, boundingBoxes, lineWidth, ctx, render, attribs = [], textureWidth, textureHeight, visualOffsetX = 0, visualOffsetY = 0) {

        visualOffsetX *= size;
        visualOffsetY *= size;
        xOffset *= size;
        yOffset *= size;

        this.size = size;
        this.attribs = attribs;
        this.offset = {
            x: xOffset,
            y: yOffset,
            vx: visualOffsetX || xOffset,
            vy: visualOffsetY || yOffset,
            tx: 0,
            ty: 0
        };
        this.bodyDimensions = bodyDimensions;
        this.boundingBoxes = boundingBoxes;
        this.lineWidth = lineWidth;
        this.render = render.bind(this);
        this.objectType = objectType;
        this.textureDimensions = {};

        this.lineWidth *= size;
        this.bodyDimensions.width *= size;
        this.bodyDimensions.height *= size;

        let p = 1;

        if (!(textureWidth && textureHeight)) {
            while (p < 8192) {
                if (this.bodyDimensions.width + lineWidth < p && this.textureDimensions.width === undefined) {
                    this.textureDimensions.width = p;
                    if (this.textureDimensions.height !== undefined) break;
                }

                if (this.bodyDimensions.height + lineWidth < p && this.textureDimensions.height === undefined) {
                    this.textureDimensions.height = p;
                    if (this.textureDimensions.width !== undefined) break;
                }
                p *= 2;
            }
        } else {
            this.textureDimensions.width = textureWidth;
            this.textureDimensions.height = textureHeight;
        }

        for (let i of this.boundingBoxes) {

            i[0] *= this.size;
            i[1] *= this.size;
            i[0] += this.offset.x;
            i[1] += this.offset.y;

            i[2] *= this.size;
            i[3] *= this.size;

        }
    }

    getData() {
        return draw(this.boundingBoxes, this.bodyDimensions.width, this.bodyDimensions.height, this.textureDimensions.width, this.textureDimensions.height, _PROPERTIES_[this.objectType].size, this.lineWidth, this.offset.tx, this.offset.ty, this.attribs);
    }
}

export class Sheet {
    constructor(textures = [], width, height) {
        this.textures = textures;
        this.width = width || 1024;
        this.height = height || 2048;

        let placement = {
            x: 0,
            y: 0
        };
        let rowHeight = 0;

        for (let t of this.textures) {

            if (placement.x + t.bodyDimensions.width > this.width) {
                placement.x = 0;
                placement.y = rowHeight;
                rowHeight = 0;
            }

            if (placement.y + t.bodyDimensions.height > rowHeight) rowHeight = placement.y + t.bodyDimensions.height;

            t.offset.tx += placement.x;
            t.offset.ty += placement.y;
            t.offset.vx += placement.x;
            t.offset.vy += placement.y;

            t.textureDimensions.width = this.width;
            t.textureDimensions.height = this.height;

            placement.x += t.bodyDimensions.width;

            if (placement.y + t.bodyDimensions.height > this.height) {
                console.log("Max sheet height exceeded. Increase sheet height or remove offending texture!");
            }
        }
    }

    addTexture(texture) {
        this.textures.push(texture);
    }

    render(ctx, showBorders) {
        for (let t of this.textures) {
            t.render(ctx);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "red";
            if (showBorders) ctx.strokeRect(t.offset.vx, t.offset.vy, t.bodyDimensions.width, t.bodyDimensions.height);
        }
    }
}

// @CONTROLS

export let JOYSTICK_DISC_TEXTURE = new TextureData(0, 0, 1, "general", {
    width: 980,
    height: 980
}, [
    [0, 0, 980, 980]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20

    ctx.scale(this.size || 0, this.size || 0);
    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 0.5;

    // Joystick base

    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, 0, 2 * Math.PI);
    ctx.fill();

},[], 980, 980);

export let DOWNWARD_LIGHT = new TextureData(0, 0, 0.8, "general", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20

    ctx.scale(this.size || 0, this.size || 0);
    ctx.translate(0,-45);
    ctx.lineWidth = 2;   
    ctx.fillStyle = "black";

    let gradient = ctx.createLinearGradient(300,0,300,600); 
    gradient.addColorStop(0,"white"); 
    gradient.addColorStop(1,"black");

    ctx.fillStyle = gradient; 

    ctx.moveTo(60,300);
    ctx.lineTo(280,47);
    ctx.lineTo(320,47);
    ctx.lineTo(540,300); 
    ctx.bezierCurveTo(700,500,470,650,300,643);
    ctx.moveTo(60,300);
    ctx.bezierCurveTo(-100,500,130,650,300,643);
 
    ctx.fill();
});


export let PICKUP_RING = new TextureData(0, 0, 0.2, "general", {
    width: 428,
    height: 428
}, [
    [0, 0, 428, 428]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.scale(this.size || 0, this.size || 0);

    ctx.lineWidth = 12;
    ctx.fillStyle = "black";

    // Joystick base
    for (let i = 0; i < 16; i += 2) {
        ctx.beginPath();
        ctx.arc(214, 214, 208, (i * 0.125) * Math.PI, ((i + 1) * 0.125) * Math.PI);
        ctx.stroke();

    }

});

export let ACTION_BUTTON_ICON = new TextureData(0, 0, 0.2, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // 90x90
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);

    ctx.fillStyle = "black";
    ctx.globalAlpha = 1;
    ctx.lineWidth = 20;
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.translate(-270, -167);
    ctx.translate(90,30);
    ctx.moveTo(345, 550);
    ctx.lineTo(460, 550);
    ctx.lineTo(530, 450);
    ctx.lineTo(530, 330);
    ctx.lineTo(480, 330);
    ctx.lineTo(480, 370);

    ctx.lineTo(480, 200);
    ctx.lineTo(430, 200);
    ctx.lineTo(430, 300);

    ctx.lineTo(430, 180);
    ctx.lineTo(380, 180);
    ctx.lineTo(380, 300);

    ctx.lineTo(380, 200);
    ctx.lineTo(330, 200);
    ctx.lineTo(330, 370);

    ctx.lineTo(330, 280);
    ctx.lineTo(280, 280);
    ctx.lineTo(280, 450);
    ctx.lineTo(355, 554);

    ctx.fillStyle = "white";
    ctx.stroke();
    ctx.restore();
});

export let RELOAD_BUTTON_TEXTURE = new TextureData(0, 0, 0.2, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.scale(this.size || 0, this.size || 0);
    ctx.scale(3, 3);
    ctx.translate(-200, -200);

    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 15;
    ctx.strokeStyle = "white";
    ctx.moveTo(300, 300);
    ctx.arc(300, 300, 100, 0, 2 * Math.PI);
    ctx.fill();

    ctx.translate(300, 300);
    ctx.rotate(10);
    ctx.translate(-300, -300);

    ctx.beginPath();

    ctx.translate(300, 300);
    ctx.rotate(0.15);
    ctx.translate(-300, -300);

    ctx.arc(300, 300, 40, 0, (2 * Math.PI) * 0.75);

    ctx.translate(300, 300);
    ctx.rotate(-0.15);
    ctx.translate(-300, -300);

    ctx.translate(-2.5, -11);
    ctx.moveTo(338.5, 320); // 321
    ctx.lineTo(352, 305);

    ctx.moveTo(349, 298);
    ctx.lineTo(320.2, 318);
    ctx.moveTo(340, 298);
    ctx.lineTo(361, 323);
    ctx.stroke();

});

export let AVATAR_MODE_BUTTON_TEXTURE = new TextureData(0, 0, 0.15, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.scale(this.size || 0, this.size || 0);

    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 15;
    ctx.strokeStyle = "white";

    ctx.moveTo(300, 300);
    ctx.arc(300, 300, 300, 0, 2 * Math.PI);
    ctx.fill();

    ctx.lineWidth = 30;
    ctx.fillStyle = "white";
    ctx.font = "300px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    //ctx.strokeText("P", 300, 320);
    ctx.strokeText("H", 300, 320);

});

export let DROP_ITEM_BUTTON_TEXTURE = new TextureData(0, 0, 1, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.scale(this.size || 0, this.size || 0);

    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 60;
    ctx.strokeStyle = "white";

    ctx.moveTo(300, 300);
    ctx.arc(300, 300, 300, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(300, 120);
    ctx.lineTo(300, 340);

    ctx.moveTo(319, 370);
    ctx.lineTo(203, 255);

    ctx.moveTo(277, 370);
    ctx.lineTo(393, 255);

    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 30;
    ctx.moveTo(220, 450);
    ctx.lineTo(380, 450);
    ctx.stroke();

});

export let GEAR_ICON = new TextureData(0, 0, 1, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
     ctx.save();
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.scale(this.size || 0, this.size || 0);

    ctx.lineWidth = 10;  
    ctx.translate(-150,-150);
 
    ctx.fillStyle = "#777777";
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 60;
    ctx.arc(300, 300, 70, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 30;
    ctx.arc(300, 300, 70, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 10;
    ctx.beginPath();

    function drawCog(r) {
     r = r * Math.PI/180;
 
     ctx.translate(300,300);
     ctx.rotate(r);
     ctx.translate(-300,-300); 
     
     let i = 4;
     ctx.moveTo(270,200+i);
     ctx.lineTo(280,170+i);
     ctx.lineTo(320,170+i);
     ctx.lineTo(330,200+i);
     ctx.lineTo(360,213+i);

     ctx.translate(300,300);
     ctx.rotate(-r);
     ctx.translate(-300,-300); 
    }

     drawCog(0);
     drawCog(52);
     drawCog(104);
     drawCog(155);
     drawCog(206);
     drawCog(257);
     drawCog(308);

     ctx.moveTo(340,300);
     ctx.fill();
     ctx.arc(300, 300, 40, 0, 2 * Math.PI);
     ctx.stroke();
     ctx.restore();
});

export let BAG_ICON = new TextureData(0, 0, 1, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);
    ctx.translate(0,-5);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 10;
    ctx.beginPath();

    ctx.fillStyle = "#636363";
    ctx.fillRect(60,80,180,200);
    ctx.fillStyle = "#525252";
    ctx.fillRect(60,50,180,75);  

    ctx.strokeRect(60,50,180,230);
    ctx.fillRect(90,170,120,15);
    ctx.fillStyle = "#525252";
    ctx.strokeRect(90,170,120,80);

    ctx.lineWidth = 5;
    ctx.moveTo(90,200);
    ctx.lineTo(210,200);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60,145);
    ctx.lineTo(240,145);
    ctx.stroke();

    ctx.strokeRect(125,200,50,10);
    ctx.lineWidth = 10;

    ctx.beginPath();
    ctx.fillStyle = "#343434";
    ctx.moveTo(100,30);
    ctx.lineTo(100,80);
    ctx.lineTo(120,80);
    ctx.lineTo(120,50);
    ctx.lineTo(180,50);
    ctx.lineTo(180,80);
    ctx.lineTo(200,80);
    ctx.lineTo(200,30);
    ctx.lineTo(95,30);
    ctx.fill();

    ctx.fillStyle = "#525252";
    ctx.fillRect(30,150,30,110);
    ctx.strokeRect(30,150,30,110);

    ctx.fillRect(240,150,30,110);
    ctx.strokeRect(240,150,30,110);
 
    ctx.stroke();
    ctx.restore();
});

export let MAP_ICON = new TextureData(0, 0, 1, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 10;
 
    ctx.translate(0,45);
    ctx.fillStyle = "#666666";

    ctx.moveTo(48,50);
    ctx.lineTo(116.6,30);
    ctx.lineTo(183.2,50);
    ctx.lineTo(249.8,30);

    ctx.lineTo(249.8,200);
    ctx.lineTo(183.2,220);
    ctx.lineTo(116.6,200);
    ctx.lineTo(50,220);
    ctx.lineTo(50,46);
    ctx.fill();
 
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.fillStyle = "#888888";
    ctx.lineTo(116.6,30);
    ctx.lineTo(183.2,50);
    ctx.lineTo(183.2,220);
    ctx.lineTo(116.6,200);
    ctx.lineTo(116.6,30);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(48,65);
    ctx.lineTo(116.6,45);
    ctx.lineTo(183.2,65);
    ctx.lineTo(249.8,45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(48,165);
    ctx.lineTo(116.6,145);
    ctx.lineTo(183.2,165);
    ctx.lineTo(249.8,145);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.beginPath()
    ctx.moveTo(48,50);
    ctx.lineTo(116.6,30);
    ctx.lineTo(183.2,50);
    ctx.lineTo(249.8,30);

    ctx.lineTo(249.8,200);
    ctx.lineTo(183.2,220);
    ctx.lineTo(116.6,200);
    ctx.lineTo(50,220);
    ctx.lineTo(50,46);

    ctx.stroke();

    ctx.fillStyle = "#444444";
    ctx.scale(2,2);
    ctx.translate(-15,-62);
 
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(75,80);
    ctx.lineTo(90,110);
    ctx.lineTo(105,80);
  
    ctx.lineTo(107,70);
    ctx.lineTo(106,65);
    ctx.lineTo(102,57);
    ctx.lineTo(95,53);
    ctx.lineTo(90,52.6);

    ctx.moveTo(96,69);
    ctx.arc(90, 72, 7, 0, 2 * Math.PI);
 
    ctx.moveTo(92,52.5);
    ctx.lineTo(85,53);
    ctx.lineTo(78,57);
    ctx.lineTo(73,65);
    ctx.lineTo(73,70);
    ctx.lineTo(75.5,81);
    
    ctx.fill();

    ctx.beginPath();
    ctx.arc(90, 72, 17, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(75,80);
    ctx.lineTo(90,110);
    ctx.lineTo(105,80);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(90, 72, 8, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
});


/* icon container */

export let ICONS = new TextureData(0, 0, 8.25, "control", {
    width: 600,
    height: 600
}, [
    [0, 0, 600, 600]
], 0, undefined, function(ctx) {
    // base body: 600x600, texture: 1024x1024, size: 20

    ctx.lineWidth = 7;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";

    // Joystick base

    ctx.translate(-365, -223);
    /* backpack icon
       70x70
    
      ctx.moveTo(300,300);
      ctx.lineTo(346,300);
      ctx.lineTo(346,260);
      ctx.lineTo(338,245);
      ctx.lineTo(308,245);
      ctx.lineTo(300,260);
      ctx.lineTo(300,303.5);
      ctx.stroke();
      
      ctx.lineWidth = 5;
      ctx.strokeRect(313,234,20,12);
       ctx.strokeRect(310.5,270,25,20);
       ctx.lineWidth = 3;
        ctx.strokeRect(310.5,270,25,7);
        */

    /* wrench icon 
      70x70    

    ctx.beginPath();
    ctx.lineWidth = 7;
    ctx.moveTo(400,300);
    ctx.lineTo(412,300);
    ctx.lineTo(412,270);
    ctx.lineTo(428,255);
    ctx.lineTo(420,234); 
    ctx.lineTo(412,234);
    ctx.lineTo(412,250);
    ctx.lineTo(400,250);
    ctx.lineTo(400,234);
    ctx.lineTo(392,234);
    ctx.lineTo(384,255); // 16 / 15
    ctx.lineTo(400,270);
    ctx.lineTo(400,303.5);
    ctx.stroke();
    */

    /* door icon
      70x70
    ctx.beginPath();
    ctx.strokeRect(332.5,303.5,45,64);
    ctx.lineWidth = 3;
    ctx.strokeRect(365,328,6,15);
    */

    /* heart icon 
      70x70
    ctx.beginPath();
    ctx.moveTo(306,296);
    ctx.lineTo(274,265);
    ctx.lineTo(289,250);
    ctx.lineTo(304,265);
    ctx.lineTo(319,250);
    ctx.lineTo(334,265);
    ctx.lineTo(302,296);
    ctx.stroke();
    ctx.fill(); */

    /*   fork icon
      
      70x70
      ctx.beginPath();
      ctx.moveTo(300,290);
      ctx.lineTo(310,290);
      ctx.lineTo(310,260);
      ctx.lineTo(320,250);
      
      ctx.lineTo(320,225);
      ctx.lineTo(317,225);
      ctx.lineTo(317,240);
      ctx.lineTo(305,240);
      ctx.lineTo(305,225);
      ctx.lineTo(303,225);
      ctx.lineTo(303,240);
      ctx.lineTo(291,240);
      ctx.lineTo(291,225);
      ctx.lineTo(289,225);
      ctx.lineTo(289,250);
      ctx.lineTo(300,260);
      ctx.lineTo(300,293.5);
      
      ctx.fill();
      ctx.stroke();
      */

 /* water icon
      70x70
    ctx.beginPath();
    ctx.moveTo(398, 290);
    ctx.lineTo(423, 265);
    ctx.lineTo(400, 230);
    ctx.lineTo(377, 265);
    ctx.lineTo(402, 290);
    ctx.fill();
    ctx.stroke(); */

/*  sheild icon
      70x70
    ctx.lineWidth = 5;
    ctx.scale(0.76,0.76);
    ctx.translate(111,62);
    ctx.moveTo(413.5,320);
    ctx.lineTo(445,290);
    ctx.lineTo(450,245);
    ctx.lineTo(415,235);
    ctx.lineTo(380,245);
    ctx.lineTo(385,290);
    ctx.lineTo(416.5,320);
    ctx.stroke();
    ctx.fill();
*/

/* ammo icon 
      70x70
   ctx.lineWidth = 5;

   function bullet(x,y) {
    ctx.translate(x,y);
    ctx.moveTo(380,290);
    ctx.lineTo(386,290);  
    ctx.lineTo(386,260);
    ctx.lineTo(384,252);
    ctx.lineTo(382,252);
    ctx.lineTo(380,260);
    ctx.lineTo(380,292.5);
    ctx.stroke();
    ctx.fill();
    ctx.translate(-x,-y);
   }

   bullet(-2,-13);
   bullet(17,-13);
   bullet(36,-13);
*/

 //  ctx.strokeRect(370,228,90,90);
   ctx.moveTo(382,273);
   ctx.lineTo(418,273);
   ctx.moveTo(382,253);
   ctx.lineTo(438,253);
   ctx.moveTo(382,293);
   ctx.lineTo(448,293);
   ctx.stroke();

});

// @BUILDINGS

export let LUXURY_APARTMENT = new TextureData(2010, 3510, 0.2, "building", {
    width: 6370,
    height: 7720
}, [
    [-2000, -3000, 3500, 4660],
    [-1565, 2200, 2700, 1500],
    [1500, 1900, 300, 2000],
    [4000, 1900, 300, 2000],
    [1500, -700, 2800, 4000],
    [-1950, 1650, 385, 2150],
    [1119, 1650, 385, 2150],
    [1450, -3500, 90, 2800],
    [4260, -3500, 90, 2800],
    [1450, -3500, 2900, 100],
    [1450, -1050, 2900, 100]
], 0, undefined, function(ctx, n) {
    // body: 3200x2280, texture: 1024,512, size: 0.18, boxes: [[500, 1700, 3200, 1500],[600, 3200, 3000, 700],[2750, 3900, 600, 250]]

    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    console.log(this.size);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "#1A1A1A";

    // front porch

    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(1500, 1900, 2500, 1500);

    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(1500, 3300, 2800, 900);
    ctx.fillStyle = "#858585";
    ctx.fillRect(1500, 4100, 2800, 100);
    ctx.strokeRect(1500, 3300, 2800, 900);

    ctx.lineWidth = 20;
    ctx.fillStyle = "#5E5E5E";
    ctx.fillRect(1500, 1900, 300, 2000);
    ctx.fillRect(4000, 1900, 300, 2000);
    ctx.strokeRect(1500, 1900, 300, 2000);
    ctx.strokeRect(4000, 1900, 300, 2000);

    // - window
    ctx.lineWidth = 20;

    ctx.fillStyle = "#424242";
    ctx.fillRect(2900, 2000, 1000, 950);

    ctx.fillStyle = "#9C9C9C";
    ctx.fillRect(2950, 2100, 900, 750);

    ctx.fillStyle = "#242424";
    ctx.fillRect(2900, 2000, 1000, 60);
    ctx.fillRect(2950, 2850, 900, 60);

    ctx.strokeRect(2950, 2100, 900, 800);
    ctx.strokeRect(2900, 2000, 1000, 950);

    ctx.lineWidth = 15;
    ctx.strokeRect(2950, 2100, 900, 750);

    ctx.fillStyle = "#424242";
    ctx.fillRect(2950, 2610, 900, 40);
    ctx.fillRect(2950, 2340, 900, 40);
    ctx.strokeRect(2950, 2610, 900, 40);
    ctx.strokeRect(2950, 2340, 900, 40);

    // - door
    ctx.lineWidth = 20;

    ctx.fillStyle = "#616161";
    ctx.fillRect(1950, 2100, 700, 1200);
    ctx.strokeRect(1950, 2100, 700, 1200);

    ctx.fillStyle = "#9C9C9C";
    ctx.fillRect(2125, 2250, 50, 900);
    ctx.fillRect(2275, 2250, 50, 900);
    ctx.fillRect(2425, 2250, 50, 900);

    ctx.lineWidth = 15;
    ctx.strokeRect(2125, 2250, 50, 900);
    ctx.strokeRect(2275, 2250, 50, 900);
    ctx.strokeRect(2425, 2250, 50, 900);
    ctx.lineWidth = 20;
    ctx.fillStyle = "#242424";
    ctx.fillRect(2550, 2700, 40, 150);
    ctx.strokeRect(2550, 2700, 40, 150);

    ctx.fillStyle = "#424242";
    ctx.fillRect(1900, 2000, 800, 100);
    ctx.fillRect(1900, 2100, 50, 1240);
    ctx.fillRect(2650, 2100, 50, 1240);
    ctx.fillStyle = "#242424";
    ctx.fillRect(1900, 2000, 800, 50);

    ctx.strokeRect(1900, 2000, 800, 100);
    ctx.strokeRect(1900, 2100, 50, 1240);
    ctx.strokeRect(2650, 2100, 50, 1240);

    // garage border wall fill 

    ctx.fillStyle = "#CCCCCC";
    ctx.moveTo(-1950, 1660);
    ctx.lineTo(-1950, 3800);
    ctx.lineTo(-1565, 3800);
    ctx.lineTo(-1565, 2200);
    ctx.lineTo(1115, 2200);
    ctx.lineTo(1115, 3800);
    ctx.lineTo(1500, 3800);
    ctx.lineTo(1500, 1660);
    ctx.fill();
    ctx.strokeRect(1500, 1900, 300, 2000);

    // garage
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.strokeRect(-2000, 1600, 3500, 60);
    ctx.moveTo(-1950, 1660);
    ctx.lineTo(-1950, 3800);
    ctx.lineTo(-1565, 3800);
    ctx.lineTo(-1565, 2200);
    ctx.lineTo(1115, 2200);
    ctx.lineTo(1115, 3800);
    ctx.lineTo(1500, 3800);
    ctx.stroke();

    // - door

    ctx.fillStyle = "#424242";
    ctx.fillRect(-1565, 2200, 2680, 1500);
    ctx.fillStyle = "#242424";
    //ctx.fillRect(-1565, 3650, 2680, 50); 

    ctx.strokeRect(-1565, 2200, 2680, 1500);
    ctx.lineWidth = 15;
    ctx.strokeRect(-1565, 2200, 2680, 1450);
    ctx.lineWidth = 10;
    ctx.strokeRect(-1565, 2200, 2680, 400);
    ctx.strokeRect(-1565, 2200, 2680, 800);
    ctx.strokeRect(-1565, 2200, 2680, 1200);

    // balcony

    // border - fill
    ctx.beginPath();
    ctx.moveTo(1500, 1500);
    ctx.lineTo(1500, 1900);
    ctx.lineTo(4300, 1900);
    ctx.lineTo(4300, 1500);
    ctx.lineTo(4300, -700);
    ctx.lineTo(1500, -700);
    ctx.lineTo(1500, -300);
    ctx.lineTo(3900, -300);
    ctx.lineTo(3900, 1500);
    ctx.lineTo(1490, 1500);
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.moveTo(2700, 1500);
    ctx.lineTo(2700, 1900);
    ctx.moveTo(3905, 1500);
    ctx.lineTo(3905, 1900);
    ctx.moveTo(3905, 600);
    ctx.lineTo(4300, 600);
    ctx.moveTo(3905, -700);
    ctx.lineTo(3905, -300);
    ctx.moveTo(2700, -700);
    ctx.lineTo(2700, -300);
    ctx.fillStyle = "#787878";
    ctx.fill();

    // - border
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(1500, -300, 2400, 1800);
    ctx.fillStyle = "#BABABA";
    ctx.fillRect(1500, 1000, 2400, 500);
    ctx.strokeRect(1500, -300, 2400, 1800);
    ctx.moveTo(1500, 1500);
    ctx.lineTo(1500, 1900);
    ctx.lineTo(4300, 1900);
    ctx.lineTo(4300, 1500);
    ctx.lineTo(4300, -700);
    ctx.lineTo(1500, -700);
    ctx.lineTo(1500, -300);
    ctx.lineTo(3900, -300);
    ctx.lineTo(3900, 1500);
    ctx.lineTo(1490, 1500);
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.moveTo(2700, 1500);
    ctx.lineTo(2700, 1900);
    ctx.moveTo(3905, 1500);
    ctx.lineTo(3905, 1900);
    ctx.moveTo(3905, 600);
    ctx.lineTo(4300, 600);
    ctx.moveTo(3905, -700);
    ctx.lineTo(3905, -300);
    ctx.moveTo(2700, -700);
    ctx.lineTo(2700, -300);
    ctx.stroke();

    // - rail
    ctx.beginPath();

    ctx.fillStyle = "#707070";
    ctx.fillRect(1500, 600, 100, 300);
    ctx.fillRect(1500, 900, 2400, 100);
    ctx.fillRect(1500, 900, 2400, 50);
    ctx.fillRect(1950, 1000, 50, 400);
    ctx.fillRect(2675, 1000, 50, 400);
    ctx.fillRect(3400, 1000, 50, 400);

    ctx.lineWidth = 20;
    ctx.strokeRect(1500, 600, 100, 300);
    ctx.fillStyle = "#545454";
    ctx.fillRect(1500, 950, 2400, 50);
    ctx.strokeRect(1500, 900, 2400, 100);
    ctx.strokeRect(1950, 1000, 50, 400);
    ctx.strokeRect(2675, 1000, 50, 400);
    ctx.strokeRect(3400, 1000, 50, 400);

    // - windows 
    ctx.fillStyle = "#424242";
    ctx.fillRect(1600, -300, 2200, 200);
    ctx.strokeRect(1600, -300, 2200, 200);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#9C9C9C";
    ctx.fillRect(1650, -300, 487, 110);
    ctx.fillRect(2187, -300, 487, 110);
    ctx.fillRect(2724, -300, 487, 110);
    ctx.fillRect(3261, -300, 487, 110);

    ctx.fillStyle = "#242424";
    ctx.fillRect(1650, -175, 487, 30);
    ctx.fillRect(2187, -175, 487, 30);
    ctx.fillRect(2724, -175, 487, 30);
    ctx.fillRect(3261, -175, 487, 30);

    ctx.strokeRect(1650, -300, 487, 150);
    ctx.strokeRect(2187, -300, 487, 150);
    ctx.strokeRect(2724, -300, 487, 150);
    ctx.strokeRect(3261, -300, 487, 150);
    ctx.strokeRect(1650, -300, 487, 120);
    ctx.strokeRect(2187, -300, 487, 120);
    ctx.strokeRect(2724, -300, 487, 120);
    ctx.strokeRect(3261, -300, 487, 120);

    // - doors
    ctx.lineWidth = 20;
    ctx.fillStyle = "#424242";
    ctx.fillRect(1600, 0, 2200, 900);
    ctx.fillStyle = "#242424";
    ctx.fillRect(1600, 0, 2200, 40);
    ctx.strokeRect(1600, 0, 2200, 900);
    ctx.lineWidth = 15;
    ctx.fillStyle = "#9C9C9C";
    ctx.fillRect(1650, 100, 2100, 790);
    ctx.fillStyle = "#424242";
    ctx.fillRect(2316, 100, 50, 800);
    ctx.fillRect(3038, 100, 50, 800);
    ctx.strokeRect(1650, 100, 2100, 800);
    ctx.strokeRect(2316, 100, 50, 800);
    ctx.strokeRect(3038, 100, 50, 800);

    // lower roof 
    ctx.lineWidth = 20;
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(-2000, -3000, 3500, 4660);
    ctx.fillStyle = "#333333";
    ctx.fillRect(-2000, 1550, 3500, 100);
    ctx.strokeRect(-2000, -3000, 3500, 4660);

    // top left section
    ctx.lineWidth = 20;
    ctx.fillStyle = "#616161";
    ctx.fillRect(-500, -200, 2000, 1500);
    ctx.strokeRect(-500, -200, 2000, 1500);

    // - stripes 
    ctx.lineWidth = 10;
    ctx.moveTo(-300, -200);
    ctx.lineTo(-300, 1300);
    ctx.moveTo(-100, -200);
    ctx.lineTo(-100, 1300);
    ctx.moveTo(100, -200);
    ctx.lineTo(100, 1300);
    ctx.moveTo(300, -200);
    ctx.lineTo(300, 1300);
    ctx.moveTo(500, -200);
    ctx.lineTo(500, 1300);
    ctx.moveTo(700, -200);
    ctx.lineTo(700, 1300);
    ctx.moveTo(900, -200);
    ctx.lineTo(900, 1300);
    ctx.moveTo(1100, -200);
    ctx.lineTo(1100, 1300);
    ctx.moveTo(1300, -200);
    ctx.lineTo(1300, 1300);
    ctx.moveTo(1500, -200);
    ctx.lineTo(1500, 1300);

    ctx.stroke();

    // - shade 
    ctx.lineWidth = 20;
    ctx.fillRect(-550, 200, 1400, 150);
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(-550, 200, 1400, 50);
    ctx.strokeRect(-550, 200, 1400, 150);

    // - windows 
    ctx.lineWidth = 20;

    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(-400, 500, 1200, 300);
    ctx.fillRect(-400, 900, 1200, 300);

    ctx.fillStyle = "#9C9C9C";
    ctx.fillRect(-400, 500, 1200, 250);
    ctx.fillRect(-400, 900, 1200, 250);

    ctx.strokeRect(-400, 500, 1200, 300);
    ctx.strokeRect(-400, 900, 1200, 300);
    ctx.lineWidth = 15;
    ctx.strokeRect(-400, 500, 1200, 250);
    ctx.strokeRect(-400, 900, 1200, 250);

    // roofs
    ctx.lineWidth = 20;

    ctx.fillStyle = "#5C5C5C";
    ctx.fillRect(-550, -2500, 2050, 2300);
    ctx.fillStyle = "#424242";
    ctx.fillRect(-550, -300, 2050, 100);
    ctx.strokeRect(-550, -2500, 2050, 2300);

    ctx.lineWidth = 20;
    ctx.fillStyle = "#5C5C5C";
    ctx.fillRect(1450, -3500, 2900, 2800);
    ctx.fillStyle = "#424242";
    ctx.fillRect(1450, -800, 2900, 100);
    ctx.strokeRect(1450, -3500, 2900, 2800);

    // hatch

    ctx.lineWidth = 20;
    ctx.fillStyle = "#424242";
    ctx.fillRect(2550, -2750, 700, 50);
    ctx.strokeRect(2550, -3200, 700, 500);
    ctx.lineWidth = 15;

    ctx.moveTo(2800, -2900);
    ctx.lineTo(3000, -2900);
    ctx.lineTo(3000, -2800);
    ctx.lineTo(2970, -2800);
    ctx.lineTo(2970, -2850);
    ctx.lineTo(2830, -2850);
    ctx.lineTo(2830, -2800);
    ctx.lineTo(2800, -2800);
    ctx.lineTo(2800, -2908);
    ctx.fillStyle = "#A1A1A1";
    ctx.fill();

    ctx.fillStyle = "#8A8A8A";
    ctx.fillRect(2800, -2900, 200, 25);

    ctx.beginPath();
    ctx.moveTo(2800, -2900);
    ctx.lineTo(3000, -2900);
    ctx.lineTo(3000, -2800);
    ctx.lineTo(2970, -2800);
    ctx.lineTo(2970, -2850);
    ctx.lineTo(2830, -2850);
    ctx.lineTo(2830, -2800);
    ctx.lineTo(2800, -2800);
    ctx.lineTo(2800, -2908);
    ctx.stroke();

    // roof rails
    ctx.lineWidth = 20;
    ctx.fillStyle = "#363636";
    ctx.fillRect(1500, -3450, 2800, 70);
    ctx.fillStyle = "#292929";
    ctx.fillRect(1500, -3450, 2800, 30);
    ctx.strokeRect(1500, -3450, 2800, 70);
    ctx.fillRect(1550, -3380, 50, 80);
    ctx.strokeRect(1550, -3380, 50, 80);
    ctx.fillRect(2875, -3380, 50, 80);
    ctx.strokeRect(2875, -3380, 50, 80);
    ctx.fillRect(4200, -3380, 50, 80);
    ctx.strokeRect(4200, -3380, 50, 80);

    ctx.fillStyle = "#363636";
    ctx.fillRect(1500, -1050, 2800, 70);
    ctx.fillStyle = "#292929";
    ctx.fillRect(1500, -1050, 2800, 30);
    ctx.strokeRect(1500, -1050, 2800, 70);
    ctx.fillRect(1550, -980, 50, 80);
    ctx.strokeRect(1550, -980, 50, 80);
    ctx.fillRect(2875, -980, 50, 80);
    ctx.strokeRect(2875, -980, 50, 80);
    ctx.fillRect(4200, -980, 50, 80);
    ctx.strokeRect(4200, -980, 50, 80);

    ctx.fillRect(1500, -3380, 50, 2330);
    ctx.strokeRect(1500, -3380, 50, 2330);
    ctx.fillRect(4250, -3380, 50, 2330);
    ctx.strokeRect(4250, -3380, 50, 2330);

    /*
          ctx.strokeStyle = "red";
          ctx.strokeRect(1450, -3500, 90, 2800);
          ctx.strokeRect(4260, -3500, 90, 2800);
          ctx.strokeRect(1450, -3500, 2900, 100);
          ctx.strokeRect(1450, -1050, 2900, 100); 

    [-2000,-3000,3500,4660],[-1565, 2200, 2700, 1500],[1500,1900,300,2000],[4000,1900,300,2000],[1500, -700, 2800, 4000],[-1950, 1650, 385, 2150],[1119, 1650, 385, 2150],[1450, -3500, 90, 2800],[4260, -3500, 90, 2800],[1450, -3500, 2900, 100],[1450, -1050, 2900, 100]

    */

    ctx.restore();
}, undefined, 0, 0, 2010, 3510);

export let HOUSE_1 = new TextureData(-1190, 3510, 0.2, "building", {
    width: 7370,
    height: 7220
}, [
    [5500, 2400, 2500, 1200],
    [1300, 1500, 1700, 1700],
    [1200, -3500, 5550, 3500],
    [5000, 1000, 3500, 1500],
    [5000, 2200, 500, 1500],
    [8000, 2200, 500, 1500],
    [5000, -3100, 3500, 3200],
    [5000, -2100, 300, 3200],
    [8200, -2100, 300, 3200],
    [1300, -3100, 3900, 6000]
], 0, undefined, function(ctx, n) {
    // body: 3200x2280, texture: 1024,512, size: 0.18, boxes: [[500, 1700, 3200, 1500],[600, 3200, 3000, 700],[2750, 3900, 600, 250]]

    /*
    bounds 

    [5500, 2400, 2500, 1200],
    [1300, 1500, 1700, 1700],
    [1200, -3500, 5550, 3500],
    [5000, 1000, 3500, 1500],
    [5000, 2200, 500, 1500],
    [8000, 2200, 500, 1500],
    [5000, -3100, 3500, 3200],
    [5000, -2100, 300, 3200],
    [8200, -2100, 300, 3200],
    [1300, -3100, 3900, 6000]

    */

    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "black";

    // garage
    ctx.fillStyle = "#949494";
    ctx.lineWidth = 15;
    ctx.moveTo(5000, 2800);
    ctx.lineTo(5000, 3700);
    ctx.lineTo(5500, 3700);
    ctx.lineTo(5500, 2400);
    ctx.lineTo(8000, 2400);
    ctx.lineTo(8000, 3700);
    ctx.lineTo(8500, 3700);
    ctx.lineTo(8500, 2050);
    ctx.lineTo(5000, 2050);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();

    // - door
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(5500, 2400, 2500, 1200);
    ctx.strokeRect(5500, 2400, 2500, 1200);
    ctx.lineWidth = 10;
    ctx.strokeRect(5500, 2400, 2500, 1150);
    ctx.lineWidth = 5;
    ctx.strokeRect(5500, 2400, 2500, 400);
    ctx.strokeRect(5500, 2400, 2500, 800);

    // front porch
    ctx.lineWidth = 15;
    ctx.fillStyle = "#949494";
    ctx.fillRect(3000, 1500, 2000, 1400);
    ctx.strokeRect(3000, 1500, 2000, 1400);
    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(3000, 2900, 2000, 500);
    ctx.fillStyle = "#8A8A8A";
    ctx.fillRect(3000, 3350, 2000, 50);
    ctx.strokeRect(3000, 2900, 2000, 500);
    ctx.lineWidth = 5;
    ctx.strokeRect(3000, 2900, 290, 500);
    ctx.strokeRect(3000, 2900, 580, 500);
    ctx.strokeRect(3000, 2900, 870, 500);
    ctx.strokeRect(3000, 2900, 1160, 500);
    ctx.strokeRect(3000, 2900, 1450, 500);
    ctx.strokeRect(3000, 2900, 1740, 500);

/*    ctx.lineWidth = 20;
    ctx.fillStyle = "#ABABAB";
    ctx.fillRect(3500, 3700, 1000, 500);
    ctx.fillRect(3500, 4500, 1000, 500);
    ctx.fillRect(3500, 5300, 1000, 500);
    ctx.fillStyle = "#DBDBDB";
    ctx.fillRect(3500, 3700, 1000, 420);
    ctx.fillRect(3500, 4500, 1000, 420);
    ctx.fillRect(3500, 5300, 1000, 420);
    ctx.strokeRect(3500, 3700, 1000, 500);
    ctx.strokeRect(3500, 4500, 1000, 500);
    ctx.strokeRect(3500, 5300, 1000, 500); */

    // - door
    ctx.lineWidth = 15;
    ctx.fillStyle = "#757575";
    ctx.fillRect(3200, 1800, 700, 1100);
    ctx.strokeRect(3200, 1800, 700, 1100);

    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(3200, 1900, 50, 1020);
    ctx.fillRect(3850, 1900, 50, 1020);
    ctx.fillRect(3200, 1800, 700, 100);
    ctx.fillStyle = "#404040";
    ctx.fillRect(3200, 1800, 700, 50);
    ctx.strokeRect(3200, 1900, 50, 1020);
    ctx.strokeRect(3850, 1900, 50, 1020);
    ctx.strokeRect(3200, 1800, 700, 100);

    ctx.lineWidth = 15;
    ctx.fillRect(3750, 2400, 50, 150);
    ctx.strokeRect(3750, 2400, 50, 150);

    // - window
    ctx.lineWidth = 15;
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(4000, 1800, 800, 800);
    ctx.fillStyle = "#404040";
    ctx.fillRect(4000, 1800, 800, 50);
    ctx.fillStyle = "#C7C7C7";
    ctx.fillRect(4050, 1900, 700, 650);
    ctx.fillStyle = "#404040";
    ctx.fillRect(4050, 2500, 700, 50);
    ctx.strokeRect(4000, 1800, 800, 800);
    ctx.lineWidth = 15;
    ctx.strokeRect(4050, 1900, 700, 650);
    ctx.strokeRect(4050, 1900, 700, 600);

    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(4050, 2083, 700, 50);
    ctx.fillRect(4050, 2316, 700, 50);
    ctx.fillStyle = "#404040";
    ctx.fillRect(4050, 2083, 700, 30);
    ctx.fillRect(4050, 2316, 700, 30);

    ctx.strokeRect(4050, 2083, 700, 50);
    ctx.strokeRect(4050, 2316, 700, 50);

    // small left section
    ctx.lineWidth = 15;
    ctx.fillStyle = "#949494";
    ctx.fillRect(1300, 1500, 1700, 1700);
    ctx.strokeRect(1300, 1500, 1700, 1700);

    // - window
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(2000, 1850, 1000, 1380);
    ctx.lineWidth = 15;
    ctx.fillStyle = "#404040";
    ctx.fillRect(2000, 1850, 1000, 50);
    ctx.fillRect(2050, 3150, 950, 50);
    ctx.strokeRect(2050, 1950, 950, 1240);

    ctx.fillStyle = "#C7C7C7";
    ctx.fillRect(2050, 1950, 950, 1190);

    ctx.fillStyle = "#4D4D4D";
    ctx.strokeRect(2050, 1950, 950, 1190);
    ctx.fillRect(2500, 1950, 50, 1220);
    ctx.fillRect(2050, 2313, 450, 50);
    ctx.fillRect(2050, 2726, 450, 50);
    ctx.fillStyle = "#404040";
    ctx.fillRect(2050, 2313, 450, 30);
    ctx.fillRect(2050, 2726, 450, 30);


    ctx.strokeRect(2500, 1950, 50, 1220);
    ctx.strokeRect(2050, 2313, 450, 50);
    ctx.strokeRect(2050, 2726, 450, 50);

    ctx.lineWidth = 15;
    ctx.strokeRect(2000, 1850, 1000, 1380);

    // roofs
    ctx.lineWidth = 15;
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(1200, -3500, 5550, 3500);
    ctx.fillStyle = "#404040";
    ctx.fillRect(1200, -3500, 5550, 3200);
    ctx.strokeRect(1200, -3500, 5550, 3500);

    // top right section 
    ctx.lineWidth = 15;
    ctx.fillStyle = "#C7C7C7";
    ctx.fillRect(5000, -700, 3500, 2500);
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(5000, -3100, 3500, 2400);
    ctx.strokeRect(5000, -3100, 3500, 5000);

    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(5300, -400, 2900, 1900);
    ctx.strokeRect(5300, -400, 2900, 1900);
    ctx.fillStyle = "#787878";
    ctx.fillRect(5300, -400, 2900, 500);
    ctx.strokeRect(5300, -400, 2900, 500);

    ctx.lineWidth = 5;
    ctx.strokeRect(5300, 100, 290, 1400);
    ctx.strokeRect(5300, 100, 580, 1400);
    ctx.strokeRect(5300, 100, 870, 1400);
    ctx.strokeRect(5300, 100, 1160, 1400);
    ctx.strokeRect(5300, 100, 1450, 1400);
    ctx.strokeRect(5300, 100, 1740, 1400);
    ctx.strokeRect(5300, 100, 2030, 1400);
    ctx.strokeRect(5300, 100, 2320, 1400);
    ctx.strokeRect(5300, 100, 2610, 1400);

    // top bar 
    ctx.lineWidth = 15;
    ctx.fillStyle = "#636363";
    ctx.fillRect(1250, 1350, 3750, 250);
    ctx.fillStyle = "#424242";
    ctx.fillRect(1250, 1350, 3750, 50);
    ctx.strokeRect(1250, 1350, 3750, 250);

    ctx.lineWidth = 15;
    ctx.fillStyle = "#636363";
    ctx.fillRect(5000, 1800, 3550, 250);
    ctx.fillStyle = "#424242";
    ctx.fillRect(5000, 1800, 3550, 50);
    ctx.strokeRect(5000, 1800, 3550, 250);

    ctx.lineWidth = 15;
    ctx.fillStyle = "#636363";
    ctx.fillRect(4950, 1350, 50, 700);
    ctx.fillStyle = "#424242";
    ctx.fillRect(4950, 1350, 50, 500);
    ctx.strokeRect(4950, 1350, 50, 700);

    // - door
    ctx.fillStyle = "#616161";
    ctx.fillRect(5675, -400, 700, 500);
    ctx.strokeRect(5675, -400, 700, 500);

    ctx.fillStyle = "#404040";
    ctx.fillRect(5675, -400, 50, 530);
    ctx.strokeRect(5675, -400, 50, 530);

    ctx.fillRect(6325, -400, 50, 530);
    ctx.strokeRect(6325, -400, 50, 530);

    ctx.lineWidth = 15;
    ctx.fillRect(6225, -400, 50, 100);
    ctx.strokeRect(6225, -400, 50, 100);

    // - rail
    ctx.lineWidth = 15;
    ctx.fillStyle = "#757575";
    ctx.fillRect(5300, 1000, 2900, 100);
    ctx.fillStyle = "#616161";
    ctx.fillRect(5300, 1000, 2900, 50);
    ctx.strokeRect(5300, 1000, 2900, 100);

    ctx.fillRect(5840, 1100, 50, 300);
    ctx.fillRect(6430, 1100, 50, 300);
    ctx.fillRect(7020, 1100, 50, 300);
    ctx.fillRect(7610, 1100, 50, 300);

    ctx.strokeRect(5840, 1100, 50, 300);
    ctx.strokeRect(6430, 1100, 50, 300);
    ctx.strokeRect(7020, 1100, 50, 300);
    ctx.strokeRect(7610, 1100, 50, 300);

    // top left section
    ctx.fillStyle = "#949494";
    ctx.fillRect(1300, 0, 3700, 1350);
    ctx.strokeRect(1300, 0, 3700, 1350);

    // - window
    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(1900, 400, 2500, 550);
    ctx.fillStyle = "#404040";
    ctx.fillRect(1900, 400, 2500, 50);
    ctx.strokeRect(1900, 400, 2500, 550);
    ctx.lineWidth = 15;
    ctx.fillStyle = "#404040";
    ctx.fillRect(2000, 550, 2300, 300);
    ctx.strokeRect(2000, 550, 2300, 300);
    ctx.fillStyle = "#C2C2C2";
    ctx.fillRect(2000, 550, 2300, 250);
    ctx.strokeRect(2000, 550, 2300, 250);

    ctx.fillStyle = "#4D4D4D";
    ctx.fillRect(2733, 550, 50, 280);
    ctx.fillRect(3516, 550, 50, 280);
    ctx.strokeRect(2733, 550, 50, 280);
    ctx.strokeRect(3516, 550, 50, 280);

    ctx.restore();
}, undefined, 0, 0, 0, 0);

export let GENERIC_APARTMENT = new TextureData(-98, -338, 0.2, "building", {
    width: 3200,
    height: 2280
}, [
    [500, 1700, 3200, 1500],
    [600, 3200, 3000, 700],
    [2750, 3900, 600, 250, 0]
], 20, undefined, function(ctx, n) {
    // body: 3200x2280, texture: 1024,512, size: 0.18, boxes: [[500, 1700, 3200, 1500],[600, 3200, 3000, 700],[2750, 3900, 600, 250]]

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    console.log(this.size);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "1A1A1A";

    // roof
    ctx.fillStyle = "white";
    ctx.fillRect(500, 1700, 3200, 1500);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(500, 1700, 3200, 1300);
    ctx.fillStyle = "#D9D9D9";
    ctx.fillRect(500, 1700, 3200, 500);
    ctx.fillStyle = "#E3E3E3";
    ctx.strokeRect(500, 1700, 3200, 1500);

    // front
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(600, 3200, 3000, 700);
    ctx.strokeRect(600, 3200, 3000, 700);

    // windows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(800, 3650, 700, 100);
    ctx.fillStyle = "#B8B8B8";
    ctx.fillRect(800, 3400, 700, 250);
    ctx.strokeRect(800, 3400, 700, 350);
    ctx.lineWidth = 10;
    ctx.moveTo(800, 3650);
    ctx.lineTo(1500, 3650);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(1800, 3650, 700, 100);
    ctx.fillStyle = "#B8B8B8";
    ctx.fillRect(1800, 3400, 700, 250);
    ctx.strokeRect(1800, 3400, 700, 350);

    ctx.lineWidth = 10;
    ctx.moveTo(1800, 3650);
    ctx.lineTo(2500, 3650);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.fillStyle = "#595959";
    ctx.fillRect(2135, 3403, 30, 320);
    ctx.strokeRect(2135, 3403, 30, 320);

    ctx.lineWidth = 10;
    ctx.fillStyle = "#595959";
    ctx.fillRect(1135, 3403, 30, 320);
    ctx.strokeRect(1135, 3403, 30, 320);

    // door
    ctx.lineWidth = 20;
    ctx.strokeRect(2800, 3400, 500, 500);
    ctx.fillStyle = "white";
    ctx.fillRect(2750, 3900, 600, 250);
    ctx.strokeRect(2750, 3900, 600, 250);
    ctx.lineWidth = 12;
    ctx.strokeRect(3210, 3650, 50, 80);
    ctx.lineWidth = 10;
    ctx.strokeRect(2750, 4125, 600, 25);

    ctx.fillStyle = "#3C3C3C";
    ctx.font = "100px Arial";
    ctx.textAlign = "center";
    ctx.strokeText(String("205"), 3050, 3600);

    ctx.restore();
});

export let SUPERMARKET = new TextureData(-98, -338, 0.2, "building", {
    width: 6200,
    height: 2600
}, [
    [500, 1700, 6200, 1700],
    [600, 3400, 6000, 900]
], 20, undefined, function(ctx) {
    // body: 6200x2600, texture: 2048,1024, size: 0.18, boxes: [[402, 1362, 6200, 1700],[502, 3062, 6000, 900]]

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "#3C3C3C";

    // roof
    ctx.fillStyle = "white";
    ctx.fillRect(500, 1700, 6200, 1700);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(500, 1700, 6200, 1500);
    ctx.fillStyle = "#E3E3E3";
    ctx.strokeRect(500, 1700, 6200, 1700);

    // front
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(600, 3400, 6000, 900);
    ctx.strokeRect(600, 3400, 6000, 900);

    // sign
    ctx.fillRect(1850, 2300, 3500, 600);
    ctx.fillStyle = "#E3E3E3";
    ctx.fillRect(1850, 2300, 3500, 100);
    ctx.strokeRect(1850, 2300, 3500, 600);
    ctx.fillStyle = "#3C3C3C";
    ctx.strokeRect(1950, 2250, 50, 50);
    ctx.strokeRect(5200, 2250, 50, 50);

    ctx.fillStyle = "black";
    ctx.font = "200px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText("SUPER", 2600, 2700);
    ctx.font = "500px Arial";
    ctx.strokeText("マーケッ", 4200, 2660);

    // window

    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(1100, 3600, 1600, 300);
    ctx.strokeRect(1100, 3600, 1600, 400);
    ctx.lineWidth = 15;
    ctx.moveTo(1100, 3900);
    ctx.lineTo(2700, 3900);
    ctx.stroke();

    ctx.lineWidth = 20;
    ctx.fillRect(4500, 3600, 1600, 300);
    ctx.strokeRect(4500, 3600, 1600, 400);
    ctx.lineWidth = 15;
    ctx.moveTo(4500, 3900);
    ctx.lineTo(6100, 3900);
    ctx.stroke();

    // open sign
    ctx.strokeRect(3080, 3700, 400, 250);
    ctx.font = "125px Arial";
    ctx.fillStyle = "#3C3C3C";
    ctx.strokeText("OPEN", 3280, 3825);
    ctx.moveTo(3140, 3700);
    ctx.lineTo(3280, 3600);
    ctx.moveTo(3420, 3700);
    ctx.lineTo(3280, 3600);
    ctx.stroke();

    // font door
    ctx.lineWidth = 20;
    ctx.strokeRect(2900, 3600, 1400, 700);
    ctx.lineWidth = 15;
    ctx.strokeRect(3580, 3600, 40, 700);
    ctx.strokeRect(3680, 3900, 80, 140);
    ctx.fillStyle = "white";
    ctx.fillRect(3440, 3900, 80, 140);
    ctx.strokeRect(3440, 3900, 80, 140);

    // details
    ctx.fillStyle = "black";
    ctx.font = "80px Arial";
    ctx.fillText("MON-SUN", 3960, 3800);
    ctx.fillText("24-7", 3960, 3880);

    ctx.restore();
});

export let CAFE = new TextureData(-18, -18, 0.2, "building", {
    width: 4000,
    height: 3000
}, [
    [100, 100, 4000, 2100],
    [200, 2100, 3800, 1000]
], 20, undefined, function(ctx) {
    // body: 4000x3000, texture: 1024,1024, size: 0.18, boxes: [[82, 82, 4000, 2000],[182, 2082, 3800, 1000]

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "#1A1A1A";

    // roof
    ctx.fillStyle = "white";
    ctx.fillRect(100, 100, 4000, 2000);
    ctx.fillStyle = "#C9C9C9";
    ctx.fillRect(100, 100, 4000, 1800);
    ctx.strokeRect(100, 100, 4000, 2000);

    // sign
    ctx.fillStyle = "white";
    ctx.fillRect(1250, 800, 1700, 600);
    ctx.fillStyle = "#E3E3E3";
    ctx.fillRect(1250, 800, 1700, 100);
    ctx.strokeRect(1250, 800, 1700, 600);
    ctx.fillStyle = "#7a7a7a";
    ctx.fillRect(2050, 1400, 100, 100);
    ctx.strokeRect(2050, 1400, 100, 100);
    ctx.fillStyle = "black";
    ctx.font = "420px Neonderthaw";
    ctx.strokeText("Cafeko", 1420, 1250);

    // cup

    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(2655, 1000);
    ctx.lineTo(2770, 1000);
    ctx.lineTo(2770, 1150);
    ctx.lineTo(2720, 1200);
    ctx.lineTo(2720, 1260);
    ctx.lineTo(2750, 1280);
    ctx.lineTo(2680, 1280);
    ctx.lineTo(2710, 1260);
    ctx.lineTo(2710, 1200);
    ctx.lineTo(2660, 1150);
    ctx.lineTo(2660, 1000);
    ctx.stroke();
    ctx.lineWidth = 20;

    // front
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(200, 2100, 3800, 1010);
    ctx.strokeRect(200, 2100, 3800, 1000);

    // shade

    ctx.moveTo(100, 2100);
    ctx.lineTo(400, 2400);
    ctx.lineTo(600, 2400);
    ctx.lineTo(600, 2300);
    ctx.lineTo(800, 2300);
    ctx.lineTo(800, 2400);

    ctx.lineTo(1000, 2400);
    ctx.lineTo(1000, 2300);
    ctx.lineTo(1200, 2300);
    ctx.lineTo(1200, 2400);

    ctx.lineTo(1400, 2400);
    ctx.lineTo(1400, 2300);
    ctx.lineTo(1600, 2300);
    ctx.lineTo(1600, 2400);

    ctx.lineTo(1800, 2400);
    ctx.lineTo(1800, 2300);
    ctx.lineTo(2000, 2300);
    ctx.lineTo(2000, 2400);

    ctx.lineTo(2200, 2400);
    ctx.lineTo(2200, 2300);
    ctx.lineTo(2400, 2300);
    ctx.lineTo(2400, 2400);

    ctx.lineTo(2600, 2400);
    ctx.lineTo(2600, 2300);
    ctx.lineTo(2800, 2300);
    ctx.lineTo(2800, 2400);

    ctx.lineTo(3000, 2400);
    ctx.lineTo(3000, 2300);
    ctx.lineTo(3200, 2300);
    ctx.lineTo(3200, 2400);

    ctx.lineTo(3400, 2400);
    ctx.lineTo(3400, 2300);
    ctx.lineTo(3600, 2300);
    ctx.lineTo(3600, 2400);
    ctx.lineTo(3800, 2400);
    ctx.lineTo(4090, 2100);
    ctx.lineTo(100, 2100);
    ctx.fillStyle = "#E3E3E3";
    ctx.fill();
    ctx.stroke();

    // front door and window
    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(2000, 2500, 1600, 320);
    ctx.strokeRect(2000, 2500, 1600, 400);
    ctx.strokeRect(800, 2500, 600, 600);
    ctx.lineWidth = 15;
    ctx.fillRect(1000, 2600, 200, 200);
    ctx.strokeRect(1300, 2700, 100, 200);
    ctx.strokeRect(1000, 2600, 200, 250);

    ctx.moveTo(2000, 2820);
    ctx.lineTo(3600, 2820);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(1000, 2800);
    ctx.lineTo(1200, 2800);
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "150px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("B  R  E  A  K  F  A  S  T", 2795, 2700);

    ctx.restore();
});
// -90, 2500
export let CONVENIENCE_STORE = new TextureData(-90, 2500, 0.2, "building", {
    width: 6220,
    height: 4610
}, [
   [200,200,6000,1800],[100,-2490,6200,2700]
], 0, undefined, function(ctx, n) {
    // body: 3200x2280, texture: 1024,512, size: 0.18, boxes: [[500, 1700, 3200, 1500],[600, 3200, 3000, 700],[2750, 3900, 600, 250]]

    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "#BCBCBC";
    ctx.fillRect(200,200,6000,1800);
    ctx.strokeRect(200,200,6000,1800);

    // bottom curb
    ctx.fillStyle = "#DCDCDC";
    ctx.fillRect(150,1950,2050,150);
    ctx.fillStyle = "#EFEFEF";
    ctx.fillRect(150,1950,2050,80);
    ctx.strokeRect(150,1950,2050,150);

    ctx.fillStyle = "#DCDCDC";
    ctx.fillRect(150,400,50,1500);
    ctx.strokeRect(150,400,50,1500);

    ctx.fillStyle = "#DCDCDC";
    ctx.fillRect(4200,1950,2050,150);
    ctx.fillStyle = "#EFEFEF";
    ctx.fillRect(4200,1950,2050,80);
    ctx.strokeRect(4200,1950,2050,150);

    ctx.fillStyle = "#DCDCDC";
    ctx.fillRect(6200,400,50,1500);
    ctx.strokeRect(6200,400,50,1500);

    // door

    ctx.fillStyle = "#565656";
    ctx.fillRect(3050,650,300,70);
    ctx.fillStyle = "#777777";
    ctx.fillRect(3100,690,200,20);
    ctx.lineWidth = 5;
    ctx.strokeRect(3100,690,200,20);
    ctx.lineWidth = 15;
    ctx.strokeRect(3050,650,300,70);
 
    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(2200,800,2000,1200);
    ctx.strokeRect(2200,800,2000,1200);

    // door content 
/*
    ctx.strokeStyle = "#676767";
    ctx.fillStyle = "#BDBDBD";
    ctx.lineWidth = 15;
    ctx.fillRect(2500,800,1400,200);
    ctx.strokeRect(2500,800,1400,200);
*/

    // remining door frame
    ctx.lineWidth = 15;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "#777777";

    ctx.fillRect(2200,800,2000,50);
    ctx.fillRect(2200,2000,2000,30);

    ctx.strokeRect(2200,800,2000,50);
    ctx.strokeRect(2200,2000,2000,30);
    
    ctx.fillRect(4150,850,50,1200);
    ctx.strokeRect(4150,850,50,1200);
    ctx.fillRect(2200,850,50,1200);
    ctx.strokeRect(2200,850,50,1200);
    ctx.fillRect(3180,850,40,1200);
    ctx.strokeRect(3180,850,40,1200);

    ctx.fillRect(3000,1400,110,250);
    ctx.fillRect(3290,1400,110,250);
    ctx.fillStyle = "#555555";
    ctx.fillRect(3000,1400,110,50);
    ctx.fillRect(3290,1400,110,50);
    ctx.strokeRect(3000,1400,110,250);
    ctx.strokeRect(3290,1400,110,250);

    // door posters
/*
    ctx.lineWidth = 15;
    ctx.fillStyle = "#BBBBBB";
    ctx.fillRect(2400,1000,630,200);
    ctx.fillStyle = "#9A9A9A";
    ctx.fillRect(2400,1000,630,30);
    ctx.font = "100px Arial";
    ctx.strokeStyle = "#444444";
    ctx.strokeText("打開 - 𝟮𝟰/𝟳",2470,1140); 
    ctx.strokeStyle = "#1A1A1A";
    ctx.strokeRect(2400,1000,630,200);

    ctx.fillStyle = "#EAEAEA";
    ctx.fillRect(3500,950,550,800);
    ctx.fillStyle = "#BDBDBD";
    ctx.fillRect(3500,950,550,30);
    ctx.fillStyle = "#898989";
    ctx.fillRect(3500,1050,550,80);
    ctx.fillRect(3500,1600,550,80);
    ctx.textAlign = "center";
    ctx.font = "400px Arial";
    ctx.strokeText("➋",3775,1450); 
    ctx.font = "90px Arial";
    ctx.strokeText("𝘍𝘖𝘙 𝘖𝘕𝘌",3775,1550); 
    ctx.strokeRect(3500,950,550,800);
*/

    // window 
    ctx.strokeStyle = "black";
    ctx.lineWidth = 15;
    ctx.fillStyle = "#777777";
    ctx.fillRect(400,500,1600,1300);
    ctx.fillStyle = "#565656";
    ctx.fillRect(400,500,1600,50);
 
    ctx.fillRect(450,600,1500,1150);
    ctx.strokeRect(400,500,1600,1300);
    ctx.strokeRect(450,600,1500,1150);

    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(450,600,1500,1100);

    // window content 
    ctx.strokeStyle = "#676767";
    ctx.fillStyle = "#BDBDBD";
    ctx.fillRect(450,750,1500,950);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(450,750,1500,50);
    ctx.fillRect(450,1100,1500,200);
    ctx.fillRect(450,1600,1500,100);
    ctx.strokeRect(450,750,1500,950);
    ctx.strokeRect(450,1300,1500,50);

    // - cereal boxes 
    function cerealBox(x, y, width = 0) {
     ctx.translate(x,y);
     ctx.fillStyle = "#ABABAB";
     ctx.fillRect(450,950,200 + width,300);
     ctx.fillStyle = "#9A9A9A";
     ctx.fillRect(450,950,200 + width,100);
     ctx.fillStyle = "#DCDCDC";
     ctx.fillRect(450,1100,200 + width,50);
     ctx.strokeRect(450,950,200 + width,300);
     ctx.strokeRect(450,950,200 + width,50);
     ctx.translate(-x,-y);
    }

    cerealBox(0,0);
    cerealBox(300,0,50);
    cerealBox(650,0,50);
    cerealBox(1000,0,50);
    cerealBox(1350,0,-50);

    // soda bottles

    function sodaBottle(x=0,y=0) {
     ctx.translate(x,y);
     ctx.fillStyle = "#777777";
     ctx.fillRect(1345,1450,60,30);
     ctx.strokeRect(1345,1450,60,30);

      
     ctx.fillStyle = "#999999";
     ctx.beginPath();
     ctx.moveTo(1300,1700);
     ctx.lineTo(1300,1550);
     ctx.lineTo(1350,1500);
     ctx.lineTo(1350,1480);
     ctx.lineTo(1400,1480);
     ctx.lineTo(1400,1500);
     ctx.lineTo(1450,1550);
     ctx.lineTo(1450,1700);
     ctx.fill();
     ctx.fillStyle = "#777777";
     ctx.fillRect(1300,1550,150,100);
     ctx.stroke();
     ctx.translate(-x,-y);
    }
  
    sodaBottle(-800,0); 
    sodaBottle(-550,0); 
    sodaBottle(-300,0); 
    sodaBottle(-50,0); 
    sodaBottle(200,0); 
    sodaBottle(450,0); 
 
    // remaining window frame
    ctx.strokeStyle = "black";
    ctx.strokeRect(450,600,1500,1100);
 
    ctx.fillStyle = "#777777";
    ctx.fillRect(450,850,1500,40);
    ctx.strokeRect(450,850,1500,40);
    ctx.fillRect(1180,600,40,1115);
    ctx.strokeRect(1180,600,40,1115);

    // other window 
    ctx.lineWidth = 15;
    ctx.fillStyle = "#777777";
    ctx.fillRect(4400,500,1600,500);
    ctx.fillStyle = "#565656";
    ctx.fillRect(4400,500,1600,50);
    ctx.fillRect(4450,600,1500,350);
    ctx.strokeRect(4400,500,1600,500);
    ctx.strokeRect(4450,600,1500,350);

    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(4450,600,1500,300);
    ctx.strokeRect(4450,600,1500,300);

    ctx.fillStyle = "#777777";
    ctx.fillRect(5180,600,40,315);
    ctx.strokeRect(5180,600,40,315);

    // roof
    
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.fillStyle = "#454545";
    ctx.fillRect(100,-2495,6200,2700);

    ctx.fillRect(100,-2495,6200,2700);
    
    ctx.fillStyle = "#555555";
    ctx.fillRect(400,-2495,5600,2200);
    ctx.fillStyle = "#333333";
    ctx.moveTo(100,-100);
    ctx.lineTo(400,-400);
    ctx.lineTo(6000,-400);
    ctx.lineTo(6300,-100);
    ctx.fill();

    ctx.fillStyle = "#2C2C2C";
    ctx.fillRect(100,-100,6200,310);
    ctx.strokeRect(100,-2490,6200,2700);

    // main sign 
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(1200,-450,4000,700);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(1200,-450,4000,100);
    ctx.strokeRect(1200,-450,4000,700);
    ctx.font = "300px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#666666";
    ctx.fillText("便利◌商店",3200,20);
    ctx.strokeText("便利◌商店",3200,20);
    ctx.font = "100px Arial";
    ctx.strokeText("B i à n l ì  C o n v e n i e n c e",3200,200);
    ctx.textAlign = "left";

    // atm

    function wallATM(x,y) {
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    ctx.fillStyle = "#787878";
    ctx.fillRect(0, 0, 550, 700);
    ctx.fillStyle = "#666666";
    ctx.fillRect(0, 0, 550, 80);
    ctx.fillStyle = "#666666";
    ctx.fillRect(0, 350, 550, 200);
    ctx.strokeRect(0, 0, 550, 700);

    ctx.lineWidth = 10; 
    ctx.fillStyle = "#666666";
    ctx.fillRect(75, 200, 400, 150);
    ctx.fillStyle = "#555555";
    ctx.fillRect(75, 370, 400, 120);
    ctx.strokeRect(75, 200, 400, 280);

    ctx.lineWidth = 5;
    ctx.moveTo(0,360);
    ctx.lineTo(80,360);
    ctx.moveTo(480,360);
    ctx.lineTo(560,360);
    ctx.stroke();
  
    ctx.font = "70px Arial";
    ctx.strokeText("ATM",200,170);
    ctx.fillStyle = "#787878";
    ctx.fillRect(25, 80, 500, 35);
    
    ctx.lineWidth = 10; 
    ctx.fillStyle = "#EFEFEF";
    ctx.fillRect(125, 250, 210, 90);
    ctx.strokeRect(125, 250, 210, 90);

    ctx.fillStyle = "#919191";
    ctx.fillRect(375, 250, 50, 30);
    ctx.fillRect(375, 310, 50, 30);
    ctx.strokeRect(375, 250, 50, 30);
    ctx.strokeRect(375, 310, 50, 30);

    ctx.translate(0,20);
    ctx.fillRect(170, 380, 210, 40);
    ctx.strokeRect(170, 380, 210, 40);
    ctx.lineWidth = 10;
    ctx.strokeRect(170, 380, 210, 20);
    ctx.strokeRect(170, 380, 42, 40);
    ctx.strokeRect(170, 380, 84, 20);
    ctx.strokeRect(170, 380, 126, 20);
    ctx.strokeRect(170, 380, 168, 40);

    ctx.lineWidth = 10;
    ctx.strokeRect(175, 600, 200, 20);
    ctx.translate(-x,-y);
    }

    wallATM(4530,1150);
    wallATM(5320,1130);

    ctx.restore();
},[],0,0,-90,2500);

export let ATM = new TextureData(0, 0, 0.2, "avatar", {
    width: 570,
    height: 1020
}, [
    [0, 0, 570, 1020],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
],0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";

    ctx.fillStyle = "#787878";
    ctx.fillRect(0, 0, 550, 1000);
    ctx.fillStyle = "#666666";
    ctx.fillRect(0, 0, 550, 80);
    ctx.fillStyle = "#666666";
    ctx.fillRect(0, 350, 550, 200);
    ctx.strokeRect(0, 0, 550, 1000);

    ctx.lineWidth = 10; 
    ctx.fillStyle = "#666666";
    ctx.fillRect(75, 200, 400, 150);
    ctx.fillStyle = "#555555";
    ctx.fillRect(75, 370, 400, 120);
    ctx.strokeRect(75, 200, 400, 280);

    ctx.lineWidth = 5;
    ctx.moveTo(0,360);
    ctx.lineTo(80,360);
    ctx.moveTo(480,360);
    ctx.lineTo(560,360);
    ctx.stroke();
  
    ctx.font = "70px Arial";
    ctx.strokeText("ATM",200,170);
    ctx.fillStyle = "#787878";
    ctx.fillRect(25, 80, 500, 35);
    
    ctx.lineWidth = 10; 
    ctx.fillStyle = "#EFEFEF";
    ctx.fillRect(125, 250, 210, 90);
    ctx.strokeRect(125, 250, 210, 90);

    ctx.fillStyle = "#919191";
    ctx.fillRect(375, 250, 50, 30);
    ctx.fillRect(375, 310, 50, 30);
    ctx.strokeRect(375, 250, 50, 30);
    ctx.strokeRect(375, 310, 50, 30);

    ctx.translate(0,20);
    ctx.fillRect(170, 380, 210, 40);
    ctx.strokeRect(170, 380, 210, 40);
    ctx.lineWidth = 10;
    ctx.strokeRect(170, 380, 210, 20);
    ctx.strokeRect(170, 380, 42, 40);
    ctx.strokeRect(170, 380, 84, 20);
    ctx.strokeRect(170, 380, 126, 20);
    ctx.strokeRect(170, 380, 168, 40);

    ctx.lineWidth = 10;
    ctx.strokeRect(175, 600, 200, 20);

    ctx.restore();
},[],0,0,10,10);

// @FIREARMS

export let NXR_44_MAG = new TextureData(-2, -7, 0.22, "firearm", {
    width: 691,
    height: 344
}, [
    [0, 0, 691, 344]
], 0, undefined, function(ctx) {
    // -2 -7
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.beginPath();
    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    ctx.scale(0.8, 0.8);
    ctx.translate(50, 30);
    ctx.moveTo(130, 140);
    ctx.lineTo(130, 125);
    ctx.lineTo(160, 124);
    ctx.lineTo(190, 100);
    ctx.lineTo(195, 70);
    ctx.lineTo(195, 60);
    ctx.lineTo(380, 60);
    ctx.lineTo(374, 185);

    // trigger house outside
    ctx.lineTo(350, 220);
    ctx.lineTo(320, 220);
    ctx.lineTo(315, 240);
    ctx.lineTo(300, 260);
    ctx.lineTo(270, 280);
    ctx.lineTo(210, 255);

    // trigger house
    ctx.moveTo(290, 210);
    ctx.lineTo(270, 205);
    ctx.lineTo(225, 210);
    ctx.lineTo(222, 220);
    ctx.lineTo(225, 242);
    ctx.lineTo(272, 262);
    ctx.lineTo(290, 245);
    ctx.lineTo(300, 230);
    ctx.lineTo(305, 213);
    ctx.lineTo(290, 210);

    // nozzel
    ctx.moveTo(380, 60);
    ctx.lineTo(800, 60);
    ctx.lineTo(800, 185);
    ctx.lineTo(374, 185);
    ctx.lineTo(348, 224);

    ctx.fill();

    ctx.resetTransform();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);

    ctx.fillStyle = "#F3F3F3";

    // handle
    ctx.beginPath();
    ctx.moveTo(150, 370);
    ctx.lineTo(60, 370);
    ctx.lineTo(30, 360);
    ctx.lineTo(20, 350);
    ctx.lineTo(40, 310);
    ctx.lineTo(55, 260);
    ctx.lineTo(65, 240);
    ctx.lineTo(90, 210);
    ctx.lineTo(110, 160);
    ctx.lineTo(110, 140);
    ctx.lineTo(150, 140);
    ctx.lineTo(165, 175);
    ctx.lineTo(200, 190);
    ctx.lineTo(205, 215);
    ctx.lineTo(210, 230);
    ctx.lineTo(180, 225);
    ctx.lineTo(170, 235);
    ctx.lineTo(170, 250);
    ctx.lineTo(180, 260);
    ctx.lineTo(180, 265);
    ctx.lineTo(160, 280);
    ctx.lineTo(160, 300);
    ctx.lineTo(165, 310);
    ctx.lineTo(145, 330);
    ctx.lineTo(150, 350);
    ctx.lineTo(155, 360);
    ctx.lineTo(155, 370);
    ctx.lineTo(150, 370);
    ctx.fill();

    // OUTLINE______________________________________
    // handle
    ctx.beginPath();
    ctx.moveTo(150, 370);
    ctx.lineTo(60, 370);
    ctx.lineTo(30, 360);
    ctx.lineTo(20, 350);
    ctx.lineTo(40, 310);
    ctx.lineTo(55, 260);
    ctx.lineTo(65, 240);
    ctx.lineTo(90, 210);
    ctx.lineTo(110, 160);
    ctx.lineTo(110, 140);
    ctx.lineTo(150, 140);
    ctx.lineTo(165, 175);
    ctx.lineTo(200, 190);
    ctx.lineTo(205, 215);
    ctx.lineTo(210, 230);
    ctx.lineTo(180, 225);
    ctx.lineTo(170, 235);
    ctx.lineTo(170, 250);
    ctx.lineTo(180, 260);
    ctx.lineTo(180, 265);
    ctx.lineTo(160, 280);
    ctx.lineTo(160, 300);
    ctx.lineTo(165, 310);
    ctx.lineTo(145, 330);
    ctx.lineTo(150, 350);
    ctx.lineTo(155, 360);
    ctx.lineTo(155, 370);
    ctx.lineTo(150, 370);
    ctx.stroke();

    // main body
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.scale(0.8, 0.8);
    ctx.translate(50, 30);
    ctx.moveTo(130, 140);
    ctx.lineTo(130, 125);
    ctx.lineTo(160, 124);
    ctx.lineTo(190, 100);
    ctx.lineTo(195, 70);
    ctx.lineTo(195, 60);
    ctx.lineTo(380, 60);

    // trigger house outside
    ctx.moveTo(350, 220);
    ctx.lineTo(320, 220);
    ctx.lineTo(315, 240);
    ctx.lineTo(300, 260);
    ctx.lineTo(270, 280);
    ctx.lineTo(210, 255);

    // nozzel
    ctx.moveTo(380, 60);
    ctx.lineTo(800, 60);
    ctx.lineTo(800, 185);
    ctx.lineTo(374, 185);
    ctx.lineTo(348, 224);

    ctx.stroke();
    ctx.resetTransform();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);

    // trigger house
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(270, 190);
    ctx.lineTo(250, 185);
    ctx.lineTo(220, 190);
    ctx.lineTo(215, 200);
    ctx.lineTo(220, 220);
    ctx.lineTo(255, 235);
    ctx.lineTo(270, 225);
    ctx.lineTo(282, 210);
    ctx.lineTo(285, 193);
    ctx.lineTo(270, 190);
    ctx.stroke();

    // trigger
    ctx.beginPath();
    ctx.moveTo(230, 190);
    ctx.lineTo(240, 210);
    ctx.lineTo(245, 215);
    ctx.lineTo(255, 220);
    ctx.lineTo(258, 218);
    ctx.lineTo(250, 205);
    ctx.lineTo(250, 187);

    // rear thingy
    ctx.moveTo(190, 100);
    ctx.lineTo(180, 95);
    ctx.lineTo(170, 80);
    ctx.lineTo(165, 85);
    ctx.lineTo(170, 100);
    ctx.lineTo(177, 111);
    ctx.fillStyle = "#787878";
    ctx.fill();
    ctx.stroke();

    // cylinder
    ctx.beginPath();
    ctx.strokeRect(230, 90, 75, 70);
    ctx.moveTo(305, 115);
    ctx.lineTo(260, 115);
    ctx.lineTo(250, 125);
    ctx.lineTo(260, 135);
    ctx.lineTo(305, 135);

    ctx.moveTo(305, 150);
    ctx.lineTo(260, 150);
    ctx.lineTo(250, 160);

    ctx.moveTo(305, 100);
    ctx.lineTo(260, 100);
    ctx.lineTo(250, 90);

    ctx.moveTo(230, 100);
    ctx.lineTo(215, 115);
    ctx.lineTo(215, 135);
    ctx.lineTo(230, 150);

    // details

    // middle line
    ctx.moveTo(320, 200);
    ctx.lineTo(350, 150);
    ctx.lineTo(350, 75);

    // nozzel lines
    ctx.moveTo(350, 135);
    ctx.lineTo(676, 135);
    ctx.moveTo(350, 110);
    ctx.lineTo(676, 110);

    // nozzel holes
    ctx.moveTo(500, 110);
    ctx.lineTo(500, 135);
    ctx.moveTo(530, 110);
    ctx.lineTo(530, 135);
    ctx.moveTo(550, 110);
    ctx.lineTo(550, 135);
    ctx.moveTo(580, 110);
    ctx.lineTo(580, 135);
    ctx.stroke();

    // top nozzel holes
    ctx.strokeRect(390, 85, 10, 15);
    ctx.strokeRect(420, 85, 10, 15);
    ctx.strokeRect(450, 85, 10, 15);
    ctx.strokeRect(480, 85, 10, 15);
    ctx.strokeRect(510, 85, 10, 15);
    ctx.strokeRect(540, 85, 10, 15);
    ctx.strokeRect(570, 85, 10, 15);
    ctx.strokeRect(600, 85, 10, 15);
    ctx.strokeRect(630, 85, 10, 15);
    ctx.fillRect(682, 75, 15, 45);
    ctx.strokeRect(682, 75, 15, 45);
    ctx.stroke();

    // crosshair
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(590, 68);
    ctx.lineTo(590, 60);
    ctx.lineTo(650, 40);
    ctx.lineTo(670, 40);
    ctx.lineTo(670, 68);
    ctx.fill();

    ctx.stroke();

    ctx.restore();
},[],0,0,90,230);

export let NXR_44_MAG_TOP = new TextureData(54, 182, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(32, 52, 47, 45);
    ctx.strokeRect(32, 52, 47, 45);

    ctx.fillStyle = "#787878";
    ctx.fillRect(290, 52, 330, 45);
    ctx.fillRect(90, 50, 200, 50);
    ctx.fillRect(180, 100, 75, 25);
    ctx.strokeRect(290, 52, 330, 45);
    ctx.strokeRect(90, 50, 200, 50);
    ctx.strokeRect(180, 100, 75, 25);
 
    ctx.lineWidth = 10;
    ctx.fillRect(100, 65, 30, 20);
    ctx.fillRect(530, 71, 70, 5);
    ctx.fillRect(90, 50, 50, 50);
    ctx.fillRect(620, 60, 15, 30);

    ctx.strokeRect(100, 65, 30, 20);
    ctx.strokeRect(530, 72, 70, 5);
    ctx.strokeRect(90, 50, 50, 50);
    ctx.strokeRect(620, 60, 15, 30);

    ctx.restore();
},[],0,0,270,880);

export let NXR_44_MAG_TOP_2 = new TextureData(54, 182, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(32, 52, 47, 45);
    ctx.strokeRect(32, 52, 47, 45);

    ctx.fillStyle = "#787878";
    ctx.fillRect(290, 52, 330, 45);
    ctx.fillRect(90, 50, 200, 50);
    ctx.fillRect(180, 100, 75, 10);
    ctx.strokeRect(290, 52, 330, 45);
    ctx.strokeRect(90, 50, 200, 50);
    ctx.strokeRect(180, 100, 75, 10);
 
    ctx.lineWidth = 10;
    ctx.fillRect(100, 65, 30, 20);
    ctx.fillRect(530, 71, 70, 5);
    ctx.fillRect(90, 50, 50, 50);
    ctx.fillRect(620, 60, 15, 30);

    ctx.strokeRect(100, 65, 30, 20);
    ctx.strokeRect(530, 72, 70, 5);
    ctx.strokeRect(90, 50, 50, 50);
    ctx.strokeRect(620, 60, 15, 30);

    ctx.restore();
},[],0,0,270,880);

export let MAIN_AVATAR_DRAW_NXR44MAG_1 = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
   
    MAIN_AVATAR_DRAW_WEAPON.render(ctx);
    NXR_44_MAG_TOP.render(ctx,-90);
}, [0], 0, 0, -1, -1);

export let MAIN_AVATAR_DRAW_NXR44MAG_2 = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
   
    MAIN_AVATAR_DRAW_WEAPON.render(ctx);
    NXR_44_MAG_TOP_2.render(ctx,-90);
}, [0], 0, 0, -1, -1);

export let GP_K100 = new TextureData(-8, -20, 0.22, "firearm", {
    width: 740,
    height: 309
}, [
    [0, 0, 740, 309]
], 0, undefined, function(ctx) {
    // body: 744x315, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.strokeStyle = "#1A1A1A";

    // silencer
    ctx.fillRect(478, 113, 296, 55);
    ctx.strokeRect(478, 113, 296, 55);

    ctx.fillStyle = "#787878";
    // handle
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(80, 280);
    ctx.lineTo(120, 210);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(100, 175);
    ctx.lineTo(80, 173);
    ctx.lineTo(60, 170);
    ctx.lineTo(60, 160);
    ctx.lineTo(80, 150);
    ctx.lineTo(95, 125);
    ctx.lineTo(100, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 170);
    ctx.lineTo(440, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle
    ctx.lineTo(210, 255);
    ctx.lineTo(210, 280);
    ctx.lineTo(205, 285);
    ctx.lineTo(190, 295);
    ctx.lineTo(190, 310);
    ctx.lineTo(195, 320);
    ctx.lineTo(195, 330);
    ctx.lineTo(180, 350);
    ctx.lineTo(185, 365);
    ctx.lineTo(185, 380);
    ctx.lineTo(180, 390);
    ctx.lineTo(170, 390);
    ctx.lineTo(165, 400);
    ctx.lineTo(148, 400);

    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);

    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.moveTo(100, 100);
    ctx.lineTo(200, 100);
    ctx.lineTo(200, 110);
    ctx.lineTo(455, 110);
    ctx.lineTo(455, 150);
    ctx.lineTo(88, 150);
    ctx.lineTo(100, 100);
    ctx.fill();

    // OUTLINE ___________________________________________
    // handle
    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(82, 375);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(80, 280);
    ctx.lineTo(120, 210);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(100, 175);
    ctx.lineTo(80, 173);
    ctx.lineTo(60, 170);
    ctx.lineTo(60, 160);
    ctx.lineTo(80, 150);
    ctx.lineTo(95, 125);
    ctx.lineTo(100, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 170);
    ctx.lineTo(440, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle
    ctx.lineTo(210, 255);
    ctx.lineTo(210, 280);
    ctx.lineTo(205, 285);
    ctx.lineTo(190, 295);
    ctx.lineTo(190, 310);
    ctx.lineTo(195, 320);
    ctx.lineTo(195, 330);
    ctx.lineTo(180, 350);
    ctx.lineTo(185, 365);
    ctx.lineTo(185, 380);
    ctx.lineTo(180, 390);
    ctx.lineTo(170, 390);
    ctx.lineTo(165, 400);
    ctx.lineTo(148, 400);

    ctx.stroke();

    // trigger
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(221, 195);
    ctx.lineTo(228, 200);
    ctx.lineTo(235, 210);
    ctx.lineTo(240, 215);
    ctx.lineTo(245, 215);
    ctx.lineTo(238, 200);
    ctx.lineTo(240, 185);
    ctx.lineTo(220, 185);

    // details
    ctx.moveTo(85, 373);
    ctx.lineTo(170, 387);
    ctx.moveTo(80, 150);
    ctx.lineTo(460, 150);
    ctx.strokeRect(248, 112, 54, 20);
    ctx.strokeRect(110, 105, 10, 35);
    ctx.strokeRect(130, 105, 10, 35);
    ctx.strokeRect(150, 105, 10, 35);
    ctx.fillRect(465, 125, 10, 35);
    ctx.strokeRect(460, 125, 15, 35);
    ctx.fill();
    ctx.stroke();

    // trigger house
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);
    ctx.stroke();
    ctx.restore();
},[], 0, 0, 30, 200);

export let USP_45 = new TextureData(-8, -5, 0.2, "firearm", {
    width: 815,
    height: 393
}, [
    [0, 0, 815, 393]
], 0, undefined, function(ctx) {
    // body: 819x398, texture: 1024,512, size: 0.18
    // -8 -5 

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";

    // silencer
    ctx.fillRect(469, 111, 380, 78);
    ctx.strokeRect(469, 111, 380, 78);

    ctx.beginPath();
    ctx.lineWidth = 15;
    // scope
    ctx.moveTo(315, 100);
    ctx.lineTo(315, 80);
    ctx.lineTo(370, 80);
    ctx.lineTo(390, 30);
    ctx.lineTo(410, 30);
    ctx.lineTo(410, 100);
    ctx.fill();
    ctx.stroke();

    // handle

    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(82, 375);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(84, 280);
    ctx.lineTo(115, 205);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(105, 180);
    ctx.lineTo(90, 173);
    ctx.lineTo(90, 165);
    ctx.lineTo(90, 150);
    ctx.lineTo(100, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle

    ctx.lineTo(210, 255);
    ctx.lineTo(180, 350);
    ctx.lineTo(182, 375);
    ctx.lineTo(186, 385);
    ctx.lineTo(190, 395);
    ctx.lineTo(187, 407);
    ctx.lineTo(150, 400);

    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);

    ctx.fill();

    // OUTLINE ___________________________________________
    // handle

    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(82, 375);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(84, 280);
    ctx.lineTo(115, 205);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(105, 180);
    ctx.lineTo(90, 173);
    ctx.lineTo(90, 165);
    ctx.lineTo(90, 150);
    ctx.lineTo(100, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle
    ctx.lineTo(210, 255);
    ctx.lineTo(180, 350);
    ctx.lineTo(182, 375);
    ctx.lineTo(186, 385);
    ctx.lineTo(190, 395);
    ctx.lineTo(187, 407);
    ctx.lineTo(150, 400);

    ctx.stroke();

    // trigger
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(221, 195);
    ctx.lineTo(228, 200);
    ctx.lineTo(235, 210);
    ctx.lineTo(240, 215);
    ctx.lineTo(245, 215);
    ctx.lineTo(238, 200);
    ctx.lineTo(240, 185);
    ctx.lineTo(220, 185);

    // rear crosshair

    ctx.moveTo(140, 101);
    ctx.lineTo(140, 100);
    ctx.lineTo(135, 90);
    ctx.lineTo(115, 90);
    ctx.lineTo(115, 100);
    ctx.lineTo(115, 102);
    ctx.lineTo(140, 102);

    // details

    ctx.moveTo(85, 373);
    ctx.lineTo(185, 387);
    ctx.moveTo(90, 150);
    ctx.lineTo(460, 150);
    ctx.strokeRect(248, 112, 54, 20);

    ctx.fill();
    ctx.stroke();

    // trigger house
    ctx.beginPath();
    ctx.lineWidth = 10;

    // thingys
    ctx.moveTo(335, 187);
    ctx.lineTo(342, 168);
    ctx.lineTo(350, 168);
    ctx.lineTo(344, 188);
    ctx.moveTo(355, 187);
    ctx.lineTo(362, 168);
    ctx.lineTo(370, 168);
    ctx.lineTo(364, 188);
    ctx.moveTo(375, 187);
    ctx.lineTo(382, 168);
    ctx.lineTo(390, 168);
    ctx.lineTo(384, 188);

    // silencer lines
    ctx.moveTo(500, 190);
    ctx.lineTo(500, 115);

    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);
    ctx.stroke();
    ctx.restore();
});

export let KC_357 = new TextureData(1, -30, 0.2, "firearm", {
    width: 426,
    height: 280
}, [
    [0, 0, 426, 280]
], 0, undefined, function(ctx) {
    // body: 430x285, texture: 512,512, size: 0.15
    // 1, -30

    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(0 || this.size, 0 || this.size);

    // main body
    ctx.beginPath();
    ctx.fillStyle = "#F3F3F3";
    ctx.strokeStyle = "#1A1A1A";
    ctx.moveTo(100, 220);
    ctx.lineTo(130, 190);
    ctx.lineTo(130, 155);
    ctx.lineTo(260, 155);
    // nozzel
    ctx.lineTo(270, 160);
    ctx.lineTo(400, 160);
    ctx.lineTo(410, 180);
    ctx.lineTo(405, 200);
    ctx.lineTo(405, 220);
    ctx.lineTo(270, 220);
    ctx.lineTo(260, 230);
    ctx.lineTo(260, 266);
    ctx.lineTo(236, 266);

    ctx.lineTo(200, 315);
    ctx.lineTo(160, 315);
    ctx.lineTo(140, 310);
    ctx.lineTo(80, 280);
    ctx.lineTo(100, 220);

    ctx.moveTo(220, 266);
    ctx.lineTo(210, 260);
    ctx.lineTo(180, 260);
    ctx.lineTo(165, 275);
    ctx.lineTo(150, 300);
    ctx.lineTo(170, 305);
    ctx.lineTo(200, 305);
    ctx.lineTo(220, 275);
    ctx.lineTo(220, 264);

    ctx.fill();

    // trigger house outside
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(130, 305);
    ctx.lineTo(165, 315);
    ctx.lineTo(205, 315);
    ctx.lineTo(240, 265);
    ctx.stroke();

    // details
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(270, 160);
    ctx.lineTo(270, 220);
    ctx.moveTo(270, 200);
    ctx.lineTo(400, 200);
    ctx.stroke();

    // cilynder
    ctx.strokeRect(150, 170, 90, 60);
    ctx.beginPath();
    ctx.moveTo(240, 190);
    ctx.lineTo(190, 190);
    ctx.lineTo(180, 200);
    ctx.lineTo(190, 210);
    ctx.lineTo(240, 210);
    ctx.stroke();

    // trigger
    ctx.beginPath();
    ctx.moveTo(170, 270);
    ctx.lineTo(175, 280);
    ctx.lineTo(189, 290);
    ctx.lineTo(195, 288);
    ctx.lineTo(185, 273);
    ctx.lineTo(185, 260);
    ctx.stroke();

    // rear stock
    ctx.moveTo(120, 200);
    ctx.lineTo(100, 190);
    ctx.lineTo(85, 190);
    ctx.lineTo(85, 185);
    ctx.lineTo(100, 180);
    ctx.lineTo(115, 185);
    ctx.lineTo(118, 178);
    ctx.lineTo(130, 178);
    ctx.fill();
    ctx.stroke();

    // main body outline
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(100, 220);
    ctx.lineTo(130, 190);
    ctx.lineTo(130, 155);
    ctx.lineTo(260, 155);
    // nozzel
    ctx.lineTo(270, 160);
    ctx.lineTo(400, 160);
    ctx.lineTo(410, 180);
    ctx.lineTo(405, 200);
    ctx.lineTo(405, 220);
    ctx.lineTo(270, 220);
    ctx.lineTo(260, 230);
    ctx.lineTo(260, 266);
    ctx.lineTo(236, 266);
    ctx.stroke();

    // trigger house
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(220, 266);
    ctx.lineTo(210, 260);
    ctx.lineTo(180, 260);
    ctx.lineTo(165, 275);
    ctx.lineTo(150, 300);
    ctx.lineTo(170, 305);
    ctx.lineTo(200, 305);
    ctx.lineTo(220, 275);
    ctx.lineTo(220, 264);
    ctx.stroke();

    // handle
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.moveTo(65, 240);
    ctx.lineTo(40, 290);
    ctx.lineTo(0, 400);
    ctx.lineTo(5, 410);
    ctx.lineTo(10, 415);
    ctx.lineTo(50, 420);
    ctx.lineTo(80, 415);
    ctx.lineTo(75, 400);
    ctx.lineTo(80, 390);
    ctx.lineTo(95, 380);
    ctx.lineTo(90, 365);
    ctx.lineTo(90, 350);
    ctx.lineTo(100, 340);
    ctx.lineTo(95, 320);
    ctx.lineTo(105, 305);
    ctx.lineTo(130, 305);
    ctx.lineTo(145, 280);
    ctx.lineTo(120, 275);
    ctx.lineTo(100, 260);
    ctx.lineTo(100, 220);
    ctx.lineTo(65, 210);
    ctx.lineTo(60, 220);
    ctx.lineTo(65, 243);
    ctx.fillStyle = "#787878";
    ctx.fill();
    ctx.stroke();

    ctx.restore();
});

export let GLOCK_20 = new TextureData(0, 0, 0.22, "firearm", {
    width: 439,
    height: 309
}, [
    [0, 0, 439, 309]
], 0, undefined, function(ctx) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20

    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(80, 280);
    ctx.lineTo(120, 200);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(100, 175);
    ctx.lineTo(85, 175);
    ctx.lineTo(80, 165);
    ctx.lineTo(90, 150);
    ctx.lineTo(90, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle

    ctx.lineTo(210, 255);
    ctx.lineTo(210, 280);
    ctx.lineTo(205, 285);
    ctx.lineTo(190, 295);
    ctx.lineTo(190, 310);
    ctx.lineTo(195, 320);
    ctx.lineTo(195, 330);
    ctx.lineTo(180, 350);
    ctx.lineTo(185, 365);
    ctx.lineTo(185, 380);
    ctx.lineTo(180, 390);
    ctx.lineTo(170, 390);
    ctx.lineTo(165, 400);
    ctx.lineTo(148, 400);

    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);

    ctx.fill();

    // OUTLINE ___________________________________________
    // handle

    ctx.beginPath();
    ctx.moveTo(150, 400);
    ctx.lineTo(90, 390);
    ctx.lineTo(80, 380);
    ctx.lineTo(82, 375);
    ctx.lineTo(60, 370);
    ctx.lineTo(50, 360);
    ctx.lineTo(80, 280);
    ctx.lineTo(120, 200);

    // curve and nozzel
    ctx.lineTo(115, 190);
    ctx.lineTo(100, 175);
    ctx.lineTo(85, 175);
    ctx.lineTo(80, 165);
    ctx.lineTo(90, 150);
    ctx.lineTo(90, 105);
    ctx.lineTo(250, 105);
    ctx.lineTo(250, 112);
    ctx.lineTo(300, 112);
    ctx.lineTo(300, 105);
    ctx.lineTo(450, 105);
    ctx.lineTo(460, 110);
    ctx.lineTo(460, 190);
    ctx.lineTo(320, 190);

    // trigger house outside
    ctx.lineTo(310, 200);
    ctx.lineTo(310, 235);
    ctx.lineTo(230, 235);

    // handle
    ctx.lineTo(210, 255);
    ctx.lineTo(210, 280);
    ctx.lineTo(205, 285);
    ctx.lineTo(190, 295);
    ctx.lineTo(190, 310);
    ctx.lineTo(195, 320);
    ctx.lineTo(195, 330);
    ctx.lineTo(180, 350);
    ctx.lineTo(185, 365);
    ctx.lineTo(185, 380);
    ctx.lineTo(180, 390);
    ctx.lineTo(170, 390);
    ctx.lineTo(165, 400);
    ctx.lineTo(148, 400);

    ctx.stroke();

    // trigger
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(221, 195);
    ctx.lineTo(228, 200);
    ctx.lineTo(235, 210);
    ctx.lineTo(240, 215);
    ctx.lineTo(245, 215);
    ctx.lineTo(238, 200);
    ctx.lineTo(240, 185);
    ctx.lineTo(220, 185);

    // details
    ctx.moveTo(85, 373);
    ctx.lineTo(170, 387);
    ctx.moveTo(90, 150);
    ctx.lineTo(460, 150);
    ctx.strokeRect(248, 112, 54, 20);
    ctx.strokeRect(110, 105, 10, 35);
    ctx.strokeRect(130, 105, 10, 35);
    ctx.fillRect(465, 125, 10, 35);
    ctx.strokeRect(460, 125, 15, 35);
    ctx.fill();
    ctx.stroke();

    // trigger house
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(240, 225);
    ctx.lineTo(295, 225);
    ctx.lineTo(300, 215);
    ctx.lineTo(300, 185);
    ctx.lineTo(220, 185);
    ctx.lineTo(220, 220);
    ctx.lineTo(241, 225);
    ctx.stroke();
    ctx.restore();
}, [], false, false, 180, 200);

export let OFF_ROADER = new TextureData(0, 0, 0.25, "avatar", {
    width: 1816,
    height: 2214
}, [
    [0, 0, 1816, 2214]
], 0, undefined, function(ctx) {

    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 15;
    ctx.fillStyle = "white";
    ctx.lineJoin = "bevel";

    // REAR AXEL  
    ctx.fillStyle = "#636363";
    // left bar 
    ctx.moveTo(550, -50);
    ctx.lineTo(850, 200);
    ctx.lineTo(850, 140);
    ctx.lineTo(620, -50);

    // right bar 
    ctx.moveTo(1950, -50);
    ctx.lineTo(1650, 200);
    ctx.lineTo(1650, 140);
    ctx.lineTo(1880, -50);
    ctx.fill();
    ctx.stroke();

    ctx.fillRect(550, -100, 1400, 50);
    ctx.strokeRect(550, -100, 1400, 50);

    // FRONT AXEL
    ctx.beginPath();
    ctx.fillRect(650, 1700, 1200, 50);
    ctx.strokeRect(650, 1700, 1200, 50);

    // left bar  
    ctx.moveTo(650, 1700);
    ctx.lineTo(920, 1500);
    ctx.lineTo(1000, 1500);
    ctx.lineTo(720, 1700);
    ctx.lineTo(650, 1700);

    // right bar  
    ctx.moveTo(1850, 1700);
    ctx.lineTo(1580, 1500);
    ctx.lineTo(1500, 1500);
    ctx.lineTo(1780, 1700);
    ctx.lineTo(1850, 1700);

    ctx.fill();
    ctx.stroke();

    // BASE PLATE
    ctx.fillStyle = "#363636";
    ctx.fillRect(910, -100, 680, 1800);
    ctx.fillStyle = "#242424";
    ctx.fillRect(910, -100, 680, 1000);
    ctx.strokeRect(910, -100, 680, 1800);

    // SEAT - top half
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(1050, 600, 400, 700);
    ctx.fillStyle = "#707070";
    ctx.fillRect(1050, 600, 400, 350);
    ctx.fillStyle = "#525252";
    ctx.fillRect(1050, 600, 400, 50);
    ctx.fillStyle = "#707070";
    ctx.fillRect(1050, 1250, 400, 50);
    ctx.strokeRect(1050, 600, 400, 700);
    ctx.strokeRect(1050, 600, 400, 350);

    // INNER FRAME
    ctx.beginPath();
    ctx.fillStyle = "#555555";

    // top bar
    ctx.moveTo(825, 340);
    ctx.lineTo(1675, 340);
    ctx.lineTo(1600, 400);
    ctx.lineTo(900, 400);
    ctx.lineTo(825, 340);

    // left bar 
    ctx.moveTo(900, 400);
    ctx.lineTo(1050, 1400);
    ctx.lineTo(1000, 1450);
    ctx.lineTo(825, 340);
    ctx.lineTo(900, 400);

    // right bar
    ctx.moveTo(1600, 400);
    ctx.lineTo(1450, 1400);
    ctx.lineTo(1500, 1450);
    ctx.lineTo(1675, 340);
    ctx.lineTo(1600, 400);

    // bottom bar 
    ctx.moveTo(1000, 1450);
    ctx.lineTo(1500, 1450);
    ctx.lineTo(1450, 1400);
    ctx.lineTo(1050, 1400);
    ctx.lineTo(1000, 1450);
    ctx.fill();
    ctx.stroke();

    // OUTER FRAME

    // left short bar 
    ctx.beginPath();
    ctx.fillStyle = "#999999";
    ctx.moveTo(825, 340);
    ctx.lineTo(600, 600);
    ctx.lineTo(680, 600);
    ctx.lineTo(835, 420);
    ctx.lineTo(825, 340)

    // right short bar 
    ctx.moveTo(1675, 340);
    ctx.lineTo(1900, 600);
    ctx.lineTo(1820, 600);
    ctx.lineTo(1665, 420);
    ctx.lineTo(1675, 340);

    // rear left bar 
    ctx.moveTo(830, -100);
    ctx.lineTo(600, 600);
    ctx.lineTo(680, 500);
    ctx.lineTo(830, 50);

    // rear right bar 
    ctx.moveTo(1670, -100);
    ctx.lineTo(1900, 600);
    ctx.lineTo(1820, 500);
    ctx.lineTo(1670, 50);

    // long left frame
    ctx.moveTo(680, 600);
    ctx.lineTo(600, 600);
    ctx.lineTo(830, 1700);
    ctx.lineTo(910, 1700);
    ctx.lineTo(680, 600);

    // long right frame
    ctx.moveTo(1820, 600);
    ctx.lineTo(1900, 600);
    ctx.lineTo(1670, 1700);
    ctx.lineTo(1590, 1700);
    ctx.lineTo(1820, 600);
    ctx.fill();
    ctx.stroke();

    // REAR FRAME

    // top bar 
    ctx.beginPath();
    ctx.moveTo(1000, -200);
    ctx.lineTo(1500, -200);
    ctx.lineTo(1550, -100);
    ctx.lineTo(950, -100);
    ctx.lineTo(1000, -200);

    // exahust pipes
    ctx.fillStyle = "#888888";
    ctx.fillRect(1000, -250, 150, 50);
    ctx.fillRect(1350, -250, 150, 50);
    ctx.strokeRect(1000, -250, 150, 50);
    ctx.strokeRect(1350, -250, 150, 50);

    // middle box 
    ctx.fillStyle = "#666666";
    ctx.fillRect(830, -100, 840, 440);
    ctx.fillStyle = "#999999";
    ctx.fillRect(890, -50, 720, 30);
    ctx.fillStyle = "#444444";
    ctx.fillRect(890, -20, 720, 360);
    ctx.strokeRect(830, -100, 840, 440);
    ctx.strokeRect(890, -20, 720, 360);
    ctx.fill();
    ctx.stroke();

    // middle bars
    ctx.fillStyle = "#666666";
    ctx.fillRect(1050, -50, 50, 390);
    ctx.fillRect(1400, -50, 50, 390);
    ctx.strokeRect(1050, -50, 50, 390);
    ctx.strokeRect(1400, -50, 50, 390);

    // engine
    ctx.fillStyle = "#999999";
    ctx.strokeRect(1100, -20, 300, 360);
    ctx.fillRect(1200, 40, 100, 100);
    ctx.fillRect(1200, 180, 100, 100);
    ctx.strokeRect(1200, 40, 100, 100);
    ctx.strokeRect(1200, 40, 100, 50);
    ctx.strokeRect(1200, 180, 100, 100);

    // BOTTOM PLATE
    ctx.fillStyle = "#bdbdbd";
    ctx.fillRect(830, 1700, 840, 50);
    ctx.strokeRect(830, 1700, 840, 50);
    ctx.fillRect(930, 1725, 640, 150);
    ctx.fillStyle = "#8f8f8f";
    ctx.fillRect(930, 1725, 640, 50);
    ctx.strokeRect(930, 1725, 640, 150);

    // FRONT PLATE
    ctx.beginPath();
    ctx.fillStyle = "#4d4d4d";
    ctx.moveTo(1000, 1450);
    ctx.lineTo(830, 1700);
    ctx.lineTo(1670, 1700);
    ctx.lineTo(1500, 1450);
    ctx.lineTo(1000, 1450);
    ctx.fill();
    ctx.stroke();

    // RIGHT REAR TIRE
    ctx.translate(-150, -700);
    ctx.fillStyle = "#2e2e2e";
    ctx.moveTo(2000, 500);
    ctx.lineTo(2050, 450);
    ctx.lineTo(2100, 500);
    ctx.lineTo(2150, 450);
    ctx.lineTo(2200, 500);
    ctx.lineTo(2250, 450);
    ctx.lineTo(2300, 500);
    ctx.lineTo(2300, 850);
    ctx.lineTo(2250, 900);
    ctx.lineTo(2200, 850);
    ctx.lineTo(2150, 900);
    ctx.lineTo(2100, 850);
    ctx.lineTo(2050, 900);
    ctx.lineTo(2000, 850);
    ctx.lineTo(2000, 495);
    ctx.moveTo(2100, 500);
    ctx.lineTo(2100, 850);
    ctx.moveTo(2200, 500);
    ctx.lineTo(2200, 850);
    ctx.fill();
    ctx.stroke();

    // RIGHT REAR TIRE
    ctx.translate(-1500, 0);
    ctx.fillStyle = "#2e2e2e";
    ctx.moveTo(2000, 500);
    ctx.lineTo(2050, 450);
    ctx.lineTo(2100, 500);
    ctx.lineTo(2150, 450);
    ctx.lineTo(2200, 500);
    ctx.lineTo(2250, 450);
    ctx.lineTo(2300, 500);
    ctx.lineTo(2300, 850);
    ctx.lineTo(2250, 900);
    ctx.lineTo(2200, 850);
    ctx.lineTo(2150, 900);
    ctx.lineTo(2100, 850);
    ctx.lineTo(2050, 900);
    ctx.lineTo(2000, 850);
    ctx.lineTo(2000, 495);
    ctx.moveTo(2100, 500);
    ctx.lineTo(2100, 850);
    ctx.moveTo(2200, 500);
    ctx.lineTo(2200, 850);
    ctx.fill();
    ctx.stroke();

    // FRONT LEFT TIRE
    ctx.translate(50, 1750);
    ctx.fillStyle = "#2e2e2e";
    ctx.moveTo(2000, 500);
    ctx.lineTo(2050, 450);
    ctx.lineTo(2100, 500);
    ctx.lineTo(2150, 450);
    ctx.lineTo(2200, 500);
    ctx.lineTo(2250, 450);
    ctx.lineTo(2300, 500);
    ctx.lineTo(2300, 850);
    ctx.lineTo(2250, 900);
    ctx.lineTo(2200, 850);
    ctx.lineTo(2150, 900);
    ctx.lineTo(2100, 850);
    ctx.lineTo(2050, 900);
    ctx.lineTo(2000, 850);
    ctx.lineTo(2000, 495);
    ctx.moveTo(2100, 500);
    ctx.lineTo(2100, 850);
    ctx.moveTo(2200, 500);
    ctx.lineTo(2200, 850);
    ctx.fill();
    ctx.stroke();

    // FRONT RIGHT TIRE
    ctx.translate(1400, 0);
    ctx.fillStyle = "#2e2e2e";
    ctx.moveTo(2000, 500);
    ctx.lineTo(2050, 450);
    ctx.lineTo(2100, 500);
    ctx.lineTo(2150, 450);
    ctx.lineTo(2200, 500);
    ctx.lineTo(2250, 450);
    ctx.lineTo(2300, 500);
    ctx.lineTo(2300, 850);
    ctx.lineTo(2250, 900);
    ctx.lineTo(2200, 850);
    ctx.lineTo(2150, 900);
    ctx.lineTo(2100, 850);
    ctx.lineTo(2050, 900);
    ctx.lineTo(2000, 850);
    ctx.lineTo(2000, 495);
    ctx.moveTo(2100, 500);
    ctx.lineTo(2100, 850);
    ctx.moveTo(2200, 500);
    ctx.lineTo(2200, 850);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}, [], 0, 0, -342, 258);

// @AVATARS

export let MAIN_AVATAR_DEFAULT = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0,0, 702, 2140] 
], 0, undefined, function(ctx) {
    // body: 700x428, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    // filler
    ctx.fillRect(152, 15, 408, 408);
    ctx.fillRect(552, 145, 136, 136);
    ctx.fillRect(12, 145, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160, 221, 392, 193);
    ctx.fillRect(570, 205, 119, 67);
    ctx.fillRect(24, 205, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231, 60, 90, 75);
    ctx.fillRect(391, 60, 90, 75);

    // main body
    ctx.strokeRect(152, 15, 408, 408);
    // right hand
    ctx.strokeRect(561, 145, 136, 136);
    // left hand
    ctx.strokeRect(15, 145, 136, 136);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
   // ctx.strokeRect(221, 50, 270, 95);

    ctx.restore();
}, [0], 0, 0, -5, -1);

export let MAIN_AVATAR_LEFT_PUNCH_1 = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 862
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 762
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_LEFT_PUNCH_2 = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 912
    }; // -272, -110
    let h2 = {
        x: 137,
        y: 570
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_RIGHT_PUNCH_1 = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 762
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 862
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_RIGHT_PUNCH_2 = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: -137,
        y: 570
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 912
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_GRAB = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: -137,
        y: 570
    }; // -272, -110
    let h2 = {
        x: 137,
        y: 570
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_DRAW_MELEE_WALKING_1 = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 930
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 794
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_DRAW_MELEE_WALKING_2 = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 794
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 930
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_DRAW_MELEE = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 828
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 862
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);

export let MAIN_AVATAR_DRAW_MELEE_STRIKE = new TextureData(0, 0, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: 0,
        y: 726
    }; // -272, -110
    let h2 = {
        x: 0,
        y: 862
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
},[], 0, 0, -5, -1);



export let MAIN_AVATAR_DRAW_WEAPON = new TextureData(0, 0, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0, 0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 702x740, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    // -1, -1
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 20;
    ctx.fillStyle = "white";

    let h1 = {
        x: -272,
        y: 590
    }; // -272, -110
    let h2 = {
        x: 150,
        y: 575
    }; // 150, -125
    let b = {
        x: 0,
        y: 856
    }; // 0, 156

    // filler
    ctx.fillRect(152 + b.x, 15 + b.y, 408, 408);
    ctx.fillRect(552 + h1.x, 145 + h1.y, 136, 136);
    ctx.fillStyle = "black";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160 + b.x, 221 + b.y, 392, 193);
    ctx.fillRect(570 + h1.x, 205 + h1.y, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231 + b.x, 60 + b.y, 90, 75);
    ctx.fillRect(391 + b.x, 60 + b.y, 90, 75);

    // main body
    ctx.strokeRect(152 + b.x, 15 + b.y, 408, 408);
    // right hand
    ctx.strokeRect(561 + h1.x, 145 + h1.y, 136, 136);
    // left hand
    ctx.fillStyle = "white";
    ctx.fillRect(12 + h2.x, 145 + h2.y, 136, 136);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(24 + h2.x, 205 + h2.y, 119, 67);
    ctx.strokeRect(15 + h2.x, 145 + h2.y, 136, 136);

    ctx.restore();
}, [0], 0, 0, -1, -1);

export let GP_K100_TOP = new TextureData(282, 900, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#F3F3F3";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.fillRect(90, 50, 370, 60);
    ctx.strokeRect(90, 50, 370, 60);

    // scilencer 

    ctx.fillRect(485, 53, 296, 55);
    ctx.strokeRect(485, 53, 296, 55);

    ctx.lineWidth = 10;
    ctx.fillStyle = "#787878";
    ctx.fillRect(460, 63, 20, 35);
    ctx.strokeRect(460, 63, 20, 35);

    // rear tip
    ctx.lineWidth = 15;
    ctx.fillRect(60, 55, 30, 50);
    ctx.strokeRect(60, 55, 30, 50);

    ctx.lineWidth = 10;
    // details
    ctx.strokeRect(110, 50, 10, 60);
    ctx.strokeRect(130, 50, 10, 60);
    ctx.strokeRect(140, 50, 10, 60);

    ctx.strokeRect(250, 85, 50, 20);

    ctx.stroke();

    ctx.restore();
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    //ctx.strokeRect(0,0,900,200);
    ctx.restore();
}, [], 0, 0, 0, 0);

export let GP_K100_TOP_2 = new TextureData(282, 900, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#F3F3F3";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.fillRect(90, 60, 370, 40);
    ctx.strokeRect(90, 60, 370, 40);

    ctx.beginPath();
    ctx.fillRect(50, 50, 370, 60);
    ctx.strokeRect(50, 50, 370, 60);

    // scilencer 

    ctx.fillRect(485, 53, 296, 55);
    ctx.strokeRect(485, 53, 296, 55);

    ctx.lineWidth = 10;
    ctx.fillStyle = "#787878";
    ctx.fillRect(460, 63, 20, 35);
    ctx.strokeRect(460, 63, 20, 35);

    // rear tip
    ctx.lineWidth = 15;
    ctx.fillRect(20, 55, 30, 50);
    ctx.strokeRect(20, 55, 30, 50);

    ctx.lineWidth = 10;
    // details
    ctx.strokeRect(70, 50, 10, 60);
    ctx.strokeRect(90, 50, 10, 60);
    ctx.strokeRect(100, 50, 10, 60);

    ctx.strokeRect(210, 85, 50, 20);

    ctx.stroke();

    ctx.restore();
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    //ctx.strokeRect(0,0,900,200);
    ctx.restore();
}, [], 0, 0, 0, 0);

export let GLOCK_20_TOP = new TextureData(54, 182, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.fillRect(90, 50, 370, 70);
    ctx.strokeRect(90, 50, 370, 70);
    ctx.lineWidth = 10;
    ctx.fillRect(465, 67, 10, 35);
    ctx.strokeRect(460, 67, 15, 35);

    // details
    ctx.strokeRect(110, 50, 10, 70);
    ctx.strokeRect(130, 50, 10, 70);

    ctx.strokeRect(250, 100, 50, 20);

    ctx.stroke();

    ctx.restore();
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    //ctx.strokeRect(0,0,900,200);
    ctx.restore();
});

export let GLOCK_20_TOP_2 = new TextureData(54, 182, 0.2, "firearm", {
    width: 900,
    height: 200
}, [
    [0, 0, 900, 200]
], 0, undefined, function(ctx, r = 0) {
    // body: 439x309, texture: 1024,512, size: 0.15
    // -8 -20
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.rotate(r * Math.PI / 180);
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 15;

    ctx.fillStyle = "#787878";
    ctx.strokeStyle = "#1A1A1A";
    // handle

    ctx.beginPath();
    ctx.fillRect(90, 60, 370, 50);
    ctx.strokeRect(90, 60, 370, 50);
    ctx.lineWidth = 10;
    ctx.fillRect(465, 67, 10, 35);
    ctx.strokeRect(460, 67, 15, 35);

    // details
    ctx.strokeRect(110, 50, 10, 70);
    ctx.strokeRect(130, 50, 10, 70);

    ctx.strokeRect(250, 100, 50, 20);

    // slide pullback
    ctx.lineWidth = 15;
    ctx.fillRect(90 - 50, 50, 370, 70);
    ctx.strokeRect(90 - 50, 50, 370, 70);
    ctx.lineWidth = 10;
    ctx.strokeRect(110 - 50, 50, 10, 70);
    ctx.strokeRect(130 - 50, 50, 10, 70);
    ctx.strokeRect(250 - 50, 100, 50, 20);

    ctx.stroke();

    ctx.restore();
    ctx.save();
    ctx.scale(this.size || 0, this.size || 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    //ctx.strokeRect(0,0,900,200);
    ctx.restore();
});

export let DOOR = new TextureData(0, 0, 0.2, "pickup", {
    width: 730,
    height: 1020
}, [
    [0, 0, 730, 1020]
], 0, undefined, function(ctx) {
    // -12, -4
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();

    ctx.strokeStyle = "#1A1A1A";

    ctx.fillStyle = "white";
    ctx.moveTo(700, 975);
    ctx.lineTo(700, 1030);
    ctx.lineTo(780, 1030);
    ctx.lineTo(780, 30);
    ctx.lineTo(70, 30);
    ctx.lineTo(70, 1030);
    ctx.lineTo(150, 1030);
    ctx.lineTo(150, 975);
    ctx.lineTo(150, 150);
    ctx.lineTo(700, 150);
    ctx.lineTo(700, 975);
    ctx.fill();

    ctx.lineWidth = 15;
    ctx.fillStyle = "#999999";
    ctx.fillRect(150, 150, 550, 830);
    ctx.strokeRect(150, 150, 550, 830);
    ctx.fillStyle = "#C5C5C5";
    ctx.fillRect(70, 30, 700, 50);
    ctx.fillStyle = "white";
    ctx.fillRect(600, 550, 50, 90);
    ctx.strokeRect(600, 550, 50, 90);
    ctx.lineWidth = 20;

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.moveTo(700, 975);
    ctx.lineTo(700, 1030);
    ctx.lineTo(780, 1030);
    ctx.lineTo(780, 30);
    ctx.lineTo(70, 30);
    ctx.lineTo(70, 1030);
    ctx.lineTo(150, 1030);
    ctx.lineTo(150, 975);
    ctx.lineTo(150, 150);
    ctx.lineTo(700, 150);
    ctx.lineTo(700, 975);
    ctx.stroke();

    ctx.restore();
});

export let MAIN_AVATAR_BLINKING = new TextureData(-5, 851, 1, "avatar", {
    width: 702,
    height: 2140
}, [
   [0,0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 700x428, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    // filler
    ctx.fillRect(152, 15, 408, 408);
    ctx.fillRect(552, 145, 136, 136);
    ctx.fillRect(12, 145, 136, 136);
    ctx.fillStyle = "#1A1A1A";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160, 221, 392, 193);
    ctx.fillRect(570, 205, 119, 67);
    ctx.fillRect(24, 205, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231, 90, 90, 15);
    ctx.fillRect(391, 90, 90, 15);

    // main body
    ctx.strokeRect(152, 15, 408, 408);
    // right hand
    ctx.strokeRect(561, 145, 136, 136);
    // left hand
    ctx.strokeRect(15, 145, 136, 136);
    ctx.restore();
}, [0]);

export let MAIN_AVATAR_WALKING_1 = new TextureData(-5, 851, 1, "avatar", {
    width: 702,
    height: 2140
}, [
    [0,0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 700x428, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    // filler
    ctx.fillRect(152, 15, 408, 408);
    ctx.fillRect(552, 195, 136, 136);
    ctx.fillRect(12, 95, 136, 136);
    ctx.fillStyle = "#1A1A1A";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160, 221, 392, 193);
    ctx.fillRect(570, 255, 119, 67);
    ctx.fillRect(24, 155, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231, 60, 90, 75);
    ctx.fillRect(391, 60, 90, 75);

    // main body
    ctx.strokeRect(152, 15, 408, 408);
    // right hand
    ctx.strokeRect(561, 195, 136, 136);
    // left hand
    ctx.strokeRect(15, 95, 136, 136);
    ctx.restore();
}, [0]);

export let MAIN_AVATAR_WALKING_2 = new TextureData(-5, 851, 0.2, "avatar", {
    width: 702,
    height: 2140
}, [
    [0,0, 702, 2140]
], 0, undefined, function(ctx) {
    // body: 700x428, texture: 1024,512, size: 0.15, boxes: [[152, 15, 408, 408],[561, 145, 136, 136],[15, 145, 136, 136]]
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    // filler
    ctx.fillRect(152, 15, 408, 408);
    ctx.fillRect(552, 95, 136, 136);
    ctx.fillRect(12, 195, 136, 136);
    ctx.fillStyle = "#1A1A1A";

    // shadows
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(160, 221, 392, 193);
    ctx.fillRect(570, 155, 119, 67);
    ctx.fillRect(24, 255, 119, 67);

    // eyes
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(231, 60, 90, 75);
    ctx.fillRect(391, 60, 90, 75);

    // main body
    ctx.strokeRect(152, 15, 408, 408);
    // right hand
    ctx.strokeRect(561, 95, 136, 136);
    // left hand
    ctx.strokeRect(15, 195, 136, 136);
    ctx.restore();
}, [0]);

export let METAL_FENCE_VERTICAL = new TextureData(0, 0, 0.2, "avatar", {
    width: 85,
    height: 1800
}, [
    [0,0,85,1800],
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#444444";
  /* 
    ctx.fillRect(110,50,40,720);
    ctx.fillRect(310,50,40,720);
    ctx.fillRect(510,50,40,720);
    ctx.fillRect(710,50,40,720);
    ctx.fillRect(910,50,40,720);
    ctx.fillRect(1110,50,40,720);
    ctx.fillRect(1310,50,40,720);

    ctx.fillStyle = "#333333";
    ctx.fillRect(110,50,40,30);
    ctx.fillRect(310,50,40,30);
    ctx.fillRect(510,50,40,30);
    ctx.fillRect(710,50,40,30);
    ctx.fillRect(910,50,40,30);
    ctx.fillRect(1110,50,40,30);
    ctx.fillRect(1310,50,40,30); 

    ctx.strokeRect(110,50,40,720);
    ctx.strokeRect(310,50,40,720);
    ctx.strokeRect(510,50,40,720);
    ctx.strokeRect(710,50,40,720);
    ctx.strokeRect(910,50,40,720);
    ctx.strokeRect(1110,50,40,720);
    ctx.strokeRect(1310,50,40,720); */
 
    ctx.fillStyle = "#444444";
    ctx.fillRect(0,0,60,780); 
    ctx.fillStyle = "#333333";
    ctx.fillRect(0,0,60,40); 
    ctx.strokeRect(0,0,60,780);

    ctx.fillStyle = "#444444";
    ctx.fillRect(0,200,25,1000);
    ctx.strokeRect(0,200,25,1000);
 

    ctx.fillStyle = "#444444";
    ctx.fillRect(25,100,40,1000);
    ctx.fillStyle = "#333333";
    ctx.fillRect(25,100,40,30);
    ctx.strokeRect(25,100,40,1000); 
    
    ctx.fillStyle = "#444444";
    ctx.fillRect(25,300,40,1000);
    ctx.fillStyle = "#333333";
    ctx.fillRect(25,300,40,30);
    ctx.strokeRect(25,300,40,1000); 

    ctx.fillStyle = "#444444";
    ctx.fillRect(25,500,40,1000);
    ctx.fillStyle = "#333333";
    ctx.fillRect(25,500,40,30);
    ctx.strokeRect(25,500,40,1000); 

    ctx.fillStyle = "#444444";
    ctx.fillRect(25,700,40,1000);
    ctx.fillStyle = "#333333";
    ctx.fillRect(25,700,40,30);
    ctx.strokeRect(25,700,40,1000); 

    ctx.fillStyle = "#444444";
    ctx.fillRect(25,900,40,650);
    ctx.fillStyle = "#333333";
    ctx.fillRect(25,900,40,30);
    ctx.strokeRect(25,900,40,650); 


    ctx.fillStyle = "#444444";
    ctx.fillRect(0,1000,60,780); 
    ctx.fillStyle = "#333333";
    ctx.fillRect(0,1000,60,40); 
    ctx.strokeRect(0,1000,60,780); 

    ctx.restore();
},[],0,0,10,10);

export let METAL_FENCE = new TextureData(0, 0, 0.2, "avatar", {
    width: 1480,
    height: 800
}, [
    [0,60,1460,720],
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#444444";
   
    ctx.fillRect(110,50,40,720);
    ctx.fillRect(310,50,40,720);
    ctx.fillRect(510,50,40,720);
    ctx.fillRect(710,50,40,720);
    ctx.fillRect(910,50,40,720);
    ctx.fillRect(1110,50,40,720);
    ctx.fillRect(1310,50,40,720);

    ctx.fillStyle = "#333333";
    ctx.fillRect(110,50,40,30);
    ctx.fillRect(310,50,40,30);
    ctx.fillRect(510,50,40,30);
    ctx.fillRect(710,50,40,30);
    ctx.fillRect(910,50,40,30);
    ctx.fillRect(1110,50,40,30);
    ctx.fillRect(1310,50,40,30);

    ctx.strokeRect(110,50,40,720);
    ctx.strokeRect(310,50,40,720);
    ctx.strokeRect(510,50,40,720);
    ctx.strokeRect(710,50,40,720);
    ctx.strokeRect(910,50,40,720);
    ctx.strokeRect(1110,50,40,720);
    ctx.strokeRect(1310,50,40,720);

    ctx.fillStyle = "#444444";
    ctx.fillRect(5,200,1450,60);
    ctx.fillRect(5,600,1450,60);
    ctx.strokeRect(5,200,1450,60);
    ctx.strokeRect(5,600,1450,60);
 
    ctx.fillStyle = "#444444";
    ctx.fillRect(1400,0,60,780);
    ctx.fillRect(0,0,60,780); 
    ctx.fillStyle = "#333333";
    ctx.fillRect(1400,0,60,40);
    ctx.fillRect(0,0,60,40); 
    ctx.strokeRect(1400,0,60,780);
    ctx.strokeRect(0,0,60,780); 

    ctx.restore();
},[],0,0,100,300);

export let STOPPER = new TextureData(0, 0, 0.2, "avatar", {
    width: 470,
    height: 1220
}, [
    [0,50,450,1150],
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#A9A9A9";

    ctx.moveTo(0,500);
    ctx.lineTo(0,50);
    ctx.lineTo(100,0);
    ctx.lineTo(360,0);
    ctx.lineTo(450,50);
    ctx.lineTo(450,500);
    ctx.fill();
    
    ctx.fillStyle = "#878787";
    ctx.beginPath();
    ctx.moveTo(0,300);
    ctx.lineTo(0,50);
    ctx.lineTo(100,0);
    ctx.lineTo(360,0);
    ctx.lineTo(450,50);
    ctx.lineTo(450,300);
    ctx.lineTo(350,250);
    ctx.lineTo(100,250);
    ctx.fill();
   
    ctx.fillStyle = "#999999";
    ctx.fillRect(100,0,250,250);

    ctx.fillStyle = "#A9A9A9";

    ctx.fillRect(0,500,450,700);
    ctx.fillStyle = "#787878";
    ctx.fillRect(0,500,450,100);

    ctx.fillStyle = "#555555";
    ctx.fillRect(50,500,350,50);
    ctx.strokeRect(50,500,350,50);  
    
    ctx.fillStyle = "#999999";
    ctx.fillRect(0,600,450,40);
    
    ctx.strokeRect(0,500,450,700);
   
    ctx.beginPath(); 
    ctx.moveTo(0,500);
    ctx.lineTo(0,50);
    ctx.lineTo(100,0);
    ctx.lineTo(360,0);
    ctx.lineTo(450,50);
    ctx.lineTo(450,500);
    ctx.stroke(); 

    ctx.restore();
},[],0,0,10,10);

export let GAZEBO = new TextureData(0, 0, 0.2, "avatar", {
    width: 3220,
    height: 3420
}, [
    [0, 0, 3220, 3420, 0]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#787878";   


    ctx.beginPath();
    ctx.fillStyle = "#787878";   
    ctx.moveTo(400,900);
    ctx.lineTo(900,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,900);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#555555";   
    ctx.moveTo(400,750);
    ctx.lineTo(750,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,800);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(400,900);
    ctx.lineTo(900,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,900);
    ctx.stroke();


    ctx.beginPath();
    ctx.fillStyle = "#787878";   
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,900);
    ctx.lineTo(2300,400);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#555555";   
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,750);
    ctx.lineTo(2450,400);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,900);
    ctx.lineTo(2300,400);
    ctx.stroke();
    
    ctx.fillStyle = "#787878";   
    ctx.beginPath(); 
    ctx.moveTo(0,150);
    ctx.lineTo(0,280);
    ctx.lineTo(200,400);
    ctx.lineTo(3000,400);
    ctx.lineTo(3200,280);
    ctx.lineTo(3200,150);
    ctx.lineTo(-6,150);
    ctx.fill();
    ctx.fillStyle = "#999999";
    ctx.fillRect(0,150,3200,80);
    ctx.stroke();

    ctx.fillStyle = "#858585";  
    ctx.fillRect(200,350,200,1500);
    ctx.fillRect(2800,350,200,1500);
    ctx.fillStyle = "#999999";  
    ctx.fillRect(200,350,200,60);
    ctx.fillRect(2800,350,200,60);
    ctx.strokeRect(200,350,200,1500);
    ctx.strokeRect(2800,350,200,1500);
    ctx.fillStyle = "#787878";  

    ctx.translate(0,1600);
   

    ctx.beginPath();
    ctx.fillStyle = "#787878";  
    ctx.moveTo(400,900);
    ctx.lineTo(900,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,900);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#555555";  
    ctx.moveTo(400,750);
    ctx.lineTo(750,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,900);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(400,900);
    ctx.lineTo(900,400);
    ctx.lineTo(700,400);
    ctx.lineTo(400,700);
    ctx.lineTo(400,900);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#787878";  
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,900);
    ctx.lineTo(2300,400);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#555555";  
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,750);
    ctx.lineTo(2450,400);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2500,400);
    ctx.lineTo(2800,700);
    ctx.lineTo(2800,900);
    ctx.lineTo(2300,400);
    ctx.stroke();
    
    ctx.fillStyle = "#787878";  
    ctx.beginPath(); 
    ctx.moveTo(0,150);
    ctx.lineTo(0,280);
    ctx.lineTo(200,400);
    ctx.lineTo(3000,400);
    ctx.lineTo(3200,280);
    ctx.lineTo(3200,150);
    ctx.lineTo(-6,150);
    ctx.fill();
    ctx.fillStyle = "#999999";
    ctx.fillRect(0,150,3200,80);
    ctx.stroke();

    ctx.fillStyle = "#858585";  
    ctx.fillRect(200,350,200,1500);
    ctx.fillRect(2800,350,200,1500);
    ctx.fillStyle = "#999999";  
    ctx.fillRect(200,350,200,60);
    ctx.fillRect(2800,350,200,60);
    ctx.strokeRect(200,350,200,1500);
    ctx.strokeRect(2800,350,200,1500);
    ctx.fillStyle = "#787878"; 

    ctx.translate(0,-1600);

    ctx.fillStyle = "#898989";
    ctx.fillRect(2870,50,60,2000);
    ctx.fillRect(270,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(2870,50,60,1800);
    ctx.fillRect(270,50,60,1800);
    ctx.strokeRect(2870,50,60,2000);
    ctx.strokeRect(270,50,60,2000);
 
    ctx.fillStyle = "#787878";
    ctx.fillRect(595,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(595,50,60,1800);
    ctx.strokeRect(595,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(920,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(920,50,60,1800);
    ctx.strokeRect(920,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(1245,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(1245,50,60,1800);
    ctx.strokeRect(1245,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(1570,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(1570,50,60,1800);
    ctx.strokeRect(1570,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(1895,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(1895,50,60,1800);
    ctx.strokeRect(1895,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(2220,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(2220,50,60,1800);
    ctx.strokeRect(2220,50,60,2000);
    
    ctx.fillStyle = "#787878";
    ctx.fillRect(2545,50,60,2000);
    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(2545,50,60,1800);
    ctx.strokeRect(2545,50,60,2000);
    
/*
    ctx.strokeStyle = "red";
    ctx.strokeRect(200,1650,200,200);
    ctx.strokeRect(2800,1650,200,200);
    ctx.strokeRect(200,3250,200,200);
    ctx.strokeRect(2800,3250,200,200); */
     
    ctx.restore();
},[],0,0,10,-40);

export let SHED = new TextureData(10, 10, 0.2, "avatar", {
    width: 3020,
    height: 2460
}, [
    [0, 0, 3020, 2460,0],
    [0, 0, 3000, 1400],
    [100, 1400, 2800, 1000]
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#979797";

    ctx.fillStyle = "#656565";
    ctx.fillRect(0, 0, 3000, 1400);
    ctx.fillStyle = "#555555";
    ctx.fillRect(0, 0, 3000, 500);
    ctx.fillStyle = "#444444";
    ctx.fillRect(0, 1300, 3000, 100);
    ctx.strokeRect(0, 0, 3000, 1400);
   
    ctx.fillStyle = "#B2B2B2";
    //ctx.strokeRect(100, 1400, 2800, 1000);
    ctx.moveTo(100,1400);
    ctx.lineTo(2900,1400);
    ctx.lineTo(2900,2440);
    ctx.lineTo(2300,2440);
    ctx.lineTo(2300,2400);
    ctx.lineTo(700,2400);
    ctx.lineTo(700,2440);
    ctx.lineTo(100,2440);
    ctx.lineTo(100,1400);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(100,1500);
    ctx.lineTo(2900,1500);
    ctx.moveTo(100,1600);
    ctx.lineTo(2900,1600);
    ctx.moveTo(100,1700);
    ctx.lineTo(2900,1700);
    ctx.moveTo(100,1800);
    ctx.lineTo(2900,1800);
    ctx.moveTo(100,1900);
    ctx.lineTo(2900,1900);
    ctx.moveTo(100,2000);
    ctx.lineTo(2900,2000);
    ctx.moveTo(100,2100);
    ctx.lineTo(2900,2100);
    ctx.moveTo(100,2200);
    ctx.lineTo(2900,2200);
    ctx.moveTo(100,2300);
    ctx.lineTo(2900,2300);
    ctx.moveTo(100,2400);
    ctx.lineTo(2900,2400);
    ctx.stroke();
   
    ctx.lineWidth = 15; 

    ctx.fillStyle = "#616161";
    ctx.fillRect(700, 1550, 1600, 50);
    ctx.fillStyle = "#444444";
    ctx.fillRect(700, 1550, 1600, 25);
    ctx.strokeRect(700, 1550, 1600, 50);

    ctx.fillStyle = "#616161";
    ctx.fillRect(700, 1600, 25, 820);
    ctx.strokeRect(700, 1600, 25, 820);

    ctx.fillRect(2275, 1600, 25, 820);
    ctx.strokeRect(2275, 1600, 25, 820);

    ctx.fillStyle = "#898989";
    ctx.fillRect(725, 1600, 1550, 800);
    ctx.strokeRect(725, 1600, 1550, 800);
   
    ctx.beginPath(); 
    ctx.moveTo(1500,1600);
    ctx.lineTo(1500,2400);
    ctx.stroke();
    
    ctx.lineWidth = 15;
    ctx.fillStyle = "#777777";
    ctx.fillRect(1450,1950,100,200);
    ctx.fillStyle = "#646464";
    ctx.fillRect(1450,1950,100,170);
    ctx.strokeRect(1450,1950,100,200);
    
    ctx.beginPath(); 
    ctx.lineWidth = 5;
    ctx.moveTo(1500,1900);
    ctx.lineTo(1500,2300);
    ctx.stroke();

    ctx.restore();
},[],0,0,10,10);

export let TABLE = new TextureData(10, 10, 0.2, "avatar", {
    width: 1400,
    height: 910
}, [
    [0, 0, 1400, 800],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 1400, 800);
    ctx.fillStyle = "#E6E6E6";
    ctx.fillRect(0, 0, 1400, 730);
    ctx.strokeRect(0, 0, 1400, 800);

    ctx.fillRect(40, 800, 100, 110);
    ctx.strokeRect(40, 800, 100, 110);
    ctx.fillRect(1260, 800, 100, 110);
    ctx.strokeRect(1260, 800, 100, 110);
    ctx.restore();
});

export let STORE_SHELF_1 = new TextureData(10, 10, 0.2, "avatar", {
    width: 2020,
    height: 1420
}, [
    [-10, -10, 2020, 1420],
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#D5D5D5";

    ctx.fillRect(0, 0, 2000, 1400);
    ctx.fillStyle = "#B3B3B3";
    ctx.fillRect(0, 0, 2000, 1100);
    ctx.fillStyle = "#999999";
    ctx.fillRect(0, 0, 2000, 50);

    ctx.strokeRect(0, 0, 2000, 1400);
    ctx.strokeRect(50, 100, 1900, 950);

    ctx.strokeRect(50, 380, 1900, 40);
    ctx.strokeRect(50, 700, 1900, 40);

    function chips1(x,y) {
     ctx.translate(x,y);
     ctx.fillStyle = "#888888";
     ctx.beginPath();
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.fill();

     ctx.fillStyle = "#565656";
     ctx.fillRect(200,280,260,40);
     ctx.fillStyle = "#D6D6D6";
     ctx.fillRect(260,220,140,70);
     ctx.fillStyle = "black";
     ctx.font = "50px Arial";
     ctx.fillText("哈 哈",275,270);
     ctx.fillText("哈 哈",275,270);

     ctx.beginPath();
     ctx.lineWidth = 5;
     ctx.moveTo(200,170);
     ctx.lineTo(460,170);
     ctx.stroke();

     ctx.beginPath();
     ctx.lineWidth = 15;
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.stroke();
     ctx.translate(-x,-y);
    } 

    function chips2(x,y) {
     ctx.translate(x,y);
     ctx.fillStyle = "#C3C3C3";
     ctx.beginPath();
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.fill();

     //ctx.fillStyle = "#565656";
     //ctx.fillRect(200,280,260,40);
     //ctx.fillStyle = "#D6D6D6";
     //ctx.fillRect(260,220,140,70);
     ctx.lineWidth = 5;
     ctx.fillStyle = "black";
     ctx.font = "130px Arial";
     ctx.strokeText("屁",265,350);

     ctx.beginPath();
     ctx.lineWidth = 5;
     ctx.moveTo(200,190);
     ctx.lineTo(460,190);
     ctx.stroke();

     ctx.beginPath();
     ctx.lineWidth = 15;
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.stroke();
     ctx.translate(-x,-y);
    } 

    function chips3(x,y) {
     ctx.translate(x,y);
     ctx.fillStyle = "#A4A4A4";
     ctx.beginPath();
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.fill();

     ctx.fillStyle = "#D3D3D3";
     ctx.fillRect(270,270,120,50);
     ctx.fillStyle = "#737373";
     ctx.fillRect(270,300,120,20);
     ctx.lineWidth = 5;
     ctx.fillStyle = "black";
     ctx.font = "130px Arial";

     ctx.beginPath();
     ctx.lineWidth = 5;
     ctx.moveTo(200,180);
     ctx.lineTo(460,180);

     ctx.moveTo(225,150);
     ctx.lineTo(225,180);
     ctx.moveTo(255,150);
     ctx.lineTo(255,180);
     ctx.moveTo(285,150);
     ctx.lineTo(285,180);
     ctx.moveTo(315,150);
     ctx.lineTo(315,180);
     ctx.moveTo(345,150);
     ctx.lineTo(345,180);
     ctx.moveTo(375,150);
     ctx.lineTo(375,180);
     ctx.moveTo(405,150);
     ctx.lineTo(405,180);
     ctx.moveTo(435,150);
     ctx.lineTo(435,180);
     ctx.stroke();

     ctx.beginPath();
     ctx.lineWidth = 15;
     ctx.moveTo(200,150);
     ctx.lineTo(460,150);
     ctx.lineTo(460,170);
     ctx.lineTo(450,200);
     ctx.lineTo(450,380);
     ctx.lineTo(210,380);
     ctx.lineTo(210,200);
     ctx.lineTo(200,170);
     ctx.lineTo(200,142);
     ctx.stroke();
     ctx.translate(-x,-y);
    } 

    chips1(70,0);
    chips1(470,0);
    chips1(870,0);
    chips1(1270,0);

    chips2(70,320);
    chips2(470,320);
    chips2(870,320);
    chips2(1270,320);
    
    chips3(70,670);
    chips3(470,670);
    chips3(870,670);
    chips3(1270,670);
    
    ctx.restore();
},[],0,0,0,0);

export let SYRINGE = new TextureData(30, 200, 0.25, "avatar", {
    width: 125,
    height: 530
}, [
    [0, 0, 125, 530],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#DDDDDD";

    ctx.fillRect(0,0,70,240);
    ctx.fillRect(15,-30,40,30);
    ctx.fillRect(-15,242,100,20);
    ctx.fillRect(25,262,20,35);
    ctx.fillRect(0,300,70,20);

    ctx.fillStyle = "#999999";
    ctx.fillRect(0,70,70,160);

    //ctx.strokeRect(0,0,70,240);
    ctx.strokeRect(-15,242,100,20);
    ctx.strokeRect(25,262,20,35);
    ctx.strokeRect(0,300,70,20);

    //ctx.fillRect(0,0,70,240);
  
    ctx.moveTo(12,0);
    ctx.lineTo(28,-45);
    ctx.lineTo(42,-45);
    ctx.lineTo(58,0);

     
    ctx.moveTo(12,0);
    ctx.lineTo(0,20);
    ctx.lineTo(0,240);
    ctx.lineTo(70,240);
    ctx.lineTo(70,20);
    ctx.lineTo(58,0);

    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(58,0);
    ctx.lineTo(12,0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(45,90);
    ctx.lineTo(70,90);
    ctx.moveTo(45,130);
    ctx.lineTo(70,130);
    ctx.moveTo(45,170);
    ctx.lineTo(70,170);
    ctx.moveTo(45,210);
    ctx.lineTo(70,210);
    ctx.stroke();
 
    ctx.lineWidth = 10;
    ctx.strokeRect(34,-180,1,140);

    ctx.restore();
},[],0,0,360,330);

export let MIXED_BUSH = new TextureData(0, 0, 0.2, "avatar", {
    width: 850,
    height: 880
}, [
    [0, 0, 850, 880],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";
    
    function leaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = (Math.random() < 0.5) ? "#E5E5E5":"#ABABAB";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function darkleaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = (Math.random() < 0.5) ? "#BBBBBB":"#787878";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function lightleafRow(y) {
    ctx.translate(0,y);
    leaf(0,0);
    leaf(100,0);
    leaf(200,0);
    leaf(300,0);
    leaf(400,0);
    leaf(500,0);
    leaf(600,0);
    leaf(700,0);
    leaf(800,0);
    leaf(900,0);
    leaf(1000,0);
    leaf(1100,0);
    leaf(1200,0);
    leaf(1300,0);
    leaf(1400,0);
    leaf(1500,0);
    leaf(1600,0);
    leaf(1700,0);
    leaf(1800,0);
    ctx.translate(0,-y);
    }

    function darkleafRow(y) {
    ctx.translate(0,y);
    darkleaf(0,0);
    darkleaf(100,0);
    darkleaf(200,0);
    darkleaf(300,0);
    darkleaf(400,0);
    darkleaf(500,0);
    darkleaf(600,0);
    darkleaf(700,0);
    darkleaf(800,0);
    darkleaf(900,0);
    darkleaf(1000,0);
    darkleaf(1100,0);
    darkleaf(1200,0);
    darkleaf(1300,0);
    darkleaf(1400,0);
    darkleaf(1500,0);
    darkleaf(1600,0);
    darkleaf(1700,0);
    darkleaf(1800,0);
    ctx.translate(0,-y);
    }

    lightleafRow(0);
    lightleafRow(50);
    lightleafRow(100);
    lightleafRow(150);
    lightleafRow(200);
    lightleafRow(250);
    lightleafRow(300);
    lightleafRow(350);
    lightleafRow(400);
    lightleafRow(450);
    darkleafRow(500);
    darkleafRow(550);
    darkleafRow(600);
    darkleafRow(650);
    darkleafRow(700);
    darkleafRow(750);
 
    ctx.restore();
},[],0,0,10,80);

export let LIGHT_BUSH = new TextureData(0, 0, 0.2, "avatar", {
    width: 850,
    height: 880
}, [
    [0, 0, 850, 880],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";
    
    function leaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = "#E5E5E5";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function darkleaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = "#BBBBBB";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function lightleafRow(y) {
    ctx.translate(0,y);
    leaf(0,0);
    leaf(100,0);
    leaf(200,0);
    leaf(300,0);
    leaf(400,0);
    leaf(500,0);
    leaf(600,0);
    leaf(700,0);
    leaf(800,0);
    leaf(900,0);
    leaf(1000,0);
    leaf(1100,0);
    leaf(1200,0);
    leaf(1300,0);
    leaf(1400,0);
    leaf(1500,0);
    leaf(1600,0);
    leaf(1700,0);
    leaf(1800,0);
    ctx.translate(0,-y);
    }

    function darkleafRow(y) {
    ctx.translate(0,y);
    darkleaf(0,0);
    darkleaf(100,0);
    darkleaf(200,0);
    darkleaf(300,0);
    darkleaf(400,0);
    darkleaf(500,0);
    darkleaf(600,0);
    darkleaf(700,0);
    darkleaf(800,0);
    darkleaf(900,0);
    darkleaf(1000,0);
    darkleaf(1100,0);
    darkleaf(1200,0);
    darkleaf(1300,0);
    darkleaf(1400,0);
    darkleaf(1500,0);
    darkleaf(1600,0);
    darkleaf(1700,0);
    darkleaf(1800,0);
    ctx.translate(0,-y);
    }

    lightleafRow(0);
    lightleafRow(50);
    lightleafRow(100);
    lightleafRow(150);
    lightleafRow(200);
    lightleafRow(250);
    lightleafRow(300);
    lightleafRow(350);
    lightleafRow(400);
    lightleafRow(450);
    darkleafRow(500);
    darkleafRow(550);
    darkleafRow(600);
    darkleafRow(650);
    darkleafRow(700);
    darkleafRow(750);
 
    ctx.restore();
},[],0,0,10,80);

export let BUSH = new TextureData(0, 0, 0.2, "avatar", {
    width: 850,
    height: 880
}, [
    [0, 0, 850, 880],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";
    
    function leaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = "#ABABAB";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function darkleaf(x,y) {

    let r = random(360,true);

    ctx.fillStyle = "#787878";
    ctx.scale(0.4,0.4);
    ctx.translate(x,y);

    ctx.translate(140,-25);
    ctx.rotate(r);
    ctx.translate(-140,25);
    
    ctx.lineWidth = 25;

    ctx.beginPath();
    ctx.moveTo(70,90);
    ctx.lineTo(90,-60);
    ctx.lineTo(130,-100);
    ctx.lineTo(200,-120);
    ctx.lineTo(220,-50);
    ctx.lineTo(200,10);
    ctx.lineTo(65,90);
    ctx.fill();
    ctx.stroke();    
   
    ctx.lineWidth = 10;
    ctx.moveTo(200,-120);
    ctx.lineTo(140,-25);
    ctx.stroke();
    
    ctx.translate(140,-25);
    ctx.rotate(-r);
    ctx.translate(-140,25);

    ctx.translate(-x,-y);
    ctx.scale(2.5,2.5);
    }

    function lightleafRow(y) {
    ctx.translate(0,y);
    leaf(0,0);
    leaf(100,0);
    leaf(200,0);
    leaf(300,0);
    leaf(400,0);
    leaf(500,0);
    leaf(600,0);
    leaf(700,0);
    leaf(800,0);
    leaf(900,0);
    leaf(1000,0);
    leaf(1100,0);
    leaf(1200,0);
    leaf(1300,0);
    leaf(1400,0);
    leaf(1500,0);
    leaf(1600,0);
    leaf(1700,0);
    leaf(1800,0);
    ctx.translate(0,-y);
    }

    function darkleafRow(y) {
    ctx.translate(0,y);
    darkleaf(0,0);
    darkleaf(100,0);
    darkleaf(200,0);
    darkleaf(300,0);
    darkleaf(400,0);
    darkleaf(500,0);
    darkleaf(600,0);
    darkleaf(700,0);
    darkleaf(800,0);
    darkleaf(900,0);
    darkleaf(1000,0);
    darkleaf(1100,0);
    darkleaf(1200,0);
    darkleaf(1300,0);
    darkleaf(1400,0);
    darkleaf(1500,0);
    darkleaf(1600,0);
    darkleaf(1700,0);
    darkleaf(1800,0);
    ctx.translate(0,-y);
    }

    lightleafRow(0);
    lightleafRow(50);
    lightleafRow(100);
    lightleafRow(150);
    lightleafRow(200);
    lightleafRow(250);
    lightleafRow(300);
    lightleafRow(350);
    lightleafRow(400);
    lightleafRow(450);
    darkleafRow(500);
    darkleafRow(550);
    darkleafRow(600);
    darkleafRow(650);
    darkleafRow(700);
    darkleafRow(750);
 
    ctx.restore();
},[],0,0,900,80);

export let TREE = new TextureData(10, 10, 0.2, "avatar", {
    width: 1400,
    height: 910
}, [
    [0, 0, 1400, 800],
   // [40, 800, 100, 110, 0],
  //  [1260, 800, 100, 110, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.moveTo(100,100);
    ctx.lineTo(250,150);
    ctx.lineTo(300,110);
    ctx.lineTo(340,100);
    ctx.lineTo(340,-10);
    ctx.lineTo(320,-300);
    ctx.stroke();

    ctx.restore();
},[],0,0,800,1100);

export let BOOK_1 = new TextureData(3, 2, 0.2, "pickup", {
    width: 301,
    height: 416
}, [
    [0, 0, 301, 416]
], 0, undefined, function(ctx) {
    // 3,2
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.moveTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.lineTo(50, 5);
    ctx.lineTo(60, 0);
    ctx.lineTo(280, 0);
    ctx.lineTo(280, 400);
    ctx.lineTo(60, 400);
    ctx.lineTo(50, 395);
    ctx.lineTo(40, 400);
    ctx.lineTo(0, 400);
    ctx.lineTo(-5, 390);
    ctx.lineTo(-5, 10);
    ctx.lineTo(4, -2);
    ctx.fill();
    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(0, 0, 280, 360);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 5);
    ctx.lineTo(50, 360);
    ctx.moveTo(0, 360);
    ctx.lineTo(280, 360);
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 372);
    ctx.lineTo(280, 372);
    ctx.moveTo(0, 385);
    ctx.lineTo(280, 385);
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillRect(100, 80, 125, 50);
    ctx.strokeRect(100, 80, 125, 50);

    ctx.restore();
});

export let BOOK_2 = new TextureData(3, 2, 0.2, "pickup", {
    width: 301,
    height: 416
}, [
    [0, 0, 301, 416]
], 0, undefined, function(ctx) {
    // 3,2
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.moveTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.lineTo(50, 5);
    ctx.lineTo(60, 0);
    ctx.lineTo(280, 0);
    ctx.lineTo(280, 400);
    ctx.lineTo(60, 400);
    ctx.lineTo(50, 395);
    ctx.lineTo(40, 400);
    ctx.lineTo(0, 400);
    ctx.lineTo(-5, 390);
    ctx.lineTo(-5, 10);
    ctx.lineTo(4, -2);
    ctx.fill();
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(0, 0, 280, 360);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 5);
    ctx.lineTo(50, 360);
    ctx.moveTo(0, 360);
    ctx.lineTo(280, 360);
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 372);
    ctx.lineTo(280, 372);
    ctx.moveTo(0, 385);
    ctx.lineTo(280, 385);
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.fillRect(100, 80, 125, 50);
    ctx.strokeRect(100, 80, 125, 50);

    ctx.restore();
});

export let KITCHEN_KNIFE = new TextureData(4, 2, 0.22, "pickup", {
    width: 124,
    height: 657
}, [
    [0, 0, 124, 657]
], 0, undefined, function(ctx) {
    // 4 2 
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#F3F3F3";

    // blade
    ctx.moveTo(0, 370);
    ctx.lineTo(0, 90);
    ctx.lineTo(10, 30);
    ctx.lineTo(20, 10);
    ctx.lineTo(35, 0);
    ctx.lineTo(60, 40);
    ctx.lineTo(80, 110);
    ctx.lineTo(85, 140);
    ctx.lineTo(90, 190);
    ctx.lineTo(95, 270);
    ctx.lineTo(95, 370);
    ctx.lineTo(70, 370);
    ctx.lineTo(50, 390);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, 390);
    ctx.lineTo(20, 370);
    ctx.lineTo(-15, 370);
    ctx.lineTo(-15, 620);
    ctx.lineTo(5, 640);
    ctx.lineTo(35, 640);
    ctx.lineTo(65, 610);
    ctx.lineTo(50, 580);
    ctx.lineTo(60, 500);
    ctx.lineTo(50, 390);
    ctx.fillStyle = "#A3A3A3";
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.moveTo(70, 370);
    ctx.lineTo(70, 250);
    ctx.lineTo(63, 150);
    ctx.lineTo(55, 90);
    ctx.lineTo(40, 40);
    ctx.lineTo(25, 9);
    ctx.stroke();

    ctx.restore();
},[], 0, 0, 390, 130);

export let ASSASSINS_KNIFE = new TextureData(8, 4, 0.22, "pickup", {
    width: 173,
    height: 677
}, [
    [0, 0, 173, 677]
], 0, undefined, function(ctx) {
    // 8 4 
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#F3F3F3";

    // blade
    ctx.moveTo(0, 390);
    ctx.lineTo(0, 370);
    ctx.lineTo(0, 300);
    ctx.lineTo(20, 150);
    ctx.lineTo(25, 90);
    ctx.lineTo(20, 30);
    ctx.lineTo(12, 10);
    ctx.lineTo(10, 0);
    ctx.lineTo(60, 40);
    ctx.lineTo(80, 110);
    ctx.lineTo(85, 140);
    ctx.lineTo(65, 190);
    ctx.lineTo(68, 180);
    ctx.lineTo(70, 185);

    ctx.lineTo(70, 195);
    ctx.lineTo(55, 220);

    ctx.lineTo(95, 180);
    ctx.lineTo(95, 240);
    ctx.lineTo(85, 300);
    ctx.lineTo(95, 370);
    ctx.lineTo(95, 390);
    ctx.fill();
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(-30, 390);
    ctx.lineTo(125, 390);
    ctx.lineTo(120, 410);
    ctx.lineTo(85, 410);
    ctx.lineTo(80, 540);
    ctx.lineTo(85, 630);
    ctx.lineTo(50, 650);
    ctx.lineTo(10, 630);
    ctx.lineTo(15, 540);
    ctx.lineTo(10, 410);
    ctx.lineTo(-25, 410);
    ctx.lineTo(-30, 387);
    ctx.fillStyle = "#A3A3A3";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(-30, 410);
    ctx.lineTo(125, 410);

    ctx.stroke();

    ctx.restore();
},[], 0, 0, 390, 130);

export let COMBAT_KNIFE = new TextureData(27, 27, 0.2, "pickup", {
    width: 349,
    height: 463
}, [
    [0, 0, 349, 463]
], 0, undefined, function(ctx) {
    // 27 27 
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.scale(0.8, 0.8);
    ctx.beginPath();
    ctx.lineWidth = 18;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#A3A3A3";

    // handle
    ctx.beginPath();
    ctx.moveTo(100, 265);
    ctx.lineTo(70, 270);
    ctx.lineTo(45, 300);
    ctx.lineTo(45, 340);
    ctx.lineTo(58, 360);
    ctx.lineTo(70, 375);
    ctx.lineTo(95, 378);
    ctx.lineTo(95, 388);
    ctx.lineTo(110, 400);
    ctx.lineTo(130, 378);
    ctx.lineTo(153, 370);
    ctx.lineTo(180, 340);
    ctx.lineTo(190, 300);
    ctx.lineTo(210, 295);
    ctx.lineTo(255, 150);
    ctx.lineTo(257, 60);
    ctx.lineTo(235, 20);
    ctx.lineTo(234, -20);
    ctx.lineTo(225, -35);
    ctx.lineTo(120, -10);
    ctx.lineTo(90, 30);
    ctx.lineTo(95, 60);
    ctx.lineTo(140, 70);
    ctx.lineTo(145, 100);
    ctx.lineTo(120, 130);
    ctx.lineTo(120, 135);
    ctx.lineTo(140, 155);
    ctx.lineTo(145, 170);
    ctx.lineTo(145, 180);
    ctx.lineTo(120, 190);
    ctx.lineTo(120, 210);
    ctx.lineTo(130, 225);
    ctx.lineTo(130, 240);
    ctx.lineTo(100, 250);
    ctx.lineTo(100, 265);

    // hole
    ctx.moveTo(80, 290);
    ctx.lineTo(120, 285);
    ctx.lineTo(160, 295);
    ctx.lineTo(162, 330);
    ctx.lineTo(145, 350);
    ctx.lineTo(125, 355);
    ctx.lineTo(80, 355);
    ctx.lineTo(65, 335);
    ctx.lineTo(70, 300);
    ctx.lineTo(80, 290);
    ctx.fill();
    ctx.stroke();

    // blade
    ctx.beginPath();
    ctx.moveTo(210, -35);
    ctx.lineTo(125, -130);
    ctx.lineTo(50, -160);
    ctx.lineTo(-50, -158);
    ctx.lineTo(-110, -130);
    ctx.lineTo(-140, -115);
    ctx.lineTo(-155, -90);
    ctx.lineTo(-90, -95);
    ctx.lineTo(-10, -80);
    ctx.lineTo(60, -20);
    ctx.lineTo(90, 30);
    ctx.fillStyle = "#F3F3F3";
    ctx.fill();
    ctx.stroke();

    // handle
    ctx.beginPath();
    ctx.lineWidth = 18;
    ctx.moveTo(100, 265);
    ctx.lineTo(70, 270);
    ctx.lineTo(45, 300);
    ctx.lineTo(45, 340);
    ctx.lineTo(58, 360);
    ctx.lineTo(70, 375);
    ctx.lineTo(95, 378);
    ctx.lineTo(95, 388);
    ctx.lineTo(110, 400);
    ctx.lineTo(130, 378);
    ctx.lineTo(153, 370);
    ctx.lineTo(180, 340);
    ctx.lineTo(190, 300);
    ctx.lineTo(210, 295);
    ctx.lineTo(255, 150);
    ctx.lineTo(257, 60);
    ctx.lineTo(235, 20);
    ctx.lineTo(234, -20);
    ctx.lineTo(225, -35);
    ctx.lineTo(120, -10);
    ctx.lineTo(90, 30);
    ctx.lineTo(95, 60);
    ctx.lineTo(140, 70);
    ctx.lineTo(145, 100);
    ctx.lineTo(120, 130);
    ctx.lineTo(120, 135);
    ctx.lineTo(140, 155);
    ctx.lineTo(145, 170);
    ctx.lineTo(145, 180);
    ctx.lineTo(120, 190);
    ctx.lineTo(120, 210);
    ctx.lineTo(130, 225);
    ctx.lineTo(130, 240);
    ctx.lineTo(100, 250);
    ctx.lineTo(100, 265);

    // hole
    ctx.moveTo(80, 290);
    ctx.lineTo(120, 285);
    ctx.lineTo(160, 295);
    ctx.lineTo(162, 330);
    ctx.lineTo(145, 350);
    ctx.lineTo(125, 355);
    ctx.lineTo(80, 355);
    ctx.lineTo(65, 335);
    ctx.lineTo(70, 300);
    ctx.lineTo(80, 290);
    ctx.fillStyle = "#A3A3A3";
    ctx.fill();
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.restore();
});

export let LAPTOP = new TextureData(1, -9, 0.2, "pickup", {
    width: 436,
    height: 486
}, [
    [0, 0, 436, 486]
], 0, undefined, function(ctx) {
    // 1 -9
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#757575";

    ctx.fillRect(0, 50, 420, 220);
    ctx.fillRect(0, 270, 420, 250);
    ctx.strokeRect(0, 50, 420, 220);
    ctx.strokeRect(0, 270, 420, 250);

    ctx.lineWidth = 10;
    ctx.moveTo(0, 70);
    ctx.lineTo(420, 70);

    ctx.moveTo(20, 310);
    ctx.lineTo(400, 310);
    ctx.moveTo(20, 340);
    ctx.lineTo(400, 340);
    ctx.moveTo(20, 370);
    ctx.lineTo(400, 370);
    ctx.moveTo(20, 400);
    ctx.lineTo(400, 400);

    ctx.moveTo(60, 290);
    ctx.lineTo(60, 430);
    ctx.moveTo(100, 290);
    ctx.lineTo(100, 430);
    ctx.moveTo(140, 290);
    ctx.lineTo(140, 430);
    ctx.moveTo(180, 290);
    ctx.lineTo(180, 405);
    ctx.moveTo(220, 290);
    ctx.lineTo(220, 405);
    ctx.moveTo(260, 290);
    ctx.lineTo(260, 405);
    ctx.moveTo(300, 290);
    ctx.lineTo(300, 430);
    ctx.moveTo(340, 290);
    ctx.lineTo(340, 430);
    ctx.moveTo(370, 290);
    ctx.lineTo(370, 430);
    ctx.stroke();

    ctx.strokeRect(20, 290, 380, 140);
    ctx.strokeRect(135, 450, 150, 60);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(20, 100, 380, 150);
    ctx.strokeRect(20, 100, 380, 150);

    ctx.restore();
});

export let ROAD = new TextureData(0, 0, 0.2, "prop", {
    width: 2500,
    height: 1410
}, [
    [0, 0, 2500, 1410]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#878787";
    ctx.fillRect(-5, -5, 6000, 6000);

    ctx.fillRect(0, 0, 2500, 1400);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(10, 0, 2480, 200);
    ctx.fillRect(10, 1200, 2480, 200);
    ctx.fillStyle = "#C4C4C4";
    ctx.fillRect(10, 0, 2480, 100);
    ctx.fillRect(10, 1300, 2480, 100);
    ctx.strokeRect(10, 10, 2480, 200);
    ctx.strokeRect(10, 1200, 2480, 200);

    ctx.lineWidth = 15;
    ctx.fillRect(357, 700, 357, 40);
    ctx.fillRect(1071, 700, 357, 40);
    ctx.fillRect(1785, 700, 357, 40);
    ctx.strokeRect(357, 700, 357, 40);
    ctx.strokeRect(1071, 700, 357, 40);
    ctx.strokeRect(1785, 700, 357, 40);

    ctx.restore();
}, [0]);

export let ROAD_DOUBLE = new TextureData(0, 0, 0.2, "prop", {
    width: 2500,
    height: 1410
}, [
    [0, 0, 2500, 1410]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#878787";
    ctx.fillRect(-5, -5, 6000, 6000);

    ctx.fillRect(0, 0, 2500, 1400);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(10, 0, 2480, 200);
    ctx.strokeRect(10, 10, 2480, 200);

    ctx.lineWidth = 15;
    ctx.fillRect(357, 700, 357, 40);
    ctx.fillRect(1071, 700, 357, 40);
    ctx.fillRect(1785, 700, 357, 40);
    ctx.strokeRect(357, 700, 357, 40);
    ctx.strokeRect(1071, 700, 357, 40);
    ctx.strokeRect(1785, 700, 357, 40);

    ctx.restore();
}, [0]);

export let ROAD_CORNER = new TextureData(0, 0, 0.2, "prop", {
    width: 1410,
    height: 1410
}, [
    [0, 0, 1410, 1410]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#878787";
    ctx.fillRect(-5, -5, 6000, 6000);

    ctx.fillRect(0, 0, 1400, 1400);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(10, 1200, 1390, 200);
    ctx.fillRect(1200, 0, 200, 1200);
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = "#C4C4C4";
    ctx.fillRect(10, 1300, 1390, 100);
    ctx.fillRect(1300, 0, 100, 1200);
    ctx.fillRect(10, 10, 100, 100);

    ctx.strokeRect(1200, 10, 200, 1190);
    ctx.strokeRect(10, 1200, 1390, 200);
    ctx.strokeRect(10, 10, 200, 200);

    ctx.lineWidth = 15;
    ctx.fillRect(357, 700, 357, 40);
    ctx.strokeRect(357, 700, 357, 40);

    ctx.restore();
}, [0]);

export let ROAD_TRICORNER = new TextureData(0, 0, 0.2, "prop", {
    width: 1410,
    height: 1410
}, [
    [0, 0, 1410, 1410]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#878787";
    ctx.fillRect(-5, -5, 6000, 6000);

    ctx.fillRect(0, 0, 1410, 1410);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(10, 1200, 1390, 200);
    ctx.fillRect(1190, 0, 200, 200);
    ctx.fillRect(0, 0, 200, 200);

    ctx.fillStyle = "#C4C4C4";
    ctx.fillRect(10, 1300, 1390, 100);
    ctx.fillRect(1300, 10, 100, 100);
    ctx.fillRect(10, 10, 100, 100);

    ctx.strokeRect(1200, 10, 200, 200);
    ctx.strokeRect(10, 1200, 1390, 200);
    ctx.strokeRect(10, 10, 200, 200);

    ctx.lineWidth = 15;
    ctx.fillRect(357, 700, 357, 40);
    ctx.strokeRect(357, 700, 357, 40);

    ctx.restore();
}, [0]);

export let ROAD_QUADCORNER = new TextureData(0, 0, 0.2, "prop", {
    width: 1410,
    height: 1410
}, [
    [0, 0, 1410, 1410]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#878787";
    ctx.fillRect(-5, -5, 6000, 6000);

    ctx.fillRect(0, 0, 1410, 1410);
    ctx.fillStyle = "#F3F3F3";
    ctx.fillRect(1200, 1200, 200, 200);
    ctx.fillRect(10, 1200, 200, 200);
    ctx.fillRect(1200, 0, 200, 200);
    ctx.fillRect(0, 0, 200, 200);
    ctx.strokeRect(1200, 10, 200, 200);
    ctx.strokeRect(1200, 1200, 200, 200);
    ctx.strokeRect(10, 1200, 200, 200);
    ctx.strokeRect(10, 10, 200, 200);

    ctx.lineWidth = 15;
    ctx.fillRect(357, 700, 357, 40);
    ctx.strokeRect(357, 700, 357, 40);

    ctx.restore();
}, [0]);

export let BULLET = new TextureData(0, 0, 0.2, "prop", {
    width: 90,
    height: 40
}, [
    [0, 0, 90, 40]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();

    ctx.strokeStyle = "#3C3C3C";
    ctx.fillStyle = "#3C3C3C";

    ctx.fill();

    ctx.restore();
});

export let BULLETSHELL = new TextureData(0, 0, 0.2, "prop", {
    width: 90,
    height: 50
}, [
    [0, 0, 90, 50]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 10;

    ctx.strokeStyle = "#3C3C3C";
    ctx.fillStyle = "white";

    ctx.moveTo(0, 0);
    ctx.lineTo(0, 40);
    ctx.lineTo(80, 40);
    ctx.lineTo(80, 20);
    ctx.lineTo(80, 0);
    ctx.lineTo(-5, 0);

    ctx.fill();
    ctx.stroke();

    ctx.restore();
}, [], 0, 0, 5, 5);

export let ROAD_SIGN = new TextureData(10, 10, 0.2, "prop", {
    width: 400,
    height: 1540
}, [
    [0, 0, 380, 520],
    [160, 520, 60, 1000]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 380, 520);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 0, 380, 50);

    //ctx.strokeRect(0,0,380,520);
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    ctx.lineTo(370, 0);
    ctx.lineTo(380, 10);
    ctx.lineTo(380, 510);
    ctx.lineTo(370, 520);
    ctx.lineTo(10, 520);
    ctx.lineTo(0, 510);
    ctx.lineTo(0, 5);
    ctx.stroke();
    ctx.fillStyle = "#9E9E9E";
    ctx.fillRect(160, 520, 60, 1000);
    ctx.strokeRect(160, 520, 60, 1000);
    ctx.lineWidth = 10;
    ctx.strokeRect(175, 450, 30, 30);

    ctx.fillStyle = "#3C3C3C";
    ctx.font = "280px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 30;
    ctx.strokeText("65", 190, 380);

    ctx.restore();
}, undefined, 0, 0, 0, 0);

export let PICNIC_TABLE = new TextureData(10, -40, 0.2, "prop", {
    width: 1400,
    height: 850
}, [
    [0, 170, 400, 900],
    [400, 50, 600, 1000],
    [1000, 170, 400, 900],
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#878787";

    ctx.moveTo(400, 1050);
    ctx.lineTo(300, 1250);
    ctx.lineTo(450, 1250);
    ctx.lineTo(550, 1050);

    ctx.moveTo(1000, 1050);
    ctx.lineTo(1100, 1250);
    ctx.lineTo(950, 1250);
    ctx.lineTo(850, 1050);

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#BABABA";
    ctx.fillRect(0, 170, 350, 900);
    ctx.fillRect(400, 50, 600, 1000);
    ctx.fillRect(1050, 170, 350, 900);
    ctx.fillStyle = "#919191";
    ctx.fillRect(0, 1020, 350, 50);
    ctx.fillRect(400, 970, 600, 70);
    ctx.fillRect(1050, 1020, 350, 50);
    ctx.strokeRect(0, 170, 350, 900);
    ctx.strokeRect(400, 50, 600, 1000);
    ctx.strokeRect(1050, 170, 350, 900);

    ctx.lineWidth = 5;
    ctx.strokeRect(116, 170, 118, 900);
    ctx.strokeRect(600, 50, 200, 1000);
    ctx.strokeRect(1166, 170, 118, 900);

    ctx.lineWidth = 15;
    ctx.fillStyle = "#878787";
    ctx.fillRect(1000, 250, 50, 120);
    ctx.fillRect(350, 250, 50, 120);
    ctx.fillRect(1000, 850, 50, 120);
    ctx.fillRect(350, 850, 50, 120);
    ctx.strokeRect(1000, 250, 50, 120);
    ctx.strokeRect(350, 250, 50, 120);
    ctx.strokeRect(1000, 850, 50, 120);
    ctx.strokeRect(350, 850, 50, 120);

    //ctx.strokeRect(300,1050,800,200);
    ctx.restore();
});

export let DOUBLE_CROSS_TILE = new TextureData(1, 1, 0.2, "prop", {
    width: 1000,
    height: 1000
}, [
    [0, 0, 1000, 1000]
], 10, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 10;

    ctx.strokeStyle = "#E3E3E3";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 1000, 1000);

    ctx.strokeRect(0, 0, 250, 250);
    ctx.strokeRect(0, 250, 250, 250);
    ctx.strokeRect(250, 250, 250, 250);
    ctx.strokeRect(250, 0, 250, 250);
    ctx.strokeRect(0, 0, 250, 125);
    ctx.strokeRect(0, 250, 125, 250);
    ctx.strokeRect(250, 250, 250, 125);
    ctx.strokeRect(250, 0, 125, 250);

    ctx.translate(500, 0);

    ctx.strokeRect(0, 0, 250, 250);
    ctx.strokeRect(0, 250, 250, 250);
    ctx.strokeRect(250, 250, 250, 250);
    ctx.strokeRect(250, 0, 250, 250);
    ctx.strokeRect(0, 0, 250, 125);
    ctx.strokeRect(0, 250, 125, 250);
    ctx.strokeRect(250, 250, 250, 125);
    ctx.strokeRect(250, 0, 125, 250);

    ctx.translate(0, 500);

    ctx.strokeRect(0, 0, 250, 250);
    ctx.strokeRect(0, 250, 250, 250);
    ctx.strokeRect(250, 250, 250, 250);
    ctx.strokeRect(250, 0, 250, 250);
    ctx.strokeRect(0, 0, 250, 125);
    ctx.strokeRect(0, 250, 125, 250);
    ctx.strokeRect(250, 250, 250, 125);
    ctx.strokeRect(250, 0, 125, 250);

    ctx.translate(-500, 0);

    ctx.strokeRect(0, 0, 250, 250);
    ctx.strokeRect(0, 250, 250, 250);
    ctx.strokeRect(250, 250, 250, 250);
    ctx.strokeRect(250, 0, 250, 250);
    ctx.strokeRect(0, 0, 250, 125);
    ctx.strokeRect(0, 250, 125, 250);
    ctx.strokeRect(250, 250, 250, 125);
    ctx.strokeRect(250, 0, 125, 250);


    ctx.restore();
});

export let URBAN_FENCE = new TextureData(0, 0, 0.2, "prop", {
    width: 2420,
    height: 1420
}, [
    [0, 0, 2420, 1420]
], 0, undefined, function(ctx) {
    // 2, 2
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#7A7A7A";

    ctx.fillRect(0, 0, 2400, 1400);
    ctx.fillStyle = "#949494";
    ctx.fillRect(0, 0, 2400, 100);
    ctx.strokeRect(0, 0, 2400, 1400);

    ctx.moveTo(0, 200);
    ctx.lineTo(2400, 200);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(200, 200);
    ctx.lineTo(200, 1400);
    ctx.moveTo(400, 200);
    ctx.lineTo(400, 1400);
    ctx.moveTo(600, 200);
    ctx.lineTo(600, 1400);
    ctx.moveTo(800, 200);
    ctx.lineTo(800, 1400);
    ctx.moveTo(1000, 200);
    ctx.lineTo(1000, 1400);
    ctx.moveTo(1200, 200);
    ctx.lineTo(1200, 1400);
    ctx.moveTo(1400, 200);
    ctx.lineTo(1400, 1400);
    ctx.moveTo(1600, 200);
    ctx.lineTo(1600, 1400);
    ctx.moveTo(1800, 200);
    ctx.lineTo(1800, 1400);
    ctx.moveTo(2000, 200);
    ctx.lineTo(2000, 1400);
    ctx.moveTo(2200, 200);
    ctx.lineTo(2200, 1400);

    ctx.stroke();

    ctx.restore();
}, [0], 0, 0, 10, 10);

export let URBAN_FENCE_VERTICAL = new TextureData(0, 0, 0.2, "prop", {
    width: 220,
    height: 2820
}, [
    [0, 0, 220, 2820]
], 0, undefined, function(ctx) {
    // 2, 2
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#7A7A7A";

    ctx.fillRect(0, 0, 200, 2800);
    ctx.fillStyle = "#949494";
    ctx.fillRect(0, 0, 200, 1400);
    ctx.strokeRect(0, 0, 200, 2800);

    ctx.moveTo(0, 1500);
    ctx.lineTo(200, 1500);
    ctx.stroke();

    ctx.stroke();

    ctx.restore();
}, [0], 0, 0, 10, 10);

export let URBAN_FENCE_HALF = new TextureData(0, 0, 0.2, "prop", {
    width: 1220,
    height: 1420
}, [
    [0, 0, 1220, 1420]
], 0, undefined, function(ctx) {
    // 2, 2
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#7A7A7A";

    ctx.fillRect(0, 0, 1200, 1400);
    ctx.fillStyle = "#949494";
    ctx.fillRect(0, 0, 1200, 100);
    ctx.strokeRect(0, 0, 1200, 1400);

    ctx.moveTo(0, 200);
    ctx.lineTo(1200, 200);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(200, 200);
    ctx.lineTo(200, 1400);
    ctx.moveTo(400, 200);
    ctx.lineTo(400, 1400);
    ctx.moveTo(600, 200);
    ctx.lineTo(600, 1400);
    ctx.moveTo(800, 200);
    ctx.lineTo(800, 1400);
    ctx.moveTo(1000, 200);
    ctx.lineTo(1000, 1400);

    ctx.stroke();

    ctx.restore();
}, [0], 0, 0, 10, 10);

export let SMALL_PLANT = new TextureData(2, 17, 0.2, "prop", {
    width: 250,
    height: 780
}, [
    [0, 300, 250, 400],
    [0, -80, 250, 380, 0]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 300, 250, 400);
    ctx.fillStyle = "#EBEBEB";
    ctx.fillRect(0, 480, 250, 210);
    ctx.strokeRect(0, 300, 250, 400);
    ctx.lineWidth = 10;
    ctx.fillStyle = "#A3A3A3";
    ctx.fillRect(40, 340, 170, 110);
    ctx.strokeRect(40, 340, 170, 110);

    ctx.fillStyle = "white";
    ctx.fillRect(60, 0, 40, 360);
    ctx.strokeRect(60, 0, 40, 360);
    ctx.strokeRect(60, 0, 40, 80);
    ctx.strokeRect(60, 0, 40, 160);
    ctx.strokeRect(60, 0, 40, 200);

    ctx.fillRect(100, 110, 40, 310);
    ctx.strokeRect(100, 110, 40, 310);
    ctx.strokeRect(100, 110, 40, 230);
    ctx.strokeRect(100, 110, 40, 180);

    ctx.fillRect(140, -80, 40, 450);
    ctx.strokeRect(140, -80, 40, 300);
    ctx.strokeRect(140, -80, 40, 230);
    ctx.strokeRect(140, -80, 40, 450);
    // ctx.strokeRect(0,-80,250,380);

    ctx.restore();
});

export let TILE = new TextureData(10, 10, 0.2, "prop", {
    width: 420,
    height: 420
}, [
    [0, 0, 420, 420]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 360, 400, 40);
    ctx.strokeRect(0, 0, 400, 400);

    ctx.restore();
});

export let WOOD_FLOOR_TILE = new TextureData(0, 0, 0.2, "prop", {
    width: 639,
    height: 639
}, [
    [0, 0, 639, 639]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#545454";
    ctx.fillStyle = "#878787";

    ctx.translate(-10,0);
 
    ctx.fillRect(0, 0, 800, 750);
    ctx.fillStyle = "#737373";

    ctx.fillRect(0, 280, 800, 50);
    ctx.fillRect(0, 690, 800, 50);
    ctx.strokeRect(0, 0, 800, 640);
    ctx.strokeRect(0, 0, 800, 340);

    ctx.restore();
});

export let CROSS_TILE = new TextureData(0, 0, 0.2, "prop", {
    width: 639,
    height: 639
}, [
    [0, 0, 639, 639]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 15;

    ctx.strokeStyle = "black";
    function part1(y = 0) {
    ctx.translate(0,y);
    ctx.beginPath();
    ctx.moveTo(0,160);
    ctx.lineTo(0,80); 
    ctx.lineTo(80,0); 
    ctx.lineTo(240,0); 
    ctx.lineTo(320,80); 
    ctx.lineTo(400,0); 
    ctx.lineTo(560,0); 
    ctx.lineTo(640,80); 
    ctx.lineTo(640,160);
    ctx.lineTo(560,160); 
    ctx.lineTo(480,80); 
    ctx.lineTo(400,160); 
    ctx.lineTo(240,160); 
    ctx.lineTo(160,80); 
    ctx.lineTo(80,160); 
    ctx.lineTo(0,160);
    ctx.fillStyle = "#959595";
    ctx.fill(); 

    ctx.beginPath();
    ctx.moveTo(0,130);
    ctx.lineTo(0,80); 
    ctx.lineTo(80,0); 
    ctx.lineTo(240,0); 
    ctx.lineTo(320,80); 
    ctx.lineTo(400,0); 
    ctx.lineTo(560,0); 
    ctx.lineTo(640,80); 
    ctx.lineTo(640,130);
    ctx.lineTo(560,130); 
    ctx.lineTo(480,50); 
    ctx.lineTo(400,130); 
    ctx.lineTo(240,130); 
    ctx.lineTo(160,50); 
    ctx.lineTo(80,130); 
    ctx.lineTo(0,130);
    ctx.fillStyle = "#B3B3B3";
    ctx.fill(); 

    ctx.beginPath();
    ctx.moveTo(0,160);
    ctx.lineTo(0,80); 
    ctx.lineTo(80,0); 
    ctx.lineTo(240,0); 
    ctx.lineTo(320,80); 
    ctx.lineTo(400,0); 
    ctx.lineTo(560,0); 
    ctx.lineTo(640,80); 
    ctx.lineTo(640,160);
    ctx.lineTo(560,160); 
    ctx.lineTo(480,80); 
    ctx.lineTo(400,160); 
    ctx.lineTo(240,160); 
    ctx.lineTo(160,80); 
    ctx.lineTo(80,160); 
    ctx.lineTo(0,160);
    ctx.stroke();
    ctx.translate(0,-y);
    }
    
    function part2(y = 0) {
    ctx.translate(0,y);
    ctx.beginPath();
    ctx.moveTo(0,240);
    ctx.lineTo(0,160);
    ctx.lineTo(80,160);
    ctx.lineTo(160,240);
    ctx.lineTo(240,160);
    ctx.lineTo(400,160);
    ctx.lineTo(480,240);
    ctx.lineTo(560,160);
    ctx.lineTo(640,160);
    ctx.lineTo(640,240);
    ctx.lineTo(560,320);
    ctx.lineTo(400,320);
    ctx.lineTo(320,240);
    ctx.lineTo(240,320);
    ctx.lineTo(80,320);
    ctx.lineTo(0,240);
    ctx.fillStyle = "#959595";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0,240);
    ctx.lineTo(0,160);
    ctx.lineTo(80,160);
    ctx.lineTo(160,240);
    ctx.lineTo(240,160);
    ctx.lineTo(400,160);
    ctx.lineTo(480,240);
    ctx.lineTo(560,160);
    ctx.lineTo(640,160);
    ctx.lineTo(640,210);
    ctx.lineTo(560,290);
    ctx.lineTo(400,290);
    ctx.lineTo(320,210);
    ctx.lineTo(240,290);
    ctx.lineTo(80,290);
    ctx.lineTo(0,210);
    ctx.fillStyle = "#B3B3B3";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0,240);
    ctx.lineTo(0,160);
    ctx.lineTo(80,160);
    ctx.lineTo(160,240);
    ctx.lineTo(240,160);
    ctx.lineTo(400,160);
    ctx.lineTo(480,240);
    ctx.lineTo(560,160);
    ctx.lineTo(640,160);
    ctx.lineTo(640,240);
    ctx.lineTo(560,320);
    ctx.lineTo(400,320);
    ctx.lineTo(320,240);
    ctx.lineTo(240,320);
    ctx.lineTo(80,320);
    ctx.lineTo(0,240);
    ctx.stroke();
    ctx.translate(0,-y);
    }
 
    part1();
    part2();
    part1(320);
    part2(320);

    ctx.restore();
});

export let GRASS_TILE = new TextureData(0, 0, 0.5, "prop", {
    width: 256,
    height: 256
}, [
    [0, 0, 256, 256]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    function grass1(x,y) {
     ctx.translate(x,y);
     GRASS_1.render(ctx);
     ctx.translate(-x,-y);
    }

    function grass2(x,y) {
     ctx.translate(x,y);
     GRASS_2.render(ctx);
     ctx.translate(-x,-y);
    }

    grass1(20,20);
    grass2(30,150);
    grass1(210,170);
    grass1(350,40);
    grass1(330,380);
    grass2(390,420);
    grass2(450,260);
    grass1(170,430);
   // grass2(170,80);
   // grass2(190,50);
    grass1(100,220);
 
    ctx.restore();
});

export let FLOOR_TILE = new TextureData(0, 0, 0.2, "prop", {
    width: 639,
    height: 639
}, [
    [0, 0, 639, 639]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#737373";

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 320, 320);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 280, 320, 40);
    ctx.strokeRect(0, 0, 320, 320);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 320, 320, 320);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 600, 320, 40);
    ctx.strokeRect(0, 320, 320, 320);

    ctx.fillStyle = "white";
    ctx.fillRect(320, 0, 320, 320);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(320, 280, 320, 40);
    ctx.strokeRect(320, 0, 320, 320);

    ctx.fillStyle = "white";
    ctx.fillRect(320, 320, 320, 320);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(320, 600, 320, 40);
    ctx.strokeRect(320, 320, 320, 320);

    ctx.restore();
});

export let LIGHT_SWITCH = new TextureData(2, 2, 0.2, "prop", {
    width: 160,
    height: 240
}, [
    [0, 0, 160, 240]
], 0, undefined, function(ctx) {
    // 2,2
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 0, 140, 220);
    ctx.fillStyle = "#CCCCCC"
    ctx.fillRect(0, 0, 140, 30);
    ctx.strokeRect(0, 0, 140, 220);

    ctx.lineWidth = 15;
    ctx.strokeRect(40, 65, 60, 110);
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 65, 60, 55);


    ctx.restore();
});

export let STREET_LIGHT = new TextureData(730, -190, 0.2, "prop", {
    width: 1580,
    height: 2450
}, [
   //  [0, 0, 1580, 2450],
     [30, 2570, 60, 60]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "#A3A3A3";

    ctx.beginPath();
    ctx.moveTo(90, 230);
    ctx.lineTo(550, 230);
    ctx.lineTo(550, 220);
    ctx.lineTo(840, 220); //840
    ctx.lineTo(840, 240);
    ctx.lineTo(840, 310);
    ctx.lineTo(550, 310);
    ctx.lineTo(550, 270);
    ctx.lineTo(90, 270);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(30, 230);
    ctx.lineTo(-430, 230);
    ctx.lineTo(-430, 220);
    ctx.lineTo(-720, 220);
    ctx.lineTo(-720, 240);
    ctx.lineTo(-720, 310);
    ctx.lineTo(-430, 310);
    ctx.lineTo(-430, 270);
    ctx.lineTo(30, 270);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#A3A3A3";

    ctx.fillRect(30, 200, 60, 2430);
    ctx.strokeRect(30, 200, 60, 2430);

    ctx.lineWidth = 10;
    ctx.moveTo(20, 260);
    ctx.lineTo(80, 260);
    ctx.stroke();

    ctx.restore();
},[], 0, 0, 730, -190);

export let GRASS_1 = new TextureData(0, 0, 0.2, "prop", {
    width: 150,
    height: 150
}, [
    [0, 0, 150, 150]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 13;

    ctx.strokeStyle = "#666666";
    ctx.fillStyle = "white";

    ctx.moveTo(15, 80);
    ctx.lineTo(10, 50);
    ctx.lineTo(40, 80);
    ctx.lineTo(60, 0);
    ctx.lineTo(70, 80);
    ctx.stroke();

    ctx.restore();
});

export let GRASS_2 = new TextureData(0, 0, 0.2, "prop", {
    width: 150,
    height: 150
}, [
    [0, 0, 150, 150]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 13;

    ctx.strokeStyle = "#666666";
    ctx.fillStyle = "white";

    ctx.moveTo(15, 80);
    ctx.lineTo(25, 40);
    ctx.lineTo(40, 80);
    ctx.stroke();

    ctx.restore();
});

export let ROCKS_1 = new TextureData(0, 0, 0.2, "prop", {
    width: 150,
    height: 150
}, [
    [0, 0, 150, 150]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 13;

    ctx.strokeStyle = "#3C3C3C";
    ctx.fillStyle = "#F3F3F3";

    ctx.translate(8, 8);
    ctx.moveTo(15, 80);
    ctx.lineTo(30, 70);
    ctx.lineTo(35, 65);
    ctx.lineTo(20, 40);
    ctx.lineTo(10, 40);
    ctx.lineTo(0, 60);
    ctx.lineTo(15, 80);

    ctx.moveTo(50, 60);
    ctx.lineTo(70, 60);
    ctx.lineTo(100, 50);
    ctx.lineTo(110, 30);
    ctx.lineTo(80, 20);
    ctx.lineTo(50, 30);
    ctx.lineTo(40, 45);
    ctx.lineTo(50, 60);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.translate(40, 50);
    ctx.moveTo(15, 80);
    ctx.lineTo(30, 70);
    ctx.lineTo(35, 65);
    ctx.lineTo(20, 40);
    ctx.lineTo(10, 40);
    ctx.lineTo(0, 60);
    ctx.lineTo(15, 80);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
});

export let ROCKS_2 = new TextureData(0, 0, 0.2, "prop", {
    width: 150,
    height: 150
}, [
    [0, 0, 150, 150]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 13;

    ctx.strokeStyle = "#3C3C3C";
    ctx.fillStyle = "#F3F3F3";

    ctx.translate(8, 8);
    ctx.moveTo(15, 80);
    ctx.lineTo(30, 70);
    ctx.lineTo(35, 65);
    ctx.lineTo(20, 40);
    ctx.lineTo(10, 40);
    ctx.lineTo(0, 60);
    ctx.lineTo(15, 80);

    ctx.moveTo(50, 60);
    ctx.lineTo(70, 60);
    ctx.lineTo(100, 50);
    ctx.lineTo(110, 30);
    ctx.lineTo(80, 20);
    ctx.lineTo(50, 30);
    ctx.lineTo(40, 45);
    ctx.lineTo(50, 60);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
});

export let CHAIR = new TextureData(10, -50, 0.2, "prop", {
    width: 520,
    height: 750
}, [
    [0, 60, 500, 650]
], 0, undefined, function(ctx) {
    // 2, -10
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(0, 50, 500, 300);
    ctx.fillStyle = "#E3E3E3";
    ctx.fillRect(0, 60, 500, 50);
    ctx.strokeRect(0, 60, 500, 300);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 360, 500, 350);
    ctx.fillStyle = "#E3E3E3";
    ctx.fillRect(0, 360, 500, 300);
    ctx.strokeRect(0, 360, 500, 350);

    ctx.fillStyle = "#696969";
    ctx.fillRect(20, 710, 60, 80);
    ctx.strokeRect(20, 710, 60, 80);
    ctx.fillRect(420, 710, 60, 80);
    ctx.strokeRect(420, 710, 60, 80);

    ctx.stroke();

    ctx.restore();
});

export let BENCH = new TextureData(10, -110, 0.2, "prop", {
    width: 1540,
    height: 1020
}, [
    [-10, 110, 1540, 1020, 0],[0,176,1520,736]
], 0, undefined, function(ctx) {
    // 2, -10
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.scale(0.8, 0.8);
    ctx.beginPath();
    ctx.lineWidth = 18;

    ctx.strokeStyle = "black";
    ctx.fillStyle = "#F1F1F1";

    ctx.fillRect(0, 650, 1900, 500);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 1080, 1900, 60);
    ctx.strokeRect(0, 650, 1900, 500);

    ctx.fillStyle = "#E5E5E5";
    ctx.fillRect(100, 560, 1700, 100);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(100, 560, 1700, 40);
    ctx.strokeRect(100, 560, 1700, 100);

    ctx.fillStyle = "#E5E5E5";
    ctx.fillRect(100, 390, 1700, 100);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(100, 390, 1700, 40);
    ctx.strokeRect(100, 390, 1700, 100);

    ctx.fillStyle = "#E5E5E5";
    ctx.fillRect(100, 220, 1700, 100);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(100, 220, 1700, 40);
    ctx.strokeRect(100, 220, 1700, 100);
/*
    ctx.fillStyle = "#E5E5E5";
    ctx.moveTo(100,280);
    ctx.lineTo(200,280);
    ctx.lineTo(280,200);
    ctx.lineTo(1620,200);
    ctx.lineTo(1700,280);
    ctx.lineTo(1800,280);
    ctx.lineTo(1800,450);
    ctx.lineTo(100,450);
    ctx.lineTo(100,200);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#A2A2A2";
    ctx.moveTo(100,280);
    ctx.lineTo(200,280);
    ctx.lineTo(280,200);
    ctx.lineTo(1620,200);
    ctx.lineTo(1700,280);
    ctx.lineTo(1800,280);
    ctx.lineTo(1800,320);
    ctx.lineTo(1700,320);
    ctx.lineTo(1620,240);
    ctx.lineTo(280,240);
    ctx.lineTo(200,320);
    ctx.lineTo(100,320);
    ctx.lineTo(100,280);
    ctx.fill();

    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(280, 200, 1340, 40);
    ctx.fillRect(100, 280, 100, 40);
    ctx.fillRect(1700, 280, 100, 40);

    ctx.beginPath();
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 10;
    ctx.moveTo(100,360);
    ctx.lineTo(1800,360);
    ctx.moveTo(100,860);
    ctx.lineTo(1800,860);
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 15; 

    ctx.beginPath();
    ctx.moveTo(100,280);
    ctx.lineTo(200,280);
    ctx.lineTo(280,200);
    ctx.lineTo(1620,200);
    ctx.lineTo(1700,280);
    ctx.lineTo(1800,280);
    ctx.lineTo(1800,450);
    ctx.lineTo(100,450);
    ctx.lineTo(100,200);
    ctx.stroke();
*/

    ctx.fillStyle = "#E5E5E5";
    ctx.fillRect(1800, 150, 100, 600);
    ctx.fillRect(0, 150, 100, 600);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(1800, 150, 100, 70);
    ctx.fillRect(0, 150, 100, 70);

    ctx.strokeRect(1800, 150, 100, 600);
    ctx.strokeRect(0, 150, 100, 600);

    ctx.fillStyle = "#F1F1F1";
    ctx.fillRect(0, 550, 100, 400);
    ctx.fillRect(1800, 550, 100, 400);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(0, 800, 100, 140);
    ctx.fillRect(1800, 800, 100, 140);
    ctx.strokeRect(0, 550, 100, 400);
    ctx.strokeRect(1800, 550, 100, 400);

    ctx.fillRect(0, 1150, 100, 250);
    ctx.fillRect(1800, 1150, 100, 250);
    ctx.strokeRect(0, 1150, 100, 250);
    ctx.strokeRect(1800, 1150, 100, 250);

    ctx.strokeStyle = "red";
    ctx.strokeRect(0,220,1900,920);

    ctx.restore();
},[],0,0,0,0);
// 1300, 550

export let ROAD_RAIL = new TextureData(-290, -90, 0.2, "prop", {
    width: 1320,
    height: 570
}, [
    [300, 100, 150, 550],
    [1450, 100, 150, 550],
    [450, 150, 1000, 410]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(300, 100, 150, 550);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(300, 100, 150, 100);
    ctx.strokeRect(300, 100, 150, 550);

    ctx.fillStyle = "white";
    ctx.fillRect(1450, 100, 150, 550);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(1450, 100, 150, 100);
    ctx.strokeRect(1450, 100, 150, 550);

    ctx.fillStyle = "white";
    ctx.fillRect(450, 150, 1000, 160);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(450, 150, 1000, 40);
    ctx.strokeRect(450, 150, 1000, 160);

    ctx.fillStyle = "white";
    ctx.fillRect(450, 400, 1000, 160);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(450, 400, 1000, 40);
    ctx.strokeRect(450, 400, 1000, 160);

    ctx.restore();
    // -58 , -18
});

export let ROAD_RAIL_VERTICAL = new TextureData(-58, -18, 0.2, "prop", {
    width: 150,
    height: 1250
}, [
    [300, 100, 150, 1250]
], 20, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.x, this.offset.y);
    ctx.scale(this.size, this.size);
    ctx.beginPath();
    ctx.lineWidth = 20;

    ctx.strokeStyle = "#1A1A1A";
    ctx.fillStyle = "white";

    ctx.fillRect(300, 100, 150, 550);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(300, 100, 150, 100);
    ctx.strokeRect(300, 100, 150, 550);

    ctx.fillRect(350, 250, 50, 700);
    ctx.strokeRect(350, 250, 50, 700);

    ctx.fillStyle = "white";
    ctx.fillRect(300, 800, 150, 550);
    ctx.fillStyle = "#CCCCCC";
    ctx.fillRect(300, 800, 150, 100);
    ctx.strokeRect(300, 800, 150, 550);

    ctx.restore();
});

export let PLUS_100 = new TextureData(0, 0, 0.2, "prop", {
    width: 415,
    height: 110
}, [
    [0, 0, 415, 110]
], 0, undefined, function(ctx) {
    ctx.save();
    ctx.translate(this.offset.vx, this.offset.vy);
    ctx.scale(this.size, this.size);

    ctx.strokeStyle = "#2cd158";
    ctx.fillStyle = "#2cd158";
    ctx.lineWidth = 40;
    ctx.strokeRect(595, 20, 50, 70);
    ctx.strokeRect(490, 20, 50, 70);

    ctx.fillRect(405, 0, 40, 110);
    ctx.fillRect(365, 0, 40, 40);
    ctx.fillRect(285, 0, 40, 110);
    ctx.fillRect(250, 35, 110, 40);

    ctx.restore();
}, [], 0, 0, -250, 0);
