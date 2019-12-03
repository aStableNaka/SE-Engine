import { Block, Geometry } from "../Block";

export class BlockGround extends Block{
	static model:string = "base:model:Cube:0";
	static noModel = false;
	constructor(){
		super();
	}
}