import { Block, Geometry, BlockData } from "../Block";

export class BlockGroundData extends BlockData{
	constructor( variant:number ){
		super( BlockGround );
		this.data = variant;
	}
}

export class BlockGround extends Block{
	static model:string = "base:model:Cube";
	static noModel = false;
	constructor(){
		super();
	}

	static createBlockData( variant?:number ):BlockData{
		if(!variant){variant = Math.floor(Math.random()*4)}
		return new BlockGroundData( variant );
	}

	static getModelKey( blockData:BlockData ):string{
		return `${this.model}:${blockData.data||0}`;
	}
}