import { classType } from "../utils/Classes";
import { Verbose } from "../utils/Verboosie";
import { Vector3, Vector2, Vector4 } from "three";

const classDictionary = new Map<classType,Serializer<any>>();

/**
 * Every class that wants to be serialized, must have a serializer.
 * 
 * When serializing occurs, the serializer will scout out for
 */
export class Serializer<T>{

	classT: classType;

	constructor( classT: classType ){
		this.classT = classT;
		if( classDictionary.has( classT ) ){
			Verbose.log(` Overwriting ClassType Collision ${classT}`, "Serializer", 0x2);
		}
		classDictionary.set( classT, this );
	}

	/**
	 * Provide an object with the data to be serialized
	 * @abstract
	 */
	dataMapping( instance: T ){
		return {};
	}

	/**
	 * Converts the instance data to raw (disk-writable) data
	 */
	convertToRaw( instance: T ){
		const mapping: any = this.dataMapping( instance );
		return this.convert75( mapping );
	}

	convert75( object: any ){
		const out:any = {};
				/**
		 * having noCTR has true will return the mapping alone 
		 */
		if( object.noCTR ){
			return object;
		}

		Object.keys( object ).map( ( attributeName: string )=>{
			const attribute = object[ attributeName ];


			if( typeof( attribute ) != "object" )
			{
				// If the attribute is a primitive
				out[ attributeName ] = attribute;
			}
			else if( Array.isArray( attribute ) )
			{
				// If the attribute is an array of potential serializable objects
				out[ attributeName ] = attribute.map( ( arrAttr )=>{
					return this.convert75( arrAttr );
				});
			}else{
				// If we are working with an object
				if( attribute.constructor == ({}).constructor )
				{
					// If it is a base javascript object
					out[ attributeName ] = this.convert75( attribute );
				}else{
					// If it is an instanced class object
					const serializer = Serializer.grabSerializer( attribute );
					out[ attributeName ] = serializer.convertToRaw( attribute );
				}
			}
		})

		return out;
	}

	/**
	 * Check to see if an attribute has a serializer
	 * @param attribute 
	 */
	static hasSerializer( attribute: any ){
		return ( !!attribute.serializer ) ||
			 ( attribute.constructor && classDictionary.has( attribute.constructor ) );
	}

	/**
	 * Provides the serializer for any object, as long as it is defined.
	 * Object serializers must be defined in order to be serialized.
	 * @param attribute 
	 */
	static grabSerializer( attribute: any ): Serializer<any>{
		if( attribute.serializer )
		{
			// If the attribute has a serializer member
			return attribute.serializer;
		}
		else if( classDictionary.has( attribute.constructor ) )
		{
			// If the attribute type is registered with a serializer
			const s = <Serializer<any>>classDictionary.get( attribute.constructor );
			return s;
		}
		else
		{
			// Objects that have no defined serializer should not be serialized
			throw new Error( `[ Serializer ] cannot serialize object. Serializer for "${ attribute.constructor.name }" is undefined.` );
		}
	}
}

/**
 * THREE.JS serializations
 */
export class VectorSerializer extends Serializer<any>{
	constructor( type: classType ){
		super( type );
	}

	dataMapping( instance: Vector2 | Vector3 | Vector4 ){
		return {
			type: instance.constructor.name,
			components: instance.toArray()
		}
	}
}

new VectorSerializer( Vector2 );
new VectorSerializer( Vector3 );
new VectorSerializer( Vector4 );