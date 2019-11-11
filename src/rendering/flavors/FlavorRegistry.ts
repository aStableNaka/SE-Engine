import { Flavor } from "./Flavor";
import { RegistryComponent } from "../../utils/Registry";
import { baseClass } from "../../utils/Classes";

/**
 * The block registry is used to assign block to their typeName
 */
export class FlavorRegistry{
	blocks:any = {};
	name:string;
	constructor( name:string="anonymous" ){
		this.name = name;
	}

	get logTag():string{
		return `[ FlavorRegistry:${this.name} ]`;
	}

	/**
	 * Register a block inside the block registry
	 * @param baseClass {baseClass} 
	 * @param forceRegister force the registry to override the old block
	 */
	register( baseClass: Flavor, forceRegister:boolean=false ){
		let blockID:string = baseClass.flavorId;

		if( this.blocks[blockID] ){
			// If a block has already been registered and forceRegister is false
			if(!forceRegister){
				console.warn( `${this.logTag} ${blockID} has already been registered, it will not be replaced.` );
				this.blocks[blockID].addIdentity( baseClass );
			}else{
				console.warn( `${this.logTag} ${blockID} has already been registered, it will be replaced.` );
				this.blocks[blockID].replaceIdentity( baseClass );
			}
			return;
		}
		console.log(`${this.logTag} ${blockID} has been registered.`);
		this.blocks[blockID] = new RegistryComponent( baseClass, forceRegister );
		
	}

	get( blockID:string ):Flavor{
		if( this.blocks[blockID] ){
			return this.blocks[blockID];
		}else{
			// Check again in case blockID is in shorthand, return the first result or throw if a block is not available
			let searchResults = Object.keys( this.blocks ).filter( ( name )=>{
				return name.split(':')[1]==blockID;
			})
			if(!searchResults[0]){
				throw new Error( `${this.logTag} flavor "${blockID}" has not been registered.` );
			}
			return this.blocks[searchResults[0]];
		}
	}
}