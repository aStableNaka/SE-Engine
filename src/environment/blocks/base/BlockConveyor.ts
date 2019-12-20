import {BlockFactory, BlockData, Facing} from "../Block";

export type BlockConveyorMetadata = {
	rotation:Facing
}

export class BlockConveyorBelt extends BlockFactory{

	// Important
	static model = "base:model:ConveyorInline";
	static noModel = false;

	static speed = 2; // Throughput per second
	

	static getModel( blockData:BlockData, pos:THREE.Vector3 ){
		return this.model;
	}

	static getModelKey( blockData:BlockData ):string{
		return this.model;
	}

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData():BlockData{
		return new BlockConveyorBeltData();
	}


	constructor(){
		super();
	}
}

export class BlockConveyorBeltData extends BlockData{
	constructor(){
		super( BlockConveyorBelt, {} );
	}
}