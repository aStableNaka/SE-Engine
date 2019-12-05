import {ModelRegistry} from "./ModelRegistry";
import * as ModelType from "./ModelTypes";
export const baseModelRegistry = new ModelRegistry("assets/GLTF");

baseModelRegistry.register(new ModelType.UniformModelScaled("Cube", "SIMPLE/cube.gltf", 0.5, 16));