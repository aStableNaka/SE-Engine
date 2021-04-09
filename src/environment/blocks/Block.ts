import { MapObject } from '../MapObject';
import { Storable } from '../../io/Storable';
import { baseClass as BlockBaseClass } from '../../utils/Classes';
import { BlockBoundingBox } from "../../controls/cursor/BlockBoundingBox";
import * as THREE from 'three';
import { Vector3 } from 'three';
import { ContextMenu, ContextMenuAction } from '../../controls/ContextMenu';
import { World } from '../world/World';

export type Geometry = THREE.Geometry | THREE.BufferGeometry | THREE.InstancedBufferGeometry;

export enum Facing{
	NORTH = 0,
	WEST = 1,
	SOUTH = 2,
	EAST = 3
}

export class BlockContextMenuAction extends ContextMenuAction{
	constructor( callback: (blockData: BlockData, world: World )=>void, domain: string ){
		super( callback, domain );
	}
}

/**
 * BlockFactories produce BlockDatas
 */
export class BlockFactory extends Storable{
	// These two must be defined for every different block type
	static module:string = "base";
	static material:string = "base:mat:none";
	static model: string = "base:model:none";
	static noModel:boolean = true;
	static miniMapColorDictionary = new Map<string, THREE.Color>();
	
	static boundingBox: BlockBoundingBox = new BlockBoundingBox( new THREE.Vector3(1,1,1) );

	static contextMenu: ContextMenu = new ContextMenu( "block:base", "Block", [], false );

	static harvestTime: number = 20; // Ticks
	
	/**
	 * Create a new block instance. Unique
	 * static blocks share a single instance,
	 * unique blocks have their own individual
	 * instances.
	 */
	constructor(){
		super();
	}

	static get blockId():string{
		return  `${this.module}:${this.name}`
	}

	static createBlockData(data?:any, pos?:THREE.Vector3):BlockData{
		return new BlockData(this, data);
	}

	static getModel( blockData:BlockData, pos:THREE.Vector3 ){
		return this.model;
	}

	/**
	 * Creates new BlockData using old serialized BlockData
	 * 
	 * Called by the BlockBaseClass, typically retrived from a
	 * BlockRegistry
	 * @param blockData 
	 */
	static restateBlockData(blockData:BlockData):BlockData{
		let recalledBD:BlockData = this.createBlockData();
		recalledBD.data = blockData.data;
		return recalledBD;
	}
	
/**
	 * Creates new BlockData but recalls old BlockData
	 * 
	 * Called by the BlockBaseClass, typically retrived from a
	 * BlockRegistry
	 * @param blockData 
	 */
	static recallUniqueData(uniqueData:any):BlockData{
		let recalledBD:BlockData = this.createBlockData();
		recalledBD.uniqueData = uniqueData;
		return recalledBD;
	}

	static toStorageObject(){
		return { type:this.name, blockId:this.blockId };
	}

	constructGeometry( blockData:BlockData ):Geometry{
		throw new Error("[ Block ] Abstract class [Object Block] has no constructable geometry.");
		return new THREE.Geometry();
	}

	// Storable definitions
	toStorageObject(){
		return { className:this.constructor.name };
	}

	/**
	 * Retrieves model key based on blockData (if used);
	 * @param blockData 
	 */
	static getModelKey( blockData:BlockData ){
		return this.model;
	}

	/**
	 * Use miniMapColorDictionary whenever available
	 * @param blockData 
	 * @override
	 */
	static getMinimapColor( blockData: BlockData ){
		return [0,0,0,0];
	}
}

export interface blockMountEvent{
	position:Vector3;
}

/**
 * BlockData is a lightweight representation
 * of a block within the world.
 * @property baseClass - the base class of the block
 * @property data - other data for the block
 */
export class BlockData extends Storable{
	baseClass: any;
	data: any;
	matrixIndex:number = 0;
	position!: THREE.Vector3;

	uniqueData:any = {};

	constructor( baseClass:BlockBaseClass, data?:any ){
		super();
		this.baseClass = baseClass;
		this.data = data;
	}

	assignMatrixIndex( n:number ){
		this.matrixIndex = n;
	}

	/**
	 * By default, look for the rotation property the
	 * blockData's parameters
	 */
	getRotation():number{
		if(this.data && this.data.rotation){
				return this.data.rotation * Math.PI/2;
		}
		return Facing.NORTH;
	}

	// Storable definitions
	toStorageObject():{}{
		return { blockId:this.baseClass.blockId, data:this.data, uniqueData: this.uniqueData };
	}

	getModelKey():string{
		return this.baseClass.getModelKey( this );
	}

	getBaseModelKey():string{
		return this.getModelKey().split(":").filter((s,i)=>{return i<3}).join(":");
	}

	get blockId(){
		return this.baseClass.blockId;
	}

	public blockDidMount( bme:blockMountEvent ):void{
		this.position = bme.position;
	}
}

/**
 * Each block should know which vertecies it represents
 * within a region mesh. This is for doing culling
 */