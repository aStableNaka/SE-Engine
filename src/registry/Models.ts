import {ModelRegistry} from "./ModelRegistry";
import * as ModelType from "./ModelTypes";
export const baseModelRegistry = new ModelRegistry("assets/GLTF");

/**
 * This is just because I can't be bothered
 * to resize the default cube when making
 * models in blender.
 */
const gltfModelOptions = {scale:0.5};

baseModelRegistry.register(new ModelType.UniformModel("Cube", "SIMPLE/cube.gltf", 16, {scale:0.5}));
baseModelRegistry.register(new ModelType.RailedModel("ConveyorInline", "CONVEYOR/ConveyorInline.gltf"));