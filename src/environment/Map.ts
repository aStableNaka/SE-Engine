import * as three from 'three';
import { Region } from './region/Region';
import { MapObject } from './MapObject'

export type StorableBuffer = Buffer;


/*
	World > Map > Regions > MapObject
*/

/**
 * Defines a single map-object, stored within regions
 */


/**
 * Defines the map as a whole
 */
export interface Map{
	getObjectsAt( vector: three.Vector2 ): MapObject[]; // Every object on the z-axis at this ordered pair
	getObjectsAt( vector: three.Vector3 ): MapObject[]; // A specific object (or objects) at this ordered pair
	getObjectsAt( posX: number, posY: number, posZ?:number ): MapObject[];
	getRegionsAt( posX: number, posY: number, posZ?:number ): Region[];
}