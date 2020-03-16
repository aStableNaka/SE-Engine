import { UniformModel } from "./UniformModel";
import { ModelOptions, ModelInstancedMesh } from "./Model";
import * as THREE from "three";

/**
 * IndividualModels are models that cannot be instanced. Like models with
 * bones, or models that have animations.
 */
export class IndividualModel extends UniformModel{
	constructor(name:string, resourcePath:string, textureAtlasSubdivisions:number=1, options?:ModelOptions){
		super(name, resourcePath, textureAtlasSubdivisions, options);
		this.subdivisions=textureAtlasSubdivisions;
	}

	/**
	 * Construct each object as its own mesh
	 * @param position 
	 * @param discriminator 
	 */
	construct_group( positions: THREE.Vector4[], discriminator: number =  0 ) : THREE.Object3D{
		const clonedGeom = this.cloneGeometry();
		const shadowGeom = this.cloneShadowGeometry();
		const group = new THREE.Group();
		let shadowMesh: ModelInstancedMesh | undefined;
		if( shadowGeom && this.shadowMesh ){
			shadowMesh = new ModelInstancedMesh( shadowGeom, this.shadowMesh.material, positions.length );
			shadowMesh.name = `${this.name}_shadow:${discriminator}`
		}

		positions.map(( vec4:THREE.Vector4, i:number )=>{
			const localTransform = this.getLocalTransform(vec4);
			const mesh = new THREE.Mesh( clonedGeom, this.materials[discriminator] || this.mesh.material  );
			mesh.position.set( vec4.x, vec4.z, vec4.y );
			mesh.rotateY( vec4.w );
			group.add( mesh );
			mesh.geometry.computeBoundingBox();
			if( shadowMesh ){
				shadowMesh.setMatrixAt( i, localTransform );
			}
		}, this);

		if( shadowMesh ){
			const mat = (<THREE.Material>shadowMesh.material);
			this.setBoundingSphere( shadowMesh );
			shadowMesh.instanceMatrix.needsUpdate = true;
			//mat.blending = THREE.MultiplyBlending;
			mat.depthWrite = false;
			mat.transparent = true;
			mat.opacity = 0.7;
			mat.side = THREE.DoubleSide;
			group.add(shadowMesh);
		}

		return group;
	}
	
	construct( positions:THREE.Vector4[], discriminator:number=0 ):THREE.Object3D{
		return this.construct_group(positions,discriminator);
	}
}