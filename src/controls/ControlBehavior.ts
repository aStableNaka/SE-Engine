import {KeyboardControlManager, KbHandlerCallback} from "./Keyboard";
import { ControlRouter } from "./ControlRouter";
import { CursorHelper } from "./cursor/CursorHelper";

export class ControlBehavior{
	name: string;
	keyboardControls: KeyboardControlManager = new KeyboardControlManager();
	controlRouter!: ControlRouter;
	cursorHelper!: CursorHelper;

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
		this.tick();
	}

	/**
	 * @abstract
	 * Called per frame
	 */
	tick(){
		
	}
}