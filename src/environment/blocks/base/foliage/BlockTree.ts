import { BlockFactory, Geometry, BlockData } from "../../Block";
import { BlockVariantFoliageData } from "./BlockFoliage";

export class BlockTree extends BlockFactory{
	static model:string = "base:model:TreeSakura0";
	static noModel = false;

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockVariantFoliageData{
		return new BlockVariantFoliageData( this );
	}

	static getModelKey( blockData:BlockData ):string{
		return this.model;
		//return `${this.model}:${blockData.data||0}`;
	}
}