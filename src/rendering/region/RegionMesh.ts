import * as THREE from 'three';
import { Region } from '../../environment/region/Region';

/**
 * Region meshes with are THREE.Group(s) which contain all the
 * meshes that represent the blocks of a region.
 * 
 * Since THREE.Meshes only support one matieral per mesh,
 * materials will be separated into flavors. Each block
 * will fall under a single flavor category,
 * all blocks with the same flavor category within a region
 * will be constructed within the same flavor-mesh
 * 
 * @required make a texture atlas that groups blocks/objects that
 * have the same flavor. This is for performance
 */
export class RegionMesh extends THREE.Group{
	region:Region;
	worldLocation!:THREE.Vector2; // This will be assigned by the world.
	constructor( region:Region ){
		super();
		this.region = region;
	}
}