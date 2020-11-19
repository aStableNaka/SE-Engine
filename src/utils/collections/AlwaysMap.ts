/**
 * @namespace collections
 */

/**
 * An AlwaysMap will always return a valid value for any given key when
 * calling AlwaysMap.get();
 * 
 * AlwaysMap will use the initializer function to ensure this.
 * 
 * Removes the need for a Map.has() check
 * @memberof collections
 */
export class AlwaysMap<TKey,TVal> extends Map<TKey,TVal>{
	initializer: (key: TKey) => TVal;
	temp: TVal[] = [];

	/**
	 * 
	 * @param {function} initializer 
	 * @param {string[]} entries 
	 */
	constructor( initializer: ( key:TKey )=>TVal, entries?: readonly( readonly[TKey, TVal] )[] ){
		super( entries );
		this.initializer = initializer;
	}

	/**
	 * Always returns a valid entry
	 * @param key 
	 */
	getAlways( key: TKey ): TVal{
		if(!this.has(key)){
			const val = this.initializer(key);
			this.set( key, val );
		}
		return <TVal>this.get( key );
	}
}

/**
 * CappedAlwaysMaps are AlwaysMaps that have a max capacity
 */
export class CappedAlwaysMap<TKey, TVal> extends AlwaysMap<TKey, TVal>{
	entriesFIFO: TKey[] = [];
	maxLength: number;
	setC: number = 0;
	deconstructor: (val: TVal) => TVal;
	
	/**
	 * 
	 * @param maxLength 
	 * @param initializer Function that initializes an object that doesn't already exist 
	 * @param entries 
	 * @param deconstruction Function called before an object gets deleted from the map
	 */
	constructor(
		maxLength:number,
		initializer: ( key:TKey )=>TVal,
		entries?: readonly( readonly[TKey, TVal] )[],
		deconstruction: ( val:TVal )=>TVal = (val:TVal)=>{ return val; }
	){
		super( initializer );
		this.deconstructor = deconstruction;
		if( entries ){
			entries.map( ([key, val])=>{
				this.setAlways( key, val );
			});
		}
		this.maxLength = maxLength;
	}

	/**
	 * Will remove the oldest entry if the size of the map is 
	 * over the limit.
	 * @param key 
	 */
	setAlways( key: TKey, val: TVal ){
		if(this.entriesFIFO.length == this.maxLength){
			// The next key to be removed
			const removalIndex = this.setC % this.maxLength
			const removalKey = this.entriesFIFO[ removalIndex ];
			const holdVal = <TVal>this.get( removalKey );
			this.deconstructor( holdVal );
			this.delete( removalKey );
			this.entriesFIFO[ removalIndex ] = key;
		}else{
			this.entriesFIFO.push( key );
		}
		this.set( key, val );
		this.setC++;
	}

	/**
	 * Always returns a valid entry
	 * @param key 
	 */
	getAlways( key: TKey ): TVal{
		if(!this.has(key)){
			this.setAlways( key, this.initializer(key) );
		}
		return <TVal>this.get( key );
	}
}