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

	/**
	 * @virtual
	 * Compress the Storable.data whenever it's requested as a string
	 * @param data 
	 */
	compress(data:any):any{
		return data;
	}

	/**
	 * @virtual
	 * Decompress the input data and assign the values to their appropriate places
	 * @param data 
	 */
	decompress(data:any):void{
		return;
	}

	// Converts this object into a json string
	toString(compress:boolean=false):string{
		let obj = this.toStorageObject();

		/* if the property value is an array */
		function processArray(data:any[]){
			return data.map((element)=>{
				return deepDough(element);
			})
		}
		
		/* if the property value is an object */
		function processObject(data:any, compress:boolean=false):any{
			let out = data;
			Object.keys(data).map((key)=>{
				if(!data[key]){ return; }
				if(data[key].toStorageObject){
					out[key] = deepDough(data.toStorageObject());
				}else{
					out[key] = deepDough(data[key]);
				}
			})
			if(compress && data.compress){
				return data.compress(out);
			}
			
			return out;
		}

		/* recursive data processing */
		function deepDough(data:any):any{
			/* If for any reason, the property value is undefined */
			if(!data){
				return data;
			}
			
			/* if the property value is an array */
			if(Array.isArray(data)){
				return processArray(data);
			}

			/* if the property value is an object */
			if(typeof(data)=='object'){
				return processObject(data, compress);
			}
			return data;
		}

		obj = processObject(obj);
		if(compress){
			obj = this.compress(obj);
		}
		return JSON.stringify( obj )
	};

	

	// Converts storable to a buffer object
	toBuffer():Buffer{
		return new Buffer(0);
	};

	// Transfers buffer data from a storable object
	fromBuffer( buffer:Buffer ):void{

	};
}
