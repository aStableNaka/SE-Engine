import * as THREE from 'three';

/**
 * Creates a 2D grid
 * @param size Size of a sidelength of a table
 * @param fill Callback to fill the contents of a table elemment
 */
export function CreateGrid<T>( size:number, fill:( x : number, y : number ) => T ) : T[][]{
	return new Array< null >( size ).fill( null ).map( (a, y)=>{
		return new Array< null >( size ).fill( null ).map( (b, x)=>{
			return fill(x,y);
		})
	});
}

/**
 * Creates a 3D volume
 * @param size Size of a sidelength of a table
 * @param fill Callback to fill the contents of a table elemment
 */
export function CreateVolume<T>( size:number, fill:( x : number, y : number, z : number ) => T ) : T[][][]{
	return new Array< null >( size ).fill( null ).map( (a, z)=>{
		return new Array< null >( size ).fill( null ).map( (b, y)=>{
			return new Array< null >( size ).fill( null ).map( (c, x)=>{
				return fill(x,y,z);
			})
		})
	});
}

export function getSpaceDepth( space:any[] ):number{
	if(space[0]){
		if(Array.isArray(space[0])){
			return 1 + getSpaceDepth(space[0]);
		}
	}
	return 1;
}

export class Position extends THREE.Vector3{};

export class Space<T> extends Array<T>{
	depth:number;
	constructor(depth : number){
		super();
		this.depth = depth;
	}
}

export type gridType<T> = T[][];

/**
 * Row major
 */
export class Grid<T>{
	contents:gridType<T>;
	constructor( size:number, fill:(x:number,y:number) => T ){
		this.contents = CreateGrid(size, fill);
	}

	getRow( row:number ){
		return this.contents[row];
	}

	get( row:number, column:number ) : T {
		return this.getRow(row)[column];
	}

	map<t>(callback:(value:T[],index:number,array:T[][])=>t[], thisValue?:any){
		return this.contents.map(callback, thisValue||this);
	}
	
}