import { CreateGrid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';
import { Block, BlockData } from "./blocks/Block";

export class Layer{
	contents:BlockData[][];
	location:number;
	constructor( size:number, location:number ){
		this.location = location;
		this.contents = CreateGrid( size, ( x, y )=>{
			return new BlockData(BlockEmpty);
		});
	}

	getBlock( x :number, y :number ):BlockData{
		return this.contents[x][y];
	}
}