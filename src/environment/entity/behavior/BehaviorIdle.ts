import { ActorBehavior } from "./ActorBehavior";
import { EntityActor } from "../EntityActor";
import { Vector2 } from "three";
import { config } from "@config";

export class BehaviorIdle extends ActorBehavior{	

	acting: boolean = false;
	timeout: number = 0;

	constructor( entity: EntityActor ){
		super( entity, "idle" );
	}

	random( scale: number = 1){
		return Math.round( (Math.random()*2-1) * scale );
	}

	pickNewLocation(){
		const newLocation = <Vector2>this.entity.movementHandler.endV.clone();	
		return newLocation.add( new Vector2( this.random( config.behavior.idle.range ), this.random( config.behavior.idle.range ) )).round();
	}

	startNewMovement(){
		const self = this;
		const loc = this.pickNewLocation();

		const mh = this.entity.movementHandler;
		this.acting = true;

		mh.newMovement( loc );
		mh.addOnArrive( ()=>{
			self.acting = false;
			self.timeout = Math.floor(Math.random()*config.behavior.idle.timeoutRange);
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