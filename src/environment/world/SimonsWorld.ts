import {World} from "./World";
import { FrostedFlakes } from "../../rendering/FrostedFlakes";
import * as THREE from "three";
import { Grid } from "../../utils/collections/Spaces";
import { Region } from "./region/Region";
import {SimonsRegion} from "./region/SimonsRegion";
import { CameraAnchor } from "../entity/CameraAnchor";
import { Vector2, Vector3 } from "three";
import { makeNoise2D, Noise2D } from "open-simplex-noise";
import { BlockData } from "../blocks/Block";
import { BoundlessGrid } from "../../utils/collections/BoundlessGrid";
import { ValuesScope, ValuesScopeState } from "../../ui/debug/ValuesScope";
import { RefObject } from "react";
import { NOISE_GENERATOR_LABELS } from "../biome/Biome";
import { BiomeSelector } from "../biome/BiomeSelector";
import { ControlRouter } from "../../controls/ControlRouter"
import { ControlBehaviors } from "../../controls/behaviors/ControlBehaviors";
import { config } from "../../controls/Config";
import { RegionDisplayBehavior } from "../../rendering/RegionDisplayBehavior";
import { Verbose } from "../../utils/Verboosie";
import { Serializer } from "../../io/Serializer";
import { EntityActor } from "../entity/EntityActor";
import { regHub } from "../../registry/RegistryHub";
import { StockpileMaster } from "../networks/stockpile/StockpileMaster";

import * as TFmt from "../../utils/TextFormat";
import * as TsxTools from "../../utils/TsxTools";

/**
 * @checkpoint
 * Control test alpha 0
 * https://gfycat.com/CautiousSeveralDromaeosaur
 */

const sin45 = Math.sin(45);
const cos45 = Math.cos(45);
const sqrthalf = Math.sqrt(1/2);

export type DebugTools = { 
	/**
	 * React RefObject for interacting with valuesScope window
	 */
	valuesScopeRef: RefObject<ValuesScope> | null | undefined;
};


/**
 * Simons world is a world where each region
 * has 4 or more layers. The layers follow this mapping:
 * 3 - other
 * 2 - roofs
 * 1 - walls
 * 0 - ground
 */
export class SimonsWorld extends World{
	enableDebugHelpers:boolean = false;

	worldSize=config.world.mapSize || 8;
	chunkSize=config.world.chunkSize || 32;
	viewAngle:number = config.camera.viewAngle || 35;
	worldDomain:THREE.Box2;
	center: THREE.Vector2;
	cameraAnchor!: CameraAnchor;

	loadedRegions:Region[] = [];
	regionLoadQueue:string[] = [];
	regionLoadMap:Map<string,Region> = new Map<string,Region>();

	noiseGenerators: Noise2D[];
	biomeSelector:BiomeSelector;

	RDB: RegionDisplayBehavior = new RegionDisplayBehavior( this );

	debugTools!: DebugTools | null;

	// TODO: Migrate controlRouter to GameController
	controlRouter: ControlRouter = new ControlRouter( this, document.body, "default" );
	seed: string;

	stockpileMaster = new StockpileMaster();

	constructor( ff:FrostedFlakes, seed:string="0" ){
		super( ff );

		this.seed = seed;

		const self = this;
		
		// Generate me some noise generators please
		this.noiseGenerators = Object.keys( NOISE_GENERATOR_LABELS ).map( ( label:string, i, v )=>{
			Verbose.log( v, "SimonsWorld#BiomeVector", 0x10 );
			return makeNoise2D( this.stringToSeed(seed+label) );
		});
		this.biomeSelector = new BiomeSelector( this.noiseGenerators );

		
		this.center = new THREE.Vector2(this.chunkSize*this.worldSize/2, this.chunkSize*this.worldSize/2);
		this.worldDomain = new THREE.Box2( new Vector2(-this.worldSize,-this.worldSize), new Vector2(this.worldSize-1,this.worldSize-1) );
		this.cameraAnchor = new CameraAnchor( this );
		this.setupControls(ff);

		if(config.world.bounded){
			this.regions = new Grid<Region>(this.worldSize,(y,x)=>{
				return self.instantiateRegion(x,y);
			});
		}else{
			this.regions = new BoundlessGrid<Region>(this.worldSize,(y,x)=>{
				return self.instantiateRegion(x,y);
			}, true);
		}

		this.regions.mapContents( ( reg:Region )=>{
			reg.constructMesh();
		} )
		
		this.RDB.setup();

		this.scheduleTicks();

		this.ready = true;
	}

	private scheduleTicks(){
		const self = this;
		let regionHold: Region | null = null;

		/**
		 * Loads a single region every tick
		 */
		this.tickScheduler.every(config.tick.ts_region_load, ()=>{
			if(self.regionLoadQueue[0]){
				let regKey = <string> self.regionLoadQueue.pop();
				let reg = <Region> self.regionLoadMap.get( regKey );
				reg.constructMesh();
				self.regionLoadMap.delete( regKey );
				reg.addToWorld();
			}
		}, "region-load");

		/**
		 * Updates information on the debug ui
		 */
		this.tickScheduler.every( config.tick.ts_debug_info_update, ()=>{
			self.updateDebug();
		}, "debug-info-update");
	}

	/**
	 * Any test methods: put in here
	 */
	test(){

		for(let w = 0; w < config.debug.entityAmount; w++ ){
			const entity = new EntityActor( this );
			entity.addToWorld();
			entity.teleport( this.center );
		}
	}


	private stringToSeed( str:string ):number{
		return str.split("").map((x)=>x.charCodeAt(0)).reduce((a,b)=>a+b)
	}				
	
	/**
	 * Queue a region to be loaded.
	 * Regions are loaded once every 2 ticks.
	 * @param region 
	 */
	queueRegionLoad(region:Region){
		const regKey = region.position.toArray().join("_");
		if(!this.regionLoadMap.has(regKey)){
			this.regionLoadQueue.push(regKey);
			this.regionLoadMap.set( regKey, region );
		}
	}

	iterateOverBox2( box2:THREE.Box2, callback:(x:number,y:number)=>void){
		for( let x = box2.min.x; x < box2.max.x; x++ ){
			for( let y = box2.min.y; y < box2.max.y; y++ ){
				callback(x,y);
			}
		}
	}

	/**
	 * Create a new instance of a region.
	 * @param x 
	 * @param y 
	 */
	instantiateRegion(x:number,y:number){
		let region = new SimonsRegion( this, new THREE.Vector2(x,y) );
		region.meshGroup.position.set(x * this.chunkSize, 0, y * this.chunkSize);
		region.meshGroup.worldLocation = new THREE.Vector2(x, y);
		region.meshGroup.name = `reg_${x}:${y}`;
		region.constructMesh();
		this.ff.add( region.meshGroup );
		return region;
	}
		
	/**
	 * Set up the controls for SimonsWorld 
	 * @param ff 
	 */
	setupControls( ff:FrostedFlakes ){
		let self = this;
		this.tickScheduler.after(10,()=>{
			// Set up the player
			self.setupAnchorPlacement(ff);	
			self.setupControlBehaviors();
		})
		this.setupOrbitControls( ff) ;
	}

	/*###################################################################
			Immediate Region Helper
	####################################################################*/

	


	getImmediateRegionBoundry( cameraAnchor: CameraAnchor ):THREE.Box2{
		let pPos = cameraAnchor.position.clone();
		// pPos but floored
		let fpPos = pPos.floor();
		// The location of the region which the player is in
		let imReg = fpPos.divideScalar(this.chunkSize).floor();
		// turn imReg into a translation
		let trans = imReg.sub( this.RDB.imrLowerBound );
		return this.RDB.immediateRegionBox.clone().translate( trans );
	}

	updateImmediateRegionBoundry( cameraAnchor: CameraAnchor ){
		this.RDB.immediateRegionBoundry = this.getImmediateRegionBoundry(cameraAnchor);
	}


	/*###################################################################
			Camera Setup
	####################################################################*/

	setupOrbitControls(ff:FrostedFlakes){
		// Set up the orbit controls
		ff.orbitControlls.maxPolarAngle=Math.PI/180*this.viewAngle;
		ff.orbitControlls.minPolarAngle=Math.PI/180*this.viewAngle;
		ff.orbitControlls.minDistance=config.camera.minZoom;
		if(config.camera.noZoomLimit){
			ff.orbitControlls.maxDistance=config.camera.maxZoom;
		}
		ff.orbitControlls.enableDamping = false;
		ff.orbitControlls.keyPanSpeed= config.camera.panSpeed || 5;

		ff.orbitControlls.mouseButtons = {
			LEFT:THREE.MOUSE.ROTATE
		}

		// Set camera target to player location
		ff.orbitControlls.target.set(this.center.x-5,1,this.center.y-5);
		ff.camera.position.set(this.center.x,5,this.center.y);

		this.ff.add( new THREE.AmbientLight( 0xffffff,1 ))

		this.setupOrbitControlsDebugging();
	}

	setupOrbitControlsDebugging(){
		if(this.enableDebugHelpers){
			// For debugging
			this.ff.orbitControlls.maxDistance=100000;
		}
	}



	/*###################################################################
			Keyboard Controls
	####################################################################*/

	/**
	 * Sets up the initial camera anchor placement
	 * @param ff 
	 */
	setupAnchorPlacement(ff:FrostedFlakes){
		this.cameraAnchor.setPosition(this.center.add(new THREE.Vector2(-5,-5)));


		this.updateImmediateRegionBoundry( this.cameraAnchor );
		this.updateRegionsSeen(this.RDB.immediateRegionBoundry);
		/*this.iterateOverBox2( this.immediateRegionBoundry, (x,y)=>{
			this.regions.get(x,y).addToWorld();
		});*/


		/**
		 * Move the camera anchor on ocPan
		 */
		ff.orbitControlls.onPan = ( panOffset: {x:number, y:number, z:number } )=>{	
			this.cameraAnchor.setPosition( new Vector2(panOffset.x,panOffset.z) );
		}
	}

	/**
	 * Basic WASD movement mapping
	 */
	setupControlBehaviors(){
		let self = this;
		this.controlRouter.addState( new ControlBehaviors.CBDefault() );
	}


	/*###################################################################
			Updating/Ticking
	####################################################################*/

	/**
	 * Adds regions that will be seen
	 * Removes regions that will no longer be seen
	 * @param newRegionBoundry 
	 * @note for some reason, i need to translate the region location by this.imr.
	 */
	updateRegionsSeen( newRegionBoundry:THREE.Box2 ){
		//let intersect = this.immediateRegionBoundry.clone().intersect(newRegionBoundry);
		let self = this;
		// Add regions that are to be seen
		this.iterateOverBox2(newRegionBoundry, (x,y)=>{
			// Location of the region
			let regionLocation = new THREE.Vector2( x-this.RDB.imr,y-this.RDB.imr );
			// If the point is inside the intersection
			// or if the world does not contain this region
			// Do nothing.
			//if(!self.worldDomain.containsPoint(regionLocation)) return; // this does nothing
			
			let region = <Region>self.regions.get(regionLocation.x,regionLocation.y);
			if(!region){ 
				return;
			};
			if(!region.loaded){
				self.queueRegionLoad(region);
			}
			region.addToWorld();
		});

		// Remove regions that aren't seen anymore
		// this can be optimized using lazy iteration
		this.iterateOverBox2(this.RDB.immediateRegionBoundry, (x,y)=>{
			let removalQueue:THREE.Object3D[] = []
			this.ff.children.map((obj3d)=>{
				if(obj3d.name.indexOf("reg_")==0){
					let n = obj3d.name.replace("reg_",'');
					let [x,y] = [...n.split(":").map(x=>parseInt(x))];
					if(!newRegionBoundry.containsPoint(new THREE.Vector2(x+this.RDB.imr,y+this.RDB.imr))){
						removalQueue.push(obj3d);
					}
				}
			}, this)
			removalQueue.map((obj3d)=>{
				this.ff.remove(obj3d);
			},this);
		})
		this.RDB.immediateRegionBoundry = newRegionBoundry;
		this.RDB.updateImrHelper()
	}

	update(){
		//this.player.tick();
		this.tickRegistries();
		let regionsSeen = this.getImmediateRegionBoundry( this.cameraAnchor );
		if(!regionsSeen.containsBox(this.RDB.immediateRegionBoundry)){
			this.updateRegionsSeen( regionsSeen );
		}
	}

	private updateDebug(){
		// updating the debug tools
		this.provideValuesScope( (valuesScope: ValuesScope)=>{
			let region = this.getRegionAtVec2( this.cameraAnchor.position );
			let chp;
			const cB = this.controlRouter.cBehavior;
			if(cB){
				chp = cB.cursorHelper.cursorHighlightMesh.position;
			}else{
				chp = new THREE.Vector3(0,0,0);
			}
			if( ! valuesScope.isVisible() ){
				return;
			}
			let debugState:ValuesScopeState = {
				tps: `${this.tps.toFixed(2).padEnd(12, ' ')} ${( 1000/this.tps ).toFixed(2)}ms/${1000/this.desiredTPS}ms    #${this.tickCount}`,
				fps:`${this.fps}`,
				tickTime: `${this.tickComputeTime.toFixed(4)} / 50 ms`,
				tickIdle: `${(50-this.tickComputeTime).toFixed(4)} / 50 ms`,
				blockData: this.getBlockColumn( chp.x, chp.z ).map(( blockData:BlockData, i )=>{
					return `${i} > ${blockData.blockId}`;
				}),
				cursorWSC: `${chp.x} , ${chp.z}`
			};

			if(region){
				
				debugState.regionWSC = TFmt.list( [ region.position.x, region.position.y ]);
				//region.forceMeshReconstruct();
			}

			valuesScope.setState( debugState );
		});
	}

	/**
	 * A wrapper for the function above, for the valuesScope
	 * @param callback 
	 */
	provideValuesScope( callback: (valuesScope:ValuesScope)=>void){
		if(this.debugTools){
			TsxTools.provideUIObject<ValuesScope>( this.debugTools.valuesScopeRef, callback);
		}
	};

	/**
	 * A tick that does stuff for player movement
	 * @param md 
	 */
	tickMovement(md:THREE.Vector3){
		if( md.x && md.y ){
			// Diagonal movement normalization
			md = md.multiplyScalar(sqrthalf);
		}
		//document.title = this.player.velocity.toString() + ` ${md.x} / ${md.y}`;
		this.ff.orbitControlls.pan( md.x, md.y );
		this.cameraAnchor.movementDelta.x = 0;
		this.cameraAnchor.movementDelta.y = 0;
	}

	tickRegistries(){
		regHub.tick( this.tickCount );
	}

	
	/*###################################################################
			Rendering
	####################################################################*/

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(){
		this.controlRouter.tick();
		this.defaultRender();

		// Handling movement
		let md = this.cameraAnchor.movementDelta;
		if( md.x || md.y ) this.tickMovement( md );
	}

	/*###################################################################
			Debugging
	####################################################################*/

	readyDebug( debugTools:DebugTools ){
		this.debugTools = debugTools;
	}
	
	/*###################################################################
			Serialization
	####################################################################*/

	/**
	 * Custom override of the toString to handle stack overflow
	 * @param compress 
	 */
	toString( compress:boolean=false ): string{
		throw new Error("Depricated");
		let obj = this.toStorageObject();
		let out: any[] = [];
		
		this.regions.mapExisting( ( region, row, col )=>{
			Verbose.log( `${row}, ${col}`, "SimonsWorld#Serializer", 0x20 );
			out.push(region.processSelf( compress ));
		});

		return JSON.stringify( {seed:this.seed, regions: out} );
	}
	
	toStorageObject(){
		throw new Error("Depricated");
		return { seed:this.seed, regions: this.regions };
	}

	/*###################################################################
			Serialization V2
	####################################################################*/

	serializev2( compress=false ){
		const instanceSerializer: Serializer<SimonsWorld> = Serializer.grabSerializer( this );
		return instanceSerializer.convertToRaw( this );
	}

}

export class SimonsWorldSerializer extends Serializer<SimonsWorld>{
	constructor(){
		super( SimonsWorld );
	}

	dataMapping( instance: SimonsWorld ){
		return {
			type: "SimonsWorld",
			seed: instance.seed,
			worldSize: instance.worldSize,
			chunkSize: instance.chunkSize,
			tickCount: instance.tickCount,
			regions: instance.regions,
		}
	}
	
}

new SimonsWorldSerializer();