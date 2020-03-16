export const options: any = {};

/**
 * World options
 */
options.world = {};
options.world.chunkSize = 32;			// A single chunk contains 32x32 blocks
options.world.mapSizeSmall = 8;		// 256x256 map size
options.world.mapSizeMedium = 16;		// 512x512 map size
options.world.mapSizeLarge = 32;		// 1024x1024 map size
options.world.mapSizeExtreme = 64; 		// 2048x2048 map size, Not recommended
options.world.mapSizeDebug = 16;		// Map size for debugging
options.world.mapSize = options.world.mapSizeDebug;
options.world.bounded = true;			// Set to false for infinite world generation

/**
 * Gameplay options
 */
options.gameplay = {}
options.gameplay.imrSize = 3;			// The square-radius of the regions in view	default 3


/**
 * Camera options
 */
options.camera = {}
options.camera.noZoomLimit = false;		// Disable zoom limit alltogether 			Default false
options.camera.maxZoom = 60; 			// How far the camera can go	 			Default 60
options.camera.minZoom = 5;			// How close the camera can go 			Default 5
options.camera.viewAngle = 32;		// The view angle						Default 35
options.camera.panSpeed = 5;			// Pan speed						Default 5

/**
 * Tick task options
 */
options.tick = {}
options.tick.ps = 20; 				// Ticks per second					Default 20
options.tick.ts_region_load = 1;		// How often an unloaded region gets loaded	Default 1 tick
options.tick.ts_debug_info_update = 10;	// How often debugging information gets updated Default 10 ticks
