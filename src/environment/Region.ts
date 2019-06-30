import { RegionMesh } from '../rendering/RegionMesh';
import { MapObject } from './MapObject';
import { CreateGrid } from '../utils/Spaces';
import {EventEmitter} from 'events';

class BlockMapObject implements MapObject{
	x: number;
	y: number;
	ref: any;
	meta: any;
	constructor( x:number, y:number, ref:any, meta?:any){
		this.x = x;
		this.y = y;
		this.ref = ref;
		this.meta = meta;
	}
}

class RegionEventEmitter extends EventEmitter{
	constructor(){
		super();
		this.on('set', this.eventSet);
	}

	eventSet():void{

	}
}

export class Region{
	mesh:RegionMesh;
	contents: ( MapObject | null )[][];
	eventEmitter:RegionEventEmitter = new RegionEventEmitter();
	constructor( size:number ){
		this.mesh = new RegionMesh(  );
		this.contents = CreateGrid< BlockMapObject >( size, (x,y)=>{
			return new BlockMapObject( x, y, {} );
		} );
	}
}