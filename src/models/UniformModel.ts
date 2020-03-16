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

	/**
	 * Process a material: apply filters and map offsets
	 * @param material 
	 * @param x 
	 * @param y 
	 */
	private processMaterial( material: THREE.MeshStandardMaterial, x: number, y: number ){
		const scale = 1/this.subdivisions
		if(material.map){
			material.side = THREE.DoubleSide;
			material.depthWrite = typeof(this.options.depthWrite)=="boolean" ? this.options.depthWrite : material.depthWrite;
			material.blending = this.options.blending || material.blending;
			material.map = material.map.clone();
			material.map.offset = new THREE.Vector2(x*scale,y*scale);
			material.map.needsUpdate=true;
			material.map.minFilter = THREE.NearestFilter;
			material.map.magFilter = THREE.NearestFilter;
			//material.depthWrite = false;
			//material.depthTest = false;
			material.flatShading = true;
			this.materials.push(material);	
		}	
	}

	private generateVariations(){
		// This will set up texture variations
		const mat = (<THREE.MeshStandardMaterial>this.mesh.material);
		for( let y = 0; y < this.subdivisions; y++ ){
			for( let x = 0; x < this.subdivisions; x++ ){
				const material = mat.clone();
				this.processMaterial( material, x, y );
			}
		}
		console.log(`[UniformModel] ${this.materials.length} material variations generated for "${this.resourcePath}"`);
	}

	/**
	 * Invoked once this model gets loaded
	 * @param data 
	 * @param resource 
	 */
	public handleModelLoaded( data:GLTF, resource:Resource ){
		this.defaultHandleModelLoaded( data, resource );
		if(this.options.scale){
			console.log(`[Model:${this.name}] rescaling ${this.options.scale}`);
			this.mesh.geometry.scale(this.options.scale,this.options.scale,this.options.scale);
			if(this.shadowMesh){
				this.shadowMesh.geometry.scale(this.options.scale,this.options.scale,this.options.scale);
			}
		}
		this.convertToFloat32Attribute( <THREE.BufferGeometry>this.mesh.geometry );
		this.generateVariations();
	}


	/**
	 * Create a mesh using instancing.
	 * @override
	 * @param positions 
	 * @param discriminator 
	 */
	construct_instanced( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		/**
		 * @note when using InstancedMesh, the reference geometry has to be cloned.
		 */
		const clonedGeom = this.cloneGeometry();
		const shadowGeom = this.cloneShadowGeometry();
		const mesh = new ModelInstancedMesh( clonedGeom, this.materials[discriminator] || this.mesh.material, positions.length );
		let shadowMesh: ModelInstancedMesh | undefined;
		if( shadowGeom && this.shadowMesh ){
			shadowMesh = new ModelInstancedMesh( shadowGeom, this.shadowMesh.material, positions.length );
			shadowMesh.name = `${this.name}_shadow:${discriminator}`
		}

		positions.map(( vec4:THREE.Vector4, i:number )=>{
			const localTransform = this.getLocalTransform(vec4);
			mesh.setMatrixAt(i, localTransform );
			if( shadowMesh ){
				shadowMesh.setMatrixAt( i, localTransform );
			}
		}, this);

		mesh.name = `${this.name}:${discriminator}`;
		this.setBoundingSphere( mesh );
		mesh.instanceMatrix.needsUpdate = true;

		if( shadowMesh ){
			const mat = (<THREE.Material>shadowMesh.material);
			this.setBoundingSphere( shadowMesh );
			shadowMesh.instanceMatrix.needsUpdate = true;
			//mat.blending = THREE.MultiplyBlending;
			mat.depthWrite = false;
			mat.transparent = true;
			mat.opacity = 0.7;
			mat.side = THREE.DoubleSide;
			const group = new THREE.Group();
			group.add(mesh);
			group.add(shadowMesh);
			return group;
		}

		return mesh;
	}

	/**
	 * Construct using mesh merging.
	 * DO NOT USE. Very slow, and produces glitchy results.
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