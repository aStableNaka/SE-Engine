import { Storable } from "../io/Storable";
import { ItemData } from "../environment/items/Item";

/**
 * Anything can have an inventory. The inventory is just
 * an interface for item storage.
 * 
 * The invnetory provides operations for transporting
 * items.
 */
class Inventory extends Storable{
	contents:any[];
	size: number;
	constructor( size:number ){
		super();
		this.size = size;
		this.contents = [];
	}


	addItem(itemData:ItemData){
		this.contents
	}

}