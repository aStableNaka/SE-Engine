import * as three from 'three';
import { Region } from './Region';

export type StorableBuffer = Buffer;


/*
	World > Map > Regions > MapObject
*/

/**
 * Defines a single map-object, stored within regions
 */
export interface MapObject{
	ref: any,
	x: number,
	y: number,
	z?: number,
	meta?: any
}

/**
 * A storable object is an object that
 * has methods for converting its own
 * data into a format meant for saving
 * 
 * as well as methods for loading
 * and an identifier
 */
export interface Storable{
	toBuffer(): StorableBuffer; // Converts storable to a buffer object
	fromBuffer( buffer:Buffer ):void; // Transfers buffer data from a storable object
}

/**
 * Defines the map as a whole
 */
export interface Map{
	getObjectsAt( vector: three.Vector2 ): MapObject[]; // Every object on the z-axis at this ordered pair
	getObjectsAt( vector: three.Vector3 ): MapObject[]; // A specific object (or objects) at this ordered pair
	getObjectsAt( posX: number, posY: number, posZ?:number ): MapObject[];
	getRegionsAt( posX: number, posY: number, posZ?:number ): Region[];
}