import { UniformModel } from "./UniformModel";
import { ModelOptions } from "./Model";
import * as THREE from "three";

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
}