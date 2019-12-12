import React from 'react';
import {regHub} from "../../registry/RegistryHub";
import { CheatBlockItem } from './CheatBlockItem';
import { Block } from '../../environment/blocks/Block';
import { BlockRegistryComponent } from '../../registry/BlockRegistry';

const CheatInventoryStyle:React.CSSProperties = {
	position:"absolute",
	top:"0px",
	left:"0px",
	width:"100px",
	backgroundColor:"grey"
}

// A magic casting mechanic where holding down the button drains more mana, but scales the effect
export class CheatInventory extends React.Component<any,{list:BlockRegistryComponent[]}>{
	constructor(props:any){
		super(props);
		this.state = {list:[]}
	}

	componentDidMount(){
		let self = this;
		this.setState({list:[]});
		regHub.onReady(()=>{
			self.setState({list:regHub.get("base:block").list});
		})
	}

	render():React.ReactNode{
		return (
			<div style={CheatInventoryStyle}>
				{
					this.state.list.map((blockRegistryComponent)=>{
						return <CheatBlockItem baseClass={blockRegistryComponent.baseClass} key={blockRegistryComponent.baseClass.name}/>
					})
				}
			</div>
		)
	}
}
