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
export type gridMapContentsCallback<T> = (value:any, row:number,col:number,self:Grid<T>)=>(any | any[][] | undefined);
/**
 * Row major
 */
export class Grid<T>{
	contents:gridType<T>;
	size:number;


	constructor( size:number, fill:(x:number,y:number) => T ){
		this.contents = CreateGrid(size, fill);
		this.size = size;
	}

	/**
	 * Checks if a coordinate pair exists within this grid
	 * @param row 
	 * @param col 
	 */
	inRange( row:number, col:number ):boolean{
		const c = [
			(x:number):boolean=>{return x<this.size;},
			(x:number):boolean=>{return x>=0;},
		]
		return c.filter( (cf)=>{ return cf(row) && cf(col); } ).length == 2;
	}

	getRow( row:number ){
		return this.contents[row];
	}

	get( row:number, column:number ) : T|null {
		if(this.inRange(row, column)){
			try{
				return this.getRow(row)[column];
			}catch(e){
				console.log(row, column, this);
			}
			
		}
		return null;
	}

	set( value:T, row:number, col:number ){
		if(this.inRange(row,col)){
			this.contents[row][col] = value;
		}
	}

	/**
	 * Maps a function to every row of the grid
	 * @param callback 
	 * @param thisArg 
	 */
	map<t>(callback:(value:T[],index:number,array:T[][])=>t[], thisArg?:any){
		return this.contents.map(callback, thisArg||this);
	}

	/**
	 * Maps a function to every element of the grid
	 * @param callback 
	 * @param thisArg 
	 */
	public mapContents(callback:gridMapContentsCallback<T>, thisArg?:any):any{
		let self = this;
		return this.contents.map((vRow, row)=>{
			return vRow.map((value, col)=>{
				return callback( value, row, col, self );
			}, thisArg||self);
		},thisArg||self);
	}

	private assignSizeError( gSourceSize:number ):Error{
		return new Error(`[ Grid ] cannot assign grid size ${gSourceSize} to grid size ${this.size}, invalid sizes.`)
	}

	/**
	 * Assign the contents of a different grid to this grid
	 * @param grid 
	 */
	public assign(grid:Grid<T>|T[][]):Grid<T>{
		
		// If grid is a grid
		if(grid instanceof Grid){
			if(grid.size != this.size){
				throw this.assignSizeError( grid.size );
			}
			this.mapContents((val, row, col, self)=>{
				self.set( <T>grid.get(row,col), row, col );
			});
			return this;
		}
		
		// If grid is a nested array
		else{
			let arraySize = Math.sqrt(grid.length * grid[0].length);
			if( arraySize != this.size){
				throw this.assignSizeError( arraySize );
			}
			this.mapContents((val, row, col, self)=>{
				self.set( grid[row][col], row, col );
			});
			return this;	
		}
	}
	
}