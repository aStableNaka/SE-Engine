import { Entity } from "./Entity";
import { config } from "@config";
import { Mesh, Vector2, Object3D, Group, PointLight } from "three";
import { World } from "../world/World";
import { ActorBehavior } from "./behavior/ActorBehavior";
import { BehaviorIdle } from "./behavior/BehaviorIdle";
import { Verbose } from "../../utils/Verboosie";
import { MovementHandler } from "./behavior/MovementHandler";

/**
 * An actor is an entity that can perform actions
 */
export class EntityActor extends Entity{
	movementHandler = new MovementHandler(1.4);
	behavior!: ActorBehavior;
	behaviors: Map<string, ActorBehavior> = new Map();
	type = "Generic";
	constructor( world: World ){
		super( world );
		this.behaviorFactory();
	}

	/**
	 * Build a mesh for this entity
	 */
	meshFactory(): Object3D{
		const group = new Group();
		const mesh = new Mesh( Entity.missingGeom.clone(), Entity.missingMat );
		mesh.position.set( 0,0,0 );
		mesh.matrixWorldNeedsUpdate = true;
		group.add(mesh);
		return group;
	}

	/**
	 * List behaviors here
	 */
	listBehaviors(){
		return [
			new BehaviorIdle( this )
		]
	}

	behaviorFactory():void{
		const behaviors = this.listBehaviors();
		this.behavior = behaviors[0];
		const out = behaviors.map( (b)=>{
			this.behaviors.set( b.name, b );
		}, this);
	}

	teleport( vec2:THREE.Vector2 ){
		this.movementHandler.teleport( vec2 );
	}

	applyMHPosition(){
		const tick = this.world.tickCount;
		const pos = this.movementHandler.getPosition();
		this.setPosition( <Vector2>pos );
	}

	render(){
		this.applyMHPosition();
	}

	update(){
		if(this.behavior){
			this.behavior.tick()
		}
	}
}