import React, { CSSProperties } from 'react';

/**
 * This specific game scene container is made for SimonsWorld
 */
export class PollingDebugPane extends React.Component{
	mount: HTMLDivElement | null | undefined;
	style:CSSProperties = {
		position: 'absolute',
		top: '0px',
		left: '0px',
	}

	constructor(props:any){
		super(props);
	}

	resizeViewport(){

	}

	componentDidMount() {

	}

	render():React.ReactNode{
		return <div ref={ref=>(this.mount = ref)} style={this.style}/>
	}
}