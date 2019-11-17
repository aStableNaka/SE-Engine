import {Region} from './environment/region/Region';
import {World} from './environment/World';
import React from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class Main extends React.Component{
	world:World = new World();
	stopwatch:Stopwatch = new Stopwatch("Main");

	render():React.ReactNode{
		return (
			<div>
				<GameSceneContainer world={this.world} />
			</div>
		)
	}
}
