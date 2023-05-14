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

export function draw(a, w, h, iw, ih, s, lw, attribs = [], canvas) {
    // boxes, width, height, texture width, texture height, size, line width, box type, canvas

    // draw texture...

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
            y = h - y;
            let xp = aisofb(x, w),
                hp = 100 - aisofb(y, h);

            outCoords[i] = [(x / s) + offset[0],
                (y / s) + offset[1],
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

export function genObjectId(length = 10) {
    let cy = "abcdefghijklmnopqqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let res = [];

    for (let i = 0; i < length; i++) {
        res.push(cy.at(Math.floor(Math.random() * (62 - 0)) + 0));
    }
    return res.join("");
}

export function random(max) {
    return Math.floor(Math.random() * (max - 0)) + 0;
}

// Animation creation objects

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

        this.lapsedTime = (Date.now() - this.lastFrameDraw) / 1000;
        if (this.lapsedTime >= this.timingConfig[this.nextFrame] * this.animationMultFactor) {
            this.frames[this.nextFrame]();
            this.lastFrameDraw = Date.now();
            this.nextFrame++;
        }
        if (this.nextFrame === this.frames.length) this.nextFrame = 0;
    }

    end() {
        this.endFunc();
        this.running = false;
    }
}

export class MultiFrameLinearAnimation {
    constructor(frames, object, timingConfig, endFunc, animationMultFactor) {
        this.frames = frames;
        this.object = object;
        this.nextFrame = 0;
        this.running = false;
        this.reset = true;
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
        if (this.reset) {
            if (!this.running) {
                this.running = true;
                this.lastFrameDraw = Date.now();
            }

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
        this.endFunc();
        this.nextFrame = 0;
        this.reset = false;
        this.running = false;
    }
}

// Inventory object (for storing object data)

export class Inventory {

    constructor(defaultItems) {
        this.items = defaultItems;
        this.slots = defaultItems?.length || 0;
    }

    addItem(item) {
        this.items.push(item);
        this.slots++;
    }

    swapItems(a, b) {
        let c = this.items[a];
        this.items[a] = this.items[b];
        this.items[b] = c;
    }

    ejectItem(slot) {
        let object = this.items[slot];
        this.items[slot] = undefined;
        this.slots--;

        return object;
    }
}

function assessObstacles(x, y, dimensions, obstacles) {
    let move = {
        x: x,
        y: y
    };
    let {
        x: ax,
        y: ay,
        width: aw,
        height: ah
    } = dimensions;

    for (let i in this.obstacles) {
        for (let segment of this.obstacles[i].segments) {

            let [ox,
                oy,
                ow,
                oh
            ] = segment;

            ox = (0 + ox) + this.obstacles[i].trans.offsetX;
            ox += ow / 2;
            oy = (0 - oy) + this.obstacles[i].trans.offsetY;
            oy += oh / 2;
            //oy -= Math.abs(oh);

            if ((Math.round(Math.abs($AVATAR.trans.offsetY - (oy))) < Math.round(($AVATAR.bounds.height / 2) + (oh / 2))) && (Math.abs($AVATAR.trans.offsetX - (ox - x)) < ($AVATAR.bounds.width / 2) + (ow / 2))) {
                move.x = 0;
            }

            if ((Math.round(Math.abs($AVATAR.trans.offsetX - (ox))) < Math.round(($AVATAR.bounds.width / 2) + (ow / 2))) && (Math.abs($AVATAR.trans.offsetY - (oy - y)) < ($AVATAR.bounds.height / 2) + (oh / 2))) {
                move.y = 0;
            }
        }
    }
}