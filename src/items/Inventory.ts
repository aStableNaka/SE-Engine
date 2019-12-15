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
	contents:ItemData[] | null[];
	size: number;
	constructor( size:number ){
		super();
		this.size = size;
		this.contents = new Array(size).fill(null);
	}

	/**
	 * Add an item to this inventory. Returns null
	 * if adding the item resulted in no overflows.
	 * @param itemData 
	 */
	addItem(itemData:ItemData):ItemData|null{
		// the itemDatas that can merge this itemData
		let matchedItemDatas = this.contents.filter(( storedItemD )=>{
			return storedItemD && storedItemD.equals(itemData) && storedItemD.freeSlots();
		});

		if(matchedItemDatas.length){
			matchedItemDatas.map( (storedItemD)=>{
				if(!itemData.amount) return;
				// how much of the item will be taken away from itemData
				let take = Math.max(itemData.amount, itemData.amount - storedItemD.freeSlots());
				itemData.amount -= take;
			});
		}

		// Returns leftover itemData if item could
		// not be appended to this inventory
		if(itemData.amount){
			return this.push(itemData);
		}

		// Returns nothing if the item was successfully appended
		return null;
	}

	/**
	 * Push an item to the first
	 * available inventory slot.
	 * 
	 * if no inventory slots are 
	 * available, this returns
	 * the itemData.
	 * @param itemData 
	 */
	push(itemData:ItemData){
		let availableIndex = this.contents.findIndex((x)=>!x);
		if(availableIndex>-1){
			this.contents[availableIndex] = itemData;
		}else{
			return itemData;
		}
	}

}