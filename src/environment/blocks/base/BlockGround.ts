import { BlockFactory, Geometry, BlockData } from "../Block";
import {BlockVariantData} from "./BlockVariantData";
import * as THREE from "three";

export class BlockGround extends BlockFactory{
	static model:string = "base:model:Cube";
	static noModel = false;

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockData{
		if(variant==null || variant==undefined){
			variant = Math.floor(Math.random()*16);
		}
		return new BlockVariantData( this, variant );
	}

	static getModelKey( blockData:BlockVariantData ):string{
		if(blockData.data < 2){
			return `${this.model}:${blockData.data}`;
		}
		return "base:model:None";
		//return `${this.model}:${blockData.data||0}`;
	}
}