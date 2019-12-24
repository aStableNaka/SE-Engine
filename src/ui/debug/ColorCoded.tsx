import React from 'react';

let divstyle = {
}


// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class ColorCoded extends React.Component<any, {}>{

	constructor(props:any){
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
