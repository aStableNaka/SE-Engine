import * as THREE from "three";
import { World } from "../world/World";
import { Vector3 } from "three";

/**
 * Entities are anything that aren't blocks which inhabit the world
 */
export class Entity{
	position: THREE.Vector2;
	meshGroup: THREE.Group = new THREE.Group();
	meshMissing: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.30902348578,1,0.30902348578), new THREE.MeshLambertMaterial({color:0xff00ff}));
	world:World;
	/**
	 * In units per second
	 */
	velocity:number=0;
	movementDelta:Vector3 = new THREE.Vector3();
	vdate:number = new Date().getTime();
	constructor( world:World ){
		this.position = new THREE.Vector2(0,0);
		this.meshMissing.position.set(0,0,0);
		this.meshMissing.matrixWorldNeedsUpdate = true;
		this.world = world;
	}

	addToWorld(){
		this.meshGroup.add( this.meshMissing );
		this.world.ff.add(this.meshGroup);
	}

	move( vec2:THREE.Vector2 ){
		this.position.add(vec2);
		this.meshGroup.position.set(this.position.x,1,this.position.y);
	}

	setPosition( vec2:THREE.Vector2 ){
		let deltaTime = this.vdate-new Date().getTime();
		this.velocity = Math.abs(this.position.clone().sub( vec2 ).length()/deltaTime)*1000;
		this.position.set( vec2.x, vec2.y );
		this.vdate = new Date().getTime();
		this.meshGroup.position.set(this.position.x,1,this.position.y);
	}

	render(){

	}

	update(){
		
	}

	tick(){
		this.update();
	}
}