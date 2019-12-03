import * as THREE from "three";

/**
 * Entities are anything that aren't blocks which inhabit the world
 */
export class Entity{
	position: THREE.Vec2
	constructor(){
		this.position = new THREE.Vector2(0,0);
	}
}