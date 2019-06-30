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