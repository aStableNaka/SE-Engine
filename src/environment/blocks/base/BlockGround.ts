import { BlockFactory, Geometry, BlockData } from "../Block";
import * as THREE from "three";

export class BlockGroundData extends BlockData{
	/** The texture variant */
	public data: number;
	constructor( variant:number ){
		super( BlockGround );
		this.data = variant;
	}
}

export class BlockGround extends BlockFactory{
	static model:string = "base:model:Cube";
	static noModel = false;
	constructor(){
		super();
	}

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockData{
		if(variant===null || variant===undefined){variant = Math.floor(Math.random()*16)}
		return new BlockGroundData( variant );
	}

	static getModelKey( blockData:BlockGroundData ):string{
		if(blockData.data == 0){
			return `${this.model}:0`;
		}
		return "base:model:None";
		//return `${this.model}:${blockData.data||0}`;
	}
}