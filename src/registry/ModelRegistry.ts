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
	getLocalTransform(pos:THREE.Vector3):THREE.Matrix4{
		return new THREE.Matrix4().makeTranslation(pos.x||0,pos.z||0,pos.y||0);
	}

	/**
	 * This must be overwritten by every mesh type.
	 * @param positions 
	 */
	construct( positions:THREE.Vector3[], discriminator:number ):THREE.Object3D{
		throw new Error("[Model] mesh cannot be constructed. No constuction definitions found.");
	}
}

export class UniformModel extends Model{
	materials:THREE.MeshStandardMaterial[] = [];
	subdivisions: number;
	constructor(name:string, resourcePath:string, textureAtlasSubdivisions:number=1){
		super(name, resourcePath);
		this.subdivisions=textureAtlasSubdivisions;
	}

	generateVariations(){
		// This will set up texture variations
		let mat = (<THREE.MeshStandardMaterial>this.mesh.material);
		if(mat.map){
			// Set textures to nearest neighbor filter for pixel-correctness.
			mat.map.magFilter=THREE.NearestFilter;
		}
		let scale = 1/this.subdivisions
		for( let y = 0; y < this.subdivisions; y++ ){
			for( let x = 0; x < this.subdivisions; x++ ){
				let material = mat.clone();
				if(material.map){
					material.side = THREE.DoubleSide;
					material.map = material.map.clone();
					material.map.offset = new THREE.Vector2(x*scale,y*scale);
					material.map.needsUpdate=true;
					material.map.minFilter = THREE.NearestFilter;
					material.map.magFilter = THREE.NearestFilter;
					this.materials.push(material);
				}
			}
		}

		console.log(`[UniformModel] ${this.materials.length} material variations generated for "${this.resourcePath}"`);
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.defaultOnModelLoaded( data, resource );
		this.convertToFloat32Attribute( <THREE.BufferGeometry>this.mesh.geometry );
		this.generateVariations();
	}

	/**
	 * Create a mesh using instancing. For some reason, this creates
	 * a bug where every instanced mesh is exactly the same.
	 * I don't really understand it.
	 * @override
	 * @param positions 
	 * @param discriminator 
	 */
	construct_instanced( positions:THREE.Vector3[], discriminator:number=0 ):THREE.Object3D{
		/**
		 * @note when using InstancedMesh, the reference geometry has to be cloned.
		 */
		let clonedGeom = this.cloneGeometry();
		let mesh = new THREE.InstancedMesh( clonedGeom, this.materials[discriminator] || this.mesh.material,positions.length );
		positions.map(( vec3:THREE.Vector3, i:number )=>{
			mesh.setMatrixAt(i, this.getLocalTransform(vec3));
		}, this);
		// Something is wrong with the mesh i don't understand lol
		// This is for the culling issues
		mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 11.3137);
		mesh.geometry.boundingSphere.center = new THREE.Vector3(32,0.5,32);
		mesh.name = `${this.name}:${discriminator}`;
		mesh.frustumCulled = false;

		mesh.instanceMatrix.needsUpdate = true;
		return mesh;
	}

	/**
	 * Construct using mesh merging
	 * @doesnt_work_either_lol
	 * @param positions 
	 * @param discriminator 
	 */
	construct_merged( positions:THREE.Vector3[], discriminator:number=0 ):THREE.Object3D{
		let geoms = positions.map(( vec3:THREE.Vector3, i:number )=>{
			let geom = <THREE.BufferGeometry>this.mesh.geometry.clone();
			this.convertToFloat32Attribute(geom);
			geom.applyMatrix( this.getLocalTransform(vec3) );
			return geom;
		}, this);
		let mergedGeom = BufferGeometryUtils.mergeBufferGeometries(geoms);
		let mesh = new THREE.Mesh(mergedGeom,this.materials[discriminator]||this.mesh.material);
		mesh.updateMatrix();
		// Something is wrong with the mesh i don't understand lol
		// This is for the culling issues
		mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 11.3137);
		mesh.geometry.boundingSphere.center = new THREE.Vector3(8,0.5,8);
		mesh.name = `${this.name}:${discriminator}`;
		mesh.frustumCulled = false;
		return mesh;
	}

	construct( positions:THREE.Vector3[], discriminator:number=0 ):THREE.Object3D{
		return this.construct_instanced(positions,discriminator);
	}
}

export class UniformModelScaled extends UniformModel{
	scale:number;
	constructor(name:string, resourcePath:string, scale:number=1, textureAtlasSubdivisions:number=1 ){
		super(name, resourcePath);
		this.scale = scale;
		this.subdivisions = textureAtlasSubdivisions;
	}

	onModelLoaded( data:GLTF, resource:Resource ){
		this.defaultOnModelLoaded( data, resource );
		this.mesh.geometry.scale(0.5,0.5,0.5);
		this.convertToFloat32Attribute( <THREE.BufferGeometry>this.mesh.geometry );
		this.generateVariations();
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