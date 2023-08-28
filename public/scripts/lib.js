// misc helper functions and key classes

export function cut(ar, lw = 0, atrbs = [], vertices = false) {
    let res = [];

    for (let i of ar) {

        let [x,
            y,
            w,
            h
        ] = i;
        x -= lw / 2;
        y -= lw / 2;
        w += lw;
        h += lw;

        res.push(...[
            [x, y, ...atrbs],
            [x + w, y, ...atrbs],
            [x, y + h, ...atrbs],

            [x + w, y, ...atrbs],
            [x, y + h, ...atrbs],
            [x + w, y + h, ...atrbs]
        ]); 
    }

    return (vertices) ? res.flat(1) : res;
}

export function draw(a, w, h, iw, ih, s, lw, tx, ty, attribs = [], canvas) {
    // boxes, width, height, texture width, texture height, size, line width, texture offset x, texture offset y, additional attributes, canvas

    // draw texture...

    function mapCoords(a, w, h, s, lw) {

        w += lw;
        h += lw;

        let offset = [-((w / s) / 2),
            -((h / s) / 2)
        ];

        let bounds = [];

        for (let i of a) {
            if (i[4] === 0) continue;

            let [x,
                y,
                tw,
                th
            ] = i;

            x -= (w / 2) + (lw / 2);
            y += th;
            y = ((h / 2) - (lw / 2)) - y;

            tw += lw;
            th += lw;

            bounds.push([x / s, y / s, tw / s, th / s]);
        }

        a = cut(a, lw);

        let outCoords = [];
        let m = Math.max(w, h);

        function aofb(a, b) {
            return a / 100 * b;
        }

        function aisofb(a, b) {
            return a * 100 / b;
        }

        for (let i = 0; i < a.length; i++) {
            let [x,
                y
            ] = a[i];
            y = h - y;
            let xp = aisofb(x, w),
                hp = 100 - aisofb(y, h);

            outCoords[i] = [(x / s) + offset[0],
                (y / s) + offset[1],
                1.0,
                aofb(aisofb(x + tx, iw), 1),
                aofb(aisofb(a[i][1] + ty, ih), 1), ...attribs
            ];
        }

        return {
            vertices: outCoords.flat(1),
            verticeCount: outCoords.length,
            width: w / s,
            height: h / s,
            bounds: bounds
        };
    }

    let texmap = mapCoords(a, w, h, s, lw);

    if (canvas) {
        canvas.toBlob((b) => {
            let src = URL.createObjectURL(b);
            d.href = src;
            console.log(d.href);
        });
    }

    return texmap;
}

export function drawText(a, w, h, iw, ih, s, lw, attribs = [], canvas) {
    // boxes, width, height, texture width, texture height, size, line width, box type, canvas

    // draw texture...

    let letterVertices;

    function cut(ar, lw) {
        let res = [];
        let letterRes = [];
        for (let i = 0; i < ar.length; i++) {

            let [x,
                y,
                w,
                h
            ] = ar[i];

            let [lx, ly, lw, lh] = [i * 40, 0, 40, 85];

            res.push(...[
                [x, y],
                [x + w, y],
                [x, y + h],

                [x + w, y],
                [x, y + h],
                [x + w, y + h]
            ]);

            letterRes.push(...[
                [lx, ly],
                [lx + lw, ly],
                [lx, ly + lh],

                [lx + lw, ly],
                [lx, ly + lh],
                [lx + lw, ly + lh]
            ]);
        }

        letterVertices = letterRes;
        return res;
    }

    function mapCoords(a, w, h, s, lw) {

        w += lw;
        h += lw;

        let offset = [-((w / s) / 2),
            -((h / s) / 2)
        ];

        let bounds = [];

        for (let i of a) {
            let [x,
                y,
                tw,
                th
            ] = i;
            x -= (w / 2) + (lw / 2);
            y -= (h / 2) + (lw / 2);
            tw += lw;
            th += lw;

            if (i[4] === 0) continue;

            bounds.push([x / s, y / s, tw / s, th / s]);
        }

        a = cut(a, lw);

        let outCoords = [];
        let m = Math.max(w, h);

        function aofb(a, b) {
            return a / 100 * b;
        }

        function aisofb(a, b) {
            return a * 100 / b;
        }

        for (let i = 0; i < a.length; i++) {
            let [x,
                y
            ] = a[i];
            let [lx, ly] = letterVertices[i];

            y = h - y;
            ly = h - ly

            let xp = aisofb(x, w),
                hp = 100 - aisofb(y, h);

            outCoords[i] = [(lx / s) + offset[0],
                (ly / s) + offset[1],
                1.0,
                aofb(aisofb(x, iw), 1),
                aofb(aisofb(a[i][1], ih), 1), ...attribs
            ];
        }

        return {
            vertices: outCoords.flat(1),
            verticeCount: outCoords.length,
            width: w / s,
            height: h / s,
            bounds: bounds
        };
    }

    return mapCoords(a, w, h, s, lw);
}

export function createText(text, size) {
    let letterIndex = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890~!@#$%^&*()-_=+{}[]|:;\"',./?<>\\ ".split("");
    let letters = [];
    for (let i of text) {
        if (letterIndex.includes(i)) {
            letters.push([letterIndex.indexOf(i) * 40, 0, 40, 85]);
        }
    }
    return drawText(letters, text.length * 40, 85, 3760, 85, size, 0);
}

export function offsetVertices(vertices, x, y, rotation, stride = 5) {
    rotation = rotation * Math.PI / 180;

    let output = [...vertices];

    for (let i = 0; i < vertices.length; i += stride) {
        if (rotation !== 0) {
            let tx = output[i];

            output[i] = (Math.cos(rotation) * output[i]) + (-Math.sin(rotation) * output[i + 1]);
            output[i + 1] = (Math.sin(rotation) * tx) + (Math.cos(rotation) * output[i + 1]);
        }
        if (x !== undefined && y !== undefined) {
            output[i] += x;
            output[i + 1] += y;
        }
    }
    return output;
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function rotate(x, y, rotation) {
    rotation = rotation * Math.PI / 180;

    let output = [x, y, rotation];

    let tx = output[0];

    output[0] = (Math.cos(rotation) * output[0]) + (-Math.sin(rotation) * output[1]);
    output[1] = (Math.sin(rotation) * tx) + (Math.cos(rotation) * output[1]);

    return output;
}

export function aofb(a, b) {
    return a / 100 * b;
}

export function aisofb(a, b) {
    return a * 100 / b;
}

export function fromRGB(color) {
    if (!color) return;
    return [aofb(aisofb(color[0], 255), 1), aofb(aisofb(color[1], 255), 1), aofb(aisofb(color[2], 255), 1), color[3]];
}

export function toRGB(color) {
    if (!color) return;
    return [aofb(aisofb(color[0], 1), 255), aofb(aisofb(color[1], 1), 255), aofb(aisofb(color[2], 1), 255), color[3]];
}

export function normalizeRotation(rotation) {
  if (rotation < 0) {
    rotation = 360 + rotation;
  } else if (rotation > 360) {
    rotation = rotation - 360;
  }

  return rotation;
}

export function genObjectId(length = 10) {
    let cy = "abcdefghijklmnopqqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let res = [];

    for (let i = 0; i < length; i++) {
        res.push(cy.at(Math.floor(Math.random() * (62 - 0)) + 0));
    }
    return res.join("");
}

export function random(max, mirror) {
    let n = Math.floor(Math.random() * (max - 0)) + 0;

    return (!mirror) ? n : (Math.random() < 0.5) ? n : -n;
}

export function isIntersecting(a1, b1, a2, b2) {
    function getOrientation(p, q, r) {
        let o = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        return o === 0 ? 0 : o < 1 ? -1 : 1;
    }

    let o1 = getOrientation(a1, b1, a2);
    let o2 = getOrientation(a1, b1, b2);
    let o3 = getOrientation(a2, b2, a1);
    let o4 = getOrientation(a2, b2, b1);

    return o1 !== o2 && o3 !== o4;
}

export function lineIntersectsBox(p1, p2, p3, p4, bx, by, bw, bh) {
    return isIntersecting({
        x: p1,
        y: p2
    }, {
        x: p3,
        y: p4
    }, {
        x: bx,
        y: by
    }, {
        x: bx + bw,
        y: by
    }) || isIntersecting({
        x: p1,
        y: p2
    }, {
        x: p3,
        y: p4
    }, {
        x: bx,
        y: by
    }, {
        x: bx,
        y: by + bh
    }) || isIntersecting({
        x: p1,
        y: p2
    }, {
        x: p3,
        y: p4
    }, {
        x: bx + bw,
        y: by + bh
    }, {
        x: bx,
        y: by + bh
    }) || isIntersecting({
        x: p1,
        y: p2
    }, {
        x: p3,
        y: p4
    }, {
        x: bx + bw,
        y: by + bh
    }, {
        x: bx + bw,
        y: by
    });
}

// Animation creation objects

export class Transition {
 constructor(value, points, speed = 1, callback, reference, property, executionPoint = 1) {
  this.value = value;
  this.points = points;
  this.speed = speed;
  this.callback = callback?.bind(reference);
  this.reference = reference;
  this.executionPoint = executionPoint;
  this.property = property;
  this.transitioning = false;
  this.phase = 0;
  this.animation = new LoopAnimation(function() {
    let difference = Math.abs(this.points[this.phase] - this.value);   
 
    this.value += (this.points[this.phase] > this.value) ? (difference/2)*this.speed:-(difference/2)*this.speed;
    
    if (this.property) this.reference[property] = value;

    if (difference < 1) this.value = this.points[this.phase]; 

    if (this.value === this.points[this.phase]) {
      this.phase++;
      if (this.phase === this.executionPoint) this.callback();
      if (this.phase === this.points.length) {
        this.transitioning = false;
        this.phase = 0;
      }
    }
  }, this, 0.005);
 }

 run() {
  if (this.transitioning) this.animation.run();
  return this.value;
 }

 requestTransition(value, callback, reference, points, speed, property) {
   this.value = value ?? this.value;
   this.points = points ?? this.points;
   this.speed = speed ?? this.speed;
   this.callback = callback?.bind(reference) ?? this.callback;
   this.reference = reference ?? this.reference;
   this.property = property ?? this.property;
   this.transitioning = true;
   this.phase = 0;
 }
}

export class LoopAnimation {
    constructor(frame, object, rate, animationMultFactor) {
        this.frame = frame.bind(object, this);
        this.object = object;
        this.running = false;
        this.lastFrameDraw = undefined;
        this.animationMultFactor = animationMultFactor || 1;
        this.rate = rate;
    }
    lapsedTime;

    run() {
        if (!this.running) {
            this.lastFrameDraw = Date.now();
            this.running = true;
            this.frame();
        }

        this.lapsedTime = (Date.now() - this.lastFrameDraw) / 1000;
        if (this.lapsedTime >= this.rate * this.animationMultFactor) {
            this.frame();
            this.lastFrameDraw = Date.now();
        }
    }
}

export class MultiFrameLoopAnimation {
    constructor(frames, object, timingConfig, endFunc, animationMultFactor) {
        this.frames = frames;
        this.object = object;
        this.nextFrame = 0;
        this.running = false;
        this.active = false;
        this.animationMultFactor = animationMultFactor || 1;
        this.timingConfig = timingConfig;
        this.duration = timingConfig.reduce((p, c) => p + c, 0);
        this.lastFrameDraw = undefined;
        if (endFunc) this.endFunc = endFunc.bind(object, this);

        for (let i = 0; i < frames.length; i++) {
            this.frames[i] = frames[i].bind(object, this);
        }
    }
    lapsedTime;

    run() {
        if (!this.running) {
            this.running = true;
            this.lastFrameDraw = Date.now();
        }
 
        this.active = true;

        this.lapsedTime = (Date.now() - this.lastFrameDraw) / 1000;
        if (this.lapsedTime >= this.timingConfig[this.nextFrame] * this.animationMultFactor) {
            this.frames[this.nextFrame]();
            this.lastFrameDraw = Date.now();
            this.nextFrame++;
        }
        if (this.nextFrame === this.frames.length) {
          this.nextFrame = 0;
          this.active = false;
        }
    }

    end() {
        this.endFunc();
        this.running = false;
    }
}

export class MultiFrameLinearAnimation {
    constructor(frames, object, timingConfig, endFunc, animationMultFactor = 1, fill = false) {
        this.frames = frames;
        this.object = object;
        this.nextFrame = 0;
        this.running = false;
        this.reset = false;
        this.animationMultFactor = animationMultFactor;
        this.fill = fill;
        this.timingConfig = timingConfig;
        this.duration = timingConfig.reduce((p, c) => p + c, 0);
        this.lastFrameDraw = undefined;
        if (endFunc) this.endFunc = endFunc.bind(object, this);

        for (let i = 0; i < frames.length; i++) {
            this.frames[i] = frames[i].bind(object, this);
        }
    }
    lapsedTime;

    run() {
        if (this.reset) {
            if (!this.running) {
                this.running = true;
                this.lastFrameDraw = Date.now();
            }

            if (this.fill) this.frames[this.nextFrame]();

            this.lapsedTime = (Date.now() - this.lastFrameDraw) / 1000;
            if (this.lapsedTime >= this.timingConfig[this.nextFrame] * this.animationMultFactor) {
                this.frames[this.nextFrame]();
                this.lastFrameDraw = Date.now();
                this.nextFrame++;
            }
            if (this.nextFrame === this.frames.length) {
                this.end();
            }
        }
    }

    start() {
        if (!this.running) {
            this.reset = true;
        }
    }

    end() {
        if (this.endFunc) this.endFunc();
        this.nextFrame = 0;
        this.reset = false;
        this.running = false;
    }
}

// Inventory object (for storing object data)

export class Inventory {

    constructor(defaultItems = [], slots) {
        this.items = defaultItems;
        this.weapons = {};
        this.slots = slots || defaultItems.length || 15;
        this.count = defaultItems.length;
        this.activeSlot = 0;
    }

    addItem(item, slot) {

        if (!item || !item.pickup || this.count === this.slots) return false;

        if (slot && !this.items[slot] && slot < this.slots-1) {
           item.slot = slot;
           this.items[slot] = item;
        } else if (this.count < this.slots) {
            for (let i = 0; i < this.slots; i++) {
              if (this.items[i] === undefined) {
                item.slot = i;
                this.items[i] = item;
                break;
              }
            }
        }
        
        if (item.slot === undefined) return false; 

        if (item.map) item.map.unlink(item.id);
        this.count++;

        switch (item.type) {
            case "gun": {
               if (!this.weapons[item.name]) this.weapons[item.name] = {
                  ammo: 0,
                  count: 0
               };
               this.weapons[item.name].ammo += item.bullets;
               this.weapons[item.name].count++;
            };
            break;
        }

        return true;
    }

    swapItems(a, b) {
        let c = this.items[a];
        this.items[a] = this.items[b];
        this.items[b] = c;

        if (this.items[a]) this.items[a].slot = a;
        if (this.items[b]) this.items[b].slot = b;
    }

    ejectItem(slot, newItem) {
        let item = this.items[slot];

        switch (item.type) {
            case "gun": {
                if (--this.weapons[this.items[slot].name].count === 0) {
                    item.bullets = Math.min(item.constructor._properties.capacity, this.weapons[item.name].ammo);
                    this.weapons[item.name].ammo = 0;
                } else {
                    item.bullets = 0;
                }

                item.ring.trans.offsetX = 0;
                item.ring.trans.offsetY = 0;
            };
            break;
        }

        item.slot = undefined;
        item.trans.offsetX = 0;
        item.trans.offsetY = 0;

        let object = item;
        this.items[slot] = undefined;
        this.count--;

        if (newItem) this.addItem(newItem, slot);

        return object;
    }
}
