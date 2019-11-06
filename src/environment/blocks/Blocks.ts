import { BlockRegistry } from "./BlockRegistry";
import { BlockEmpty } from "./BlockEmpty";

export const baseRegistry = new BlockRegistry();

baseRegistry.register( BlockEmpty );