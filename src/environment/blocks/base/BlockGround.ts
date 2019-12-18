import { BlockFactory, Geometry, BlockData } from "../Block";
import * as THREE from "three";

export class BlockGroundData extends BlockData{
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

	static createBlockData( variant?:number|null ):BlockData{
		if(variant===null || variant===undefined){variant = Math.floor(Math.random()*16)}
		return new BlockGroundData( variant );
	}

	static getModelKey( blockData:BlockData ):string{
		return `${this.model}:${blockData.data||0}`;
	}
}