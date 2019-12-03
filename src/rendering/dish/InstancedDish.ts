import * as THREE from "three";
import { Flavor } from "../flavors/Flavor";

class InstancedDish extends THREE.InstancedMesh{
	constructor( geometry: THREE.Geometry | THREE.BufferGeometry, flavor:Flavor, count:number=1){
		super( geometry, flavor.material, count );
	};
}