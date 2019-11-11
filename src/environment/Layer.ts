import { CreateGrid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';
import { Block, BlockData } from "./blocks/Block";
import { Storable } from "../io/Storable";

export class Layer extends Storable{
	contents:BlockData[][];
	location:number;
	constructor( size:number, location:number ){
		super();
		this.location = location;
		this.contents = CreateGrid( size, ( x, y )=>{
			return new BlockData(BlockEmpty);
		});
	}

	toStorageObject(){
		return {contents:this.contents}
	}

	getBlock( x :number, y :number ):BlockData{
		return this.contents[x][y];
	}
}