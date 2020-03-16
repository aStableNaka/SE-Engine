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
 * A high level container for partitioning blocks
 */
export class Region extends Storable{
	/**
	 * The region position in world space coordinates, assigned by the world generator
	 */
	position: THREE.Vector2;

	/**
	 * A mesh group that contains everything in the region, for ease of transformation
	 * and render partitioning
	 */
	meshGroup: RegionMesh;
	dictionary: Dictionary = new Dictionary();

	/**
	 * Used to determine if a block has LOS of the "sky" and other tidbits
	 */
	lightGrid!: Grid<number>;
	layers: Layer[] = [];

	/**
	 * Entities that enter this region will be "transfered" from their previous region, to this region
	 */
	entities: any[] = [];

	/**
	 * Contains all actor blocks located within this region for ease of iteration
	 * 
	 * Actor blocks are defined as blocks that are autonomous and can perform
	 * their own operations on any determined tick basis
	 */
	actorBlocks: MapObject[] = [];
	eventEmitter:RegionEventEmitter = new RegionEventEmitter();

	/**
	 * A reference to the parent world object
	 */
	world:World;

	/**
	 * The width and length of a region
	 */
	size: number;


	requiresUpdate:boolean=true;
	requiresMeshUpdate:boolean=true; // Used for initialization
	updateQueued:boolean = true;
	modelData:any = {};

	/**
	 * Ideally, this region will not be used until this is true
	 */
	loaded:boolean=false;
	modified:boolean=false;

	/**
	 * A mesh that serves as a non-null value for the scene to render in place
	 * of the region's meshGroup in case the renderer decides to act before
	 * the meshGroup is generated
	 */
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
		//this.constructMesh();
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
	 * Reconstructs modelMeshes that have been updated
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

	/**
	 * Forces reconstruction of all modelMeshes. Useful for when modelMeshes
	 * break, but also very expensive.
	 */
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

	/**
	 * Get a block at a specific location in world-space
	 * @param x 
	 * @param y 
	 * @param z 
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

	/**
	 * Clears every child of the meshGroup
	 */
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
		if(!this.requiresMeshUpdate){ return; }
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
		this.loaded = true;
		//this.meshGroup.remove(this.placeHolderMesh);

		this.requiresMeshUpdate = false;
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