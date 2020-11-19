import { RefObject } from "react";

/*
	A bunch of helper functions to make interaccting with tsx objects easier
*/

/**
 * ensures a react component ref
* is available to be used.
 * @param a 
 */
export function ensureRefAvailable<ComponentType>( a:any ): ComponentType | null {
	if( a && a.current ){
		return a.current;
	}
	return null;
}

/**
 * a generic funcction for getting UI Objects from react.
 * The callback will invoke with the component object
 * if it is available.
 * @param uiRefObject any React ref object
 * @param onAvailable the uiObject is passed via callback
 */
export function provideUIObject<ComponentType>
	(
		uiRefObject: RefObject<ComponentType> | null | undefined,
		onAvailable:( uiObject: ComponentType )=>void,
		onUnavailable: ()=>void = ()=>{}
	){
	const uiObj_notNull = ensureRefAvailable<ComponentType>( uiRefObject );
	if( uiObj_notNull ){
		onAvailable( uiObj_notNull );
	}else{
		onUnavailable()
	}
}