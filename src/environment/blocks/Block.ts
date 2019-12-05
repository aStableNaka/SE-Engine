import { MapObject } from '../MapObject';
import { Storable } from '../../io/Storable';
import { baseClass as BlockBaseClass } from '../../utils/Classes';
import * as Space from '../../utils/Spaces';
import * as Regions from '../region/Region';
import { BlockRegistry } from '../../registry/BlockRegistry';
import * as THREE from 'three';

export type Geometry = THREE.Geometry | THREE.BufferGeometry | THREE.InstancedBufferGeometry;

/**
 * Blocks are *small* representations of objects which form the environment
 */
export class Block extends Storable{
	// These two must be defined for every different block type
	static module:string = "base";
	static material:string = "base:mat:none";
	static model: string = "base:model:none";
	static noModel:boolean = true;
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

	static createBlockData(data?:any):BlockData{
		return new BlockData(this, data);
	}

	/**
	 * Creates new BlockData but recalls old BlockData
	 * 
	 * Called by the BlockBaseClass, typically retrived from a
	 * BlockRegistry
	 * @param blockData 
	 */
	static recallBlockData(blockData:BlockData):BlockData{
		let recalledBD:BlockData = this.createBlockData();
		recalledBD.data = blockData.data;
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
	constructor( baseClass:BlockBaseClass, data?:any ){
		super();
		this.baseClass = baseClass;
		this.data = data;
	}

	// Storable definitions
	toStorageObject():{blockId:string,data:any}{
		return { blockId:this.baseClass.blockId, data:this.data };
	}

	getModelKey():string{
		return this.baseClass.getModelKey( this );
	}
}

/**
 * Each block should know which vertecies it represents
 * within a region mesh. This is for doing culling
 */