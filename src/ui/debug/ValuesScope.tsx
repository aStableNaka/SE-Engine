import React, { CSSProperties, RefObject } from 'react';
import * as THREE from "three";
import { SuperEvents } from '../../utils/SuperEvents';
import { GUIDict } from "../GUIDictionary";


let divStyleBase: CSSProperties = {
	position:"absolute",
	top:"0px",
	left:"0px",
	zIndex: 1,
	color:"#ffffff",
	backgroundColor:"rgba(0,0,0,0.5)",
	fontFamily: "monospace",
	fontSize: "8",
}

let divStyleVisible:CSSProperties = Object.assign({
	visibility: "visible"
}, divStyleBase); 

let divStyleHidden:CSSProperties = Object.assign({
	visibility: "hidden"
}, divStyleBase); 

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
	visibility?: boolean;

	list?: string[];
	/**
	 * WSC ( World Space Coordinates )
	 */
	regionWSC?: string;
	/**
	 * WSC ( World Space Coordinates )
	 */
	cursorWSC?: string;
	/**
	 * The blockData of the block that the cursor is hovered over
	 */
	blockData?:string[];
	/**
	 * The amount of time it takes to execute a single tick
	 */
	tickTime?: string;
	/**
	 * How much time is between ticks, where nothing is happening
	 */
	tickIdle?: string;
	tps?: string;
	fps?: string;
}

// A magic casting mechanic where holding down the button drains more mana, but scales the effect

/**
 * ValuesScope is a mini window react compoent that displays values to provide real-time polled
 * data
 */
export class ValuesScope extends React.Component<{id:string}, ValuesScopeState>{
	divStyle: React.CSSProperties;
	ref: RefObject<ValuesScope>
	constructor(props:any){
		super(props);
		this.state = {
			visibility: true,
			regionWSC:"",
			cursorWSC:"",
			tps: "",
			fps: "",
			blockData: []
		};
		this.divStyle = divStyleVisible;
		const self = this;

		SuperEvents.addListener("debug-visibility-toggle", ( state: boolean )=>{
			console.log("Toggling ValuesScope");
			self.toggle( state );
		});

		this.ref = React.createRef();

		GUIDict.register<ValuesScope>( this, "ValuesScope" );
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

	toggle( state?:boolean ){
		const newState = (state===undefined || state===null)? !this.state.visibility : state;
		this.divStyle = newState ? divStyleVisible : divStyleHidden;

		// SetState to ensure re-rendering
		this.setState({visibility:newState});
	}

	isVisible(){
		return this.state.visibility;
	}

	render():React.ReactNode{
		return (
			<div style={this.divStyle}>
				<div>[ Performance ]</div>
				<div>TPS: {this.state.tps}</div>
				<div>FPS: {this.state.fps}</div>
				<div>TickTime: {this.state.tickTime}</div>
				<div>TickIdle: {this.state.tickIdle}</div>
				<br/>
				<div>[ Environment ]</div>
				<div>Reg-WS-CO: {this.state.regionWSC}</div>
				<div>Cur-WS-CO: {this.state.cursorWSC}</div>
				<br/>
				<div>[ Block Data ]</div>
				<div>{(this.state.blockData||[]).map((str:string)=>{
					return <div>{str}</div>
				})}</div>
				{this.props.children}
			</div>
		)
	}
}
