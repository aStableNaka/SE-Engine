import * as THREE from "three";
import { World } from "../world/World";
import { Vector3, Vector2, Object3D } from "three";
import { Region } from "../world/region/Region";

export const enetityMissingGeometry: THREE.Geometry = new THREE.BoxGeometry(0.30902348578,1,0.30902348578);
export const entityMissingMaterial: THREE.Material = new THREE.MeshLambertMaterial({color:0xff00ff});

/**
 * Entities are anything that aren't blocks which inhabit the world
 */
export class Entity{
	position: THREE.Vector2;
	meshGroup: THREE.Group = new THREE.Group();
	world:World;
	/**
	 * In units per second
	 */
	velocity:number=0;
	movementDelta:Vector3 = new THREE.Vector3();
	vdate:number = new Date().getTime();

	region!: Region;

	lifespan:number = 10; // Ticks
	lifetime: number = 0;

	constructor( world:World ){
		this.position = new THREE.Vector2(0,0);
		this.world = world;
		this.world.entities.add( this );
		this.meshGroup.name = `ENTITY_${this.world.entities.size}`
		//this.updateRegionPosition();
	}

	/**
	 * Build a mesh for this entity
	 */
	meshFactory(): Object3D{
		const mesh = new THREE.Mesh( enetityMissingGeometry.clone(), entityMissingMaterial );
		mesh.position.set( 0,0,0 );
		mesh.matrixWorldNeedsUpdate = true;
		return mesh;
	}

	/**
	 * If this isn't overwritten, we will assume the entity has no mesh
	 */
	addToWorld(){
		const mesh = this.meshFactory();
		this.meshGroup.add( mesh );
		this.updateRegionPosition();
		this.world.limboMeshGroup.add(this.meshGroup);
	}

	move( vec2:THREE.Vector2 ){
		this.position.add(vec2);
		this.meshGroup.position.set(this.position.x,3,this.position.y);
	}

	setPosition( vec2:THREE.Vector2 ){
		let deltaTime = this.vdate-new Date().getTime();
		this.velocity = Math.abs(this.position.clone().sub( vec2 ).length()/deltaTime)*1000;
		this.position.set( vec2.x, vec2.y );
		this.vdate = new Date().getTime();
		this.meshGroup.position.set(this.position.x,1,this.position.y);
		//this.updateRegionPosition();
	}

	teleport( vec2:THREE.Vector2 ){
		this.setPosition( vec2 );
	}

	/**
	 * Transfer this entity to a new region
	 * @param newRegion 
	 */
	transferToRegion( newRegion: Region ){
		if( this.region && this.region.entities.has( this ) ){
			this.region.entities.delete( this );
		}
		newRegion.entities.add( this );
		newRegion.meshGroup.add( this.meshGroup );
	}

	updateRegionPosition(){
		if(!this.world.ready){ return; }
		const region = this.world.getRegionAtVec2( this.position );
		if( region ){
			if( !this.region ){
				// If the entity is not already in a region
				this.region = region;
				this.transferToRegion( region );
			}
			if(this.region != region){
				// If the region changes
				this.region = region;
				this.transferToRegion( region );
			}
		}else{
			// If the entity is off the map, send it to limbo
			this.world.limboMeshGroup.add( this.meshGroup );
		}
		
	}

	render(){

	}

	/**
	 * All implementations should
	 * only change the update() method
	 */
	update(){
		
	}

	tick(){
		this.lifetime++;
		this.update();
	}
}