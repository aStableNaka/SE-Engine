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
	
	/** @virtual */
	toStorageObject():any{
		return {};
	}

	/** @virtual */
	fromString():void{

	}

	/** @virtual compress the data */
	compress(data:any):void{
		return data;
	}

	/** @virtual decompress the data */
	decompress(data:any):void{
		return data;
	}

	// Converts this object into a json string
	toString():string{
		let obj = this.toStorageObject();
		function deepDough(data:any):any{
			/* If for any reason, the property value is undefined */
			if(!data){
				return data;
			}

			if(typeof(data)=='object'){
				Object.keys(data).map((key)=>{
					data[key] = deepDough(data[key]);
				});
			}

			/* if the property value is an object */
			if(data.toStorageObject){
				return data.toStorageObject();
			}

			/* if the property value is an array */
			else if(Array.isArray(data)){
				return data.map(deepDough);
			}

			return data;
		}

		Object.keys(obj).map((key)=>{
			obj[key] = deepDough(obj[key]);
		});
		
		return JSON.stringify( this.compress( obj ) )
	};

	

	// Converts storable to a buffer object
	toBuffer():Buffer{
		return new Buffer(0);
	};

	// Transfers buffer data from a storable object
	fromBuffer( buffer:Buffer ):void{

	};
}
