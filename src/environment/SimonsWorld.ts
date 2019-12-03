import {World} from "./World";
import { FrostedFlakes } from "../rendering/FrostedFlakes";
import * as THREE from "three";
import { Grid } from "../utils/Spaces";
import { Region } from "./region/Region";
import {SimonsRegion} from "./region/SimonsRegion";

/**
 * Simons world is a world where each region
 * has 4 or more layers. The layers follow this mapping:
 * 3 - other
 * 2 - roofs
 * 1 - walls
 * 0 - ground
 */
export class SimonsWorld extends World{

	constructor( ff:FrostedFlakes ){
		super( ff );
		let self = this;
		this.regions = new Grid<Region>(8,(y,x)=>{
			let region = new SimonsRegion( self );
			region.meshGroup.position.set(x*16,0,y*16);
			region.constructMesh();
			return region;
		});
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(){
		this.defaultRender();
	}
}