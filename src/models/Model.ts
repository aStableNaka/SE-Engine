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
	resource!:GLTFResource;
	name:string;
	resourcePath:string;
	registry!: ModelRegistry;
	mesh!:THREE.Mesh;
	gltf!:GLTF;
	options: ModelOptions;
	constructor(name:string,resourcePath:string,options?:ModelOptions){
		this.name = name;
		this.resourcePath = resourcePath;
		this.options = options || {};
	}

	assignRegistry(registry:ModelRegistry){
		this.registry = registry;
		this.resource = new GLTFResource(this.resourcePath, this.onModelLoaded.bind(this));
	}

	cloneMesh():THREE.Mesh{
		let m = this.mesh.clone();
		this.convertToFloat32Attribute( <THREE.BufferGeometry>m.geometry );
		return m;
	}

	cloneGeometry():THREE.BufferGeometry{
		let g  = this.mesh.geometry.clone();
		this.convertToFloat32Attribute(<THREE.BufferGeometry>g);
		return <THREE.BufferGeometry>g;
	}

	setBoundingSphere( mesh:THREE.Mesh ){
		mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 11.3137);
		mesh.geometry.boundingSphere.center = new THREE.Vector3(32,0.5,32);
		mesh.frustumCulled = false;
	}

	/**
	 * This is necessary because trying to use the geometry provided by
	 * GLTFLoader causes WEBGL_BUFFER issues
	 * @param geometry 
	 */
	convertToFloat32Attribute(geometry:THREE.BufferGeometry){
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
	construct( positions:THREE.Vector4[], discriminator:number ):THREE.Object3D{
		throw new Error("[Model] mesh cannot be constructed. No constuction definitions found.");
	}
}