import React from "react";
import { ReactComponentElement } from "react";
import { RefObject, Component } from "react";
import * as TsxTools from "../utils/TsxTools";
import { Verbose } from "../utils/Verboosie";

export type ComponentWithRef<ComponentType> = Component & {ref: RefObject<ComponentType>}

export type GUIComponentWrapper<ComponentType> = {
	component: ComponentWithRef<ComponentType>
}

/**
 * The GUIDictionary provides a cental object for ease
 * of manipulating gui elements.
 * 
 * GUI Elements must be registered onto the dictionary
 * during construction.
 * 
 * @important
 * 		components registered with the GUIDictionary must include a .ref property initialized
 * 		with React.createRef()
 */
export class GUIDictionary{
	contents: Map<string, GUIComponentWrapper<any>> = new Map<string, GUIComponentWrapper<any>>()

	constructor(){
		Verbose.log('Initialized', "GUIDictionary", 0x8);
	}

	/**
	 * 
	 * @param component 
	 * @param identity camel case
	 * @param i 
	 */
	register<ComponentType>( component: ComponentWithRef<ComponentType>, identity?:string, i:number=0 ){

		let noIdentity = false;
		if(!identity){
			identity = "GUI_UNNAMED";
			noIdentity = true;
		}
		if(this.contents.get( identity )) {
			this.register( component, `${identity}_${i+1}`);
			return;
		}
		if(noIdentity) {
			Verbose.log(component, "GUIDictionary", 0x2);
			Verbose.log("Component has inexplicit identity", "GUIDictionary", 0x2);
		}

		const componentWrapper = {
			component: component
		}

		this.contents.set( identity, componentWrapper );
		Verbose.log(`Registered ${identity}`, "GUIDict", 0x10)
	}

	/**
	 * Get the component wrapper object which includes the component along
	 * with occompanying objects
	 * @param query 
	 */
	get<ComponentType>( query:string ): GUIComponentWrapper<ComponentType> | undefined{
		if(this.contents.has( query )) {
			return (<GUIComponentWrapper<ComponentType>>(this.contents.get( query )));
		}
		return undefined;	
	}

	/**
	 * get the ReactComponent
	 * @param query 
	 */
	getComponent<ComponentType>( query: string ): ComponentWithRef<any> | undefined {
		const componentWrapper = this.get( query );
		if(componentWrapper) {
			return componentWrapper.component;
		}
	}

	/**
	 * Get the REF Object that can be manipulated directly
	 * @param query 
	 * @param onAvilable 
	 * @param onUnavailable 
	 */
	getRef<ComponentType>( query: string, onAvilable:( refObject: any )=>void, onUnavailable:()=>void ): void {
		const componentWrapper = this.get( query );
		if( componentWrapper ) {
			TsxTools.provideUIObject<ComponentType>( <any>(componentWrapper.component.ref).current, onAvilable, onUnavailable );
		}
	}
}

export const GUIDict = new GUIDictionary();