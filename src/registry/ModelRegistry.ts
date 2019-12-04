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
	gltf!:GLTF;
	constructor(name:string,resourcePath:string){
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

	defaultOnModelLoaded( data:GLTF,resource:Resource ){
		this.gltf = data;
		this.mesh = <THREE.Mesh>data.scene.children.filter((obj3d)=>{ return obj3d.type=="Mesh";})[0];
		if(!this.mesh) throw new Error(`[Model] Mesh could not be found within scene of ${this.resourcePath} ${data}`);
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.defaultOnModelLoaded( data, resource );
	}

	/**
	 * Get the local transformation of a position
	 * @param pos 
	 */
	getLocalTransform(pos:THREE.Vector3):THREE.Matrix4{
		return new THREE.Matrix4().makeTranslation(pos.x||0,pos.z||0,pos.y||0);
	}

	/**
	 * This must be overwritten by every mesh type.
	 * @param positions 
	 */
	construct( positions:THREE.Vector3[] ):THREE.Object3D{
		throw new Error("[Model] mesh cannot be constructed. No constuction definitions found.");
	}
}

export class UniformModel extends Model{
	constructor(name:string, resourcePath:string){
		super(name, resourcePath);
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.defaultOnModelLoaded( data, resource );
		this.convertToFloar32Attribute( <THREE.BufferGeometry>this.mesh.geometry );
	}

	/**
	 * @override
	 */
	construct( positions:THREE.Vector3[] ):THREE.Object3D{
		let mesh = new THREE.InstancedMesh( this.mesh.geometry,this.mesh.material,positions.length );
		positions.map(( vec3:THREE.Vector3, i:number )=>{
			mesh.setMatrixAt(i, this.getLocalTransform(vec3));
		}, this);

		// This is for the culling issues
		mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 11.3137);
		mesh.geometry.boundingSphere.center = new THREE.Vector3(8,0.5,8);
		return mesh;
	}
}

export class UniformModelScaled extends UniformModel{
	scale:number;
	constructor(name:string, resourcePath:string, scale:number=1){
		super(name, resourcePath);
		this.scale = scale;
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.defaultOnModelLoaded( data, resource );
		this.mesh.geometry.scale(0.5,0.5,0.5);
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