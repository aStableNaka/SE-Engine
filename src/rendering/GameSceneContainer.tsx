import React, { CSSProperties } from 'react';
import {FrostedFlakes} from "./FrostedFlakes";
import { SimonsWorld } from '../environment/world/SimonsWorld';
import {regHub} from "../registry/RegistryHub";
import { GameController } from '../GameController';

export type GPVProps = {
	setController:( gameScene: FrostedFlakes )=> GameController;
}

/**
 * This specific game scene container is made for SimonsWorld
 */
export class GameSceneContainer extends React.Component<GPVProps>{
	mount: HTMLDivElement | null | undefined;
	gameScene: FrostedFlakes | undefined;
	world!: SimonsWorld;
	style:CSSProperties = {
		position: 'absolute',
		top: '0px',
		left: '0px',
		zIndex:0
	}
	gameController!: GameController;

	constructor(props:GPVProps){
		super(props);
	}

	resizeViewport(){
		this.style.width = `${window.innerWidth}px`;
		this.style.height = `${window.innerHeight}px`;
	}

	componentDidMount() {
		/**
		 * Load order:
		 * RegHub/Assets
		 * Interface
		 * GameScene
		 * World
		 */
		regHub.load((()=>{
			if(this.mount!=undefined){
				this.gameScene = new FrostedFlakes( this.mount );
				this.gameController = this.props.setController( this.gameScene );
			}
		}).bind(this));
	}

	render():React.ReactNode{
		return <div ref={ref=>(this.mount = ref)} style={this.style}/>
	}
}