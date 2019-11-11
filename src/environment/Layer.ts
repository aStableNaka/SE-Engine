import { CreateGrid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';
import { Block, BlockData } from "./blocks/Block";
import { Storable } from "../io/Storable";
import { quickHash } from "../utils/QuickHash";

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

	getBlock( x :number, y :number ):BlockData{
		return this.contents[x][y];
	}

	/**
	 * Compress the Storable.data whenever it's requested as a string
	 * @param data 
	 */
	compress( data:any ){
		let dictionary = new Map<string,any>();
		let out : { compressed:boolean, contents?:[], map?:[string, any][] } = { compressed:true }
		
		out.contents = data.contents.map( (rowArr:Array<BlockData>)=>{
			return rowArr.map((bd:BlockData)=>{
				let key:string = quickHash(JSON.stringify(bd));
				if(!dictionary.has(key)){
					console.log(`[ [Layer.compress] registered ${key} ]`);
					dictionary.set(key, {blockData:bd, index:dictionary.size});
				}
				let entry = dictionary.get(key);
				return entry.index;
			})
		} )

		out.map = [...dictionary.entries()];
		return out;
	}

	decompress( data:any ){

	}

	toStorageObject(){
		return {contents:this.contents}
	}
}