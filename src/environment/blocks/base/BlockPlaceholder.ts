import {BlockFactory, Geometry, BlockData} from "../Block";

/**
 * Placeholder blocks hold the place of multiblocks.
 * 
 * Placeholders cannot be interacted with, but simply
 * represent a block position that is occupied.
 */
class BlockPladeholder extends BlockFactory{
	static model: string = "base:model:None";

	constructor(){
		super();
	}
}