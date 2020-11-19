import { EntityActor } from "../EntityActor";
import { EventEmitter } from "events";

export class ActorBehavior extends EventEmitter{
	entity: EntityActor;
	name: string;

	isCompletable(): boolean{
		return true;
	}

	constructor( entity: EntityActor, name: string ){
		super();
		this.entity = entity;
		this.name = name;
		this.entity.behaviors.set( name, this );
	}

	onComplete( callback:( behavior: ActorBehavior )=>void ){
		this.addListener( "complete", callback );
	}

	onInterrupted( callback:( behavior: ActorBehavior )=>void ){
		this.addListener( "interrupted", callback );
	}
	
	onFail( callback:( behavior: ActorBehavior )=>void ){
		this.addListener( "fail", callback );
	}

	invokeComplete(){
		this.emit( "complete", this );
	}

	invokeInterrupted(){
		this.emit( "complete", this );
	}

	invokeFail(){
		this.emit( "complete", this );
	}

	switchTo(){
		this.entity.behavior = this;
	}

	tick(){}
}