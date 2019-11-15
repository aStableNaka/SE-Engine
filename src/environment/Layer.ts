import { CreateGrid, Grid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';
import { BlockData, Block } from "./blocks/Block";
import { Storable } from "../io/Serializable";
import { quickHash } from "../utils/QuickHash";

const defaultBlock = new BlockData(BlockEmpty);

type compressedData = { compressed:boolean, grid:Grid<number>, map:[string, any][], location:number };
type storageData = { grid:Grid<BlockData>, location:number }


export class Layer extends Storable{
	grid:Grid<BlockData>;
	location:number;
	size: number;
	constructor( size:number, location:number ){
		super();
		this.location = location;
		this.size = size;
		this.grid = new Grid<BlockData>(size, ()=>{return defaultBlock;});
	}

	/**
	 * Column major
	 * @param x 
	 * @param y 
	 */
	getBlock( x :number, y :number ):BlockData{
		return this.grid.get(y,x);
	}

	/**
	 * Compress the Storable.data whenever it's requested as a string
	 * @converts
	 * {
	 * 	contents: BlockData[][]
	 * }
	 * 
	 * @to
	 * {
	 *	map: [ id:string, value:{ index:number, blockData:BlockData }][],
	 *	contents: number[][]
	 * }
	 * @note Each number corresponds to index in the map
	 * @param data 
	 */
	compress( data:storageData ):compressedData{
		let dictionary = new Map<string,any>();
		const bdDefault = new BlockData(Block);
		let out : compressedData = { compressed:true, map:[], grid:new Grid<number>(this.size, ()=>{return 0;}), location:data.location }
		let contents = data.grid.map( (rowArr)=>{
			return rowArr.map((bd:BlockData)=>{
				let key:string = quickHash(JSON.stringify(bd));
				if(!dictionary.has(key)){
					console.log(`[ [Layer.compress] registered ${key} ]`);
					dictionary.set(key, {blockData:bd, index:dictionary.size});
				}
				let entry = dictionary.get(key);
				return entry.index;
			})
		});
		out.grid = new Grid<number>(this.size, (row, col)=>{ return contents[row][col]; })

		out.map = [...dictionary.entries()];
		return out;
	}

	/**
	 * Undos the compression process
	 * @param data assumes data has been parsed back into an object
	 */
	decompress( data:compressedData ){
		let dictionary = new Map<string,BlockData>();
		data.map.map(([key, value])=>{
			let blockId = value.blockData.baseClass.blockId;
			let blockClass = baseRegistry.getBlockClass(blockId);
			let blockData = blockClass.recallBlockData( value.blockData );
			dictionary.set(`_${value.index}`, blockData);
		});
		this.grid = new Grid<BlockData>(this.size, (row, column)=>{
			return dictionary.get( `_${data.grid.contents[row][column]}` ) || BlockEmpty.createBlockData();
		})
		this.location = data.location;
	}

	toStorageObject():storageData{
		return {grid:this.grid, location:this.location};
	}
}