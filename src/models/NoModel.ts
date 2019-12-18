import {Model} from "./Model";

export class NoModel extends Model{
	constructor( name: string ){
		super( name, {} );
	}

	/**
	 * Return an empty object
	 * @param positions 
	 * @param discriminator 
	 */
	construct( positions:THREE.Vector4[], discriminator:number ):null{
		return null;
	}
}