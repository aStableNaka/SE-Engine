import { CreateGrid, Grid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { regHub } from '../registry/RegistryHub';
import { BlockData, Block } from "./blocks/Block";
import { Storable } from "../io/Storable";
import { quickHash } from "../utils/QuickHash";
import {Vector2, Vector3} from "three";

const defaultBlock = new BlockData(BlockEmpty);

type compressedGrid<T> = {contents:T[][]}
type compressedData = { compressed:boolean, grid:compressedGrid<number>, map:[string, any][], location:number };
type storageData = { grid:Grid<BlockData>, location:number }


export class Layer extends Storable{
	grid:Grid<BlockData>;
	location:number;
	size: number;
	constructor( size:number, location:number, generation:(x:number,y:number)=>BlockData=()=>{return defaultBlock} ){
		super();
		this.location = location;
		this.size = size;
		this.grid = new Grid<BlockData>(size, generation);
	}

	/**
	 * Column major
	 * @param x 
	 * @param y 
	 */
	public getBlock( x :number, y :number ):BlockData{
		return this.grid.get(y,x);
	}

	/**
	 * Will modify modelData. This modelData will be used
	 * to construct the region mesh.
	 * @example
	 * modelData = {
	 * 	"base:model:Simple:0":[vector3],
	 * 	"base:model:Simple:1":[vector3,vector3]
	 * }
	 */
	public generateModelData( modelData:any ){
		let self = this;
		this.grid.mapContents( (blockData:BlockData, yPos, xPos)=>{
			let blockClass = blockData.baseClass;
			let modelKey = blockData.getModelKey();
			// Some blocks have no model.
			if(blockClass.noModel){return;}
			// If the model is not already included within modelData
			if(!modelData[modelKey]){
				modelData[modelKey] = [];
			}

			modelData[modelKey].push( new Vector3(xPos, yPos, self.location));
		});
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
	public compress( data:storageData ):compressedData{
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
	public decompress( data:compressedData ):void{
		let dictionary = new Map<string,BlockData>();
		data.map.map(([key, value])=>{
			//console.log(key, value);
			let blockId = value.blockData.baseClass.blockId;
			let blockClass = regHub.get("base:block").getBlockClass(blockId);
			let blockData = blockClass.recallBlockData( value.blockData );
			//console.log(blockData);
			dictionary.set(`_${value.index}`, blockData);
		});
		//console.log('BWHJAKBSJKHD KWAJ',dictionary.get("_1"));
		let dataGrid = new Grid(this.size, (row, col)=>{
			return dictionary.get( `_${data.grid.contents[row][col]}` ) || BlockEmpty.createBlockData();
		})
		//console.log(dataGrid.get(0,0));
		this.grid.assign(dataGrid);
		this.location = data.location;
	}

	public toStorageObject():storageData{
		return {grid:this.grid, location:this.location};
	}
}