import { FrostedFlakes } from "../rendering/FrostedFlakes";
import {Player} from "./entity/Player";
import {Storable} from "../io/Storable";
import { Region } from "./region/Region";
import { Grid } from "../utils/Spaces";
import { object } from "prop-types";
import { TickScheduler } from "./TickScheduler"; 

export class World extends Storable{
	
	ff: FrostedFlakes;
	regions!: Grid<Region>
	regionUpdateQueue:Region[] = [];

	worldSize = 4;
	chunkSize = 16;

	tickLoggingLength:number = 10;
	tickSkip = this.tickLoggingLength*2;
	tickTime:number = 0;
	tickCount:number = 0;
	desiredTPS:number = 20;
	tickDeltas:number[] = new Array<number>(this.tickLoggingLength).fill(1000/this.desiredTPS);
	tickScheduler:TickScheduler;

	meshUpdates=6000;

	constructor( ff:FrostedFlakes ){
		super();
		console.log(`[World] initialized`);
		this.ff = ff;
		console.log(this);

		this.tickScheduler = new TickScheduler( this );

	}

	/**
	 * Converts ms to ticks
	 */
	msToTicks( ms:number ):number{
		return 1000/this.desiredTPS*ms;
	}

	queueUpdate( region:Region ){
		this.regionUpdateQueue.push(region);
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 * @abstract
	 */
	render(  ){
		this.defaultRender();
	}

	update(){}

	/**
	 * The default rendering cycle
	 */
	defaultRender(){
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
		let nextDelay = this.getNextTickDelay()-3;
		let tps = this.getTPS();
		document.title = tps.toFixed(2) + " - - - " + this.tickCount + " - - - " + 1000/tps+" / "+1000/this.desiredTPS;
		let self = this;
		this.updateTickTimes();
		this.tickScheduler.tick( this.tickCount );
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
			this.update();
			while(this.regionUpdateQueue.length){
				let reg = this.regionUpdateQueue.pop();
				if(!reg) return;
				reg.update(  )
			}
			/*if(this.meshUpdates && false){
				this.meshUpdates--;
				this.ff.children.map((child)=>{
					child.traverse((o3d)=>{
						if(o3d.type=="Mesh"){
							let im = (<THREE.Mesh>o3d);
							let bg = <THREE.BufferGeometry>im.geometry
							if(bg.attributes){
								if( bg.attributes.position && bg.attributes.normals && bg.attributes.uv ){
									(<THREE.BufferAttribute>bg.attributes.position).needsUpdate = true;
									(<THREE.BufferAttribute>bg.attributes.normals).needsUpdate = true;
									(<THREE.BufferAttribute>bg.attributes.uv).needsUpdate = true;
								}
							}
						}
					})
				})
			}*/
		}
		
		this.queueNextTick();
	}
}