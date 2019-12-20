import { BlockFactory, BlockData } from "../Block";

/**
 * BlockEmpty should be used in place of blocks "don't exist"
 */
export class BlockEmpty extends BlockFactory{
	static model: string = "base:model:None";

	constructor(){
		super();
	}

	public static createBlockData(){
		return new BlockData( BlockEmpty );
	}
}