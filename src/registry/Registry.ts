import { EventEmitter } from "events";

export interface Registry{
	register( entity:any, forceRegister?:boolean ):string;
	get( key:string ):any;
	checkReady( ready:()=>void ):void;
	list:any[];
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
export class RegistryHub extends EventEmitter{
	namespaces:any = {};
	registries:Registry[] = [];
	readyCount:number = 0;
	ready:boolean=false;
	constructor(){
		super();
	}

	/**
	 * 
	 * @param namespace 
	 * @param name 
	 * @param registry 
	 * @example
	 * regHub.register( "base", "block", blockBaseRegistry );
	 */
	add(namespace:string,name:string,registry:Registry){
		let self = this;
		if(!this.namespaces[namespace]){
			this.namespaces[namespace] = {}
		}
		this.namespaces[namespace][name] = new RegistryRegistryComponent(namespace, name, registry);
		this.registries.push(registry);
		this.onReady(()=>{
			self.ready = true;
		})
		console.log(`[ RegistryHub ] Registered ${namespace}:${name}:*`);
	}

	load(onReady:()=>void){
		this.onReady(onReady);
		this.registries.map((reg)=>{
			reg.checkReady((()=>{
				this.incrimentReady();
			}).bind(this));
		}, this)
	}

	incrimentReady(){
		this.readyCount++;
		if(this.readyCount==this.registries.length){
			console.log(`[RegistryHub] Loading complete, ready.`);
			this.emit("ready", this);
		}
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

	/**
	 * Add a method to be invoked when all registries are ready
	 * @param callback 
	 */
	onReady(callback:()=>void){
		if(this.ready){
			callback();
		}else{
			this.addListener("ready", callback);
		}
	}
}