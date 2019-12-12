import React from 'react';
import { blockBaseClass } from '../../registry/BlockRegistry';

export type CBIProps = {baseClass:blockBaseClass, key:string}

let divstyle = {
}

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class CheatBlockItem extends React.Component<CBIProps, {}>{
	constructor(props:CBIProps){
		super(props);
	}
	render():React.ReactNode{
		return (
			<div style={divstyle}>
				{this.props.baseClass.name}
			</div>
		)
	}
}
