import { EventEmitter } from "events";
import { Resource } from "./Resource";

declare type resourceLoaderOnLoadedCallback = ( resources:Resource[] )=>{}

/**
 * Manages the loading of many resources of the same type.
 * @example
 * // Basic usage
 * let animalLoader = new ResourceLoader("path/to/animals");
 * let dogResource = new Resource("dog.png");
 * animalLoader.queue( dogResource );
 * // ...
 * animalLoader.onLoaded( ()=>{
 * 	console.log( "All animals loaded!" );
 * });
 * // ...
 * animalLoader.beginLoading();
 */
declare class ResourceLoader extends EventEmitter{
	resources:Resource[]; /** A list of all resources to be loaded */
	resourceTotal:number; /** A tally of the amount of resources */
	resourceLoaded:number; /** The number of resources fully loaded */
	resourcePath:string;

	/**
	 * Create a new ResourceLoader
	 * @param resourcePath Root path of resources
	 */
	constructor(resourcePath:string, onLoaded?:resourceLoaderOnLoadedCallback);

	/**
	 * Start the loading process. Use this after
	 * all the resources have been declared.
	 * @example
	 * animalLoader.load( ()=>{
	 * 	console.log("Animals loaded!");
	 * });
	 */
	load( onLoadedCallback?: resourceLoaderOnLoadedCallback ):ResourceLoader;

	/**
	 * Pass a method to be invoked when loading is complete
	 * @param callback ( resources: this.loadedCache )
	 */
	onLoaded( callback: resourceLoaderOnLoadedCallback );

	/**
	 * Queue a resource to be loaded
	 * @param resource 
	 */
	queue(resource:Resource);

	/**
	 * Set the root path for resources
	 * @param path root path for resources
	 * @example
	 * // I want to load some animals
	 * let animalLoader = new ResourceLoader( "/path/to/cool/animals" );
	 * // But /path/to/awesome/animals has cooler animals
	 * animalLoader.setResourcePath( "/path/to/awesome/animals" );
	 */
	setResourcePath(path:string);
}