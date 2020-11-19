import * as THREE from "three";
import { config } from "../controls/Config";
import { Grid } from "../utils/collections/Spaces";
import { SimonsRegion } from "../environment/world/region/SimonsRegion";
import { World } from "../environment/world/World";
import { SuperEvents } from "../utils/SuperEvents";
import * as tFmt from "../utils/TextFormat";
import { MeshBasicMaterial } from "three";

/**
 * RegionDisplayBehavior controls which regions
 * will be displayed for any given viewport state
 */
export class RegionDisplayBehavior{
	// The immediate region is the region where
	// The player is most likely to be seeing
	// at the current moment.
	imr:number = config.gameplay.imrSize || 3; // immediate region size
	imrLowerBound:THREE.Vector2 = new THREE.Vector2(-this.imr,-this.imr);
	imrUpperBound:THREE.Vector2 = new THREE.Vector2(this.imr,this.imr);
	immediateRegionBox:THREE.Box2 = new THREE.Box2( this.imrLowerBound , this.imrUpperBound );
	immediateRegionBoundry!:THREE.Box2;
	immediateRegions!: Grid<SimonsRegion>;
	imrHelper!:THREE.Mesh;
	world: World;

	constructor( world: World ){
		this.world = world;
	}

	iterateOverBox2( box2:THREE.Box2, callback:(x:number,y:number)=>void){
		for( let x = box2.min.x; x <= box2.max.x; x++ ){
			for( let y = box2.min.y; y <= box2.max.y; y++ ){
				callback(x,y);
			}
		}
	}

	/**
	 * imrHelper helps visualize the immediate viewable region
	 */
	setup(){
		const self = this;
		const imrMatSettingsHidden = {
			color:0xffff00,
			wireframe:false,
			transparent:true,
			opacity:0
		};
		const imrMatSettingsVisible = {
			color:0xffff00,
			wireframe:true,
			transparent:false,
			opacity:0
		};

		const imrMatHidden = new MeshBasicMaterial( imrMatSettingsHidden );
		const imrMatVisible = new MeshBasicMaterial( imrMatSettingsVisible );

		const chunkSize = config.world.chunkSize;
		const imrSize = this.imr*2*chunkSize;

		this.imrHelper = new THREE.Mesh( new THREE.BoxGeometry(imrSize,1,imrSize, this.imr*2, 1, this.imr*2), imrMatHidden );

		this.imrHelper.name = `IMRHelper${config.int.rcTag}`;
		
		this.world.ff.add(this.imrHelper);

		SuperEvents.on("debug-visibility-toggle", ( state: boolean )=>{
			console.warn(`[ImrHelper] ${tFmt.bool( state, 'enabled', 'disabled')}`);
			// Hotswap imrHelper material
			this.imrHelper.material = state?imrMatVisible:imrMatHidden;
		});
	}

	updateImrHelper(){
		const chunkSize = config.world.chunkSize;
		this.imrHelper.position.set(this.immediateRegionBoundry.min.x*chunkSize, 0,  this.immediateRegionBoundry.min.y*chunkSize);
		if(config.debug.enable){
			//this.imrHelper.visible=true;
		}
		//this.imrHelper.visible=false;
	}

	/**
	 * change the imr radius
	 * @param size 
	 */
	setImrSize( size:number ){
		
	}
}