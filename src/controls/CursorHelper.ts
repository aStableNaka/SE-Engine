import { Model } from "../models/Model";
import * as THREE from "three";
import { Region } from "../environment/world/region/Region";
import { World } from "../environment/world/World";
import { regHub } from "../registry/RegistryHub";
import { BlockRegistry } from "../registry/BlockRegistry";

export class CursorHelper{
	mouseEvent!:MouseEvent;
	cursorModel!:Model;
	cursorMesh!:THREE.Mesh;
	cursorRegion!:Region|null;
	world: World;

	mouseRayCaster:THREE.Raycaster = new THREE.Raycaster();
	mousePosition:THREE.Vector2 = new THREE.Vector2(0,0);
	mouseWorldPosition:THREE.Vector2 = new THREE.Vector2(0,0);
	mouseIntersects!: THREE.Intersection[];

	constructor( world:World ){
		this.world = world;
		this.cursorModel = (<Model>regHub.get("base:model:ConveyorInline"));
		this.cursorMesh = this.cursorModel.mesh.clone();
		this.cursorMesh.name = "CursorHelper";

		this.setupEventHandlers();
	}

	/**
	 * If your object is not intersected, add &ci to the name.
	 */
	updateRayCaster(){
		this.mouseRayCaster.setFromCamera(this.mousePosition,this.world.ff.camera);
		this.mouseIntersects = this.mouseRayCaster.intersectObjects(this.world.ff.children, true);
		let filt = this.mouseIntersects.filter((intersect)=>{
			return intersect.object.name.indexOf("&ci") > 0;
		})
		if(filt[0]){
			let obj3d = filt[0];
			this.cursorMesh.position.x = Math.floor(obj3d.point.x+0.5);
			this.cursorMesh.position.y = obj3d.point.y+0.5+(this.cursorModel.options.zOffset||0);
			this.cursorMesh.position.z = Math.floor(obj3d.point.z+0.5);
		}
		this.cursorRegion = this.world.getRegionAtVec2( new THREE.Vector2(this.cursorMesh.position.x, this.cursorMesh.position.z) );
	}

	handleMouseClick(){
		let chp = this.cursorMesh.position;
		let blockRegistry: BlockRegistry = regHub.get( "base:block" );
		let block = blockRegistry.createBlockData( "base:BlockConveyorBelt" );
		this.world.setBlock( block, chp.x, chp.z, 1 );
		block.blockDidMount( { position:new THREE.Vector3( chp.x, chp.z, 1 ) }); // REQUIRED
		//console.log(this.mouseIntersects);
		if(this.cursorRegion){
			this.cursorRegion.meshGroup.children.map((obj3d)=>{
				let intersection = this.mouseRayCaster.intersectObject(obj3d);
				//console.log(intersection)
			})
		}
	}

	setupEventHandlers(){
		window.addEventListener("mousemove", this.updateMouse.bind(this));
		window.addEventListener("click", this.handleMouseClick.bind(this));
	}

	projectMouse(){
		const event = this.mouseEvent;
		this.mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		this.updateRayCaster();
	}

	updateMouse( event:MouseEvent ){
		if(!this.world.ready){ return; }
		this.mouseEvent = event;
		this.projectMouse();
	}
}