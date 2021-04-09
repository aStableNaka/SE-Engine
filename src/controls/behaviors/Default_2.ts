import { ControlBehavior } from "../ControlBehavior";
import { ControlRouter } from "../ControlRouter";
import { KeyboardControlManager } from "../Keyboard";
import { CursorHelperGenericMapMani } from "../cursor/CursorHelperGenericMapMani";

export namespace ControlBehaviors{
	export class CBDefault extends ControlBehavior{
		constructor(){
			super( "default" );
		}
	
		crDidBind( controlRouter: ControlRouter ){
			const world = controlRouter.world;
			const self = this;

			this.cursorHelper = new CursorHelperGenericMapMani( world );

		}
	}
}
