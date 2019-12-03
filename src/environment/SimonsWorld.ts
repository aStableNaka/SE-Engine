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
		this.regions = new Grid<Region>(8,(x,y)=>{
			return new SimonsRegion( self );
		});
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(  ){
		let self = this;
		window.requestAnimationFrame(()=>{
			self.render();
		});
		self.ff.render();
	}
}