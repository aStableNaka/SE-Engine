import React from 'react';
import { CheatInventory } from './inventory/CheatInventory';
import { SimonsWorld } from '../environment/SimonsWorld';

export class CheatMenu extends React.Component<{world:SimonsWorld},any>{
	constructor(props:any){
		super(props);
	}

	render():React.ReactNode{
		return (
			<div>
				<CheatInventory />
			</div>
		)
	}
}
