/**
 * Dishes are objects with the same flavor baked into a single mesh
 */
import * as THREE from "three";
import { Flavor } from "../flavors/Flavor";

export class Dish extends THREE.Mesh{
	constructor( defaultGeometry:THREE.Geometry | THREE.BufferGeometry, flavor:Flavor ){
		super( defaultGeometry, flavor.material );
	}
}