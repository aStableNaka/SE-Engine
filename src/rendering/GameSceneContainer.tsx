import React, { CSSProperties } from 'react';
import {FrostedFlakes} from "./FrostedFlakes";
import { World } from '../environment/World';

export type GPVProps = {
	world:World
}

export class GameSceneContainer extends React.Component<GPVProps>{
	mount: HTMLDivElement | null | undefined;
	gameScene: FrostedFlakes | undefined;
	world: World;
	style:CSSProperties = {
		position: 'absolute',
		top: '0px',
		left: '0px',
	}

	constructor(props:GPVProps){
		super(props);
		this.world = props.world;
	}

	resizeViewport(){
		this.style.width = `${window.innerWidth}px`;
		this.style.height = `${window.innerHeight}px`;
	}

	componentDidMount() {
		if(this.mount!=undefined){
			this.gameScene = new FrostedFlakes( this.mount );
		}
	}

	render():React.ReactNode{
		return <div ref={ref=>(this.mount = ref)} style={this.style}/>
	}
}