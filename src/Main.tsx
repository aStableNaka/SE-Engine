import React, { RefObject } from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";
import {CheatMenu} from "./ui/CheatMenu";
import { SimonsWorld, DebugTools } from './environment/world/SimonsWorld';
import { ValuesScope } from './ui/debug/ValuesScope';

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class Main extends React.Component<{},{world:SimonsWorld|null}>{
	stopwatch:Stopwatch = new Stopwatch("Main");
	debug!: DebugTools
	valuesScope: RefObject<ValuesScope> | null | undefined;

	constructor(props:any){
		super(props);
		this.state = {world:null}
		this.valuesScope = React.createRef();
	}

	componentDidMount(){
		this.setState({world:null});
		this.debug = {
			valuesScope:this.valuesScope
		}
	}

	setWorld(world:SimonsWorld){
		this.setState({world:world});
		if(this.state.world){
			this.state.world.readyDebug( this.debug );
			console.log(`[ Main ] debug tools ready`);
		}
	}

	startCheatMenu(){
		if(this.state.world){
			return (<CheatMenu world={this.state.world}/>);
		}
	}

	render():React.ReactNode{
		let self = this;
		return (
			<div>
				<ValuesScope id="vsmain" ref={this.valuesScope}></ValuesScope>
				<GameSceneContainer setWorld={(world:SimonsWorld)=>{self.setWorld(world)}} />
			</div>
		)
	}
}
