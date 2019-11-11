import { RegionMesh } from '../../rendering/region/RegionMesh';
import { MapObject } from '../MapObject';
import { CreateGrid, Position, getSpaceDepth } from '../../utils/Spaces';
import {EventEmitter} from 'events';
import { PositionalAudio } from 'three';
import { Dictionary } from '../../utils/Dictionary';
import { World } from '../World';
import { Layer } from '../Layer';
import { Block, BlockData } from '../blocks/Block';
import { Storable } from '../../io/Storable';

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

export class Region extends Storable{
	meshGroup: RegionMesh;
	dictionary: Dictionary = new Dictionary();
	layers: Layer[] = [];
	entities: any[] = [];
	actorBlocks: MapObject[] = [];
	eventEmitter:RegionEventEmitter = new RegionEventEmitter();
	world:World;

	/** Storable overloads begin*/

	toStorageObject(){
		return { layers:this.layers, entities:this.entities, dictionary:this.dictionary }
	}

	/** Storable overloads end */

	/**
	 * produces a region of size x size x height
	 * @param size sidelength of the region
	 * @param parent the world that this region inhabits
	 */
	constructor( size:number, parent:World ){
		super();
		this.world = World;
		this.meshGroup = new RegionMesh( this );
		
		// Generate the terrain
		this.layers.push( new Layer(size, 0) );
	}

	getBlock( x:number, y:number, z:number ):BlockData{
		return this.layers[z].getBlock(x,y);
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