import {ModelRegistry} from "./ModelRegistry";
import * as ModelType from "../models/ModelTypes";
import { Model } from "../models/ModelTypes";
export const baseModelRegistry = new ModelRegistry("assets/GLTF");

/**
 * This is just because I can't be bothered
 * to resize the default cube when making
 * models in blender.
 */
const lazyBlenderOptions = {scale:0.5};
function regF( model:Model ){
	baseModelRegistry.register(model);
}

// No model
regF(new ModelType.NoModel("None"));

// Uniform Models, Models that vary in textures but are static. Textures are generated.
regF(new ModelType.UniformModel("Cube", "SIMPLE/cube.gltf", 16, lazyBlenderOptions));

// Railed Models, Models that have animated textures.
regF(new ModelType.RailedModel("ConveyorInline", "CONVEYOR/ConveyorInline.gltf", {scale:0.5,zOffset:0}));