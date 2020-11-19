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

		}
	}
}
