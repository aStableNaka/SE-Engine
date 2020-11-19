export type stringable = string | number | null | undefined;

/**
 * puts string in "[ text ]" format
 * @param text 
 */
export function brackets( text: stringable ): string{
	return `[ ${text} ]`;
}

export function outOf( a: any, b: any, label?: stringable ){
	return `${a} / ${b}${label?` ${label}` : ''}`;
}

/**
 * puts string in "list, list, list" format
 * @param items 
 * @param subformatter a method applied to every entry
 */
export function list( items: any[], subformatter?:( entry: any )=>string){
	return items.map( (entry: any)=>{
		if(subformatter){
			return subformatter( entry );
		}else{
			return entry
		}
	}).join(", ");
}

/**
 * Allows text formatting chat chooses based on an boolean
 * @param state 
 * @param t 
 * @param f 
 */
export function bool( state: boolean, t: stringable, f: stringable ){
	return state ? t : f;
}
