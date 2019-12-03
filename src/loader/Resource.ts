import { EventEmitter } from "events";

/**
 * Invoked when a resource finishes loading
 */
export type resourceOnLoadedCallback = ( data:any, self:Resource )=>void;

/**
 * Represents a single resource that is intended
 * to be loaded by a ResourceLoader.
 * @abstract
 * @example
 * let animalLoader = new ResourceLoader("./");
 * let dog = new Resource("dog.png");
 * animalLoader.queue(dog);
 */
export class Resource extends EventEmitter{
	resourcePath: string;
	fullResourcePath: string = '';

	/**
	 * Create a new resource
	 * @param resourcePath Resource path relative to the parent loader's root resource path
	 * @param onLoadedCallback
	 * @example
	 * 	let dog = new Resource("/dog.png");
	 */
	constructor(resourcePath:string, onLoadedCallback?:resourceOnLoadedCallback){
		super();
		this.resourcePath = resourcePath;
		if(onLoadedCallback) this.onLoaded( onLoadedCallback );
	}

	/**
	 * Ideally, this is only ever called by a ResourceLoader
	 * @param resourcePath
	 * @param onLoadedCallback 
	 */
	load( fullResourcePath:string, onLoadedCallback?:resourceOnLoadedCallback ){
		this.fullResourcePath = fullResourcePath;
		if(onLoadedCallback) this.onLoaded( onLoadedCallback );
		this.doLoading();
	}

	/**
	 * This method should be overwritten for every different type
	 * of resource.
	 * @abstract
	 * @param resourcePath
	 * On implementation, be sure to emit the "loaded" event
	 */
	doLoading(){
		throw new Error("[ Resource ] using skeleton code. new Resource(...).load() cannot be used.");
	}

	/**
	 * Pass a method to be invoked once the resource has been loaded
	 * @param data
	 * @param callback 
	 */
	onLoaded( onLoadedCallback:resourceOnLoadedCallback ){
		this.addListener("loaded", onLoadedCallback );
	}

	/**
	 * Called before loading begins
	 * @param callback 
	 */
	onLoadBegin( callback:(self:Resource)=>{} ){

	}

	/**
	 * Pass a method to be invoked if the resource errors during load
	 * @param callback 
	 */
	onError( callback:(err:Error)=>{} ){

	}

}