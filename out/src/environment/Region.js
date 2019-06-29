"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegionMesh_1 = require("../rendering/RegionMesh");
class Block {
    constructor(x, y, ref, meta) {
        this.x = x;
        this.y = y;
        this.ref = ref;
        this.meta = meta;
    }
}
function CreateTable(size, callback) {
    return new Array(size).fill(null).map((a, y) => { return new Array(size).fill(null).map((b, x) => { return callback(x, y); }); });
}
exports.CreateTable = CreateTable;
class Region {
    constructor(size) {
        this.mesh = new RegionMesh_1.RegionMesh();
        this.contents = CreateTable(size, (x, y) => { return new Block(x, y, {}); });
    }
}
exports.Region = Region;
