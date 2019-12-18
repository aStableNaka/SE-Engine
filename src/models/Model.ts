import {GLTFResource} from "../loader/GLTFResource";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";
import * as THREE from "three";
import { Layer } from "../environment/Layer";
import { ModelRegistry } from "../registry/ModelRegistry";
import { Vector4 } from "three";

export type ModelOptions = {
	scale?:number;
	usesInstancing?:boolean;
};

export class ModelDataEntry{
	needsUpdate:boolean = true;
	contents:Vector4[] = [];
	modelKey:string;
	constructor(modelKey:string){
		this.modelKey = modelKey;
	}

	push( v4:Vector4 ){
		this.contents.push(v4);
		this.needsUpdate = true;
	}

	map(callback:(v4:Vector4,index?:number,array?:Vector4[])=>any, thisArg?:any){
		return this.contents.map(callback,thisArg);
	}
}

export class ModelInstancedMesh extends THREE.InstancedMesh{
	layerLocation:number = 0;
	constructor( geometry:THREE.Geometry | THREE.BufferGeometry, material:THREE.Material | THREE.Material[], count:number ){
		super( geometry, material, count );
	}

	layerize( layer:Layer ){
		this.layerLocation = layer.location;
	}
}

/**
 * This is for basic models that are composed of a single mesh
 */
export class Model{
	public name:string;
	public registry!: ModelRegistry;
	public mesh!:THREE.Mesh;
	public options: ModelOptions;

	constructor(name: string, options?: ModelOptions){
		this.name = name;
		this.options = options || {};
	}

	assignRegistry(registry:ModelRegistry){
		this.registry = registry;
	}

	/**
	 * Get the local transformation of a position
	 * @param pos 
	 */
	getLocalTransform(pos:THREE.Vector4):THREE.Matrix4{
		let matrix = new THREE.Matrix4().makeTranslation(pos.x||0,pos.z||0,pos.y||0);
		if(pos.w){
			matrix = new THREE.Matrix4().makeRotationZ( pos.w ).multiply( matrix );	
		}
		return matrix;
	}

	/**
	 * This must be overwritten by every mesh type.
	 * @param positions 
	 */
	construct( positions:THREE.Vector4[], discriminator:number ):THREE.Object3D | null{
		throw new Error("[Model] mesh cannot be constructed. No constuction definitions found.");
	}
}