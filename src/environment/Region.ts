import { RegionMesh } from '../rendering/RegionMesh';
import { MapObject } from './MapObject';
import { CreateGrid, Position, getSpaceDepth } from '../utils/Spaces';
import {EventEmitter} from 'events';
import { PositionalAudio } from 'three';
import { Dictionary } from '../utils/Dictionary';
import { World } from './World';
import { Layer } from './Layer';

/**
 * How blocks are represented in regions
 */
export class BlockMapObject{
	position: Position;
	ref: any;
	constructor( position:Position, ref:any, meta?:any){
		this.position = position;
		this.ref = ref;
	}
}

export class RegionEventEmitter extends EventEmitter{
	constructor(){
		super();
		this.on('set', this.eventSet);
	}

	eventSet():void{
		
	}
}

export class Region{
	meshGroup: RegionMesh;
	dictionary: Dictionary = new Dictionary();
	layers: Layer[] = [];
	entities: any[] = [];
	actorBlocks: MapObject[] = [];
	eventEmitter:RegionEventEmitter = new RegionEventEmitter();
	world:World;

	constructor( size:number, parent:World ){
		this.world = World;
		this.meshGroup = new RegionMesh( this );
	}

	/**
	 * Builds the mesh and adds it to the world's scene
	 */
	constructMesh():void{

	}

	/**
	 * Offload this region
	*/
	offload():boolean{
		return true;
	}

	/**
	 * Map a function to every block within this region
	 */
	map():any{
		const self = this;
		
	}

	/**
	 * Map a function to every actor block within this region
	 */
	mapActorBlocks():any{

	}

}