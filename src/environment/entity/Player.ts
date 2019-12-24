import { Entity } from "./Entity";
import { World } from "../world/World";
import * as THREE from "three";

/**
 * Conversion rate of speed units to in-game units
 */
const veloPerUnit = 0.82268/10;

/**
 * The player is a controllable entitity
 */
export class Player extends Entity{
	light:THREE.PointLight;
	lightInner:THREE.PointLight;
	lightRadius:number=10;
	flickerRadius:number=1;
	speed: number = 15;
	camera: THREE.Camera;
	constructor( world:World ){
		super( world );
		this.camera = world.ff.camera;
		this.light = new THREE.PointLight(0xdf8f5f, 3, this.lightRadius, 0.1);
		//this.light = new THREE.SpotLight(0xdf8f5f, 1, 10, 10, 1, 0);
		this.lightInner = new THREE.PointLight(0x2070a0, 2, this.lightRadius-2, 0.1);
		//this.lightInner = new THREE.SpotLight(0x2070a0, 2, 10, 10, 1, 0);
		this.light.position.set(0,2,0);
		this.lightInner.position.set(0,2,0);
		//this.light.lookAt(0,-10, 0);
		//this.meshGroup.add( this.light );
		//this.meshGroup.add( this.lightInner );
	}

	update(){
		//this.light.distance = (Math.sin(this.world.tickCount)+1)/2*this.flickerRadius + this.lightRadius;
		//this.light.intensity = Math.random()*0.5 + 1.5;
	}

	render(){

	}
}