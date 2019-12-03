import {Region} from "./Region";
import { World } from "../World";
import { Layer } from "../Layer";
import {regHub} from "../../registry/RegistryHub";

const regionSize = 16;

export class SimonsRegion extends Region{	
	constructor(world:World){
		super( regionSize, world );
	}

	/**
	 * Generates the floor layer
	 */
	private generateFloorLayer():Layer{
		let blockRegistry = regHub.get("base:block");
		return new Layer( regionSize, 0, (x,y)=>{
			return blockRegistry.createBlockData("base:BlockGround");
		});
	}

	generateTerrain(){
		this.layers.push(...[
			this.generateFloorLayer()
		]);
	}
}