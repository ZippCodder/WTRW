// A graph representation of the map with a built in pathfinder based on A*

import {
    random
} from "./lib.js";

export default class Graph {
    constructor(width, height, diagonal = false) {

        this.width = width;
        this.height = height;
        this.nodeCount = width * height;
        this.diagonal = diagonal;
        this.grid = new Map();
        this.find = (function(col, row) {
            return this.grid.get(`${col},${row}`);
        }).bind(this);

        class Node {
            constructor(x, y, edges = [], blocked = false) {
                this.position = {
                    x: x,
                    y: y
                };
                this.f = 0;
                this.g = 0;
                this.h = 0;
                this.edges = edges;
                this.parent = undefined;
                this.fresh = true;
                this.blocked = blocked;
            }
        }

        this.nodes = {};

        let col = 0,
            row = 0,
            node;
        for (let i = 1; i <= this.nodeCount; i++) {
            node = new Node((col - (width / 2)) * 10, -((row - (height / 2)) * 10));
            node.id = i;
            this.nodes[i] = node;
            this.grid.set(`${(col-(width/2))*10},${-((row-(height/2))*10)}`, node);

            if (col > 0) node.edges.push(node.id - 1);
            if (col < this.width - 1) node.edges.push(node.id + 1);
            if (row > 0) node.edges.push(node.id - width);
            if (row < this.height - 1) node.edges.push(node.id + width);

            if (this.diagonal) {
                if (col > 0 && row > 0) node.edges.push(node.id - width - 1);
                if (col < width - 1 && row > 0) node.edges.push(node.id - width + 1);
                if (row < height - 1 && col < width - 1) node.edges.push(node.id + width + 1);
                if (row < height - 1 && col > 0) node.edges.push(node.id + width - 1);
            }

            if (col === width - 1) {
                col = 0;
                row++;
            } else {
                col++;
            }
        }
    }

    getPath(s, g) {

        function euclideanDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function manhattanDistance(x1, y1, x2, y2) {
            return (Math.abs(x1 - x2) + Math.abs(y1 - y2));
        }

        if (this.nodes[g].blocked === true) return false;

        const start = s,
            goal = g,
            open = [s],
            closed = [];
        let current, result = {
            result: false,
            path: []
        };

        while (open.length > 0) {

            current = open.reduce((a, v) => {
                return ((this.nodes[v].f < a.f || (this.nodes[v].f === a.f && this.nodes[v].h < a.h)) ? this.nodes[v] : a)
            }, {
                f: Infinity,
                h: Infinity
            });
            open.splice(open.indexOf(current.id), 1);
            closed.push(current.id);

            if (current.id === goal) {
                let n = current;

                while (n.id !== start) {
                    n = this.nodes[n.parent];
                    if (n.id === start) break;
                    result.path.unshift(n.position);
                }

                result.path.push(current.position);
                result.result = true;
                break;
            }

            for (let i of current.edges) {
                let edge = this.nodes[i];

                if (edge === undefined) continue;

                let calc = {
                    g: current.g + euclideanDistance(edge.position.x, edge.position.y, current.position.x, current.position.y),
                    h: manhattanDistance(edge.position.x, edge.position.y, this.nodes[goal].position.x, this.nodes[goal].position.y)
                };
                calc.f = calc.g + calc.h;

                if (edge.blocked || closed.includes(edge.id)) continue;
                if (edge.parent === undefined || edge.fresh === true || calc.f < edge.f) {
                    edge.parent = current.id;
                    edge.f = calc.f;
                    edge.g = calc.g;
                    edge.h = calc.h;
                    open.push(edge.id);
                }
            }

            current.f = 0;
            current.h = 0;
            current.g = 0;
            current.fresh = true;
        }

        return result;
    }

    getPoint(x, y) {

        let p = {
                x: (this.width % 2 === 0) ? (Math.floor(x * 0.1) * 10) : (Math.round(x * 0.1) * 10) - 5,
                y: (this.height % 2 === 0) ? (Math.ceil(y * 0.1) * 10) : (y % 5 === 0 && y % 2 !== 0) ? (Math.round(y * 0.1) * 10) - 5 : (Math.round(y * 0.1) * 10) + 5
            },
            unit = this.find(p.x, p.y);

        return (unit) ? {
            x: p.x,
            y: p.y,
            unit: unit.id
        } : false;
    }

    getRandomPoint() {
        let p = this.nodes[random(this.nodeCount)];
        while (p.blocked) {
            p = this.nodes[random(this.nodeCount)];
        }

        return {
            x: p.position.x,
            y: p.position.y,
            unit: p.id
        };
    }

    evalObstacle(x, y, width, height) {

        let xAndWidth = (x + width) - 1,
            yAndHeight = (y - height) + 1;

        const cornerA = this.getPoint(x, y);
        const cornerB = this.getPoint(xAndWidth, y);
        const cornerC = this.getPoint(xAndWidth, yAndHeight);

        if (cornerA && cornerB && cornerC) {
            for (let i = cornerA.x; i <= cornerB.x; i += 10) {
                for (let j = cornerB.y; j >= cornerC.y; j -= 10) {
                    let unit = this.find(i, j);
                    if (unit) unit.blocked = true;
                }
            }
        } else {
            return false;
        }

        return true;
    }
}