import * as Item from "../../items/item";

export class Stockpile{
	
	// The items allowed in this stockpile
	filter: Item.ITEM_TAGS[];

	// The items contained within this stockpile
	inventory: Item.ItemData[] = [];

	// The maximum amount of item stacks within this stockpile
	maxCapacity: number;

	constructor( maxCapacity: number, filter: Item.ITEM_TAGS[] ){
		this.filter = filter;
		this.maxCapacity = maxCapacity;
	}


}