import {Region} from "./Region";
import { World } from "../World";
import { Layer } from "../Layer";
import {regHub} from "../../registry/RegistryHub";
import { SimonsWorld } from "../SimonsWorld";
import * as THREE from "three";
import { BlockRegistry } from "../../registry/BlockRegistry";
import { BlockData } from "../blocks/Block";

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
			blockRegistry: BlockRegistry,
			self: SimonsRegion ) => BlockData ){
		const blockRegistry = <BlockRegistry>regHub.get("base:block");
		const self =this;
		return new Layer( this, location, (x,y)=>{
			return generationRules(x,y,blockRegistry,self);
		});
	}

	private generateMiddleLayer():Layer{
		return this.layerDecorator( 1, ( x,y, blockRegistry, self )=>{
			const localLocation = self.location.clone().multiplyScalar(self.world.chunkSize).add(new THREE.Vector2(x,y)).divideScalar(100);
			const noiseOutput = (self.world.noiseGen1.noise2D(localLocation.x/2,localLocation.y/2)+1)/2;
			// Stone
			let block = blockRegistry.createBlockData( "base:BlockGround", 1 );
			
			// Air
			if(noiseOutput<0.7){
				if(Math.random()<0.5){
					block = blockRegistry.createBlockData( "base:BlockFoliage" );
				}else{
					block = blockRegistry.createBlockData( "base:BlockEmpty" );
				}
			}
			return block;
		} )
	}

	/**
	 * Generates the floor layer
	 */
	private generateFloorLayer():Layer{
		return this.layerDecorator( 0, ( x,y, blockRegistry, self )=>{;
			let variant = 0;
			const groundBD = blockRegistry.createBlockData( "base:BlockGround", variant );
			return groundBD;
		} )
	}

}