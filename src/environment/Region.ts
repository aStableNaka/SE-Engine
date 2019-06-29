import { RegionMesh } from '../rendering/RegionMesh';
import { MapObject } from './Map';

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

export function CreateTable<T>( size:number, callback:( x : number, y : number ) => T ) : T[][]{
	return new Array< null >( size ).fill( null ).map( (a, y)=>{
		return new Array< null >( size ).fill( null ).map( (b, x)=>{
			return callback(x,y);
		})
	});
}

export class Region{
	mesh:RegionMesh;
	contents: ( MapObject | null )[][];
	constructor( size:number ){
		this.mesh = new RegionMesh(  );
		this.contents = CreateTable< BlockMapObject >( size, (x,y)=>{
			return new BlockMapObject( x, y, {} );
		} );
	}
}