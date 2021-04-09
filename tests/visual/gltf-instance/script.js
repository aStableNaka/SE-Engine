var scene = new THREE.Scene();

const instances = Math.pow(32,3);
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.far = 18000;
camera.near = -1000;
var renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const bloomLayer = new THREE.Layers();
bloomLayer.set(1);

renderer.setClearColor( 0x000000, 1 );
document.body.appendChild(renderer.domElement);
var controls = new THREE.OrbitControls( camera, renderer.domElement );
let gltfData;
let loader = new THREE.GLTFLoader().setPath( './gltf-instance/assets/' );
loader.setCrossOrigin( 'anonymous' );
let cols = 1;
let rows = 1;

let renderCalls = [];

function scaleObject3D( object3D, x, y, z ){
	object3D.scale.x = x;
	object3D.scale.y = y;
	object3D.scale.z = z;
}

loader.load( 'dvalone_clean1.gltf', function( gltf ){
	gltfData = gltf;

	// Use this method because children get taken
	// from their parent when .add is invoked
	let parts = gltf.scene.children.filter((child)=>{
		if(child.material){
			child.material.metalness = 0;
		}
		if(child.isMesh){
			console.log(child);
		}
		return true;
	});

	gltf.scene.traverse((part)=>{
		if(part.isMesh){
			part.layers.enable(1);
		}
	})

	parts.map( (part)=>{
		
		if(part.material){
			console.log(part);
		}
		scene.add(part);
		
	} )

	return;
	// TODO convert into instance, right now it's making rows*cols draw calls
	for( let y = -Math.floor(rows/2); y < Math.ceil(rows/2); y++){
		for( let x = -Math.floor(cols/2); x < Math.ceil(cols/2); x++){
			let boxGroup = new THREE.Group();
			boxGroup.position.x = x;
			boxGroup.position.z = y;
			parts.map( ( part )=>{
				
				let clone = part.clone();
				//clone.geometry.computeBoundingBox();
				clone.castShadow = true;
				clone.group = boxGroup;
				boxGroup.add( clone );
				
			} );
			boxGroup.rotation.y = Math.random()*2*Math.PI;
			//var boxhelper = new THREE.BoxHelper( boxGroup, 0xffff00 );
			//scene.add(boxhelper);
			scene.add(boxGroup);
		}
	}
	
	
});

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


var light = new THREE.PointLight( 0xeaeaea, 4, 5 );
light.position.set( 0, 4, 0 );
scene.add( light );

var ambient = new THREE.AmbientLight( 0xdfefef, 5 ); // soft white light
scene.add( ambient );

var geometry = new THREE.PlaneGeometry( 1, 1, 1 );
var material = new THREE.MeshStandardMaterial( {color: 0xffffff, side:THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );
plane.rotation.x+=90/180*3.14;
plane.position.y=0;
plane.receiveShadow = true;

camera.position.z = 1;
camera.position.y = 1;


var renderScene = new THREE.RenderPass( scene, camera );

var params = {
	exposure: 200,
	bloomStrength: 2.5,
	bloomThreshold: 0.1,
	bloomRadius: 0.2
};

var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

composer = new THREE.EffectComposer( renderer );
composer.renderToScreen = false;
composer.addPass( renderScene );
composer.addPass( bloomPass );

var finalPass = new THREE.ShaderPass(
	new THREE.ShaderMaterial( {
		uniforms: {
			baseTexture: { value: null },
			bloomTexture: { value: composer.renderTarget2.texture }
		},
		vertexShader: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		defines: {}
	} ), "baseTexture"
);
finalPass.needsSwap = true;

finalComposer = new THREE.EffectComposer( renderer );
finalComposer.addPass(renderScene);
finalComposer.addPass( finalPass );

var materials = {};

function darkenNonBloomed( obj ) {
	if ( obj.isMesh && bloomLayer.test( obj.layers ) === true ) {
		//console.log(obj);
		materials[ obj.uuid ] = obj.material;
		obj.material = darkMaterial;
	}
}

function restoreMaterial( obj ) {
	if ( materials[ obj.uuid ] ) {
		obj.material = materials[ obj.uuid ];
		delete materials[ obj.uuid ];
	}
}
var darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );

let intersects = [];
var animate = function () {
	requestAnimationFrame(animate);
	//renderer.render(scene, camera);
	//camera.rotateZ(0.01);
	//group.rotation.x+=0.01
	//group.rotation.y+=0.01
	
	//scene.traverse( darkenNonBloomed2 );
	
	//scene.traverse( restoreMaterial );
	
	scene.traverse( darkenNonBloomed );
	composer.render();
	scene.traverse( restoreMaterial );

	finalComposer.render();
	
	controls.update();
	light.position.x = Math.sin(new Date().getTime()/5000)*5-2.5;
	light.position.z = Math.tan(new Date().getTime()/5000)*5-2.5;
	//ambient.intensity = (Math.sin(new Date().getTime()/1000)+0.9);
	//group.rotation.z+=0.01
	renderCalls.map( (c)=>{c()} );
};

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', ()=>{
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	intersects = raycaster.intersectObjects( scene.children, true );
	console.log(intersects);
}, false );
animate();

// Parts to bloom:
// 1) Bloom layer, enable it for every mesh you want to have/not have bloom
// 2) bloomComposer.renderToScreen = false;
// 3) finalPass
// 4) finalComposer