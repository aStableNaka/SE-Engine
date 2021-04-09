import {Noise2D} from "open-simplex-noise";
import {BlockData} from "../blocks/Block";
import { regHub } from "../../registry/RegistryHub";
import { BlockRegistry } from "../../registry/BlockRegistry";
import { BiomeRegistry } from "../../registry/BiomeRegistry";
import { Biome, NOISE_GENERATOR_LABELS } from "./Biome";
import { CreateSuperSpace, getSpaceDepth } from "../../utils/collections/Spaces";
import { BiomeOverlap } from "../../registry/BiomeRegistry";
import { Vector3 } from "three";
import { Verbose } from "../../utils/Verboosie";
import { config } from "@config";

/**
 * Ailias to NOISE_GENERATOR_LABELS
 */
const NGL = NOISE_GENERATOR_LABELS;
type NGL = NOISE_GENERATOR_LABELS;

/**
 * Helper to determine which biome generation rules to invoke
 * with provided with coordinates
 */
export class BiomeSelector{
	public reg: BiomeRegistry;

	private noiseGen: Noise2D[];
	private cache: Biome[][][][];

	private vLowerBound: Vector3 = new Vector3(0,0,0);
	private vUpperBound: Vector3 = new Vector3(5,5,5);

	constructor( noiseGen:Noise2D[] ){
		this.reg = regHub.get("base:biome");
		this.noiseGen = noiseGen;
		this.cache = this.createCache();
		Verbose.log( getSpaceDepth(this.cache), 'BiomeSelector#Enviroment', 0x10 );
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

	ngCacheX = 0;
	ngCacheY = 0;
	ngCacheV = 0;
	transitionRes = 1;

	/**
	 * Noise Generator
	 * @param label 
	 * @param x 
	 * @param y 
	 */
	private ng( label: NGL, x: number, y: number ): number{
		if( this.ngCacheX != x || this.ngCacheY != y ){
			this.ngCacheV = Math.round((this.noiseGen[ NGL.RESOLUTION_1 ]( x*3.5, y*3.5 ) + 1)/2 * this.transitionRes);
			this.ngCacheX = x;
			this.ngCacheY = y;
		}
		return Math.round((this.noiseGen[ label ]( x, y ) + 1)/2 * (4-this.transitionRes) + this.ngCacheV );
	}

	public ngTemp( x: number, y: number ): number{
		const scale = config.world.biome.tempScale;
		return this.ng( NGL.BIOME_TEMPERATURE, x/scale, y/scale );
	}

	public ngWet( x: number, y: number ): number{
		const scale = config.world.biome.wetScale;
		return this.ng( NGL.BIOME_WETNESS, x/scale, y/scale );
	}

	public ngFert( x: number, y: number ): number{
		const scale = config.world.biome.fertScale
		return this.ng( NGL.BIOME_FERTILITY, x/scale, y/scale );
	}

	/**
	 * 
	 * @param bv BiomeVector
	 * @param x 
	 * @param y 
	 */
	public ngSelect( bv: Vector3, x: number, y: number ): Biome{
		const choices: Biome[] = this.cache[bv.x][bv.y][bv.z];

		const genSteps = [
			[NGL.BIOME_SELECTION, 100 ],
			[NGL.RESOLUTION_1, 30],
			[NGL.RESOLUTION_2, 4]
		]
		
		const val = (genSteps.map((w:any[])=>{
			return this.noiseGen[w[0]](x/w[1], y/w[1]);
		}).reduce((p,n)=>{
			return p+n;
		})+genSteps.length) / ( genSteps.length * 2 )

		//(this.noiseGen[ NGL.BIOME_SELECTION ]( x/100, y/100 ) + this.noiseGen[NGL.RESOLUTION_1](x/2,y/2)+2)/4
		const selection: number = Math.floor(val * choices.length);
		return choices[selection];
	}

	public createBiomeVector( x: number, y: number ): Vector3{
		return new Vector3( this.ngTemp( x, y ), this.ngWet( x, y ), this.ngFert( x, y ) );
		//.clamp(this.vLowerBound, this.vUpperBound);
	}

	generate( x: number, y: number, zLevel: number ): BlockData{
		const biomeVector = this.createBiomeVector( x, y );
		const biome = this.ngSelect( biomeVector, x, y );
		return biome.generate( x, y, zLevel, this.noiseGen );
	}
}