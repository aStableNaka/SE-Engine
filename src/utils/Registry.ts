
import { baseClass } from './Classes';

export class RegistryComponent{
	baseClass:baseClass;
	forceRegister:boolean;
	identities:baseClass[];

	constructor( baseClass:any, forceRegister:boolean ){
		this.baseClass = baseClass;
		this.forceRegister = forceRegister;
		this.identities = [];
	}

	replaceIdentity( newbaseClass:any ){
		this.addIdentity( this.baseClass );
		this.baseClass = newbaseClass;
	}

	addIdentity( baseClass:any ){
		this.identities.push( baseClass );
	}
}