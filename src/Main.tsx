import React, { RefObject } from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";
import {CheatMenu} from "./ui/CheatMenu";
import { SimonsWorld, DebugTools } from './environment/world/SimonsWorld';
import { ValuesScope } from './ui/debug/ValuesScope';
import { GameController } from './GameController';
import { FrostedFlakes } from './rendering/FrostedFlakes';
import { MousePointer } from "./ui/core/MousePointer";

type MainState = {
	gameController: GameController | null;
}

export type MainDebug = {
	valueScopeRef: React.RefObject<ValuesScope> | null | undefined;
}

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class Main extends React.Component<{},MainState>{
	stopwatch:Stopwatch = new Stopwatch("Main");
	debug!: DebugTools
	valuesScope: RefObject<ValuesScope> | null | undefined;

	gameCtrlr: GameController = new GameController();

	constructor(props:any){
		super(props);
		this.state = {gameController: null}
		this.valuesScope = React.createRef();
	}

	componentDidMount(){
		this.setState({gameController: null});
		this.debug = {
			valuesScopeRef:this.valuesScope
		}
	}

	setController( gameScene: FrostedFlakes ){
		this.setState({ gameController: this.gameCtrlr }); // TODO finish changing world dependencies to GameControler
		
		const gameController = this.gameCtrlr;
		if( gameController ){
			gameController.linkGameScene( gameScene );
			gameController.initializeDebug( this.debug );
			console.log(`[ Main ] debug tools ready`);

			gameController.createNewSession();
		}
	}

	startCheatMenu(){
		if(this.state.gameController){
			return (<CheatMenu world={this.state.gameController.world}/>);
		}
	}

	render():React.ReactNode{
		let self = this;
		return (
			<div>
				
				<ValuesScope id="vsmain" ref={this.valuesScope}></ValuesScope>
				<GameSceneContainer setController={
					( gameScene: FrostedFlakes )=>{
						/**
						 * The game session should initialize
						 * after the gameScene has mounted
						 */
						self.setController( gameScene );
						return self.gameCtrlr;
					}
				}/>
			</div>
		)
	}
}
