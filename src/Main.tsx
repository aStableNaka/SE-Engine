import React from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class Main extends React.Component{
	stopwatch:Stopwatch = new Stopwatch("Main");
	render():React.ReactNode{
		return (
			<div>
				<GameSceneContainer />
			</div>
		)
	}
}
