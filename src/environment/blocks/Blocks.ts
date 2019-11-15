import { BlockRegistry } from "./BlockRegistry";
import { BlockEmpty } from "./base/BlockEmpty";
import { BlockNull } from "./base/BlockNull";

export const baseRegistry = new BlockRegistry();

baseRegistry.register( BlockEmpty );
baseRegistry.register( BlockNull );