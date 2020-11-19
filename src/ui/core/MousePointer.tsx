import React, { CSSProperties, RefObject } from 'react';
import {GUIDict} from "../GUIDictionary";
const s = require('./MousePointerStyle.css');

type MousePointerState = {
	x: number,
	y: number
}

export class MousePointer extends React.Component<any, MousePointerState>{
	size:number = 10;
	offset!: number;
	ref: RefObject<MousePointer>

	constructor(){
		super({});
		GUIDict.register(this, "mousePointer");
		this.offset = this.size;
		this.ref = React.createRef();
	}

	onComponentDidMount(){
		this.setState({x:0,y:0});
		
	}

	updatePos( x: number, y: number){
		this.setState({x:x,y:y});
	}

	/**
	 * inefficient and doesnt work. wonderful!
	 */
	render(){
		let x = 0;
		let y = 0;
		if(this.state){
			x = this.state.x;
			y = this.state.y;
		}
		const style:CSSProperties = {left:x-this.offset, top:y-this.offset, width:this.size, height:this.size};
		return (
			<div style={style} className="mouse-pointer"></div>
		)
	}
}