import * as SimplexNoise from "simplex-noise";
import {BlockData} from "../blocks/Block";
import { regHub } from "../../registry/RegistryHub";
import { BlockRegistry } from "../../registry/BlockRegistry";
import { BiomeRegistry } from "../../registry/BiomeRegistry";
import { Biome, NOISE_GENERATOR_LABELS } from "./Biome";
import { CreateSuperSpace, getSpaceDepth } from "../../utils/Spaces";
import { BiomeOverlap } from "../../registry/BiomeRegistry";
import { Vector3 } from "three";

/**
 * Helper to determine which biome generation rules to invoke
 * with provided with coordinates
 */
export class BiomeSelector{
	public reg: BiomeRegistry;

	private noiseGen: SimplexNoise[];
	private cache: Biome[][][][];

	private vLowerBound: Vector3 = new Vector3(0,0,0);
	private vUpperBound: Vector3 = new Vector3(5,5,5);

	constructor( noiseGen:SimplexNoise[] ){
		this.reg = regHub.get("base:biome");
		this.noiseGen = noiseGen;
		this.cache = this.createCache();
		console.log(getSpaceDepth(this.cache));
	}

	/**
	 * We precalculate the a table of
	 * outcomes based on each potential vector.
	 * 
	 * We do this by calculating the distance between
	 * a vector and every biome and caching the ones that fit
	 * best.
	 * 
	 * Overlapping biomes will be added
	 */
	private createCache(): Biome[][][][]{
		const overlaps: BiomeOverlap[] = new Array( ...this.reg.overlaps.values() );
		return CreateSuperSpace( 5, 3, ( index )=>{
			const cacheVector = new Vector3( index[0], index[1], index[2] );
			return overlaps.reduce( ( pv: BiomeOverlap, cv: BiomeOverlap )=>{
				if( cv.vector.distanceTo( cacheVector ) < pv.vector.distanceTo( cacheVector ) ){
					return cv;
				}
				return pv;
			} ).biomes;
		});
	}

	private ng( label: NOISE_GENERATOR_LABELS, x: number, y: number ): number{
		return Math.round((this.noiseGen[ label ].noise2D( x, y ) + 1)/2 * 4);
	}

	public ngTemp( x: number, y: number ): number{
		return this.ng( NOISE_GENERATOR_LABELS.BIOME_TEMPERATURE, x/1200, y/1200 );
	}

	public ngWet( x: number, y: number ): number{
		return this.ng( NOISE_GENERATOR_LABELS.BIOME_WETNESS, x/500, y/500 );
	}

	public ngFert( x: number, y: number ): number{
		return this.ng( NOISE_GENERATOR_LABELS.BIOME_FERTILITY, x/200, y/200 );
	}

	/**
	 * 
	 * @param bv BiomeVector
	 * @param x 
	 * @param y 
	 */
	public ngSelect( bv: Vector3, x: number, y: number ): Biome{
		const choices: Biome[] = this.cache[bv.x][bv.y][bv.z];
		const selection: number = Math.floor((this.noiseGen[ NOISE_GENERATOR_LABELS.BIOME_SELECTION ].noise2D( x/500+255000, y/500+255000 ) + 1)/2 * choices.length);
		return choices[selection];
	}

	public createBiomeVector( x: number, y: number ): Vector3{
		return new Vector3( this.ngTemp( x, y ), this.ngWet( x, y ), this.ngFert( x, y ) );//.clamp(this.vLowerBound, this.vUpperBound);
	}

	generate( x: number, y: number, zLevel: number ): BlockData{
		const biomeVector = this.createBiomeVector( x, y );
		const biome = this.ngSelect( biomeVector, x, y );
		return biome.generate( x, y, zLevel, this.noiseGen );
	}
}