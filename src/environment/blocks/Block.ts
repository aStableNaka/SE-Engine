import { MapObject } from '../MapObject';
import { Storable } from '../../io/Storable';
import * as Space from '../../utils/Spaces';
import * as Regions from '../Region';
import { BlockRegistry } from './BlockRegistry';

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
	
	// Storable definitions
	toStorageObject(){
		return { className:this.constructor.name };
	}
}