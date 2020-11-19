import { ActorBehavior } from "./ActorBehavior";
import { EntityActor } from "../EntityActor";
import { Vector2 } from "three";
import { config } from "../../../controls/Config";

export class BehaviorGoTo extends ActorBehavior{	

	acting: boolean = false;
	timeout: number = 0;
	location: Vector2;

	constructor( entity: EntityActor, location: Vector2 ){
		super( entity, "goto" );
		this.location = location;
	}

	startNewMovement(){
		const self = this;

		const mh = this.entity.movementHandler;
		this.acting = true;

		mh.newMovement( this.location );
		mh.addOnArrive( ()=>{
			self.acting = false;
			self.invokeComplete()
		});
	}

	tick(){
		if( this.acting ){
			//this.entity.applyMHPosition();
		}else{
			if( this.timeout ){
				this.timeout--;
			}else{
				this.startNewMovement();
			}
		}
	}
}