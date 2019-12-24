import * as Biome from "./Biome";
import * as SimplexNoise from "simplex-noise";
import { Vector3 } from "three";
import { BlockData } from "../blocks/Block";

export class BiomeCherryBlossomForest extends Biome.Biome{
	
	private ncx: number = 0;
	private ncy: number = 0;
	private noiseCacheValue: number = 0;

	private pondFactor: number = 0.9;

	constructor( name: string ){
		super( name, new Vector3(
			Biome.BIOME_TEMPERATURE.TEMPERATE,
			Biome.BIOME_WETNESS.MODERATE,
			Biome.BIOME_FERTILITY.FERTILE
		));
	}

	

	terrainNoise(x: number, y: number, noiseGen:SimplexNoise[]): number{
		if( this.ncx == x && this.ncy == y ){
			return this.noiseCacheValue;
		}
		this.ncx = x;
		this.ncy = y;
		this.noiseCacheValue = (noiseGen[Biome.NOISE_GENERATOR_LABELS.TERRAIN].noise2D(x/200,y/200)+1)/2;
		return this.noiseCacheValue;
	}
	
	/**
	 * Floor layer
	 */
	public generateLayer0( x: number, y: number, noiseGen:SimplexNoise[] ): BlockData{
		const pondChance = this.terrainNoise( x, y, noiseGen );
		let block = this.br.createBlockData( "base:BlockGround", 16 );

		// Grass
		if(pondChance<this.pondFactor){
			block  = this.br.createBlockData( "base:BlockGround", 2 );
		}
		return block;
	}

	/**
	 * Content layer
	 */
	public generateLayer1( x: number, y: number, noiseGen:SimplexNoise[] ): BlockData{
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