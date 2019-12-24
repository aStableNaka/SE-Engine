import { BlockFactory, Geometry, BlockData } from "../../Block";
import * as THREE from "three";
import { BlockVariantData } from "../BlockVariantData";
import { baseClass as BlockBaseClass } from '../../../../utils/Classes';

export class BlockVariantFoliageData extends BlockVariantData{
	constructor( baseClass:BlockBaseClass, variant?:any ){
		super( baseClass, variant );
	}

	getRotation(){
		return Math.random()*Math.PI;
	}
}

export class BlockFoliage extends BlockFactory{
	static model:string = "base:model:FoliageSix";
	static noModel = false;

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockData{
		return new BlockVariantFoliageData( this, typeof(variant)=="number" ? variant : Math.floor(Math.random()*2) );
	}

	static getModelKey( blockData:BlockVariantFoliageData ):string{
		return `base:model:FoliageSix:${ blockData.data }`;
		//return `${this.model}:${blockData.data||0}`;
	}
}