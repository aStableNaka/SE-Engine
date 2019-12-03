import {RegistryHub} from "./Registry";
import {baseBlockRegistry as baseBlockRegistry} from "./Blocks";
/**
 * Warning - Each registry can have its own usage spec. This just groups
 * all the registries together.
 * @example
 * regHub.get("base:block").createBlockData("base:BlockGround");
 * regHub.get("base:model:Cube");
 * regHub.get("base:mat:Simple");
 */
export const regHub = new RegistryHub();
regHub.add("base", "block", baseBlockRegistry);