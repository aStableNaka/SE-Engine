import { CreateGrid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';
import { Block, BlockData } from "./blocks/Block";
import { Storable } from "../io/Storable";
import { quickHash } from "../utils/QuickHash";

const defaultBlock = new BlockData(BlockEmpty);

type compressedData = { compressed:boolean, contents:number[][], map:[string, any][], location:number };
type storageData = { contents:BlockData[][], location:number }
type compressedStorageData = { contents:number[][], location:number }

export class Layer extends Storable{
	contents:BlockData[][];
	location:number;
	constructor( size:number, location:number ){
		super();
		this.location = location;
		this.contents = CreateGrid( size, ( x, y )=>{
			return defaultBlock;
		});
	}

	getBlock( x :number, y :number ):BlockData{
		return this.contents[x][y];
	}

	/**
	 * Compress the Storable.data whenever it's requested as a string
	 * @converts
	 * 	{
	 * 		contents: BlockData[][]
	 * 	}
	 * 
	 * @to
	 * 	{
	 * 		map: [ id:string, value:{ index:number, blockData:BlockData }][],
	 * 		contents: number[][] // Each number corresponds to index in the map
	 * 	}
	 * @param data 
	 */
	compress( data:storageData ):compressedData{
		let dictionary = new Map<string,any>();
		let out : compressedData = { compressed:true, map:[], contents:[[0]], location:data.location }
		
		out.contents = data.contents.map( (rowArr:BlockData[])=>{
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

	/**
	 * Undos the compression process
	 * @param data 
	 */
	decompress( data:compressedData ){
		let dictionary = new Map<string,BlockData>();
		data.map.map(([key, value])=>{
			let blockData = baseRegistry.get(value.blockData.baseClass.blockId).baseClass.constructor( value.blockData )
			dictionary.set(`_${value.index}`, blockData);
		});
		this.contents = data.contents.map((row)=>{
			return row.map((index)=>{
				return dictionary.get(`_${index}`) || BlockEmpty.createBlockData();
			})
		});
		this.location = data.location;
	}

	toStorageObject():storageData{
		return {contents:this.contents, location:this.location}
	}
}