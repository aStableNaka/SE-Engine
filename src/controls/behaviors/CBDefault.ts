import { ControlBehavior } from "../ControlBehavior";
import { ControlRouter } from "../ControlRouter";
import { KeyboardControlManager } from "../Keyboard";
import { CursorHelper } from "../cursor/CursorHelper";

export namespace ControlBehaviors{
	export class CBDefault extends ControlBehavior{
		constructor(){
			super( "default" );
		}
	
		crDidBind( controlRouter: ControlRouter ){
			const world = controlRouter.world;
			const self = this;

			this.cursorHelper = new CursorHelper( world );

			// left, A and SHIFT+A
			this.keyboardControls.addListener(65, ( event, kbm )=>{
				let speed = self.calcPlayerSpeed(kbm);
				if(world.cameraAnchor.movementDelta.x){ return world.cameraAnchor.movementDelta.x = 0 }
				world.cameraAnchor.movementDelta.x +=  speed;
			}, true); 
	
			// up, W and SHIFT+W
			this.keyboardControls.addListener(87, ( event, kbm )=>{
				let speed = self.calcPlayerSpeed(kbm);
				if(world.cameraAnchor.movementDelta.y){ return world.cameraAnchor.movementDelta.y = 0 }
				world.cameraAnchor.movementDelta.y += speed;
			}, true);
	
			// right, D and SHIFT+D
			this.keyboardControls.addListener(68, ( event, kbm )=>{
				let speed = self.calcPlayerSpeed(kbm);
				if(world.cameraAnchor.movementDelta.x){ return world.cameraAnchor.movementDelta.x = 0 }
				world.cameraAnchor.movementDelta.x -= speed;
			}, true);
	
			// down, S and SHIFT+S
			this.keyboardControls.addListener(83, ( event, kbm )=>{
				let speed = self.calcPlayerSpeed(kbm);
				if(world.cameraAnchor.movementDelta.y){ return world.cameraAnchor.movementDelta.y = 0 }
				world.cameraAnchor.movementDelta.y -= speed;
			}, true);
		}
	
		/**
		 * Calculate player speed in pan units
		 * @param kbm 
		 */
		calcPlayerSpeed( kbm: KeyboardControlManager ):number{
			const baseSpeedMult = 1.5 // 1
			const sprintSpeedMult = 4; // 4
			const world = this.controlRouter.world;
			return world.cameraAnchor.speed * (kbm.shift?sprintSpeedMult:baseSpeedMult);
		}
	}
}
