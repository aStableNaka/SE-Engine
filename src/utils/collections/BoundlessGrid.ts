import {Grid, gridMapContentsCallback} from "./Spaces";

export interface Ve2{
	x:number;
	y:number;
}

/**
 * @memberof collections
 */
export class BoundlessGrid<T> extends Grid<T>{
	extended:Map<string,T> = new Map<string,T>();
	generationSubroutine: (row: number, column: number) => T;
	temp: T[] = [];

	exists: number[][] = [];
	constructor( initialSize:number, generation:(x:number,y:number)=>T, forceInstanciate?:boolean ){
		super( initialSize, generation );
		this.generationSubroutine = generation;
	}

	private generation( row: number, column: number ): T{
		const val = this.generationSubroutine( row, column );
		this.exists.push([row,column]);
		this.temp.push(val);
		return val;
	}

	private gS( row:number, column:number ){
		return `${row}_${column}`;
	}
	
	/**
	 * Generate a new entry using the same generation
	 * rules defined during grid construction.
	 * @param row 
	 * @param column 
	 */
	generate( column:number, row:number ):T{
		const vNew = this.gS(row,column);
		if(!this.extended.has( vNew )){
			console.log(`Generating ${row} ${column}`);
			this.extended.set(vNew, this.generation( row, column ));
		}
		return <T>this.extended.get( vNew );
	}

	/**
	 * Maps a function to all generated entries
	 * 
	 * WARNING: This mapping is based on insert order,
	 * sequential mapping is not guaranteed.
	 * @param callback 
	 * @param thisArg 
	 */
	mapExisting( callback:gridMapContentsCallback<T>, thisArg?:any ):any{
		const self = this;
		this.exists.map( (coords)=>{
			const [row, col] = [...coords];
			const entry = this.get( row, col );
			callback( entry, row, col, self );
		}, thisArg);
	}

	/**
	 * If it's not available in the base region,
	 * generate it and return the result
	 * @param row 
	 * @param column 
	 */
	get( row:number, column:number ) : T {
		if(this.inRange(row, column)){
			return this.getRow(row)[column];
		}else{
			return this.generate( row, column );
		}
	}

	/**
	 * 
	 * @param value 
	 * @param row 
	 * @param column 
	 */
	set( value:T, row:number, column:number ){
		if(this.inRange(row,column)){
			this.contents[row][column] = value;
		}else{
			const vNew = this.gS(row,column);
			this.extended.set(vNew, value);
		}
	}
}