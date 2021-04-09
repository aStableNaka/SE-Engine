import { config } from "process";
import React from "react";
import { SimonsRegion } from "../../environment/world/region/SimonsRegion";
import { SimonsWorld } from "../../environment/world/SimonsWorld";
import { SuperEvents } from "../../utils/SuperEvents";
import {GUIDict} from "../GUIDictionary";


export type MinimapProps = {

}

export type MinimapState = {

}

export class Minimap extends React.Component<MinimapProps,MinimapState>{
	ref: React.RefObject<Minimap>;
	ctx?: CanvasRenderingContext2D | null;
	constructor( props: MinimapProps ){
		super( props );
		this.ref = React.createRef();

		GUIDict.registerElement( ()=>{
			const elem = document.getElementById("minimap-canvas");
			return elem;
		}, "minimap-canvas" );

		const self = this;

		SuperEvents.once("world-loading-done", (world:SimonsWorld)=>{
			GUIDict.queueElement("minimap-canvas", (canvas:HTMLCanvasElement)=>{
				const pixelSize = world.worldSize * world.regionSize;
				canvas.width = pixelSize;
				canvas.height = pixelSize;
				const context = canvas.getContext("2d");
				self.ctx = context;

				if(context){
					world.regions.mapContents( (region:SimonsRegion, row, col)=>{
						const imageData = region.updateWholeMinimapImage();
						context.putImageData(imageData, row*world.regionSize,col*world.regionSize);
					});
				}
			})
		})
	}

	componentDidMount(){

	}

	render(){
		return <div style={{zIndex:1, position:"absolute", right:"10px"}}>
			<canvas id="minimap-canvas"></canvas>
		</div>
	}
}