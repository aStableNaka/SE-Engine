import { CreateGrid } from "../utils/Spaces";
import { BlockEmpty } from "./blocks/BlockEmpty";
import { baseRegistry } from './blocks/Blocks';

export class Layer{
	contents:any[][];
	location:number;
	constructor( size:number, location:number ){
		this.location = location;
		this.contents = CreateGrid( size, ( x, y )=>{
			return baseRegistry.get('base:empty').constructor();
		});
	}
}