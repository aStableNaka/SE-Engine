import { Verbose } from "../utils/Verboosie";

/**
 * Used for analysis
 */
export type compressionMeta = {
	/**
	 * The difference in size of uncompressed and compressed
	 * data
	 */
	diff: number,
}

export type compressedData = {
	compressed?:boolean,
	meta?:compressionMeta,
}


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
	
	/** 
	 * Returns an object that can be turned into JSON
	 * @virtual
	 * @required
	 */
	public toStorageObject():any{
		return {};
	}

	/**
	 * @virtual
	 */
	public fromString():void{

	}

	/**
	 * @virtual
	 * Compress the Storable.data whenever it's requested as a string
	 * 
	 * Compressed data is assumed to be a final-stop for deep-serialization
	 * 
	 * @param data the output of this.toStorageObject()
	 */
	public compress(data:any):any{
		return this.toStorageObject();
	}

	/**
	 * @virtual
	 * Decompress the input data and assign the values to their appropriate places
	 * @param data the output of this.compress(...)
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

	public processSelf( compress:boolean=false ):any{
		const so = this.toStorageObject();
		return this.deepDough( so, compress );
	}

	private processObject( data:any, compress:boolean=false ):any{
		/**
		 * If the data is already compressed, there are no
		 * more instances to process.
		 */
		if(data.compressed){
			return data;
		}
		let out:any = {};
		Object.keys(data).map((key)=>{
			if(!data[key]){ return; }
			if(data[key].toStorageObject){
				out[key] = this.deepDough(data.toStorageObject(), compress);
			}else{
				//out[key] = this.deepDough(data[key], compress);
			}
		})
		if(compress && data.compress){
			const n = data.compress(out);
			n.compressed = true;
			return n;
		}
		
		return out;
	}

	/* processing property values that are arrays */
	private processArray(data:any[], compress:boolean=false):any{
		console.log(data);
		return data.map((element)=>{
			return this.deepDough(element, compress);
		})
	}

	/**
	 * Converts this object into a json string
	 * @param compress enable compression of the data
	 */
	public toString(compress:boolean=false):string{
		let obj = this.toStorageObject();
		obj = this.processObject(obj, compress);
		return JSON.stringify( obj )
	};

	// Converts serializable to a storable form
	public serialize( compress:boolean = false ):Buffer{
		return new Buffer(this.toString( compress ));
	};

	// Converts serialized data into a workable form
	public deserialize( buffer:Buffer ):void{

	};

	/**
	 * Just a wrapper for easier logging
	 * @param data 
	 * @param id 
	 * @param vLevel 
	 */
	public log( data: string, id?: string, vLevel:number = 4 ):void{
		Verbose.log( data, id, vLevel );
	}
}
