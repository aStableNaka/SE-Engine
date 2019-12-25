import React, { CSSProperties } from 'react';
import * as THREE from "three";

let divstyle:CSSProperties = {
	position:"absolute",
	top:"0px",
	left:"0px",
	zIndex: 100,
	color:"#ffffff",
	backgroundColor:"rgba(0,0,0,0.5)",
	fontFamily: "monospace",
	fontSize: "8"
}

export class VMAppendEvent extends Event{
	list: string[];
	constructor( list:string[] ){
		super( "VM_APPEND" );
		this.list = list;
	}
}

export class VMSetEvent extends Event{
	key: string;
	value: string;
	constructor( key:string,value:string ){
		super( "VM_SET" );
		this.key = key;
		this.value = value;
	}
}


export type ValuesScopeState = {
	list?: string[];
	regionWSCO?: string;
	cursorWSCO?: string;
	blockData?:string[];
	tps?: string;
	tickTime?: string;
	tickIdle?: string;
	fps?: string;
}

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class ValuesScope extends React.Component<{id:string}, ValuesScopeState>{
	constructor(props:any){
		super(props);
		this.state = {
			regionWSCO:"",
			cursorWSCO:"",
			tps: "",
			fps: "",
			blockData: []
		};
		//this.setupEventListeners();
	}

	setupEventListeners(){
	/*	let self = this;
		// Perform append operations onto the list state
		window.addEventListener(`VM_APPEND:${this.props.id}`, ( event:VMAppendEvent )=>{
			this.setState( {list:[ ...self.state.list, ...event.list ]} )
		});

		// Perform a set opetation on the list state
		window.addEventListener(`VM_SET:${this.props.id}`, ( event:VMSetEvent )=>{
			const updatedState = {};
			updatedState[event.key] = event.value;
			self.setState( Object.assign(self.state, updatedState) );
		});
	*/
	}

	updateState( obj:any ){
		this.setState( Object.assign(this.state, obj) );
	}

	render():React.ReactNode{
		return (
			<div style={divstyle}>

				<div>[ Performance ]</div>
				<div>TPS: {this.state.tps}</div>
				<div>FPS: {this.state.fps}</div>
				<div>TickTime: {this.state.tickTime}</div>
				<div>TickIdle: {this.state.tickIdle}</div>
				<br/>
				<div>[ Environment ]</div>
				<div>Reg-WS-CO: {this.state.regionWSCO}</div>
				<div>Cur-WS-CO: {this.state.cursorWSCO}</div>
				<br/>
				<div>[ Block Data ]</div>
				<div>{(this.state.blockData||[]).map((str:string)=>{
					return <div>{str}</div>
				})}</div>
			</div>
		)
	}
}
