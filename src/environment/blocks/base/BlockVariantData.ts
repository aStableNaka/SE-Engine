import { BlockData } from "../Block";
import { baseClass as BlockBaseClass } from '../../../utils/Classes';

export class BlockVariantData extends BlockData{
	/** The texture variant */
	constructor( baseClass:BlockBaseClass, variant?:number, rotation?:number ){
		super( baseClass );
		this.data = {
			variant: variant,
			rotation: (typeof(rotation) == "number") ? rotation : Math.random()*Math.PI*2
		};
	}
}