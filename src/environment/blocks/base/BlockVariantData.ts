import { BlockData } from "../Block";
import { baseClass as BlockBaseClass } from '../../../utils/Classes';

export class BlockVariantData extends BlockData{
	/** The texture variant */
	public data: number;
	constructor( baseClass:BlockBaseClass, variant?:any ){
		super( baseClass );
		this.data = variant;
	}
}