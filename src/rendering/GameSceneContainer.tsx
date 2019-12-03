import React, { CSSProperties } from 'react';
import {FrostedFlakes} from "./FrostedFlakes";
import {World} from "../environment/World";
import { SimonsWorld } from '../environment/SimonsWorld';
import {regHub} from "../registry/RegistryHub";

export type GPVProps = {
	//world:World
}

/**
 * This specific game scene container is made for SimonsWorld
 */
export class GameSceneContainer extends React.Component<GPVProps>{
	mount: HTMLDivElement | null | undefined;
	gameScene: FrostedFlakes | undefined;
	world!: World;
	style:CSSProperties = {
		position: 'absolute',
		top: '0px',
		left: '0px',
	}

	constructor(props:GPVProps){
		super(props);
	}

	resizeViewport(){
		this.style.width = `${window.innerWidth}px`;
		this.style.height = `${window.innerHeight}px`;
	}

	componentDidMount() {
		regHub.load((()=>{
			if(this.mount!=undefined){
				this.gameScene = new FrostedFlakes( this.mount );
				this.world = new SimonsWorld(this.gameScene);
				this.world.tick();
				this.world.render();
			}
		}).bind(this));
	}

	render():React.ReactNode{
		return <div ref={ref=>(this.mount = ref)} style={this.style}/>
	}
}