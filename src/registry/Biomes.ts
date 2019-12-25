import {BiomeRegistry} from "./BiomeRegistry";
import { Biome } from "../environment/biome/Biome";

import { BiomeTemprateGrasslands } from "../environment/biome/BiomeTemprateGrasslands";
import { BiomeCherryBlossomForest } from "../environment/biome/BiomeCherryBlossomForest";
import { BiomeRocklands } from "../environment/biome/BiomeRocklands";


export const baseBiomeRegistry = new BiomeRegistry();

function regF( biome:Biome ){
	baseBiomeRegistry.register(biome);
}

regF( new BiomeTemprateGrasslands( "TemprateGrasslands" ) );
regF( new BiomeCherryBlossomForest( "CherryBlossomForest" ) );
regF( new BiomeRocklands( "Rocklands" ) );