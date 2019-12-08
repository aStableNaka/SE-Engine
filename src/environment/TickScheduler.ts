import * as THREE from "three";
import {World} from "./World";

export type TickTask = (world:World)=>void;

export class TaskDenominator{
	uuid: string;
	tickTask: TickTask;
	tick: any;
	persistent: any;
	order!:number;
	constructor( tt:TickTask, tick:number, persistent:boolean=false ){
		this.uuid = THREE.Math.generateUUID();
		this.tickTask = tt;
		this.tick = tick;
		this.persistent = persistent;
	}

	assign(order:number){
		this.order = order;
	}
}

/**
 * @example
 * let tickScheduler = new TickScheduler( world );
 * let task = (world)=>{console.log(world)};
 * tickScheduler.every(10,task) // every 10 ticks, do this task.
 * tickScheduler.after(100,task) // after 100 ticks, do this task
 * tickScheduler.randomly(100,1000,task) // do a task after anywhere between 100 and 1000 ticks
 */
export class TickScheduler{
	tasks:TaskDenominator[] = [];
	uuid: string;
	world: any;
	count:number = 0;
	constructor( world:World ){
		this.uuid = THREE.Math.generateUUID();
		this.world = world;
	}

	tick( tick:number ){
		this.tasks = this.tasks.filter((td)=>{
			let keep = true;
			if( tick==td.tick || (td.persistent && tick%td.tick==0) ){
				td.tickTask(this.world);
				if(!td.persistent) keep = false;
			}
			return keep;
		},this);
	}

	private finalize(td:TaskDenominator){
		td.assign( this.count );
		this.count++;
		this.tasks.push(td);
	}

	/**
	 * Repeats a task after every n ticks
	 * @param tick 
	 * @param task 
	 */
	every(tick:number,task:TickTask){
		let td = new TaskDenominator(task, tick, true);
		this.finalize(td);
	}

	/**
	 * Does a task after n ticks
	 * @param tick 
	 * @param task 
	 */
	after(tick:number,task:TickTask){
		let td = new TaskDenominator(task, this.world.tickCount+tick, false);
		this.finalize(td);
	}

	/**
	 * Does a task after a random number of ticks
	 * @param tickMin 
	 * @param tickMax 
	 * @param task 
	 */
	randomly(tickMin:number,tickMax:number,task:TickTask){
		let td = new TaskDenominator(task, Math.floor(Math.random()*(tickMax-tickMin)+tickMin), true);
		this.finalize(td);
	}
}