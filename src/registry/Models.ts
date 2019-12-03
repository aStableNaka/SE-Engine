import {ModelRegistry, Model} from "./ModelRegistry";
export const baseModelRegistry = new ModelRegistry("assets/GLTF");

baseModelRegistry.register(new Model("Cube:0", "SIMPLE/cube.gltf", baseModelRegistry));