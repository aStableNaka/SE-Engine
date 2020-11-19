import { UniformModel } from "./UniformModel";
import { ModelOptions } from "./Model";
import * as THREE from "three";
import { GLTF } from "../utils/THREE/jsm/loaders/GLTFLoader";
import { Resource } from "../loader/Resource";

/**
 * RailedModels are models which have textures meant for
 * animation that follow a rail structure.
 * see conveyorbelt.
 * 
 * Mainly used for models with static geometry, but complex
 * textures with texture animations.
 * 
 * Each x-interval 
 * 
 * RailedModel meshes can only have a single material
 */
export class RailedModel extends UniformModel{
	usesTick = true;
	material!: THREE.MeshStandardMaterial;

	constructor( name:string, resourcePath:string, options?:ModelOptions ){
		super(name, resourcePath, 1, options);
		console.log(this.mesh);
		
	}

	setupRailedMaterial(){
		this.material = <THREE.MeshStandardMaterial>this.mesh.material;
	}

	/**
	 * Invoked when model loads
	 */
	handleModelLoaded( data:GLTF, resource:Resource ){
		this.defaultHandleModelLoaded( data, resource );
		this.setupRailedMaterial();
	}

	/**
	 * Create a mesh using instancing. For some reason, this creates
	 * a bug where every instanced mesh is exactly the same.
	 * I don't really understand it.
	 * @override
	 * @param positions 
	 * @param discriminator 
	 */
	/*
	construct_instanced( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		let clonedGeom = this.cloneGeometry();
		let mesh = new THREE.InstancedMesh( clonedGeom, this.materials[0] || this.mesh.material,positions.length );
		positions.map(( vec4:THREE.Vector4, i:number )=>{
			mesh.setMatrixAt(i, this.getLocalTransform(vec4));
		}, this);

		mesh.name = `${this.name}:${discriminator}`;
		this.setBoundingSphere( mesh );

		mesh.instanceMatrix.needsUpdate = true;
		return mesh;
	}*/
	
	calcYOffset( n: number ): number{
		return 0;
	}

	/**
	 * Called once every tick
	 * @param n 
	 */
	tick( n: number ){
		if(this.material.map){
			this.material.map.offset.y=this.calcYOffset( n );
		}
	}
}