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

export type ModelOptions = {
	scale?:number;
};

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

/**
 * Uniform models are models that have one single uniform geometry
 * and may only vary in materials. Uniform models do not
 * support any sort of animation, but are optimized for rendering
 * by using instancing.
 */
export class UniformModel extends Model{
	materials:THREE.MeshStandardMaterial[] = [];
	subdivisions: number;
	constructor(name:string, resourcePath:string, textureAtlasSubdivisions:number=1, options?:ModelOptions){
		super(name, resourcePath, options);
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
		console.log(data);
		if(this.options.scale){
			this.mesh.geometry.scale(0.5,0.5,0.5);
		}
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
	construct_instanced( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		/**
		 * @note when using InstancedMesh, the reference geometry has to be cloned.
		 */
		let clonedGeom = this.cloneGeometry();
		let mesh = new ModelInstancedMesh( clonedGeom, this.materials[discriminator] || this.mesh.material,positions.length );
		positions.map(( vec4:THREE.Vector4, i:number )=>{
			mesh.setMatrixAt(i, this.getLocalTransform(vec4));
		}, this);
		mesh.name = `${this.name}:${discriminator}`;
		this.setBoundingSphere( mesh );

		mesh.instanceMatrix.needsUpdate = true;
		return mesh;
	}

	/**
	 * Construct using mesh merging
	 * @doesnt_work_either_lol
	 * @param positions 
	 * @param discriminator 
	 */
	construct_merged( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		let attrPositionArray:number[] = [];
		let attrNormalArray:number[] = [];
		let attrUvArray:number[] = [];
		let attrIndexArray:number[] = [];

		let baseGeometry = <THREE.BufferGeometry>this.mesh.geometry.clone();

		positions.map((vec4:THREE.Vector4, i:number)=>{
			let geom = baseGeometry.clone();

			geom.applyMatrix(this.getLocalTransform(vec4));

			let posArr = <Float32Array>geom.attributes.position.array;
			let normalArr = <Float32Array>geom.attributes.normal.array;
			let uvArr = <Float32Array>geom.attributes.uv.array;
			let index = <Uint16Array>geom.index.array;
			
			attrPositionArray.push(...posArr);
			attrNormalArray.push(...normalArr);
			attrUvArray.push(...uvArr);
			attrIndexArray.push(...index);
		});

		let positionF32A = new Float32Array( attrPositionArray );
		let normalF32A = new Float32Array( attrNormalArray );
		let uvF32A = new Float32Array( attrUvArray );
		let positionUi16A = new Float32Array( attrPositionArray );

		let positionAttribute = new THREE.Float32BufferAttribute(positionF32A, baseGeometry.attributes.position.itemSize);
		let normalAttribute = new THREE.Float32BufferAttribute(normalF32A, baseGeometry.attributes.normal.itemSize);
		let uvAttribute = new THREE.Float32BufferAttribute(uvF32A, baseGeometry.attributes.uv.itemSize);
		let indexAttribute = new THREE.Uint16BufferAttribute(positionUi16A, baseGeometry.attributes.position.itemSize);

		let mergedGeometry = baseGeometry.clone();
		mergedGeometry.attributes.position = positionAttribute;
		mergedGeometry.attributes.normal = normalAttribute;
		mergedGeometry.attributes.uv = uvAttribute;
		mergedGeometry.index = indexAttribute;

		let mesh = new THREE.Mesh( mergedGeometry, this.materials[discriminator]||this.mesh.material );
		mesh.updateMatrix();
		mesh.name =  this.name;
		
		throw new Error("[UniformModel.construct_merged] does not work.");

		return mesh;
		/*
		throw new Error("[UniformModel] Please do not use UniformModel.construct_merged");
		let geoms = positions.map(( vec4:THREE.Vector4, i:number )=>{
			let geom = <THREE.BufferGeometry>this.mesh.geometry.clone();
			this.convertToFloat32Attribute(geom);
			geom.applyMatrix( this.getLocalTransform(vec4) );
			return geom;
		}, this);
		let mergedGeom = BufferGeometryUtils.mergeBufferGeometries(geoms);
		let mesh = new THREE.Mesh(mergedGeom,this.materials[discriminator]||this.mesh.material);
		mesh.updateMatrix();

		mesh.name = `${this.name}:${discriminator}`;
		this.setBoundingSphere( mesh );
		return mesh;
		*/
	}

	construct( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		return this.construct_instanced(positions,discriminator);
	}
}

/**
 * RailedModels are models which have textures meant for
 * animation that follow a rail structure.
 * see conveyorbelt.
 * 
 * Mainly used for models with static geometry, but complex
 * textures with texture animations.
 * 
 * Each x-interval 
 */
export class RailedModel extends UniformModel{
	constructor( name:string, resourcePath:string, options?:ModelOptions ){
		super(name, resourcePath, 1, options);
	}

	/**
	 * Create a mesh using instancing. For some reason, this creates
	 * a bug where every instanced mesh is exactly the same.
	 * I don't really understand it.
	 * @override
	 * @param positions 
	 * @param discriminator 
	 */
	construct_instanced( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		/**
		 * @note when using InstancedMesh, the reference geometry has to be cloned.
		 */
		let clonedGeom = this.cloneGeometry();
		let mesh = new THREE.InstancedMesh( clonedGeom, this.materials[0] || this.mesh.material,positions.length );
		positions.map(( vec4:THREE.Vector4, i:number )=>{
			mesh.setMatrixAt(i, this.getLocalTransform(vec4));
		}, this);

		mesh.name = `${this.name}:${discriminator}`;
		this.setBoundingSphere( mesh );

		mesh.instanceMatrix.needsUpdate = true;
		return mesh;
	}
}

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
		this.loader.queue(model.resource);
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