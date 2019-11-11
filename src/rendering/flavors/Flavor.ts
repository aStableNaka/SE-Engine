import * as THREE from 'three';

/**
 * Flavors are basically a wrapper for materials
 * 
 * @ref rendering/region/RegionMesh.js
 */
export class Flavor{
	module:"base";
	material: THREE.Material;
	name: string;

	get flavorId(){
		return `${this.module}:${this.name}`;
	}

	constructor( material:THREE.Material, name:string ){
		this.material = material;
		this.name = name;
	}
}