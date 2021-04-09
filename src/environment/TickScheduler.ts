import * as THREE from "three";
import {World} from "./world/World";

export type TickTask = (world:World)=>void;

export class TaskDenominator{
	id: string;
	tickTask: TickTask;
	tick: any;
	persistent: any;
	order!:number;
	maxFails = 20;
	suspended = false;
	
	constructor( tt:TickTask, tick:number, persistent:boolean=false, uuid?:string ){
		this.id = uuid || THREE.Math.generateUUID();
		this.tickTask = tt;
		this.tick = tick;
		this.persistent = persistent;
	}

	assign(order:number){
		this.order = order;
	}
}

/**
 * All time values are in units of ms
 */
export class TickAnalytics{
	/**
	 * Time Average over all invocations
	 */
	timeAverage: number = 0;

	/**
	 * Time Average over a small sample of invocations
	 */
	shortAverageList: number[];
	shortAverageLength: number;
	shortAverage: number = 0;

	calls: number = 0;
	uuid: string;

	/**
	 * Reported failures
	 */
	failCount: number = 0;
	fails: Error[] = [];
	
	constructor( uuid: string, shortAverageLength = 10 ){
		this.uuid = uuid;
		this.shortAverageLength = shortAverageLength;
		this.shortAverageList = new Array( shortAverageLength ).fill( 0 );
	}

	/**
	 * Add a time sample to the data
	 * @param delta 
	 */
	addTimeSample( delta:number ){
		this.calls++;
		if(!this.timeAverage){
			this.timeAverage = delta; 
		}else{
			// Full-time average
			this.timeAverage = ( this.timeAverage + delta ) / 2;
		}

		this.shortAverageList[ this.calls % this.shortAverageLength ] = delta;
		this.shortAverage = this.shortAverageList.reduce( ( a, b )=>{ return a + b; } ) / ( this.calls < this.shortAverageLength ? this.calls+1 : this.shortAverageLength );
	}

	/**
	 * Invoked when an error occurs during a scheduled task
	 * @param error 
	 */
	failed( error: Error ){
		this.failCount++;
		this.fails.push(error);
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
	enableAnalytics: boolean = true; // Disable for performance enhancing
	analytics: Map< string, TickAnalytics > = new Map< string, TickAnalytics >();
	constructor( world:World ){
		this.uuid = THREE.Math.generateUUID();
		this.world = world;
		console.log(`[ TickScheduler ] debugging variable`, this);
	}

	tick( tick:number ){
		this.tasks = this.tasks.filter((td)=>{
			// Do not invoke suspended tasks
			if(td.suspended){ return; }

			let keep = true;
			if( tick==td.tick || (td.persistent && tick%td.tick==0) ){
				const startTime = new Date().getTime();
				
				try{
					td.tickTask(this.world);
					if(!td.persistent) keep = false;
				}catch( error ){
					// Suspend the scheduled task if it fails too much
					if(this.analytics.has(td.id)){
						// This is for "every" tasks
						const analytics = <TickAnalytics> this.analytics.get( td.id );
						analytics.failed( error );
						if( analytics.failCount >= td.maxFails ){
							td.suspended = true;
							console.error( `[ TickScheduler ] suspended task "${td.id}"\nReason: Too many failures`, td );
							console.error( `[ TickScheduler ] Analytics Dump for suspended task "${td.id}"`, analytics)
						}
					}else{
						// This is for "once" tassks
						throw error;
					}
				}
				
				
				if(this.analytics.has( td.id )){
					const ta = <TickAnalytics> this.analytics.get( td.id );
					ta.addTimeSample( new Date().getTime() - startTime );
				}
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
	 * Analytics is automatically enabled for "every" tasks
	 * @param tick 
	 * @param task
	 * @param uuid uuid or any string
	 */
	every(tick:number,task:TickTask, uuid?:string ){
		let td = new TaskDenominator(task, tick, true, uuid);
		this.analytics.set( td.id, new TickAnalytics( td.id ) );
		this.finalize(td);
	}

	/**
	 * Does a task after n ticks
	 * @param tick 
	 * @param task 
	 * @param uuid uuid or any string; pass a string to enable analytics
	 */
	after(tick:number,task:TickTask, uuid?:string){
		let td = new TaskDenominator(task, this.world.tickCount+tick, false, uuid);
		if( uuid ){
			this.analytics.set( uuid, new TickAnalytics( uuid ) );
		}
		this.finalize(td);
	}

	/**
	 * Does a task after a random number of ticks
	 * @param tickMin 
	 * @param tickMax 
	 * @param task 
	 * @param uuid uuid or any string; pass a string to enable analytics
	 */
	randomly(tickMin:number,tickMax:number,task:TickTask, uuid?:string){
		let td = new TaskDenominator(task, Math.floor(Math.random()*(tickMax-tickMin)+tickMin), true, uuid);
		if( uuid ){
			this.analytics.set( uuid, new TickAnalytics( uuid ) );
		}
		this.finalize(td);
	}
}