import { MapObject } from '../MapObject';
import { Storable } from '../../io/Storable';
import * as Space from '../../utils/Spaces';
import * as Regions from '../region/Region';
import { BlockRegistry } from './BlockRegistry';


export type baseClass = Function & { module:string, blockId:string };

/**
 * Blocks are *small* representations of objects which form the environment
 */
export class Block extends Storable{
	// These two must be defined for every different block type
	static module:string = "base";
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
	
	static toStorageObject(){
		return { type:this.name };
	}

	// Storable definitions
	toStorageObject(){
		return { className:this.constructor.name };
	}
}

export class BlockData extends Storable{
	baseClass: any;
	data: any;
	constructor( baseClass:baseClass, data?:any ){
		super();
		this.baseClass = baseClass;
		this.data = data;
	}

	// Storable definitions
	toStorageObject(){
		return { baseClass:this.baseClass, data:this.data };
	}
}