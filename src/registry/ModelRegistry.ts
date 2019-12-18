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
import {BufferGeometryUtils} from "../utils/THREE/jsm/utils/BufferGeometryUtils";
import { Layer } from "../environment/Layer";
import {Model} from "../models/Model";

/**
 * @example
 * let mr = new ModelRegistry("assets/models");
 * mr.queue( new UniformModel("cube", "Cube.gltf") )
 */
export class ModelRegistry implements Registry{
	entries:Map<string,Model> = new Map<string,Model>();
	loader:ResourceLoader;
	list:Model[] = [];
	constructor(resourcePath:string){
		this.loader = new ResourceLoader(resourcePath);
	}

	register( model:Model,forceRegister:boolean=false ):string{
		if(this.entries.has(model.name)&&!forceRegister){
			throw new Error(`[ModelRegistry] could not register model ${model.name}. Model already registered.`);
		}
		model.assignRegistry(this);
		this.entries.set(model.name,model);
		this.list.push(model);
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