import {RegistryHub} from "./Registry";
import {baseBlockRegistry} from "./Blocks";
import {baseModelRegistry} from "./Models";
/**
 * Warning - Each registry can have its own usage spec. This just groups
 * all the registries together.
 * @example
 * regHub.get("base:block").createBlockData("base:BlockGround");
 * regHub.get("base:model:Simple:0"); // base:model:ModelName:discriminator
 * regHub.get("base:mat:Simple"); // 
 */
export const regHub = new RegistryHub();
regHub.add("base", "block", baseBlockRegistry);
regHub.add("base", "model", baseModelRegistry);