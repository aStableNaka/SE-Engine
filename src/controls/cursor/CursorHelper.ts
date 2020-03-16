import { Model, RCAble } from "../../models/Model";
import * as THREE from "three";
import { Region } from "../../environment/world/region/Region";
import { World } from "../../environment/world/World";
import { regHub } from "../../registry/RegistryHub";
import { BlockRegistry } from "../../registry/BlockRegistry";
import { Vector2 } from "three";
import { SimonsWorld } from "../../environment/world/SimonsWorld";
import { CappedAlwaysMap } from "../../utils/AlwaysMap";
import { BlockData } from "../../environment/blocks/Block";

export class CursorHelper{
	mouseEvent!:MouseEvent;
	cursorModel!:Model;
	cursorMesh!:THREE.Mesh;
	cursorRegion!:Region|null;
	world: SimonsWorld;

	rayCastingMap!: CappedAlwaysMap<string, RCAble>;
	rayCastingGroup: THREE.Group = new THREE.Group();
	rayCastingList: RCAble[] = [];
	
	mouseRayCaster:THREE.Raycaster = new THREE.Raycaster();

	/**
	 * In block coordinates
	 */
	mousePosition:THREE.Vector2 = new THREE.Vector2(0,0);

	/**
	 * The block location which cursor is currently hovered over
	 */
	mouseBlockSpace: THREE.Vector2 = new THREE.Vector2(0,0);
	mouseWorldPosition:THREE.Vector2 = new THREE.Vector2(0,0);
	mouseIntersects!: THREE.Intersection[];

	edgeScrollingSensitivity: number = 50;
	

	constructor( world:SimonsWorld ){
		const self = this;
		this.world = world;
		this.cursorModel = (<Model>regHub.get("base:model:ConveyorInline"));
		this.cursorMesh = this.cursorModel.mesh.clone();
		this.cursorMesh.name = `CursorHelper#${(Math.random()*9999).toString().padStart(4)}`;
		
		/**
		 * This map contains raycastables
		 */
		return;

		/**
		 * This was an alternative to using the regular map
		 */
		this.rayCastingMap = new CappedAlwaysMap<string, RCAble>( 5*5*2, ( key: string )=>{
			const [x,y] = [...key.split("_").map((n)=>{return parseInt(n)})];
			const block = <BlockData>self.world.getBlock(x,y,1);
			const model = <Model>regHub.get(block.getModelKey());
			const transform = world.getBlockModelTransform( x,y,1 );
			const rc = model.borrowRaycastable();

			rc.mesh.position.set( transform.x, transform.z, transform.y );
			rc.mesh.rotation.y = transform.w;

			self.world.ff.add(rc.mesh);
			return rc;
		}, undefined, ( rcAble )=>{
			rcAble.mesh.rotation.y = 0;
			self.world.ff.remove(rcAble.mesh);
			rcAble.returnToModel();
			return rcAble;
		});
	}

	/**
	 * Returns a list of meshes that are flagged with the &ci tag in their name
	 * Updates am internal list of intersects
	 */
	updateRCIntersects(){
		this.mouseIntersects = this.mouseRayCaster.intersectObjects(this.world.ff.children, true);
		let filteredRaycastables = this.mouseIntersects.filter((intersect)=>{
			return intersect.object.name.indexOf("&ci") > 0;
		})
		return filteredRaycastables;
	}

	/**
	 * If your object is not intersected, add &ci to the name.
	 */
	updateRayCaster(){

		this.mouseRayCaster.setFromCamera(this.mousePosition,this.world.ff.camera);
		const filteredRaycastables = this.updateRCIntersects();
		const self = this;
		
		if(filteredRaycastables[0]){
			let imrh = filteredRaycastables.find((o3d)=>{ return o3d.object.name=="IMRHelper&ci" });

			if(!imrh){
				return;
			}
			
			const [blockX, blockY] = [Math.floor(imrh.point.x+0.5), Math.floor(imrh.point.z+0.5)]
			
			this.updateBlockSpace( blockX, blockY, imrh );

			// This will add rc objects to the scene
			this.raycastInstancedMeshes( blockX, blockY );
			
		}

		this.cursorRegion = this.world.getRegionAtVec2( this.mouseBlockSpace );
	}

	/**
	 * 
	 * @param blockX 
	 * @param blockY 
	 * @param imrh 
	 */
	updateBlockSpace( blockX: number, blockY: number, imrh: THREE.Intersection ){
		this.cursorMesh.position.x = blockX;
		this.cursorMesh.position.y = imrh.point.y+0.5+(this.cursorModel.options.zOffset||0);
		this.cursorMesh.position.z = blockY;
		
		this.mouseBlockSpace.x = blockX;
		this.mouseBlockSpace.y = blockY;
	}

	/**
	 * Will add raycastable meshes to the scene
	 * and use them to calculate mouse intersects.
	 * @param blockX 
	 * @param blockY 
	 */
	raycastInstancedMeshes( blockX:number, blockY:number ){
		const self = this;
		// The higher the resolution, the more expensive this operation
		// But the more accurate the raycasting will be
		const resolution = 5;

		// The offset of the raycasting square
		const mpOffset = -Math.floor((resolution-1)/2)
		const [bx,by] = [mpOffset,mpOffset];
		const [ex,ey] = [bx+resolution,by+resolution];

		for( let x = bx; x <=ex; x++ ){
			for( let y = by; y <=ey; y++ ){
				const index = resolution*(y-by)+x-bx;
				const [wbx,wby,wbz] = [x+blockX, y+blockY, 1];

				// Remove old rc objects
				if(this.rayCastingList[index]){
					const rcAble = this.rayCastingList[index];
					rcAble.mesh.rotation.y = 0;
					self.world.ff.remove(rcAble.mesh);
					rcAble.returnToModel();
				}
				
				const block = <BlockData>self.world.getBlock(wbx,wby,wbz);

				// If the cursor goes out of the region bounds
				if(!block){
					return;
				}

				const model = <Model>regHub.get(block.getModelKey());
				const transform = self.world.getBlockModelTransform( wbx,wby,wbz );
				const rc = model.borrowRaycastable();

				rc.mesh.position.set( transform.x, transform.z, transform.y );
				rc.mesh.rotation.y = transform.w;

				self.world.ff.add(rc.mesh);
				this.rayCastingList[index] = rc;
			}
		}
		this.updateRCIntersects();
	}

	/**
	 * @override
	 * @abstract
	 */
	handleMouseClick(){		
		// Block placing example
		/*
		let block = blockRegistry.createBlockData( "base:BlockConveyorBelt" );
		this.world.setBlock( block, chp.x, chp.z, 1 );
		*/
		
		console.log(this.mouseIntersects);
		console.log(this.rayCastingMap);
		console.log(regHub.get("base:model:TreeSakura0"));

		// An attempt to do raycasting with instanced meshes
		/*

		this.mouseRayCaster.setFromCamera(this.mousePosition,this.world.ff.camera);
		if(this.cursorRegion){
			this.cursorRegion.meshGroup.traverse((obj3d)=>{
				if((<THREE.Mesh>obj3d).isMesh ){
					let intersection = this.mouseRayCaster.intersectObject(obj3d, true);
					console.log(obj3d, intersection);
				}
			})
		}

		*/
	}

	/**
	 * Places a block at the cursor's projected location
	 * @param blockID 
	 */
	placeBlock( blockID: string ): BlockData;
	placeBlock( blockData: BlockData ): BlockData;
	placeBlock( BIDorBD: string | BlockData ): BlockData {
		let chp = this.mouseBlockSpace;
		let blockData;
		if( typeof BIDorBD == "string" ){
			const blockRegistry: BlockRegistry = regHub.get( "base:block" );
			blockData = blockRegistry.createBlockData( BIDorBD );
		}else{
			blockData = BIDorBD;
		}

		this.world.setBlock( blockData, chp.x, chp.y, 1 );

		return blockData;

	}

	/**
	 * Project the screen-space coordinates for the raycaster
	 * to do its calculations
	 */
	projectMouse(){
		const event = this.mouseEvent;
		this.mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		this.updateRayCaster();
	}

	handleEdgeScrolling(){
		if(!this.mouseEvent){ return; }
		const scroll = new Vector2( 0, 0 );

		switch( this.mouseEvent.clientX ){
			case 0:
				scroll.x = this.edgeScrollingSensitivity;
				break;
			case window.innerWidth-1:
				scroll.x = -this.edgeScrollingSensitivity;
				break;
			default:
				scroll.x = 0;
		}

		switch( this.mouseEvent.clientY ){
			case 0:
				scroll.y = this.edgeScrollingSensitivity;
				break;
			case window.innerHeight-1:
				scroll.y = -this.edgeScrollingSensitivity;
				break;
			default:
				scroll.y = 0;
		}

		const pPos = this.world.player.position;
		const camDist = this.world.ff.camera.position.distanceTo( new THREE.Vector3( pPos.x, 1, pPos.y ) ) / 2;

		this.world.ff.orbitControlls.pan( scroll.x*camDist, scroll.y*camDist );
	}

	/**
	 * Invoked by ControlBehavior
	 * @param event 
	 */
	handle( event: MouseEvent ){
		if( event.type=="mousemove" ){
			this.updateMouse( event );
		}else if(event.type=="click"){
			this.handleMouseClick();
		}
	}

	/**
	 * Called by world.update
	 */
	update(){
		this.handleEdgeScrolling();
	}

	updateMouse( event:MouseEvent ){
		if(!this.world.ready){ return; }
		this.mouseEvent = event;
		this.projectMouse();
	}
}