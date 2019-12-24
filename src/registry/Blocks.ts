import { BlockRegistry } from "./BlockRegistry";
import { BlockEmpty } from "../environment/blocks/base/BlockEmpty";
import { BlockNull } from "../environment/blocks/base/BlockNull";
import { BlockGround } from "../environment/blocks/base/BlockGround";
import { BlockFoliage } from "../environment/blocks/base/foliage/BlockFoliage";
import { BlockTree } from "../environment/blocks/base/foliage/BlockTree";

import { BlockConveyorBelt } from "../environment/blocks/base/BlockConveyor";

/**
 * The block registry for all blocks
 */
export const baseBlockRegistry = new BlockRegistry();

baseBlockRegistry.register( BlockEmpty );
baseBlockRegistry.register( BlockNull );
baseBlockRegistry.register( BlockGround );
baseBlockRegistry.register( BlockFoliage )
baseBlockRegistry.register( BlockTree )

baseBlockRegistry.register( BlockConveyorBelt );
