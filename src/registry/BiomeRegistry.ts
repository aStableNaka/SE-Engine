import {Registry} from "./Registry";
import { Biome } from "../environment/biome/Biome";
import { Vector3 } from "three";

export type BiomeOverlap = {
	biomes: Biome[];
	vector: Vector3;
}

export class BiomeRegistry implements Registry{
	
	entries: Map<string,Biome> = new Map<string,Biome>()
	overlaps: Map<string,BiomeOverlap> = new Map<string,BiomeOverlap>()
	list: Biome[] = [];
	
	constructor(){}

	private overlapKey( biome:Biome ): string{
		return biome.vector.toArray().join("_");
	}

	/**
	 * Register an instance of a biome
	 * @param biome 
	 * @param forceRegister 
	 */
	public register( biome:Biome, forceRegister?:boolean ): string{
		if( this.entries.has( biome.name ) && !forceRegister ){
			throw new Error(`[ BiomeRegistry ] biome name collision: ${biome.name}`);
		}
		this.entries.set( biome.name, biome );
		this.list.push( biome );

		const overlapKey = this.overlapKey( biome );

		if( !this.overlaps.has( overlapKey ) ){
			this.overlaps.set( overlapKey, { biomes:[], vector:biome.vector } );
		}

		(<BiomeOverlap>this.overlaps.get( overlapKey )).biomes.push( biome );

		console.log(`[ BiomeRegistry ] registered ${biome.name}`);
		return biome.name;
	}

	get( key:string ): Biome{
		if( !this.entries.has( key ) ){
			throw new Error(`[ BiomeRegistry ] biome "${key}" is not registered`)
		}
		return <Biome>this.entries.get( key );
	}

	checkReady( ready:()=>void ){
		ready();
	}
}