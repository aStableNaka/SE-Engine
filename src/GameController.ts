
/*
TODO migrate tick and rendering control from
SimonsWorld over to here.
*/

import { World } from "./environment/world/World";
import { MainDebug } from "./Main";
import { DebugTools, SimonsWorld } from "./environment/world/SimonsWorld";
import { FrostedFlakes } from "./rendering/FrostedFlakes";
import { Verboosie, Verbose } from "./utils/Verboosie";
type SaveData = any;

/**
 * The game controller will handle initializing stuff
 */
export class GameController{

	world!: SimonsWorld;
	debug!: DebugTools;
	gameScene!: FrostedFlakes;

	constructor(){
		
	}

	/**
	 * Session creation/loading should not be done before
	 * game scene linking.
	 * @param gameScene 
	 */
	linkGameScene( gameScene: FrostedFlakes ){
		this.gameScene = gameScene;
		Verbose.log("GameScene linked", "GameController", 0x8 );
	}

	/**
	 * Create a new session and cache all necessary constructs into GameSession
	 * @param seed 
	 */
	createNewSession( seed:string = "hamon" ){
		if( !this.gameScene )
			throw new Error("Attempted to create new world session before game scene mount");

		this.world = new SimonsWorld( this.gameScene, seed );
		this.startTicks();
	}

	loadSession( saveData: SaveData ){

	}


	/**
	 * Invokes render and update ticks
	 */
	startTicks(){
		const world = <World>this.world;
		(<SimonsWorld>this.world).readyDebug( this.debug );
		world.tick();
		world.render();
	}

	/**
	 * Invoked after a session is initialized
	 * @param debug 
	 */
	initializeDebug( debug: DebugTools ){
		this.debug = debug;
	}
}