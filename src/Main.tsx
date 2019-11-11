import {Region} from './environment/region/Region';
import {World} from './environment/World';
import React from 'react';

export class Main extends React.Component{
	world:World = new World();
	region:Region = new Region(16,this.world);
	render():React.ReactNode{
		return (
			<div>
				{JSON.stringify(this.region.toString())}
			</div>
		)
	}
}
