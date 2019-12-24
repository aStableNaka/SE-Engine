import {BiomeRegistry} from "./BiomeRegistry";
import { Biome } from "../environment/biome/Biome";

import { BiomePlains } from "../environment/biome/BiomePlains";
import { BiomeCherryBlossomForest } from "../environment/biome/BiomeCherryBlossomForest";


export const baseBiomeRegistry = new BiomeRegistry();

function regF( biome:Biome ){
	baseBiomeRegistry.register(biome);
}

regF( new BiomePlains( "Plains" ) );
regF( new BiomeCherryBlossomForest( "CherryBlossomForest" ) );
