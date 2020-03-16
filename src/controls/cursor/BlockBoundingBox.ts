import * as THREE from "three";

const boundingBoxMaterial = new THREE.MeshBasicMaterial({transparent:true,opacity:0});
const boundingBoxSelectedMaterial = new THREE.MeshBasicMaterial({transparent:true,opacity:0.3,color:0xffffff});

export class BlockBoundingBox extends THREE.Mesh{
	
	//position: THREE.Vector3 = new THREE.Vector3( 0, 0, 0 );
	//blockPosition: THREE.Vector2 = new THREE.Vector2( 0, 0 );
	
	/**
	 * @param dimensions (width, height, depth)
	 */
	constructor( dimensions: THREE.Vector3 ){
		super( new THREE.BoxBufferGeometry( dimensions.x, dimensions.y, dimensions.z ), boundingBoxMaterial );
	}
}