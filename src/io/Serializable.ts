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
	public toStorageObject():any{
		return {};
	}

	/** @virtual */
	public fromString():void{

	}

	/**
	 * @virtual
	 * Compress the Storable.data whenever it's requested as a string
	 * @param data 
	 */
	public compress(data:any):any{
		return data;
	}

	/**
	 * @virtual
	 * Decompress the input data and assign the values to their appropriate places
	 * @param data 
	 */
	public decompress(data:any):void{
		return;
	}

	/* recursive data property value processing */
	private deepDough( data:any, compress:boolean=false ):any{
		/* If for any reason, the property value is undefined */
		if(!data){
			return data;
		}
		
		/* if the property value is an array */
		if(Array.isArray(data)){
			return this.processArray(data, compress);
		}

		/* if the property value is an object */
		if(typeof(data)=='object'){
			return this.processObject(data, compress);
		}
		return data;
	}

	private processObject( data:any, compress:boolean=false ):any{
		let out = data;
			Object.keys(data).map((key)=>{
				if(!data[key]){ return; }
				if(data[key].toStorageObject){
					out[key] = this.deepDough(data.toStorageObject(), compress);
				}else{
					out[key] = this.deepDough(data[key], compress);
				}
			})
			if(compress && data.compress){
				return data.compress(out);
			}
			
			return out;
	}

	/* processing property values that are arrays */
	private processArray(data:any[], compress:boolean=false):any{
		return data.map((element)=>{
			return this.deepDough(element, compress);
		})
	}

	// Converts this object into a json string
	public toString(compress:boolean=false):string{
		let obj = this.toStorageObject();
		obj = this.processObject(obj, compress);
		if(compress){
			obj = this.compress(obj);
		}
		return JSON.stringify( obj )
	};


	// Converts serializable to a storable form
	public serialize():Buffer{
		return new Buffer(0);
	};

	// Converts serialized data into a workable form
	public deserialize( buffer:Buffer ):void{

	};
}
