import { ControlBehavior } from "./ControlBehavior";
import { SimonsWorld } from "../environment/world/SimonsWorld";
import { regHub } from "../registry/RegistryHub";

/**
 * Control routers will route controls to different
 * behaviors depending on the ui target
 */
export class ControlRouter{
	state: string;
	cBehavior!: ControlBehavior;
	defaultState: string;

	states: Map<string,ControlBehavior> = new Map();
	world: SimonsWorld;

	keyboardTarget: HTMLElement;
	mouseTarget: HTMLElement;
	

	constructor( world: SimonsWorld, keyboardTarget: HTMLElement, mouseTarget: HTMLElement, defaultState: string ){
		this.defaultState = defaultState;
		this.state = defaultState;
		this.world = world;
		this.keyboardTarget = keyboardTarget;
		this.mouseTarget = mouseTarget;

		// Don't capture anything until the reghub has loaded every asset
		regHub.onReady(()=>{
			window.addEventListener("keydown",this.routeKeyboardEvent.bind(this));
			window.addEventListener("keyup",this.routeKeyboardEvent.bind(this));

			mouseTarget.addEventListener( "mousemove", this.routeMouseEvent.bind(this) );
			mouseTarget.addEventListener( "click", this.routeMouseEvent.bind(this) );
			mouseTarget.addEventListener( "mousedown", this.routeMouseEvent.bind(this) );
			mouseTarget.addEventListener( "mouseup", this.routeMouseEvent.bind(this) );
		});
	}

	/**
	 * Executes cleanup subroutines. Resets control states and cancels any inter-event
	 * operations from completing.
	 */
	cleanup(): void {
		console.log("wee wee");
		this.cBehavior.cleanup();
		this.cBehavior.freezeKeyboardTicks();
	}

	/**
	 * Unfreeze keyboard ticks for current state
	 */
	unfreezeKeyboardTicks(){
		this.cBehavior.unfreezeKeyboardTicks();
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

	targetSwitch<EventType>( event: EventType ){
		
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
		if(event.target != this.mouseTarget){
			this.cleanup();
			return;
		}
		this.unfreezeKeyboardTicks();
		this.taskCurrentState( ( cBehavior )=>{
			cBehavior.handleMouseEvent( event );
		});
	}

	routeKeyboardEvent( event: KeyboardEvent ){
		// This is required because the keybinds are listening on the window context
		if(event.target != this.keyboardTarget){
			this.cleanup();
			return;
		}
		this.unfreezeKeyboardTicks();
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