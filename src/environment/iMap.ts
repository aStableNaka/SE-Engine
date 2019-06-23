enum MapOccupantType{
	Block,
	Entity,
	ActorBlock,
}

/**
 * An object that occupies the map
 * this includes blocks, entities, whatever.
 */
class MapOccupant{
	type: MapOccupantType;
	constructor( type: MapOccupantType ){
		this.type = type;
	}
}

/**
 * Defines a single map-object
 */
interface MapObjectRef{
	occupant: MapOccupant,
	x: number,
	y: number,
	z?: number,
	meta: any
}

/**
 * Defines the map as a whole
 */
interface Map{
	getObjectsAt( posX: number, posY: number, posZ?:number ): MapObjectRef[];
}