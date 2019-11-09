import { BlockRegistry } from "./BlockRegistry";
import { BlockEmpty } from "./base/BlockEmpty";

export const baseRegistry = new BlockRegistry();

baseRegistry.register( BlockEmpty );