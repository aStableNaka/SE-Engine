export type KeyCode = number;
export type KeyInputData = { keyCode: KeyCode, altKey: boolean, shiftKey: boolean, ctrlKey: boolean };
export type KbHandlerCallback = (event:KeyboardEvent, kbm:KeyboardControlManager) => void;
export type KbHandlerContainer = { hold: boolean, callback: KbHandlerCallback }

/**
 * Generate KeyInputData with modifiers
 */
export const KIDModGen = {
	altShift:(keyCode:number) => ({ keyCode: keyCode, altKey: true, shiftKey: true, ctrlKey: false }),
	alt:(keyCode:number) => ({ keyCode: keyCode, altKey: true, shiftKey: false, ctrlKey: false }),
	ctrlAltShift:(keyCode:number) => ({ keyCode: keyCode,altKey: true, shiftKey: true, ctrlKey: true }),
	ctrlAlt:(keyCode:number) => ({ keyCode: keyCode, altKey: true, shiftKey: false, ctrlKey: true }),
	ctrl:(keyCode:number) => ({ keyCode: keyCode, altKey: false, shiftKey: false, ctrlKey: true }),
	shift:(keyCode:number) => ({ keyCode: keyCode, altKey: false, shiftKey: true, ctrlKey:false }),
}
/**
 * @example
 * let keyboardManager = new KeyboardControlManager( window );
 * keyboardManager.addListener(65, ()=>{console.log("A is being held"), true}) // a
 */
export class KeyboardControlManager{
	public target: HTMLElement;
	public shift: boolean = false;
	public alt: boolean = false;
	public ctrl: boolean = false;


	private keysDown: any={};
	private handlers: Map<KeyCode, KbHandlerContainer>= new Map<KeyCode, KbHandlerContainer>();
	
	constructor( target: HTMLElement ){
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
	getKeyCode( event: KeyboardEvent|KeyInputData): KeyCode{
		return event.keyCode;
	}

	addListener( input: KeyCode, callback: KbHandlerCallback, hold: boolean = false ): void{
		this.handlers.set( input, {hold: hold, callback: callback} );
	}

	handleKeyDown( event: KeyboardEvent ): void{
		let keyCode = event.keyCode;
		this.shift = event.shiftKey;
		this.alt = event.altKey;
		this.ctrl = event.ctrlKey;
		if(this.handlers.has( event.keyCode )){
			let kbhc = (<KbHandlerContainer>this.handlers.get(keyCode));
			if( kbhc.hold ){
				this.keysDown[ event.keyCode ] = event;
			}else{
				kbhc.callback(event, this);
			}
		}
	}

	handleKeyUp( event: KeyboardEvent ): void{
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

	tick(): void{
		this.handlers.forEach(( kbhc, keyCode )=>{
			if(this.keysDown[keyCode] && kbhc.hold ){
				kbhc.callback( this.keysDown[keyCode], this );
			}
		})
	}
}