import { config } from "@config";
import { Vector3, Vector2 } from "three";
import { Verbose } from "../../../utils/Verboosie";

type VectorU = Vector2 & Vector3;

export class MovementHandler{
	unitsPerMS: number; // units per tick
	startV: Vector2 | Vector3 = new Vector2();
	endV: Vector2 | Vector3 =  new Vector2();
	startTime: number = 0; // Start tick
	onArrive: (()=>void)[] = [];
	unitsPerSecond: number;

	active: boolean = false;
	distance!: number;

	constructor( unitsPerSecond: number ){
		this.unitsPerMS = unitsPerSecond / 1000;
		this.unitsPerSecond = unitsPerSecond;
	}

	/**
	 * Schedule a new movement action
	 * @param startTick 
	 * @param to 
	 * @param from 
	 */
	newMovement( to: Vector2 | Vector3, from?:Vector2 | Vector3 ){
		this.active = true;
		if( from ){
			this.startV = from.clone();
		}
		this.endV = to.clone();
		this.startTime = new Date().getTime();
		this.distance = this.startV.distanceTo( <VectorU>this.endV ) || 1;
		return this;
	}

	/**
	 * Add a listener for arrival
	 * @param func 
	 */
	addOnArrive( func: ()=>void ){
		this.onArrive.push( func );
	}

	/**
	 * Calculate current position of the current movement path
	 * @param currentTick 
	 */
	getPosition(){
		if(!this.active){
			return this.endV; 
		}
		const msElapsed = ( new Date().getTime() - this.startTime );
		const msReq = this.distance / this.unitsPerMS;
		const alpha = msElapsed / msReq;
		const out = new Vector2(0,0).lerpVectors( <VectorU>this.startV, <VectorU>this.endV, alpha );
		if( alpha >= 1 ){
			this.invokeArrival();
		}
		return out;
	}

	invokeArrival(){
		this.active = false;
		this.startV = this.endV.clone();
		if( this.onArrive.length ){
			while( this.onArrive.length ){
				(<()=>void>this.onArrive.pop())();
			}
		}
	}

	teleport( to: Vector2 ){
		this.active = false;
		this.startV = to.clone();
		this.endV = to.clone();
		this.invokeArrival();
	}
}