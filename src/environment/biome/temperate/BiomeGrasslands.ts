import * as Biome from "../Biome";
import {Noise2D} from "open-simplex-noise";
import { Vector3 } from "three";
import { BlockData } from "../../blocks/Block";

export class BiomeGrasslands extends Biome.Biome{

	private pondFactor: number = 0.9;

	constructor( name: string ){
		super( name, new Vector3(
			Biome.BIOME_TEMPERATURE.SUBTROPICS,
			Biome.BIOME_WETNESS.MODERATE,
			Biome.BIOME_FERTILITY.MODERATE
		));
	}

	/**
	 * Floor layer
	 */
	public generateLayer0( x: number, y: number, noiseGen:Noise2D[] ): BlockData{

		// Dark grass
		let block = this.br.createBlockData( "base:BlockGround", 0 );
		return block;
	}

	/**
	 * Content layer
	 */
	public generateLayer1( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		let block;
		if(Math.random()<0.3){
			// Foliage
			block = this.br.createBlockData( "base:BlockFoliage" );
		}else{
			// Air
			block = this.br.createBlockData( "base:BlockEmpty" );
		}
		return block;
	}
}