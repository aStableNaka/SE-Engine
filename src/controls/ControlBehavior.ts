import {KeyboardControlManager, KbHandlerCallback} from "./Keyboard";
import { ControlRouter } from "./ControlRouter";
import { CursorHelper } from "./cursor/CursorHelper";
import { config } from "@config";

export class ControlBehavior{
	name: string;
	keyboardControls: KeyboardControlManager = new KeyboardControlManager();
	controlRouter!: ControlRouter;
	cursorHelper!: CursorHelper;
	tickLast: number = new Date().getTime();
	tickDelta: number = 0;

	constructor( name:string ){
		this.name = name;
		this.setupControls();
	}

	setupControls(){

	}

	bindControlRouter( controlRouter: ControlRouter ){
		this.controlRouter = controlRouter;
		this.crDidBind( controlRouter );
		this.load();
	}

	/**
	 * Resets states, terminates multi-event interactions
	 * 
	 */
	cleanup(){

	}

	freezeKeyboardTicks(){
		this.keyboardControls.freeze();
	}

	unfreezeKeyboardTicks(){
		this.keyboardControls.unfreeze();
	}

	/**
	 * Invoked when this behavior gets bound
	 * to a control router. Use this to set up
	 * controls.
	 * @param controlRouter 
	 */
	crDidBind( controlRouter: ControlRouter ){

	}

	/**
	 * Add a keyboard input listener
	 * @param keyCode 
	 * @param callback 
	 * @param hold 
	 */
	addKeyboardListener( keyCode: number, callback: KbHandlerCallback, hold = false ){
		this.keyboardControls.addListener( keyCode, callback, hold );
	}
	
	/**
	 * Mouse events are automatically routed to the cursorHelper
	 * @param event 
	 */
	handleMouseEvent( event:MouseEvent ){
		if(this.cursorHelper){
			this.cursorHelper.handle( event );
		}
	}

	handleKeyboardEvent( event: KeyboardEvent ){
		if( event.type == "keydown" ){
			this.keyboardControls.handleKeyDown( event );
		}else if( event.type == "keyup" ){
			this.keyboardControls.handleKeyUp( event );
		}
	}

	/**
		 * Calculate camera speed in pan units
		 * @param kbm required to determine if shift pressed
		 */
	 calcPanSpeed( kbm: KeyboardControlManager ):number{
		const baseSpeedMult = 1.5 // 1
		const superSpeedMult = 4; // 4
		const world = this.controlRouter.world;
		const cameraAnchor = world.cameraAnchor;
		const speedPerTick = 1000 / config.tick.ps * config.camera.panSpeed
		const adjustedSpeed = Math.log( cameraAnchor.distanceToOwnCamera() ) / 100 * speedPerTick * this.tickDelta ;
											// Shift multiplies the pan speed
		
		return adjustedSpeed * (kbm.shift?superSpeedMult:baseSpeedMult);
	}

	load(){
		this.controlRouter.world.ff.add(this.cursorHelper.cursorHighlightMesh);
	}

	/**
	 * Invoked when this behavior is no longer in action
	 */
	unload(){
		this.controlRouter.world.ff.remove(this.cursorHelper.cursorHighlightMesh);
	}

	update(){
		this.keyboardControls.tick();
		this.cursorHelper.update();
		if(this.cursorHelper.mouseEvent){
			this.cursorHelper.projectMouse();
		}
		const date = new Date().getTime();
		this.tickDelta = date - this.tickLast;
		this.tickLast = date;
		this.tick();
	}

	/**
	 * @abstract
	 * Called per frame
	 */
	tick(){
		
	}
}