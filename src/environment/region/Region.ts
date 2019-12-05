import { RegionMesh } from '../../rendering/region/RegionMesh';
import { MapObject } from '../MapObject';
import { CreateGrid, Position, Grid } from '../../utils/Spaces';
import {EventEmitter} from 'events';
import { PositionalAudio, Vector4, Matrix4 } from 'three';
import { Dictionary } from '../../utils/Dictionary';
import { World } from '../World';
import { Layer } from '../Layer';
import { Block, BlockData } from '../blocks/Block';
import { Storable } from '../../io/Storable';
import { regHub } from '../../registry/RegistryHub';
import * as THREE from "three";

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

/**
 * @property lightGrid : grid<number>
 * - a grid where each element is the depth (layer-index) in which the block at the local
 * coordinate ( region(x,y)->grid(x,y) ) has direct LOS ( line of sight ) with the sky
 */
export class Region extends Storable{
	meshGroup: RegionMesh;
	dictionary: Dictionary = new Dictionary();
	lightGrid!: Grid<number>;
	layers: Layer[] = [];
	entities: any[] = [];
	actorBlocks: MapObject[] = [];
	eventEmitter:RegionEventEmitter = new RegionEventEmitter();
	world:World;
	size: number;
	requiresUpdate:boolean=true;
	requiresMeshUpdate:boolean=true;
	updateQueued:boolean = true;
	modelData:any = {};

	/**
	 * produces a region of size x size x height
	 * @param size sidelength of the region
	 * @param world the world that this region inhabits
	 */
	constructor( world:World ){
		super();
		this.size = world.chunkSize;
		this.world = world;
		this.meshGroup = new RegionMesh( this );
		this.world.ff.add(this.meshGroup);
		this.generateTerrain();
	}

	meshUpdate(){}

	update(){
		this.updateQueued = false;
	}

	generateTerrain(){
		// Generate the terrain
		this.layers.push( new Layer(this.size, 0) );
		this.lightGrid = new Grid<number>(this.size, ()=>{return 0;});
		this.requestUpdate();
	}

	requestUpdate(){
		if(!this.updateQueued){
			this.world.queueUpdate(this);
		}
	}

	getBlock( x:number, y:number, z:number ):BlockData{
		return this.layers[z].getBlock(x,y);
	}

	clearMeshGroup(){
		while(this.meshGroup.children.length){
			this.meshGroup.remove(this.meshGroup.children[0]);
		}
	}

	/**
	 * Get the local transformation of a position
	 * @param pos 
	 */
	getLocalTransform(pos:THREE.Vector3):THREE.Matrix4{
		return new THREE.Matrix4().makeTranslation(pos.x||0,pos.z||0,pos.y||0);
	}

	/**
	 * Builds the mesh and adds it to the world's scene
	 * Ideally, this will be optimized with rust.
	 * @optimize
	 */
	constructMesh():void{
		this.modelData = {};
		this.clearMeshGroup();
		this.layers.map((layer)=>{
			return layer.generateModelData( this.modelData );
		});

		// Use the modelData to construct the appropriate meshes
		// and append them to this.meshGroup
		console.log(this.modelData);
		Object.keys(this.modelData).map((modelKey,i)=>{
			let [namespace,regName,modelName,discriminator] = [...modelKey.split(":"),"0"];
			let model = regHub.get(`${namespace}:${regName}:${modelName}`);
			let positions = this.modelData[modelKey];
			let mesh = <THREE.InstancedMesh>model.construct( positions, parseInt( discriminator ) );
			
			//mesh.matrixWorldNeedsUpdate=true;
			//mesh.instanceMatrix.needsUpdate=true;
			//mesh.instanceMatrix.needsUpdate=true;
	
			//mesh.instanceMatrix.
			//mesh.translateY(i*0.2);
			this.meshGroup.add(mesh);
		}, this);
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

	/** Storable overloads begin*/

	toStorageObject(){
		return { layers:this.layers, entities:this.entities, dictionary:this.dictionary, lightGrid:this.lightGrid }
	}

	/** Storable overloads end */

}