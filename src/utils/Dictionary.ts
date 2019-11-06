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