import { ModelOptions, ModelInstancedMesh } from "./Model";
import { GLTFModel } from "./GLTFModel";
import * as THREE from "three";

import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";

import { Resource } from "../loader/Resource";

/**
 * Uniform models are models that have one single uniform geometry
 * and may only vary in materials. Uniform models do not
 * support any sort of animation, but are optimized for rendering
 * by using instancing.
 */
export class UniformModel extends GLTFModel{
	materials:THREE.MeshStandardMaterial[] = [];
	subdivisions: number;
	constructor(name:string, resourcePath:string, textureAtlasSubdivisions:number=1, options?:ModelOptions){
		super(name, resourcePath, options);
		this.subdivisions=textureAtlasSubdivisions;
	}

	generateVariations(){
		// This will set up texture variations
		const mat = (<THREE.MeshStandardMaterial>this.mesh.material);
		if(mat.map){
			// Set textures to nearest neighbor filter for pixel-correctness.
			mat.map.magFilter=THREE.NearestFilter;
		}
		const scale = 1/this.subdivisions
		for( let y = 0; y < this.subdivisions; y++ ){
			for( let x = 0; x < this.subdivisions; x++ ){
				const material = mat.clone();
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

	handleModelLoaded( data:GLTF, resource:Resource ){
		this.defaultHandleModelLoaded( data, resource );
		if(this.options.scale){
			console.log(`[Model:${this.name}] rescaling ${this.options.scale}`);
			this.mesh.geometry.scale(this.options.scale,this.options.scale,this.options.scale);
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
		const clonedGeom = this.cloneGeometry();
		const mesh = new ModelInstancedMesh( clonedGeom, this.materials[discriminator] || this.mesh.material,positions.length );
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
		const attrPositionArray:number[] = [];
		const attrNormalArray:number[] = [];
		const attrUvArray:number[] = [];
		const attrIndexArray:number[] = [];

		const baseGeometry = <THREE.BufferGeometry>this.mesh.geometry.clone();

		positions.map((vec4:THREE.Vector4, i:number)=>{
			const geom = baseGeometry.clone();

			geom.applyMatrix(this.getLocalTransform(vec4));

			const posArr = <Float32Array>geom.attributes.position.array;
			const normalArr = <Float32Array>geom.attributes.normal.array;
			const uvArr = <Float32Array>geom.attributes.uv.array;
			const index = <Uint16Array>geom.index.array;
			
			attrPositionArray.push(...posArr);
			attrNormalArray.push(...normalArr);
			attrUvArray.push(...uvArr);
			attrIndexArray.push(...index);
		});

		const positionF32A = new Float32Array( attrPositionArray );
		const normalF32A = new Float32Array( attrNormalArray );
		const uvF32A = new Float32Array( attrUvArray );
		const positionUi16A = new Float32Array( attrPositionArray );

		const positionAttribute = new THREE.Float32BufferAttribute(positionF32A, baseGeometry.attributes.position.itemSize);
		const normalAttribute = new THREE.Float32BufferAttribute(normalF32A, baseGeometry.attributes.normal.itemSize);
		const uvAttribute = new THREE.Float32BufferAttribute(uvF32A, baseGeometry.attributes.uv.itemSize);
		const indexAttribute = new THREE.Uint16BufferAttribute(positionUi16A, baseGeometry.attributes.position.itemSize);

		const mergedGeometry = baseGeometry.clone();
		mergedGeometry.attributes.position = positionAttribute;
		mergedGeometry.attributes.normal = normalAttribute;
		mergedGeometry.attributes.uv = uvAttribute;
		mergedGeometry.index = indexAttribute;

		const mesh = new THREE.Mesh( mergedGeometry, this.materials[discriminator]||this.mesh.material );
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