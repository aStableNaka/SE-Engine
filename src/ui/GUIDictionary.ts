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
	elements: Map<string, ()=>HTMLElement|null> = new Map<string, ()=>HTMLElement|null>();
	elementsCache: Map<string, HTMLElement> = new Map<string, HTMLElement>();
	elementsQueue: Map<string, ((e:HTMLElement)=>void)[]> = new Map<string, ((e:HTMLElement)=>void)[]>();

	constructor(){
		Verbose.log('Initialized', "GUIDictionary", 0x8);
	}

	/**
	 * 
	 * @param component 
	 * @param identifier camel case
	 * @param i 
	 */
	register<ComponentType>( component: ComponentWithRef<ComponentType>, identifier?:string, i:number=0 ){

		let noIdentity = false;
		if(!identifier){
			identifier = "GUI_UNNAMED";
			noIdentity = true;
		}
		if(this.contents.get( identifier )) {
			this.register( component, `${identifier}_${i+1}`);
			return;
		}
		if(noIdentity) {
			Verbose.log(component, "GUIDictionary", 0x2);
			Verbose.log("Component has inexplicit identity", "GUIDictionary", 0x2);
		}

		const componentWrapper = {
			component: component
		}

		this.contents.set( identifier, componentWrapper );
		Verbose.log(`Registered ${identifier}`, "GUIDict", 0x10)
	}

	/**
	 * Register an HTML Element using a function that will retrieve the
	 * element if it doesn't exist. Re-registering an element
	 * will delete the cache
	 * @param getter 
	 * @param identifier 
	 */
	registerElement( getter: ()=>HTMLElement|null, identifier: string ){
		this.elements.set( identifier, getter );
		this.elementsCache.delete( identifier );
	}

	/**
	 * Get a registered HTMLElement. Prioritizes cached elements.
	 * @param identifier 
	 * @param cache default true. set to false to disable caching
	 */
	getElement( identifier: string, cache:boolean=true ): HTMLElement | undefined {
		const cacheElem = this.elementsCache.get( identifier );
		const getterOrUndefined = this.elements.get( identifier );
		let output: HTMLElement | undefined = undefined;
		if(cacheElem){
			output = cacheElem;
		}
		if(getterOrUndefined && !output){
			const elem = getterOrUndefined();
			if(elem){

				if(cache){
					this.elementsCache.set( identifier, elem );
				}
				output = elem;
			}
		}

		const queue = this.elementsQueue.get( identifier );
		if(output && queue){
			queue.map( ( callback )=>{
				callback( <HTMLElement>output )
			});
			this.elementsQueue.delete( identifier );
		}

		return output;
	}

	/**
	 * Queue a callback for an element. It's the safest way ensure an operation works on an element.
	 * @param identifier 
	 * @param callback 
	 */
	queueElement( identifier: string, callback:(elem:any)=>void){
		const element = this.getElement( identifier );
		if(element){
			callback( element );
			return;
		}
		this.elementsQueue.set( identifier, [ callback ,...(this.elementsQueue.get(identifier)||[])]);
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
			TsxTools.provideUIObject<ComponentType>( <any>({current:componentWrapper.component}), onAvilable, onUnavailable );
		}
	}
}

export const GUIDict = new GUIDictionary();