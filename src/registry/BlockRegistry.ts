import { BlockFactory, BlockData } from "../environment/blocks/Block";
import { baseClass } from "../utils/Classes";
import {Registry} from "./Registry";

export type IBlockBase = baseClass & {
	blockId:string,
	createBlockData:Function,
	restateBlockData:Function
};

export class BlockRegistryComponent{
	baseClass:IBlockBase;
	forceRegister:boolean;
	identities:baseClass[];

	constructor( baseClass:any, forceRegister:boolean ){
		this.baseClass = baseClass;
		this.forceRegister = forceRegister;
		this.identities = [];
	}

	replaceIdentity( newbaseClass:any ){
		this.addIdentity( this.baseClass );
		this.baseClass = newbaseClass;
	}

	addIdentity( baseClass:any ){
		this.identities.push( baseClass );
	}
}

/**
 * The block registry is used to assign block to their typeName
 */
export class BlockRegistry implements Registry{
	blocks:any = {};
	list:BlockRegistryComponent[] = [];
	name:string;
	constructor( name:string="anonymous" ){
		this.name = name;
	}

	get logTag():string{
		return `[ BlockRegistry:${this.name} ]`;
	}

	/**
	 * Register a block inside the block registry
	 * @param baseClass {IBlockBase} 
	 * @param forceRegister force the registry to override the old block
	 */
	register( baseClass: IBlockBase, forceRegister:boolean=false ):string{
		let blockID:string = baseClass.blockId;

		if( this.blocks[blockID] ){
			// If a block has already been registered and forceRegister is false
			if(!forceRegister){
				console.warn( `${this.logTag} ${blockID} has already been registered, it will not be replaced.` );
				this.blocks[blockID].addIdentity( baseClass );
			}else{
				console.warn( `${this.logTag} ${blockID} has already been registered, it will be replaced.` );
				this.blocks[blockID].replaceIdentity( baseClass );
			}
			return "";
		}
		console.log(`${this.logTag} ${blockID} has been registered.`);
		let rc = new BlockRegistryComponent( baseClass, forceRegister );
		this.blocks[blockID] = rc;
		this.list.push(rc);
		
		return blockID;
	}

	/**
	 * Get the registry component of a block from its ID
	 * @param blockId 
	 * @example
	 * baseRegistry.get("base:BlockNull") // [ Object BlockRegistryComponent ]
	 */
	get( blockId:string ):BlockRegistryComponent{
		if( this.blocks[blockId] ){
			return this.blocks[blockId];
		}else{
			// Check again in case blockID is in shorthand, return the first result or throw if a block is not available
			let searchResults = Object.keys( this.blocks ).filter( ( name )=>{
				return name.split(':')[1]==blockId;
			});
			if(!searchResults[0]){
				throw new Error( `${this.logTag} block "${blockId}" has not been registered.` );
			}
			return this.blocks[searchResults[0]];
		}
	}

	/**
	 * Get a block class from its ID
	 * @param blockId 
	 * @example
	 * baseRegistry.getBlockClass("base:BlockNull") // [ Object BlockNull ]
	 */
	getBlockClass( blockId:string ):IBlockBase{
		return this.get(blockId).baseClass;
	}

	/**
	 * Create new block data using a block ID
	 * @param blockId 
	 * @example
	 * baseRegistry.createBlockData("base:BlockNull") // [ Object BlockData ]
	 */
	createBlockData( blockId:string, parameters?:any ):BlockData{
		return this.getBlockClass(blockId).createBlockData( parameters );
	}

	/**
	 * BlockRegistry does not do any async loading
	 * therefore it is ready as soon as it's added
	 * to the registry hub.
	 * @param ready 
	 */
	checkReady(ready:()=>void){
		ready();
	}
}