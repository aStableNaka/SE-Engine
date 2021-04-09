import React from 'react';
import { SimonsWorld } from '../../environment/world/SimonsWorld';
import "./ActionMenu.css";

export class ActionMenu extends React.Component<any,any>{
	ref: React.RefObject<ActionMenu>;
	constructor(props:any){
		super(props);
		this.ref = React.createRef();
	}

	render():React.ReactNode{
		return (
			<div>
				
			</div>
		)
	}
}
