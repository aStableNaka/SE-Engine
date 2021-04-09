import { World } from "../environment/world/World";

/**
 * An action for the context menu
 */
export class ContextMenuAction{
	domain: string;
	callback: (...args:any) => void;
	args: any;
	constructor( callback: (...args:any)=>void, domain: string ){
		this.callback = callback;
		this.domain = domain;
	}

	setArgs(...args: any){
		this.args = args;
	}

	invoke(){
		console.log(this.args);
		this.callback(...this.args);
	}
}

/**
 * Represents a set of actions the user can take for any given "domain".
 * a "domain" is anything that the user can interact with. Eg. a Block, UI element, entity, etc.
 */
export class ContextMenu{
	
	static registry: Map<string, ContextMenu> = new Map<string, ContextMenu>();
	actions: ContextMenuAction[]; 
	id: string;
	enabled: boolean;
	domain: string;
	
	constructor( id: string, domain: string, actions: ContextMenuAction[], enabled: boolean = true ){
		this.id = id;
		this.actions = actions;
		this.enabled = enabled;
		this.domain = domain;
		if( !ContextMenu.registry.has( id ) ){
			ContextMenu.registry.set( id, this );
		}
	}

	setArgs(...args:any){
		this.actions.map( ( action )=>{
			action.setArgs( ...args );
		});
	}

	/**
	 * Enable this context menu.
	 */
	enable(){
		this.enabled = false;
	}

	/**
	 * Disable this context menu;
	 */
	disable(){
		this.enabled = true;
	}
}