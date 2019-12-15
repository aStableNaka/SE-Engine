import {BlockFactory, BlockData, Facing} from "../Block";

export type BlockConveyorMetadata = {
	rotation:Facing
}

export class BlockConveyorBelt extends BlockFactory{
	static speed:2; // Throughput per second
	static model:"base:model:ConveyorInline";

	static getModel( blockData:BlockData, pos:THREE.Vector3 ){
		return this.model;
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