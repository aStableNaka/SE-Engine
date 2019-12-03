import { EventEmitter } from "events";

declare type resourceOnLoadedCallback = ( data:any, self:Resource )=>void;

declare class Resource extends EventEmitter{
	loaded:boolean;
	resourcePath:string;

	/**
	 * Create a new resource
	 * @param resourcePath Resource path relative to the parent loader's root resource path
	 * @example
	 * 	let dog = new Resource("/dog.png");
	 */
	constructor(resourcePath:string);

	/**
	 * @abstract
	 * @param onLoaded 
	 */
	load( onLoadedCallback?:resourceOnLoadedCallback );

	/**
	 * Called before loading begins
	 * @param callback 
	 */
	onLoadBegin( callback:(self:Resource)=>{} );

	/**
	 * Pass a method to be invoked once the resource has been loaded
	 * @param data
	 * @param callback 
	 */
	onLoaded( callback:resourceOnLoadedCallback );

	/**
	 * Pass a method to be invoked if the resource errors during load
	 * @param callback 
	 */
	onError( callback:(err:Error)=>{} );
}