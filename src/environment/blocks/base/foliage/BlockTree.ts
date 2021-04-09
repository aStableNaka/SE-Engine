import { ContextMenu, ContextMenuAction } from "../../../../controls/ContextMenu";
import { BlockFactory, Geometry, BlockData, BlockContextMenuAction } from "../../Block";
import { ItemEntity } from "../../../entity/ItemEntity";
import { Item, ItemData } from "../../../items/Item";
import { World } from "../../../world/World";
import { Vector2 } from "three";
import { BlockVariantData } from "../BlockVariantData";

export class BlockTree extends BlockFactory{
	static model:string = "base:model:TreeSakura0";
	static noModel = false;

	static harvestTime:number = 100; // Ticks

	static contextMenu: ContextMenu = new ContextMenu( "block:tree", "Tree", [
		new BlockContextMenuAction( BlockTree.contextHarvestTest, "Harvest Tree Test" )
	], true );

	static contextHarvestTest( blockData: BlockData, world: World ){
		const position = new Vector2(blockData.position.x, blockData.position.y);
		const itemEntity = new ItemEntity( world, new ItemData( Item, position ) );
		itemEntity.addToWorld();
		itemEntity.setPosition( position );
		world.removeBlock(blockData.position.x, blockData.position.y, 1);
	}

	/**
	 * Creates BlockData with a variant
	 */
	static createBlockData( variant?:number|null ):BlockVariantData{
		return new BlockVariantData( this );
	}

	static getModelKey( blockData:BlockData ):string{
		return this.model;
		//return `${this.model}:${blockData.data||0}`;
	}

	static getMinimapColor( blockData:BlockData ){
		return [255,100,250,255];
	}
}