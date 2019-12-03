import {Region} from './environment/region/Region';
import {World} from './environment/World';
import React from 'react';
import {Stopwatch} from './utils/Stopwatch';
import {GameSceneContainer} from "./rendering/GameSceneContainer";
import {ResourceLoader} from "./loader/ResourceLoader";
import {GLTFResource } from "./loader/GLTFResource";

let rl = new ResourceLoader("assets/GLTF/SIMPLE");
let resource = new GLTFResource("cube.gltf", (data)=>{ console.log(data) });
rl.queue(resource);
rl.load();

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
