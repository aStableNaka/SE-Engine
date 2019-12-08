import { Resource, resourceOnLoadedCallback } from "./Resource";
import * as THREE from "three";

const loader = new THREE.TextureLoader();

export class TextureResource extends Resource{
	constructor( resourcePath:string, onLoadedCallback?:resourceOnLoadedCallback ){
		super( resourcePath, onLoadedCallback );
	}

	doLoading( ){
		console.info(`[ TextureResource ] loading ${ this.fullResourcePath }`);
		let self = this;
		loader.load(
			this.fullResourcePath,
			this.textureOnLoaded.bind(self),
			null,
			this.onError.bind(self)
		);
	}

	textureOnLoaded( texture: THREE.Texture ){
		console.info( `[ TextureResource ] resouce loaded ${ this.resourcePath }` );
		this.emit("loaded", texture);
	}
}