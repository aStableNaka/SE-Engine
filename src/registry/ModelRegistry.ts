/**
 * @todo finish this, I will finally have a working rendered world
 */

import {Registry} from "./Registry";
import {GLTFResource} from "../loader/GLTFResource";
import {ResourceLoader} from "../loader/ResourceLoader";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";
import { Geometry } from "../environment/blocks/Block";
import * as THREE from "three";

/**
 * This is for basic models that are composed of a single mesh
 */
export class Model{
	resource!:GLTFResource;
	name:string;
	resourcePath:string;
	registry!: ModelRegistry;
	mesh!:THREE.Mesh;
	constructor(name:string,resourcePath:string, registry:ModelRegistry){
		this.name = name;
		this.resourcePath = resourcePath;
	}

	assignRegistry(registry:ModelRegistry){
		this.registry = registry;
		this.resource = new GLTFResource(this.resourcePath, this.onModelLoaded.bind(this));
	}

	/**
	 * This is necessary because trying to use the geometry provided by
	 * GLTFLoader causes WEBGL_BUFFER issues
	 * @param geometry 
	 */
	convertToFloar32Attribute(geometry:THREE.BufferGeometry){
		geometry.computeVertexNormals();
		let attr = geometry.attributes;
		attr.position = this.bufferAttributeToFloat32BufferAttribute( <THREE.BufferAttribute>attr.position );
		attr.normal = this.bufferAttributeToFloat32BufferAttribute( <THREE.BufferAttribute>attr.normal );
		attr.uv = this.bufferAttributeToFloat32BufferAttribute( <THREE.BufferAttribute>attr.uv );
		geometry.index = new THREE.Uint16BufferAttribute(geometry.index.array, geometry.index.itemSize, geometry.index.normalized);
	}

	bufferAttributeToFloat32BufferAttribute(bufferAttribute:THREE.BufferAttribute){
		return new THREE.Float32BufferAttribute(bufferAttribute.array, bufferAttribute.itemSize, bufferAttribute.normalized);
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.mesh = <THREE.Mesh>data.scene.children.filter((obj3d)=>{ return obj3d.type=="Mesh";})[0];
		if(!this.mesh) throw new Error(`[Model] Mesh could not be found within scene of ${this.resourcePath} ${data}`);
		this.convertToFloar32Attribute( <THREE.BufferGeometry>this.mesh.geometry );
	}
}
export class ModelRegistry implements Registry{
	entries:Map<string,Model> = new Map<string,Model>();
	loader:ResourceLoader;

	constructor(resourcePath:string){
		this.loader = new ResourceLoader(resourcePath);
	}

	register( model:Model,forceRegister:boolean=false ):string{
		if(this.entries.has(model.name)&&!forceRegister){
			throw new Error(`[ModelRegistry] could not register model ${model.name}. Model already registered.`);
		}
		model.assignRegistry(this);
		this.loader.queue(model.resource);
		this.entries.set(model.name,model);
		return model.name;
	}

	get(key:string){
		if(!this.entries.has(key)){
			throw new Error(`[ModelRegistry] model:${key} is not registered.`);
		}
		return this.entries.get(key);
	}

	checkReady(ready:()=>void){
		this.loader.load(()=>{
			ready();
		})
	}
}