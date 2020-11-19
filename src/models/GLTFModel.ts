import {GLTFResource} from "../loader/GLTFResource";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";
import * as THREE from "three";
import { Layer } from "../environment/world/region/Layer";
import { ModelRegistry } from "../registry/ModelRegistry";
import { Vector4 } from "three";
import { Model, ModelOptions } from "./Model";

export class GLTFModel extends Model{
	resource!:GLTFResource;
	gltf!:GLTF;
	resourcePath:string;
	shadowMesh: THREE.Mesh | undefined;
	constructor( name: string, resourcePath: string, options?: ModelOptions){
		console.log(options);
		super( name, options );
		this.resourcePath = resourcePath;
	}

	assignRegistry(registry:ModelRegistry){
		this.registry = registry;
		this.resource = new GLTFResource(this.resourcePath, this.handleModelLoaded.bind(this));
		registry.loader.queue(this.resource);
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

	cloneShadowGeometry(): THREE.BufferGeometry | undefined{
		if(this.shadowMesh){
			let g  = this.shadowMesh.geometry.clone();
			this.convertToFloat32Attribute(<THREE.BufferGeometry>g);
			return <THREE.BufferGeometry>g;
		}
		return;
	}

	setBoundingSphere( mesh:THREE.Mesh ){
		mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(16,0.5,16), 16);
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
		attr.position = this.bufferAttribute_To_Float32BufferAttribute( <THREE.BufferAttribute>attr.position );
		attr.normal = this.bufferAttribute_To_Float32BufferAttribute( <THREE.BufferAttribute>attr.normal );
		attr.uv = this.bufferAttribute_To_Float32BufferAttribute( <THREE.BufferAttribute>attr.uv );
		geometry.index = new THREE.Uint16BufferAttribute(geometry.index.array, geometry.index.itemSize, geometry.index.normalized);
	}

	bufferAttribute_To_Float32BufferAttribute(bufferAttribute:THREE.BufferAttribute){
		return new THREE.Float32BufferAttribute(bufferAttribute.array, bufferAttribute.itemSize, bufferAttribute.normalized);
	}

	defaultHandleModelLoaded( data:GLTF,resource:Resource ){
		this.gltf = data;
		this.mesh = <THREE.Mesh>data.scene.children.filter((obj3d)=>{ return obj3d.type=="Mesh" && obj3d.name!='shadow';})[0];
		this.shadowMesh = <THREE.Mesh>data.scene.children.filter((obj3d)=>{ return obj3d.type=="Mesh" && obj3d.name=='shadow';})[0];
		if(!this.mesh) throw new Error(`[Model] Mesh could not be found within scene of ${this.resourcePath} ${data}`);
	}

	handleModelLoaded( data:GLTF, resource:Resource ){
		this.defaultHandleModelLoaded( data, resource );
	}
}