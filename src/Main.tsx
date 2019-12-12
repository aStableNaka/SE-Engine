import React from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";
import {CheatMenu} from "./ui/CheatMenu";
import { SimonsWorld } from './environment/SimonsWorld';

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class Main extends React.Component<{},{world:SimonsWorld|null}>{
	stopwatch:Stopwatch = new Stopwatch("Main");

	constructor(props:any){
		super(props);
		this.state = {world:null}
	}

	componentDidMount(){
		this.setState({world:null});
	}

	setWorld(world:SimonsWorld){
		this.setState({world:world});
	}

	startCheatMenu(){
		if(this.state.world){
			return (<CheatMenu world={this.state.world}/>);
		}
	}

	render():React.ReactNode{
		return (
			<div>
				<GameSceneContainer setWorld={this.setWorld} />
			</div>
		)
	}
}
