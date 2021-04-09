/**
 * Superevents provides a global object for event emissions
 */

import { EventEmitter } from "events";

export const SuperEvents = new EventEmitter();

// Debug