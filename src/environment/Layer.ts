import { CreateGrid, Grid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/base/BlockEmpty";
import { regHub } from '../registry/RegistryHub';
import { BlockData, BlockFactory } from "./blocks/Block";
import { Storable } from "../io/Storable";
import { quickHash } from "../utils/QuickHash";
import {Vector2, Vector3, Vector4} from "three";
import { Region } from "./region/Region";
import { ModelInstanceData } from "../models/Model";

const defaultBlock = new BlockData(BlockEmpty);

type compressedGrid<T> = {contents:T[][]}
type compressedData = { compressed:boolean, grid:compressedGrid<number>, map:[string, any][], location:number };
type storageData = { grid:Grid<BlockData>, location:number }


export class Layer extends Storable{
	grid:Grid<BlockData>;
	location:number;
	size: number;
	region: Region;

	modelUpdateQueue:string[] = [];

	constructor( region:Region, location:number, generation:(x:number,y:number)=>BlockData=()=>{return defaultBlock} ){
		super();
		this.location = location;
		this.region = region;
		this.size = region.world.chunkSize;
		this.grid = new Grid<BlockData>(this.size, generation);
	}
	
	/**
	 * Column major
	 * @param x 
	 * @param y 
	 */
	public getBlock( x :number, y :number ):BlockData|null{
		let data = this.grid.get(y,x);
		return <BlockData>this.grid.get(y,x);
	}

	/**
	 * 
	 * @param blockData 
	 * @param x 
	 * @param y 
	 */
	public setBlock( blockData:BlockData, x:number, y:number ){
		// Ensures the block being replaced gets removed visually
		const occupyingBlock = this.getBlock(x,y);
		if(occupyingBlock){
			const modelKey = occupyingBlock.getModelKey();
			const modelInstanceData = this.region.modelData[modelKey];
			if(modelInstanceData){
				modelInstanceData.contents = modelInstanceData.filter((v4:Vector4)=>{
					return v4.x!=x && v4.y!=y;
				})
				modelInstanceData.needsUpdate = true;
			}
		}


		this.grid.set(blockData,y,x);
		this.addToModelData( this.region.modelData, blockData, x, y );
	}

	public addToModelData( modelData:any, blockData:BlockData, xPos:number, yPos:number ){
		const blockClass = blockData.baseClass;
		const modelKey = <string>blockClass.getModel( blockData, new Vector3(xPos, this.location, yPos) );
		// Some blocks have no model.
		if(blockClass.noModel){return;}
		// If the model is not already included within modelData
		if(!modelData[modelKey]){
			modelData[modelKey] = new ModelInstanceData(modelKey);
		}

		// This helps the block identify itself
		// within the game world.

		// remove modelKey discriminator;
		const baseModelKey = blockData.getBaseModelKey();
		const model = regHub.get(baseModelKey);
		if(model.options.usesInstancing){
			blockData.assignMatrixIndex( modelData[modelKey].length-1 );
		}
		
		modelData[modelKey].push( new Vector4(xPos, yPos, this.location, blockData.getRotation()));
		modelData[modelKey].needsUpdate = true;
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
		const self = this;
		this.grid.mapContents( (blockData:BlockData, yPos, xPos)=>{
			this.addToModelData(modelData, blockData, xPos, yPos);
		}, this);
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
		const dictionary = new Map<string,any>();
		const bdDefault = new BlockData(BlockFactory);
		const out : compressedData = {
			compressed:true,
			map:[],
			grid:new Grid<number>( this.size, ()=>{return 0;} ),
			location:data.location
		}
		const contents = data.grid.map( (rowArr)=>{
			return rowArr.map((bd:BlockData)=>{
				const key:string = quickHash(JSON.stringify(bd));
				if(!dictionary.has(key)){
					console.log(`[ [Layer.compress] registered ${key} ]`);
					dictionary.set(key, {blockData:bd, index:dictionary.size});
				}
				const entry = dictionary.get(key);
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
		const dictionary = new Map<string,BlockData>();
		data.map.map(([key, value])=>{
			//console.log(key, value);
			const blockId = value.blockData.baseClass.blockId;
			const blockClass = regHub.get("base:block").getBlockClass(blockId);
			const blockData = blockClass.recallBlockData( value.blockData );
			//console.log(blockData);
			dictionary.set(`_${value.index}`, blockData);
		});
		//console.log('BWHJAKBSJKHD KWAJ',dictionary.get("_1"));
		const dataGrid = new Grid(this.size, (row, col)=>{
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