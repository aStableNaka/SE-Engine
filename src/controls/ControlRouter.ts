import { ControlBehavior } from "./ControlBehavior";
import { SimonsWorld } from "../environment/world/SimonsWorld";
import { regHub } from "../registry/RegistryHub";

/**
 * Control routers will route controls to different
 * behaviors.
 */
export class ControlRouter{
	state: string;
	cBehavior!: ControlBehavior;
	defaultState: string;

	states: Map<string,ControlBehavior> = new Map();
	target: HTMLElement;
	world: SimonsWorld;

	constructor( world: SimonsWorld, target: HTMLElement, defaultState: string ){
		this.defaultState = defaultState;
		this.state = defaultState;
		this.world = world;
		this.target = target;

		// Don't capture anything until the reghub has loaded every asset
		regHub.onReady(()=>{
			target.addEventListener("keydown",this.routeKeyboardEvent.bind(this));
			target.addEventListener("keyup",this.routeKeyboardEvent.bind(this));

			window.addEventListener( "mousemove", this.routeMouseEvent.bind(this) );
			window.addEventListener( "click", this.routeMouseEvent.bind(this) );
			window.addEventListener( "mousedown", this.routeMouseEvent.bind(this) );
			window.addEventListener( "mouseup", this.routeMouseEvent.bind(this) );
		});
	}
	/**
	 * Reverts controls and routing paths
	 * to the default state
	 */
	revertToDefault(){
		this.state = this.defaultState;
	}

	addState( controlBehavior: ControlBehavior ){
		this.states.set( controlBehavior.name, controlBehavior );
		controlBehavior.bindControlRouter( this );
	}

	/**
	 * Set the current behavior state
	 * @param state 
	 */
	setState( state: string ){
		const cBehavior = this.states.get( state );
		if( cBehavior ){
			if(this.cBehavior){
				this.cBehavior.unload();
			}
			this.state = state;
			this.cBehavior = cBehavior;
		}
	}

	taskCurrentState( callback:( cBhevaior: ControlBehavior )=>void ){
		if(!this.cBehavior){
			this.setState( this.state );
		}
		if( this.cBehavior ){
			callback( this.cBehavior );
		}
	}

	routeMouseEvent( event: MouseEvent ){
		this.taskCurrentState( ( cBehavior )=>{
			cBehavior.handleMouseEvent( event );
		});
	}

	routeKeyboardEvent( event: KeyboardEvent ){
		this.taskCurrentState( ( cBehavior )=>{
			cBehavior.handleKeyboardEvent( event );
		});
	}

	tick(){
		this.taskCurrentState( ( cBehavior )=>{
			cBehavior.update();
		});
	}
}