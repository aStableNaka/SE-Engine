import {Region} from "./Region";
import { World } from "../World";
import { Layer } from "./Layer";
import {regHub} from "../../../registry/RegistryHub";
import { SimonsWorld } from "../SimonsWorld";
import * as THREE from "three";
import { BlockRegistry } from "../../../registry/BlockRegistry";
import { BlockData } from "../../blocks/Block";


export class SimonsRegion extends Region{
	world:SimonsWorld;
	constructor(world:SimonsWorld, location:THREE.Vector2){
		super( world, location );
		this.world = world;
	}

	/**
	 * 
	 */
	public generateTerrain(){
		this.layers.push(...[
			this.generateFloorLayer(),
			this.generateMiddleLayer()
		]);
	}

	/**
	 * 
	 * @param generationRules 
	 */
	private layerDecorator(location: number,
		generationRules:( 
			x: number,
			y: number,
			self: SimonsRegion ) => BlockData ){
		const self =this;
		return new Layer( this, location, (x,y)=>{
			// World location
			const wl = self.position.clone().multiplyScalar(self.world.chunkSize).add(new THREE.Vector2(x,y));
			return generationRules( wl.x, wl.y, self );
		});
	}

	private generateMiddleLayer():Layer{
		return this.layerDecorator( 1, ( x, y, self )=>{
			return self.world.biomeSelector.generate( x, y, 1 );
		});
	}

	/**
	 * Generates the floor layer
	 */
	private generateFloorLayer():Layer{
		return this.layerDecorator( 0, ( x,y, self )=>{;
			return self.world.biomeSelector.generate( x, y, 0 );
		} )
	}

}