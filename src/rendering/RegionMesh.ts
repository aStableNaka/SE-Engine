import * as THREE from 'three';
import { Region } from '../environment/Region';

export class RegionMesh extends THREE.Group{
	region:Region;
	constructor( region:Region ){
		super();
		this.region = region;
	}
}