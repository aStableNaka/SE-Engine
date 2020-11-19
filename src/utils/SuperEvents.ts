/**
 * Superevents provides a global object for event emissions
 */

import { EventEmitter } from "events";

export const SuperEvents = new EventEmitter();

// Debug

// Invoked when the visibility of debug tools changes
SuperEvents.once("debug-visibility-toggle", ( state: boolean)=>{
	/*
		state: true = visible, false = hidden;
	*/
});