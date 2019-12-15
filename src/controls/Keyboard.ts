export type KeyCode = number;
export type KeyInputData = {altKey:boolean,keyCode:KeyCode,shiftKey:boolean,ctrlKey:boolean};
export type KbHandlerCallback = (event:KeyboardEvent, kbm:KeyboardControlManager) => void;
export type KbHandlerContainer = {hold:boolean, callback:KbHandlerCallback}

/**
 * @example
 * let keyboardManager = new KeyboardControlManager( window );
 * keyboardManager.addListener(65, ()=>{console.log("A is being held"), true}) // a
 */
export class KeyboardControlManager{
	keysDown:any={};
	handlers:Map<KeyCode, KbHandlerContainer>= new Map<KeyCode, KbHandlerContainer>();
	target:HTMLElement;
	shift:boolean = false;
	alt:boolean = false;
	ctrl:boolean = false;
	constructor( target:HTMLElement ){
		this.target = target;
		target.addEventListener("keydown",this.handleKeyDown.bind(this));
		target.addEventListener("keyup",this.handleKeyUp.bind(this));
	}

	/**
	 * @param event
	 * @example
	 * "alt:keyCode:shift:ctrl",
	 * "true:65:true:false" == "Alt+W+Shift" 
	 */
	getKeyCode( event:KeyboardEvent|KeyInputData){
		return event.keyCode;
	}

	addListener( input:KeyCode, callback:KbHandlerCallback, hold:boolean=false ){
		this.handlers.set( input, {hold:hold,callback:callback} );
	}

	handleKeyDown( event:KeyboardEvent ){
		let keyCode = event.keyCode;
		this.shift = event.shiftKey;
		this.alt = event.altKey;
		this.ctrl = event.ctrlKey;
		if(this.handlers.has(event.keyCode)){
			let kbhc = (<KbHandlerContainer>this.handlers.get(keyCode));
			if(kbhc.hold){
				this.keysDown[event.keyCode] = event;
			}else{
				kbhc.callback(event, this);
			}
		}
	}

	handleKeyUp( event:KeyboardEvent ){
		let keyCode = event.keyCode;
		this.shift = event.shiftKey;
		this.alt = event.altKey;
		this.ctrl = event.ctrlKey;
		if(this.handlers.has(event.keyCode)){
			let kbhc = (<KbHandlerContainer>this.handlers.get(keyCode));
			if(kbhc.hold){
				this.keysDown[event.keyCode] = false;
			}
		}
	}

	tick(){
		this.handlers.forEach(( kbhc, keyCode )=>{
			if(this.keysDown[keyCode] && kbhc.hold ){
				kbhc.callback( this.keysDown[keyCode], this );
			}
		})
	}
}