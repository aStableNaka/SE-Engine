export interface Registry{
	register( entity:any, forceRegister:boolean ):string;
	get( key:string ):any;
}

/**
 * A registry component for registry components 
 */
class RegistryRegistryComponent{
	name: string;
	namespace: string;
	registry: Registry;
	constructor(namespace:string,name:string,registry:Registry){
		this.name = name;
		this.namespace = namespace;
		this.registry = registry;
	}

	get(id:string):any{
		return this.registry.get(id);
	}
}
export class RegistryHub{
	namespaces:any = {};
	constructor(){}

	/**
	 * 
	 * @param namespace 
	 * @param name 
	 * @param registry 
	 * @example
	 * regHub.register( "base", "block", blockBaseRegistry );
	 */
	add(namespace:string,name:string,registry:Registry){
		if(!this.namespaces[namespace]){
			this.namespaces[namespace] = {}
		}
		this.namespaces[namespace][name] = new RegistryRegistryComponent(namespace, name, registry);
		console.log(`[ RegistryHub ] Registered ${namespace}:${name}:*`);
	}

	/**
	 * 
	 * @param fullKey
	 * @example
	 * let blockGroundClass = regHub.get("base:block:BlockGround"); 
	 */
	get(fullKey:string):any{
		let [namespace, name, key, discriminator] = fullKey.split(":");
		if(!this.namespaces[namespace]) throw new Error(`[ RegistryHub ] could not find namespace "${namespace}"`);
		if(!this.namespaces[namespace][name]) throw new Error(`[ RegistryHub ] could not find registry "${namespace}:${name}"`);
		let reg = this.namespaces[namespace][name].registry;
		if(!key) return reg;
		if(discriminator) key += `:${discriminator}`;
		return reg.get(key);
	}
}