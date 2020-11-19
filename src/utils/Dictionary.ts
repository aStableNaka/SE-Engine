import { Serializer } from "../io/Serializer";


/**
 * 
 */
export class Dictionary{
	entries: any = {};
	constructor(){}

	add( entryName:string, entryValue:any ){
		this.entries[entryName] = entryValue;
	}

	remove( entryName:string ){
		delete this.entries[entryName];
	}

	get( entryName:string ){
		return this.entries[entryName];
	}
}

export class DictionarySerializer extends Serializer<Dictionary>{
	constructor(){
		super( Dictionary );
	}

	dataMapping( instance: Dictionary ){
		return {
			type: "Dictionary",
			entries: Object.keys(instance.entries).map( ( key )=>{
				return [key, instance.entries[key] ];
			}),
		}
	}
}

new DictionarySerializer();