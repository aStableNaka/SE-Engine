import * as Biome from "./Biome";
import {Noise2D} from "open-simplex-noise";
import { Vector3 } from "three";
import { BlockData } from "../blocks/Block";

export class BiomeCherryBlossomForest extends Biome.Biome{

	private pondFactor: number = 0.9;

	constructor( name: string ){
		super( name, new Vector3(
			Biome.BIOME_TEMPERATURE.TEMPERATE,
			Biome.BIOME_WETNESS.MODERATE,
			Biome.BIOME_FERTILITY.FERTILE
		));
	}

	/**
	 * Floor layer
	 */
	public generateLayer0( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		const pondChance = this.terrainNoise( x, y, noiseGen );
		let block = this.br.createBlockData( "base:BlockGround", 15 );

		// Grass
		if(pondChance<this.pondFactor){
			block  = this.br.createBlockData( "base:BlockGround", 2 );
		}
		return block;
	}

	/**
	 * Content layer
	 */
	public generateLayer1( x: number, y: number, noiseGen:Noise2D[] ): BlockData{
		const pondChance = this.terrainNoise( x, y, noiseGen );
		let block = this.br.createBlockData( "base:BlockEmpty" );
		
		if(pondChance<this.pondFactor){
			if(Math.random()<0.5){
				// Foliage
				if(Math.random()<0.1){
					block = this.br.createBlockData( "base:BlockTree" );
				}else{
					block = this.br.createBlockData( "base:BlockFoliage" );
				}
				
			}else{
				// Air
				block = this.br.createBlockData( "base:BlockEmpty" );
			}
		}
		return block;
	}
}