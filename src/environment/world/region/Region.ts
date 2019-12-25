import { RegionMesh } from '../../../rendering/region/RegionMesh';
import { MapObject } from '../../MapObject';
import { CreateGrid, Position, Grid } from '../../../utils/Spaces';
import {EventEmitter} from 'events';
import { PositionalAudio, Vector4, Matrix4, Vector3 } from 'three';
import { Dictionary } from '../../../utils/Dictionary';
import { World } from '../World';
import { Layer } from './Layer';
import { BlockFactory, BlockData } from '../../blocks/Block';
import { Storable } from '../../../io/Storable';
import { regHub } from '../../../registry/RegistryHub';
import * as THREE from "three";
import { ModelInstancedMesh, ModelInstanceData, Model } from '../../../models/Model';

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

const placeHolderMeshMaterial = new THREE.MeshBasicMaterial({color:0xffffff});

/**
 * @property lightGrid : grid<number>
 * - a grid where each element is the depth (layer-index) in which the block at the local
 * coordinate ( region(x,y)->grid(x,y) ) has direct LOS ( line of sight ) with the sky
 */
export class Region extends Storable{
	position: THREE.Vector2;
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

	loaded:boolean=false;
	modified:boolean=false;

	placeHolderMesh:THREE.Mesh;

	/**
	 * Keeps track of how many times this region gets
	 * added and removed from the scene
	 */
	renderLoads:number = 0;
	renderUnloads:number = 0;

	/**
	 * produces a region of size x size x height
	 * @param size sidelength of the region
	 * @param world the world that this region inhabits
	 */
	constructor( world:World, location:THREE.Vector2 ){
		super();
		this.position = location;
		this.size = world.chunkSize;
		this.world = world;
		this.meshGroup = new RegionMesh( this );
		this.placeHolderMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(this.world.chunkSize, 1, this.world.chunkSize), placeHolderMeshMaterial);
		this.placeHolderMesh.name = "placeholder";
		this.generateTerrain();
	}

	addToWorld(){
		this.world.ff.add(this.meshGroup);
		this.renderLoads++;
	}

	removeFromWorld(){
		this.world.ff.remove(this.meshGroup);
		this.renderUnloads++;
	}

	meshUpdate(){}

	/**
	 * Looks for constructed model
	 */
	private reconstructModelMeshGroups(): void{
		(<ModelInstanceData[]>Object.values(this.modelData)).map((modelInstanceData:ModelInstanceData)=>{
			if(modelInstanceData.needsUpdate){
				let constructedMesh = this.meshGroup.children.find((o3d)=>o3d.name==modelInstanceData.modelKey);
				if(constructedMesh){
					this.meshGroup.remove(constructedMesh);
					//console.log(constructedMesh);
				}
				this.constructModelMesh( modelInstanceData );
				modelInstanceData.needsUpdate = false;
			}
		}, this);
	}

	public forceMeshReconstruct(){
		(<ModelInstanceData[]>Object.values(this.modelData)).map((modelInstanceData:ModelInstanceData)=>{
			let constructedMesh = this.meshGroup.children.find((o3d)=>o3d.name==modelInstanceData.modelKey);
			if(constructedMesh){
				this.meshGroup.remove(constructedMesh);
				//console.log(constructedMesh);
			}
			this.constructModelMesh( modelInstanceData );
			modelInstanceData.needsUpdate = false;
		}, this);
	}

	/**
	 * Iterates through model data searching for model instances that need updating.
	 */
	update(){
		this.updateQueued = false;
		this.reconstructModelMeshGroups();
	}

	generateTerrain(){
		// Generate the terrain
		this.layers.push( new Layer(this, 0) );
		this.lightGrid = new Grid<number>(this.size, ()=>{return 0;});
		this.requestUpdate();
	}

	/**
	* Queues an update for the next tick
	*/
	requestUpdate(){
		if(!this.updateQueued){
			this.world.queueUpdate(this);
		}
	}

	/*
		Region manipulation
	*/

	getBlock( x:number, y:number, z:number ):BlockData|null{
		return this.layers[z].getBlock(x,y);
	}

	/**
	 * Set the block data at location x,y,z
	 * @param blockData 
	 * @param x 
	 * @param y 
	 * @param z layer index
	 */
	setBlock(blockData:BlockData, x:number, y:number, z:number){
		let layer = this.layers[z];
		if(!layer) throw new Error(`[Region] layer ${z} does not exist`);
		layer.setBlock(blockData, x, y);
		this.requestUpdate()
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
		//console.log(this.modelData);
		(<ModelInstanceData[]>Object.values(this.modelData)).map((modelInstanceData)=>{
			this.constructModelMesh(modelInstanceData);
		}, this);
		//this.meshGroup.remove(this.placeHolderMesh);
	}

	/**
	 * Constructs the mesh for a single model type
	 * @param modelInstanceData 
	 */
	constructModelMesh( modelInstanceData:ModelInstanceData ){
		let modelKey = modelInstanceData.modelKey;
		let [namespace,regName,modelName,discriminator] = [...modelKey.split(":"),"0"];
		let model = <Model>regHub.get(`${namespace}:${regName}:${modelName}`);
		let positions = this.modelData[modelKey].contents;
		let object3D = < THREE.Object3D | null >model.construct( positions, parseInt( discriminator ) );
		if( object3D ){
			object3D.name = modelKey;
			this.meshGroup.add(object3D);
			let self = this;
		}
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
		return { layers:this.layers, entities:this.entities, dictionary:this.dictionary, lightGrid:this.lightGrid, renderLoads:this.renderLoads, renderUnloads:this.renderUnloads }
	}

	/** Storable overloads end */

}