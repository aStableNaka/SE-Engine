import { ControlBehavior } from "../ControlBehavior";
import { ControlRouter } from "../ControlRouter";
import { KeyboardControlManager } from "../Keyboard";
import { CursorHelper } from "../cursor/CursorHelper";
import { CursorHelperGenericMapMani } from "../cursor/CursorHelperGenericMapMani";
import { ValuesScope } from "../../ui/debug/ValuesScope";
import { SuperEvents } from "../../utils/SuperEvents";
import { config } from "../Config";
import { debug } from "console";
import * as tFmt from "../../utils/TextFormat";

let debugState = config.debug.enable;

export namespace ControlBehaviors{
	export class CBDefault extends ControlBehavior{
		constructor(){
			super( "default" );
		}
	
		crDidBind( controlRouter: ControlRouter ){
			this.cursorHelper = new CursorHelperGenericMapMani( this.controlRouter.world );
			this.setupCameraPanKeyboardControls();
		}

		/**
		 * Resets states, terminates multi-event interactions
		 * 
		 */
		cleanup(){
			this.cursorHelper.cleanup();
		}

		// Setup the controls for camera panning, using WASD
		setupCameraPanKeyboardControls(){
			const self = this;
			const world = this.controlRouter.world;
			const pan = world.cameraAnchor.movementDelta;
			// left, A and SHIFT+A
			this.keyboardControls.addListener(65, ( event, kbm )=>{
				let speed = self.calcPanSpeed(kbm);
				if(pan.x){ return pan.x = 0 }
				pan.x +=  speed;
			}, true); 
	
			// up, W and SHIFT+W
			this.keyboardControls.addListener(87, ( event, kbm )=>{
				let speed = self.calcPanSpeed(kbm);
				if(pan.y){ return pan.y = 0 }
				pan.y += speed;
			}, true);
	
			// right, D and SHIFT+D
			this.keyboardControls.addListener(68, ( event, kbm )=>{
				let speed = self.calcPanSpeed(kbm);
				if(pan.x){ return pan.x = 0 }
				pan.x -= speed;
			}, true);
	
			// down, S and SHIFT+S
			this.keyboardControls.addListener(83, ( event, kbm )=>{
				let speed = self.calcPanSpeed(kbm);
				if(pan.y){ return pan.y = 0 }
				pan.y -= speed;
			}, true);

			// f3
			this.keyboardControls.addListener(114, (event, kbm)=>{
				debugState = !debugState;
				console.log(`${tFmt.bool( debugState, "Enabling", "Disabling" )} debug tools visibility`);
				SuperEvents.emit("debug-visibility-toggle", debugState);
			})
		}

		load(){
			//this.controlRouter.world.ff.add(this.cursorHelper.cursorHighlightMesh);
		}
	
		/**
		 * Invoked when this behavior is no longer in action
		 */
		unload(){
			//this.controlRouter.world.ff.remove(this.cursorHelper.cursorHighlightMesh);
		}
	
		
	}
}
