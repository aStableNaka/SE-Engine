import {GLTFResource} from "../loader/GLTFResource";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";
import * as THREE from "three";
import { Layer } from "../environment/world/region/Layer";
import { ModelRegistry } from "../registry/ModelRegistry";
import { Vector4, Vector2 } from "three";

export type ModelOptions = {
	scale?:number;
	usesInstancing?:boolean;
	zOffset?:number;
	blending?:THREE.Blending;
	depthWrite?:boolean
};

/**
 * Contains positions and z-rotation for every
 * instance of a model. This is used to build
 * an instancedMesh or a MeshGroup
 */
export class ModelInstanceData{
	needsUpdate:boolean = false;
	contents:Vector4[] = [];
	modelKey:string;
	position:Vector2;
	constructor(modelKey:string, position:Vector2){
		this.modelKey = modelKey;
		this.position = position;
	}

	public push( v4:Vector4 ){
		this.contents.push(v4);
		this.needsUpdate = true;
	}

	public map(callback:(v4:Vector4,index?:number,array?:Vector4[])=>any, thisArg?:any){
		return this.contents.map(callback,thisArg);
	}

	public filter(callback:(v4:Vector4, index?:number, array?:Vector4[])=>any, thisArg?:any){
		return this.contents.filter(callback, thisArg);
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
		const zOffset = this.options.zOffset || 0;
		const translation = new THREE.Vector3(pos.x||0,(pos.z||0)+zOffset,pos.y||0);
		//const rotation = new THREE.Matrix4().makeRotationY(  );
		const rotation = new THREE.Quaternion();
		rotation.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), pos.w );
		const scale = new THREE.Vector3(1,1,1);
		const matrix = new THREE.Matrix4().compose( translation, rotation, scale );
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