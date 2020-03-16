import {BiomeRegistry} from "./BiomeRegistry";
import { Biome } from "../environment/biome/Biome";

import { BiomeGrasslands } from "../environment/biome/temperate/BiomeGrasslands"
import { BiomeCherryBlossomForest } from "../environment/biome/subtropics/BiomeCherryBlossomForest";
import { BiomeRocklands } from "../environment/biome/hot/BiomeRocklands";


export const baseBiomeRegistry = new BiomeRegistry();

function regF( biome:Biome ){
	baseBiomeRegistry.register(biome);
}

regF( new BiomeGrasslands( "TemprateGrasslands" ) );
regF( new BiomeCherryBlossomForest( "CherryBlossomForest" ) );
regF( new BiomeRocklands( "Rocklands" ) );