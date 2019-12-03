import { Resource, resourceOnLoadedCallback } from "./Resource";
import THREE from "three";
import { GLTFLoader, GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader"

const gltfLoader = new GLTFLoader();
export class GLTFResource extends Resource{
	constructor( resourcePath:string, onLoadedCallback?:resourceOnLoadedCallback ){
		super( resourcePath, onLoadedCallback );
	}

	doLoading( ){
		//console.info(`[ GLTFResource ] loading ${ fullResourcePath }`);
		let self = this;
		gltfLoader.load(
			this.fullResourcePath,
			this.gltfOnLoaded.bind(self),
			this.gltfXHR.bind(self),
			this.gltfOnError.bind(self)
		);
	}

	gltfOnLoaded( gltf: GLTF ){
		console.info( `[ GLTFResource ] resouce loaded ${ this.resourcePath }` );
		this.emit("loaded", gltf);
	}

	gltfXHR( event:ProgressEvent<EventTarget> ){

	}

	gltfOnError( event:ErrorEvent ){
		console.error( `[ GLTFResource:Error ] could not load ${this.fullResourcePath}. \n${event.message}` );
		throw event;
	}
}