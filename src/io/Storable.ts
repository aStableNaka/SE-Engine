/**
 * A storable object is an object that
 * has methods for converting its own
 * data into a format meant for saving
 * 
 * as well as methods for loading
 * and an identifier
 */
export class Storable{
	type: string;
	constructor(){
		this.type = this.constructor.name;
	}
	
	toStorageObject():any{
		return {};
	}

	// Converts this object into a json string
	toString():string{
		return JSON.stringify( this.toStorageObject() );
	};

	// Converts storable to a buffer object
	toBuffer():Buffer{
		return new Buffer(0);
	};

	// Transfers buffer data from a storable object
	fromBuffer( buffer:Buffer ):void{

	};
}
