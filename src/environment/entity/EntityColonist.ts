import { EntityActor } from "./EntityActor";
import { World } from "../world/World";

export class EntityColonist extends EntityActor{
	constructor( world: World ){
		super( world );
	}
}