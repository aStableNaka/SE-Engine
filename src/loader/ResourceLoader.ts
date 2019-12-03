import { Resource } from "./Resource";
import { EventEmitter } from "events";

const filePathRegex:RegExp = new RegExp(".");

export type resourceLoaderOnLoadedCallback = ( resources:Resource[] )=>void;

export class ResourceLoader extends EventEmitter{
	resources:Resource[] = []; /** A list of all resources to be loaded */
	contents:any[] = [];
	resourceTotal:number = 0; /** A tally of the amount of resources */
	resourceLoaded:number = 0; /** The number of resources fully loaded */
	resourcePath:string = "";

	constructor( resourcePath:string, onLoadedCallback?:resourceLoaderOnLoadedCallback ){
		super();
		this.setResourcePath(resourcePath);
		if(onLoadedCallback) this.onLoaded( onLoadedCallback );
	}

	load( onLoadedCallback?:resourceLoaderOnLoadedCallback ):ResourceLoader{
		console.log(`[ResourceLoader] ${this.resourcePath} starting load`);
		if( onLoadedCallback ) this.onLoaded( onLoadedCallback );
		let self = this;
		this.resources.map( (resource)=>{
			resource.onLoaded( ( data )=>{
				self.resourceLoaded++;
				self.checkStatus();
				self.contents.push(data);
				return null;
			});
			resource.load( `${self.resourcePath}/${resource.resourcePath}` );
		}, this);
		return this;
	}

	queue( resource:Resource ){
		this.resources.push(resource);
	}

	onLoaded( callback:resourceLoaderOnLoadedCallback ){
		this.addListener("loaded", callback);
	}

	setResourcePath(resourcePath: string) {
		//resourcePath = resourcePath.replace("$cwd", process.cwd());
		if(!filePathRegex.test(resourcePath))
			throw new Error(`[ ResourceLoader ] Invalid Resource Path ${resourcePath}`);
		this.resourcePath = resourcePath;
	}

	/**
	 * Checks the status of resources. If every
	 * resource is loaded, it invokes all onLoaded
	 * callbacks.
	 */
	private checkStatus(){
		if( this.resourceLoaded == this.resources.length ){
			this.emit("loaded", this.resources);
		}
	}
}