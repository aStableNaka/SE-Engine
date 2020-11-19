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
export class CameraAnchor extends Entity{
	speed: number = 1000; //15;
	camera: THREE.Camera;
	constructor( world:World ){
		super( world );
		this.camera = world.ff.camera;
	}
	
	distanceToCamera( camera: THREE.Camera ){
		return Math.pow( this.meshGroup.position.distanceTo( camera.position ), 2 ) / 2;
	}

	distanceToOwnCamera( ) {
		return this.distanceToCamera( this.camera );
	}

	addToWorld(){
		this.world.ff.add( this.meshGroup );
	}

	update(){

	}

	render(){

	}
}