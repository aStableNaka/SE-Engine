"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
/**
 * Basic boilerplate for a simple
 * threejs scene setup
 */
class FrostedFlakes extends THREE.Scene {
    constructor(container) {
        super();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.viewAngle = 45;
        this.near = 0.1;
        this.far = 10000;
        this.aspect = this.width / this.height;
        this.container = null;
        this.renderer = new THREE.WebGLRenderer();
        this.camera = null;
        const camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
        this.add(camera);
        this.renderer.setSize(this.width, this.height);
        if (!container) {
            container = document.body;
        }
        this.container = container;
        container.appendChild(this.renderer.domElement);
    }
}
exports.FrostedFlakes = FrostedFlakes;
