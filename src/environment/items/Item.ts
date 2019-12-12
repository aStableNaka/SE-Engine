import { Storable } from "../../io/Storable";
import {baseClass} from "../../utils/Classes";

export type ItemBaseClass = baseClass & {itemId:string};

export class Item extends Storable{
	static module:string = "base";
	static icon:string = "base:icon:missingItemIcon";

	static get itemId(){
		return `${this.module}:${this.name}`;
	}

	toStorageObject(){
		return { className:this.constructor.name };
	}

	/**
	 * Create this item data
	 */
	static createItemData( metaData:any ){}
}

export class ItemData extends Storable{
	baseClass: ItemBaseClass;
	data: any;
	constructor(baseClass:ItemBaseClass, data?:any){
		super();
		this.baseClass = baseClass;
		this.data = data;
	}

	toStorageObject(){
		return {baseClass:this.baseClass.itemId, data:this.data }
	}
}