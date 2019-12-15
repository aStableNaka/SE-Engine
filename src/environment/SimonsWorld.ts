import {World} from "./World";
import { FrostedFlakes } from "../rendering/FrostedFlakes";
import * as THREE from "three";
import { Grid } from "../utils/Spaces";
import { Region } from "./region/Region";
import {SimonsRegion} from "./region/SimonsRegion";
import { OrbitControls } from "../controls/Orbit";
import { Player } from "./entity/Player";
import { Vector2, Vector3 } from "three";
import {KeyboardControlManager} from "../controls/Keyboard";
import { any, object } from "prop-types";
import * as SimplexNoise from "simplex-noise";
import { BlockData } from "./blocks/Block";

/**
 * @checkpoint
 * Control test alpha 0
 * https://gfycat.com/CautiousSeveralDromaeosaur
 */

const sin45 = Math.sin(45);
const cos45 = Math.cos(45);
const sqrthalf = Math.sqrt(1/2);

/**
 * Simons world is a world where each region
 * has 4 or more layers. The layers follow this mapping:
 * 3 - other
 * 2 - roofs
 * 1 - walls
 * 0 - ground
 */
export class SimonsWorld extends World{
	enableDebugHelpers:boolean = true;

	worldSize=16;
	chunkSize=32;
	worldDomain:THREE.Box2;
	center: THREE.Vector2;
	player!: Player;

	loadedRegions:Region[] = [];
	regionLoadQueue:Region[] = [];

	mouseRayCaster:THREE.Raycaster = new THREE.Raycaster();
	mousePosition:THREE.Vector2 = new THREE.Vector2(0,0);
	mouseWorldPosition:THREE.Vector2 = new THREE.Vector2(0,0);
	
	keyboardControls:KeyboardControlManager = new KeyboardControlManager( document.body );

	// The immediate region is the region where
	// The player is most likely to be seeing
	// at the current moment.
	imr:number = 3; // immediate region size
	imrLowerBound:THREE.Vector2 = new THREE.Vector2(-this.imr,-this.imr);
	imrUpperBound:THREE.Vector2 = new THREE.Vector2(this.imr,this.imr);
	immediateRegionBox:THREE.Box2 = new THREE.Box2( this.imrLowerBound , this.imrUpperBound );
	immediateRegionBoundry!:THREE.Box2;
	immediateRegions!: Grid<SimonsRegion>;
	imrHelper!:THREE.Mesh;

	cursorHelper!:THREE.Mesh;
	cursorRegion!:Region|null;

	noiseGen1:SimplexNoise = new SimplexNoise.default();
	mouseIntersects!: THREE.Intersection[];

	constructor( ff:FrostedFlakes ){
		super( ff );
		let self = this;
		this.center = new THREE.Vector2(this.chunkSize*this.worldSize/2, this.chunkSize*this.worldSize/2);
		this.worldDomain = new THREE.Box2( new Vector2(-this.worldSize,-this.worldSize), new Vector2(this.worldSize-1,this.worldSize-1) );
		this.player = new Player( this );
		this.setupControls(ff);
		this.regions = new Grid<Region>(this.worldSize,(y,x)=>{
			return self.instantiateRegion(x,y);
		});
		this.setupImrHelper();
		this.setupMouseControls();

		this.tickScheduler.every(2, ()=>{
			if(self.regionLoadQueue[0]){
				let reg = <Region>self.regionLoadQueue.pop();
				reg.loaded = true;
				reg.constructMesh();
			}
		})

	}

	/**
	 * Queue a region to be loaded.
	 * Regions are loaded once every 2 ticks.
	 * @param region 
	 */
	queueRegionLoad(region:Region){
		this.regionLoadQueue.push(region);
	}

	/**
	 * Create a new instance of a region.
	 * @param x 
	 * @param y 
	 */
	instantiateRegion(x:number,y:number){
		let region = new SimonsRegion( this, new THREE.Vector2(x,y) );
		region.meshGroup.position.set(x*this.chunkSize,0,y*this.chunkSize);
		region.meshGroup.worldLocation = new THREE.Vector2(x,y);
		region.meshGroup.name = `reg_${x}:${y}`;
		//region.constructMesh();
		return region;
	}


	/**
	 * imrHelper helps visualize the immediate viewable region
	 */
	setupImrHelper(){
		let imrMaterialSettings = {
			color:0xffff00,
			wireframe:false,
			transparent:true,
			opacity:0
		};
		if(this.enableDebugHelpers){
			console.warn("[ImrHelper] enabled");
			imrMaterialSettings.wireframe = true;
			imrMaterialSettings.transparent = false;
		}
		this.imrHelper = new THREE.Mesh( new THREE.BoxGeometry(this.imr*2*this.chunkSize,1,this.imr*2*this.chunkSize, this.imr*2, 1, this.imr*2), new THREE.MeshBasicMaterial(imrMaterialSettings) );
		this.cursorHelper = new THREE.Mesh( new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0xff33ff, wireframe:false}) );
		this.imrHelper.name = "IMRHelper&ci";
		this.cursorHelper.name = "CursorHelper";
		this.ff.add(this.imrHelper);
		this.ff.add(this.cursorHelper);
	}

	updateImrHelper(){
		this.imrHelper.position.set(this.immediateRegionBoundry.min.x*this.chunkSize, 0,  this.immediateRegionBoundry.min.y*this.chunkSize);
		if(this.enableDebugHelpers){
			//this.imrHelper.visible=true;
		}
		//this.imrHelper.visible=false;
	}






	setupMouseControls(){
		window.addEventListener("mousemove", this.updateMouse.bind(this));
		window.addEventListener("click", this.handleMouseClick.bind(this));
	}

	updateMouse( event:MouseEvent ){
		this.mousePosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mousePosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		this.updateRayCaster();
	}

	/**
	 * If your object is not intersected, add &ci to the name.
	 */
	updateRayCaster(){
		this.mouseRayCaster.setFromCamera(this.mousePosition,this.ff.camera);
		this.mouseIntersects = this.mouseRayCaster.intersectObjects(this.ff.children, true);
		let filt = this.mouseIntersects.filter((intersect)=>{
			return intersect.object.name.indexOf("&ci") > 0;
		})
		if(filt[0]){
			let obj3d = filt[0];
			this.cursorHelper.position.x = Math.floor(obj3d.point.x+0.5);
			this.cursorHelper.position.y = obj3d.point.y+0.1;
			this.cursorHelper.position.z = Math.floor(obj3d.point.z+0.5);
		}
		this.cursorRegion = this.getRegionAtVec2( new THREE.Vector2(this.cursorHelper.position.x, this.cursorHelper.position.z) );
	}

	/**
	 * Place a block as a debugging measure
	 */
	debugBlockPlace(){
		if(this.enableDebugHelpers){
			console.log(this,this.mouseIntersects);
		}
	}

	handleMouseClick(){
		this.debugBlockPlace();
		let mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:0x00ff00}));
		let chp = this.cursorHelper.position;
		mesh.position.set(chp.x, 1, chp.z);
		this.ff.add(mesh);
		console.log(this.mouseIntersects);
		if(this.cursorRegion){
			this.cursorRegion.meshGroup.children.map((obj3d)=>{
				let intersection = this.mouseRayCaster.intersectObject(obj3d);
				console.log(intersection)
			})
		}
	}






	iterateOverBox2( box2:THREE.Box2, callback:(x:number,y:number)=>void){
		for( let x = box2.min.x; x < box2.max.x; x++ ){
			for( let y = box2.min.y; y < box2.max.y; y++ ){
				callback(x,y);
			}
		}
	}

	getImmediateRegionBoundry( player:Player ):THREE.Box2{
		let pPos = player.position.clone();
		// pPos but floored
		let fpPos = pPos.floor();
		// The location of the region which the player is in
		let imReg = fpPos.divideScalar(this.chunkSize).floor();
		// turn imReg into a translation
		let trans = imReg.sub( this.imrLowerBound );
		return this.immediateRegionBox.clone().translate( trans );
	}

	updateImmediateRegionBoundry( player:Player ){
		this.immediateRegionBoundry = this.getImmediateRegionBoundry(player);
	}

	/**
	 * Set up the controls for SimonsWorld 
	 * @param ff 
	 */
	setupControls( ff:FrostedFlakes ){
		let self = this;
		this.tickScheduler.after(10,()=>{
			// Set up the player
			self.setupPlayerPlacement(ff);	
			self.setupMovementControls();
		})
		this.setupOrbitControls( ff) ;
	}

	setupOrbitControls(ff:FrostedFlakes){
		// Set up the orbit controls
		ff.orbitControlls.maxPolarAngle=Math.PI/180*45;
		ff.orbitControlls.minPolarAngle=Math.PI/180*45;
		ff.orbitControlls.minDistance=5;
		//ff.orbitControlls.maxDistance=60;
		ff.orbitControlls.enableDamping = false;
		ff.orbitControlls.keyPanSpeed=5;

		ff.orbitControlls.mouseButtons = {
			LEFT:THREE.MOUSE.ROTATE
		}

		// Set camera target to player location
		ff.orbitControlls.target.set(this.center.x-5,1,this.center.y-5);
		ff.camera.position.set(this.center.x,5,this.center.y);

		this.setupOrbitControlsDebugging();
	}

	setupOrbitControlsDebugging(){
		if(this.enableDebugHelpers){
			// For debugging
			this.ff.add( new THREE.AmbientLight( 0xffffff,1 ))
			//this.ff.orbitControlls.maxDistance=100000;
		}
	}






	/**
	 * Sets up the initial player placement
	 * as well as tethering the player to the camera.
	 * @param ff 
	 */
	setupPlayerPlacement(ff:FrostedFlakes){
		this.player.setPosition(this.center.add(new THREE.Vector2(-5,-5)));


		this.updateImmediateRegionBoundry( this.player );
		this.updateRegionsSeen(this.immediateRegionBoundry);
		/*this.iterateOverBox2( this.immediateRegionBoundry, (x,y)=>{
			this.regions.get(x,y).addToWorld();
		});*/


		/**
		 * I could try setting the player mesh
		 * as a child to the camera.
		 */
		ff.orbitControlls.onPan = ( panOffset )=>{	
			this.player.setPosition( new Vector2(panOffset.x,panOffset.z) );
		}
	}

	/**
	 * Calculate player speed in pan units
	 * @param kbm 
	 */
	calcPlayerSpeed(kbm:KeyboardControlManager):number{
		const baseSpeedMult = 1.5 // 1
		const sprintSpeedMult = 4; // 4
		return this.player.speed * (kbm.shift?sprintSpeedMult:baseSpeedMult)
	}

	/**
	 * Basic WASD movement mapping
	 */
	setupMovementControls(){
		let self = this;

		// left, A and SHIFT+A
		this.keyboardControls.addListener(65, ( event, kbm )=>{
			let speed = this.calcPlayerSpeed(kbm);
			if(self.player.movementDelta.x){ return self.player.movementDelta.x = 0 }
			self.player.movementDelta.x +=  speed;
		}, true); 

		// up, W and SHIFT+W
		this.keyboardControls.addListener(87, ( event, kbm )=>{
			let speed = this.calcPlayerSpeed(kbm);
			if(self.player.movementDelta.y){ return self.player.movementDelta.y = 0 }
			self.player.movementDelta.y += speed;
		}, true);

		// right, D and SHIFT+D
		this.keyboardControls.addListener(68, ( event, kbm )=>{
			let speed = this.calcPlayerSpeed(kbm);
			if(self.player.movementDelta.x){ return self.player.movementDelta.x = 0 }
			self.player.movementDelta.x -= speed;
		}, true);

		// down, S and SHIFT+S
		this.keyboardControls.addListener(83, ( event, kbm )=>{
			let speed = this.calcPlayerSpeed(kbm);
			if(self.player.movementDelta.y){ return self.player.movementDelta.y = 0 }
			self.player.movementDelta.y -= speed;
		}, true);
	}



	/**
	 * Adds regions that will be seen
	 * Removes regions that will no longer be seen
	 * @param newRegionBoundry 
	 * @note for some reason, i need to translate the region location by this.imr.
	 */
	updateRegionsSeen( newRegionBoundry:THREE.Box2 ){
		//let intersect = this.immediateRegionBoundry.clone().intersect(newRegionBoundry);
		let self = this;
		// Add regions that are to be seen
		this.iterateOverBox2(newRegionBoundry, (x,y)=>{
			// Location of the region
			let regionLocation = new THREE.Vector2( x-this.imr,y-this.imr );
			// If the point is inside the intersection
			// or if the world does not contain this region
			// Do nothing.
			if(!self.worldDomain.containsPoint(regionLocation)) return;
			let region = <Region>self.regions.get(regionLocation.x,regionLocation.y);
			if(!region.loaded){
				self.queueRegionLoad(region);
			}
			region.addToWorld();
		});

		// Remove regions that aren't seen anymore
		// this can be optimized using lazy iteration
		this.iterateOverBox2(this.immediateRegionBoundry, (x,y)=>{
			let removalQueue:THREE.Object3D[] = []
			this.ff.children.map((obj3d)=>{
				if(obj3d.name.indexOf("reg_")==0){
					let n = obj3d.name.replace("reg_",'');
					let [x,y] = [...n.split(":").map(x=>parseInt(x))];
					if(!newRegionBoundry.containsPoint(new THREE.Vector2(x+this.imr,y+this.imr))){
						removalQueue.push(obj3d);
					}
				}
			}, this)
			removalQueue.map((obj3d)=>{
				this.ff.remove(obj3d);
			},this);
		})
		this.immediateRegionBoundry = newRegionBoundry;
		this.updateImrHelper()
	}

	update(){
		this.player.tick();
		let regionsSeen = this.getImmediateRegionBoundry( this.player );
		if(!regionsSeen.containsBox(this.immediateRegionBoundry)){
			this.updateRegionsSeen( regionsSeen );
		}
	}

	/**
	 * A tick that does stuff for player movement
	 * @param md 
	 */
	tickMovement(md:THREE.Vector3){
		if( md.x && md.y ){
			// Diagonal movement normalization
			md = md.multiplyScalar(sqrthalf);
		}
		//document.title = this.player.velocity.toString() + ` ${md.x} / ${md.y}`;
		this.ff.orbitControlls.pan( md.x, md.y );
		this.player.movementDelta.x = 0;
		this.player.movementDelta.y = 0;
	}

	/**
	 * Rendering will do a few things:
	 * 	1 ) Update the camera position
	 */
	render(){
		this.defaultRender();
		this.keyboardControls.tick();

		// Handling movement
		let md = this.player.movementDelta;
		if( md.x || md.y ) this.tickMovement( md );
	}
}