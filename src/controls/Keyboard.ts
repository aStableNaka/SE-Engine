export type KeyCode = {altKey:boolean,keyCode:boolean,shiftKey:boolean,ctrlKey:boolean};

/**
 * @example
 * let keyboardManager = new KeyboardControlManager( window );
 * keyboardManager.addListener(65, ()=>{console.log("A is being held"), true}) // a
 */
export class KeyboardControlManager{
	keysDown:any={};
	handlers:any={};
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
	getKeyCode( event:KeyboardEvent|KeyCode){
		return event.keyCode;
	}

	addListener( input:number, callback:( event:KeyboardEvent, kbm:KeyboardControlManager )=>void, hold:boolean=false ){
		this.handlers[input] = {hold:hold,callback:callback};
	}

	handleKeyDown( event:KeyboardEvent ){
		this.shift = event.shiftKey;
		this.alt = event.altKey;
		this.ctrl = event.ctrlKey;
		if(this.handlers[event.keyCode]){
			if(this.handlers[event.keyCode].hold){
				this.keysDown[event.keyCode] = event;
			}else{
				this.handlers[event.keyCode].callback(event, this);
			}
		}
	}

	handleKeyUp( event:KeyboardEvent ){
		this.shift = event.shiftKey;
		this.alt = event.altKey;
		this.ctrl = event.ctrlKey;
		if(this.handlers[event.keyCode]){
			if(this.handlers[event.keyCode].hold){
				this.keysDown[event.keyCode] = false;
			}
		}
	}

	tick(){
		Object.keys(this.handlers).map(( keyCode )=>{
			if(this.keysDown[keyCode] && this.handlers[keyCode].hold ){
				this.handlers[keyCode].callback( this.keysDown[keyCode], this );
			}
		})
	}
}