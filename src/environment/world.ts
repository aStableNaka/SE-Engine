import { FrostedFlakes } from "../rendering/FrostedFlakes";
import {Player} from "./entity/Player";
import {Storable} from "../io/Storable";
import { Region } from "./region/Region";
import { Grid } from "../utils/Spaces";

export class World extends Storable{
	player:Player | null = null;
	ff: FrostedFlakes;
	regions!: Grid<Region>
	regionUpdateQueue:Region[] = [];

	tickLoggingLength:number = 10;
	tickSkip = this.tickLoggingLength*2;
	tickTime:number = 0;
	tickCount:number = 0;
	desiredTPS:number = 20;
	tickDeltas:number[] = new Array<number>(this.tickLoggingLength).fill(1000/this.desiredTPS);

	constructor( ff:FrostedFlakes ){
		super();
		this.ff = ff;
	}

	queueUpdate( region:Region ){
		this.regionUpdateQueue.push(region);
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(  ){
		let self = this;
		window.requestAnimationFrame(()=>{
			self.render();
		});
		self.ff.render();
	}

	updateTickTimes(){
		let time = new Date().getTime();
		this.tickCount++;
		this.tickDeltas[this.tickCount%this.tickDeltas.length] = time-this.tickTime;
		this.tickTime = time;
	}

	/**
	 * Gets the average TPS (Ticks Per Second)
	 */
	getTPS():number{
		let deltaSum = this.tickDeltas.reduce((pv, cv)=>{
			return pv+cv;
		});
		// Average interval between ticks
		let deltaAvg = deltaSum/this.tickLoggingLength;
		
		let tps = 1000 / deltaAvg;
		return tps;
	}

	/**
	 * Ideally, this will produce a value in MS
	 * that will keep our tps at ${desiredTPS} (probably 60)
	 */
	getNextTickDelay():number{
		let idealTPS = this.desiredTPS; // ms
		let currentTPS = this.getTPS();
		return Math.min(1000/idealTPS, 1000/(idealTPS - (currentTPS - idealTPS)));
	}

	queueNextTick(){
		let nextDelay = this.getNextTickDelay();
		let tps = this.getTPS();
		document.title = tps.toFixed(2) + " - - - " + new Date().getTime() + " - - - " + 1000/tps+" / "+1000/this.desiredTPS;
		let self = this;
		this.updateTickTimes();
		setTimeout(()=>{
			self.tick();
		}, nextDelay);
	}

	/**
	 * Tick will do a few things
	 * 	1 ) Update mesh transforms
	 * 	2 ) Update region states
	 */
	tick(){
		if(this.tickSkip){
			this.tickSkip--;
		}else{
			while(this.regionUpdateQueue.length){
				let reg = this.regionUpdateQueue.pop();
				if(!reg) return;
				reg.update(  )
			}
		}
		
		this.queueNextTick();
	}
}