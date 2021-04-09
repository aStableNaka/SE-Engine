import {Region} from "./Region";
import { World } from "../World";
import { Layer } from "./Layer";
import {regHub} from "../../../registry/RegistryHub";
import { SimonsWorld } from "../SimonsWorld";
import * as THREE from "three";
import { BlockRegistry } from "../../../registry/BlockRegistry";
import { BlockData } from "../../blocks/Block";
import { Serializer } from "../../../io/Serializer";
import { ThemeProvider } from "react-bootstrap";


export class SimonsRegion extends Region{
	
	world:SimonsWorld;
	minimapImage: ImageData;

	constructor(world:SimonsWorld, location:THREE.Vector2){
		super( world, location );
		this.world = world;
		this.minimapImage = new ImageData(world.regionSize, world.regionSize);
	}

	updateWholeMinimapImage():ImageData{
		const image = this.minimapImage;
		const regionSize = this.world.regionSize;
		this.layers.map((layer)=>{
			layer.grid.mapContents(( blockData:BlockData, row, col )=>{
				const arr = blockData.baseClass.getMinimapColor( blockData );
				if(arr[3]==0){return;}
				const index = (row * regionSize + col) * 4;
				image.data[ index ] = arr[0];
				image.data[ index+1 ] = arr[1];
				image.data[ index+2 ] = arr[2];
				image.data[ index+3 ] = arr[3];
				
			})
		})
		return this.minimapImage;
	}

	/**
	 * 
	 */
	public generateTerrain(){
		this.layers.push(...[
			this.generateFloorLayer(),
			this.generateMiddleLayer()
		]);
	}

	/**
	 * 
	 * @param generationRules 
	 */
	private layerDecorator(location: number,
		generationRules:( 
			x: number,
			y: number,
			self: SimonsRegion ) => BlockData ){
		const self =this;
		return new Layer( this, location, (x,y)=>{
			// World location
			const wl = self.position.clone().multiplyScalar(self.world.regionSize).add(new THREE.Vector2(x,y));
			const blockData = generationRules( wl.x, wl.y, self );
			blockData.blockDidMount({position: new THREE.Vector3(wl.x, wl.y, location)})
			return blockData; 
		});
	}

	private generateMiddleLayer():Layer{
		return this.layerDecorator( 1, ( x, y, self )=>{
			return self.world.biomeSelector.generate( x, y, 1 );
		});
	}

	/**
	 * Generates the floor layer
	 */
	private generateFloorLayer():Layer{
		return this.layerDecorator( 0, ( x,y, self )=>{;
			return self.world.biomeSelector.generate( x, y, 0 );
		} )
	}

}

export class SimonsRegionSerializer extends Serializer<SimonsRegion>{
	constructor(){
		super( SimonsRegion );
	}

	dataMapping( instance: SimonsRegion ){
		return {
			type: "SimonsRegion",
			renderLoads: instance.renderLoads,
			renderUnloads: instance.renderUnloads,
			modified: instance.modified,
			size: instance.size,
			position: instance.position,
			dictionary: instance.dictionary,
			layers: instance.layers,	// TODO: LayerSerializer
			actorBlocks: instance.actorBlocks,
		}
	}
}

new SimonsRegionSerializer();