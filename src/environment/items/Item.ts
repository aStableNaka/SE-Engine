import { Storable } from "../../io/Storable";
import {baseClass} from "../../utils/Classes";

export type ItemBaseClass = baseClass & {
	itemId:string,
	parseData:(data:any)=>any,
	stackSize:number
};

export enum ITEM_TAGS{
	CHUNKS,
	RAW_MATERIALS,
	FOOD,
	CLOTHING
}

console.log( Object.keys(ITEM_TAGS) );

export class Item extends Storable{
	static module:string = "base";
	static icon:string = "base:icon:missingItemIcon";
	static stackSize:number = 250;
	static get itemId(){
		return `${this.module}:${this.name}`;
	}

	toStorageObject(){
		return { className:this.constructor.name };
	}

	static parseData( data:any ){
		return data;
	}

	/**
	 * Create this item data
	 */
	static createItemData( paramData:any ){}
}

export class ItemData extends Storable{
	baseClass: ItemBaseClass;
	data: any;
	amount:number = 0;
	maxCapacity: number;
	position: THREE.Vector2;
	constructor(baseClass:ItemBaseClass, position: THREE.Vector2, data?:any, amount:number=0){
		super();
		this.baseClass = baseClass;
		this.data = this.baseClass.parseData(data);
		this.amount = amount;
		this.position = position;
		this.maxCapacity = this.baseClass.stackSize;
	}
	
	get hasInsertsAvailable(){
		return this.amount != this.maxCapacity;
	}

	/**
	 * Compares two itemDatas
	 * @param itemData 
	 */
	equals(itemData:ItemData){
		return this.baseClass === itemData.baseClass && this.data == itemData.data;
	}

	/**
	 * Returns how many more of this item can be contained within this
	 * itemData
	 */
	freeSlots():number{
		return Math.max(0, this.baseClass.stackSize - this.amount );
	}

	equalsInstance(itemData:ItemData){
		return itemData === this;
	}

	toStorageObject(){
		return {baseClass:this.baseClass.itemId, data:this.data }
	}
}