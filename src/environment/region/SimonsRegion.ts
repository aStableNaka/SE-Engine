import {Region} from "./Region";
import { World } from "../World";
import { Layer } from "../Layer";
import {regHub} from "../../registry/RegistryHub";
import { SimonsWorld } from "../SimonsWorld";
import * as THREE from "three";
import { BlockRegistry } from "../../registry/BlockRegistry";

export class SimonsRegion extends Region{
	world:SimonsWorld;
	constructor(world:SimonsWorld, location:THREE.Vector2){
		super( world, location );
		this.world = world;
	}

	/**
	 * Generates the floor layer
	 */
	private generateFloorLayer():Layer{
		let blockRegistry = <BlockRegistry>regHub.get("base:block");
		let self =this;
		return new Layer( this.world.chunkSize, 0, (x,y)=>{
			let localLocation = self.location.clone().multiplyScalar(self.world.chunkSize).add(new THREE.Vector2(x,y)).divideScalar(100);
			let noiseOutput = (self.world.noiseGen1.noise2D(localLocation.x,localLocation.y)+1)/2;
			let variant = 0;
			if(noiseOutput>0.9){
				variant+= Math.floor( Math.random()*3 );
			}
			let groundBD = blockRegistry.createBlockData("base:BlockGround", null);
			return groundBD;
		});
	}

	generateTerrain(){
		this.layers.push(...[
			this.generateFloorLayer()
		]);
	}
}