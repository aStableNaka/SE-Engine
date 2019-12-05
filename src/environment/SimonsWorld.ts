import {World} from "./World";
import { FrostedFlakes } from "../rendering/FrostedFlakes";
import * as THREE from "three";
import { Grid } from "../utils/Spaces";
import { Region } from "./region/Region";
import {SimonsRegion} from "./region/SimonsRegion";
import { OrbitControls } from "../controls/Orbit";

/**
 * @checkpoint
 * Control test alpha 0
 * https://gfycat.com/CautiousSeveralDromaeosaur
 */

/**
 * Simons world is a world where each region
 * has 4 or more layers. The layers follow this mapping:
 * 3 - other
 * 2 - roofs
 * 1 - walls
 * 0 - ground
 */
export class SimonsWorld extends World{

	worldSize=32;

	constructor( ff:FrostedFlakes ){
		super( ff );
		let self = this;
		this.regions = new Grid<Region>(this.worldSize,(y,x)=>{
			let region = new SimonsRegion( self );
			region.meshGroup.position.set(x*this.chunkSize,0,y*this.chunkSize);
			region.constructMesh();
			return region;
		});
		this.setupControls(ff);
		
	}

	/**
	 * Set up the controls for SimonsWorld 
	 * @param ff 
	 */
	setupControls( ff:FrostedFlakes ){
		// Set up the orbit controls
		ff.orbitControlls.maxPolarAngle=Math.PI/180*45;
		ff.orbitControlls.minPolarAngle=Math.PI/180*45;
		ff.orbitControlls.minDistance=5;
		ff.orbitControlls.maxDistance=20;
		ff.orbitControlls.enableDamping = false;
		ff.orbitControlls.keyPanSpeed=5;

		// Set camera target to player location
		ff.orbitControlls.target.set(this.chunkSize*this.worldSize/2-5,1,this.chunkSize*this.worldSize/2-5)
		ff.camera.position.set(this.chunkSize*this.worldSize/2,5,this.chunkSize*this.worldSize/2);
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(){
		this.defaultRender();
	}
}