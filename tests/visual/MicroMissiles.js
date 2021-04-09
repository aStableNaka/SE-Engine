const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const sourceEntityMaterial = new THREE.MeshBasicMaterial({color:0x0000ff});
const sourceEntityGeom = new THREE.BoxBufferGeometry(1, 1, 1);
const sourceEntity = new THREE.Mesh( sourceEntityGeom, sourceEntityMaterial );


const targetEntityMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
const targeteEntityGeom = new THREE.BoxBufferGeometry(1, 1, 1);
const targetEntity = new THREE.Mesh( targeteEntityGeom, targetEntityMaterial );

scene.add( sourceEntity );
scene.add( targetEntity );

sourceEntity.position.set(-20,0,0);
targetEntity.position.set(20,2,5);

camera.position.set(0,0,20);

const mats = [];
const launchSound = document.getElementById("soundLaunch");
const explosionSound = document.getElementById("soundExplosion");
function playSound(s, duration=0.01){
	const sound = s//.cloneNode();
	if(sound.currentTime>duration){
		//sound.pause();
		sound.currentTime = 0;
	}
	sound.volume = 0.1+Math.random()*0.05;
	sound.play();
	
}


for( let j = 0; j < 100; j++ ){
	mats.push( new THREE.MeshBasicMaterial({color:Math.floor(Math.random()*0xffffff)}));
}

class Explosion{
	static collection = []
	static mat = new THREE.MeshBasicMaterial({ color:0xff8800, opacity:0.5, transparent:true });
	static geom = new THREE.BoxGeometry(0.5, 0.7, 0.5);
	static mat2 = new THREE.MeshBasicMaterial({ color:0xffffff, opacity:0.5, transparent:true });
	static geom2 = new THREE.BoxGeometry(0.7, 0.3, 0.7);
	constructor( location ){
		this.location = location;
		this.lifetime = Math.random()*20;
		this.currentTick = 0;
		this.sprite = new THREE.Group();
		this.sprite.add(new THREE.Mesh( Explosion.geom, Explosion.mat ));
		this.sprite.add(new THREE.Mesh( Explosion.geom2, Explosion.mat2 ))
		this.sprite.position.set( location.x, location.y, location.z );
		scene.add( this.sprite );
		playSound(explosionSound, 0.01);
		Explosion.collection.push( this )
	}

	render(){
		if(this.currentTick <= this.lifetime){
			this.currentTick++;
			this.sprite.scale.multiplyScalar(1.08);
		}else{
			Explosion.collection.splice(Explosion.collection.indexOf(this), 1);
			scene.remove( this.sprite );
			delete this;
		}
	}
}

class Missile{

	static geom = new THREE.BoxGeometry(0.1, 1, 0.1);
	static mat = new THREE.MeshBasicMaterial( {color: 0xffaa00 } );
	static rotationAxis = new THREE.Vector3(0,1,0);
	static collection = [];

	constructor( source, target ){

		this.lifetime = 100;
		this.renders = 0;
		this.alive = true;

		this.random = Math.random()*4-2;
		this.randomVector = new THREE.Vector3(Math.random()*360-180,Math.random()*360-180,Math.random()*360-180).normalize()

		this.target = target;
		this.source = source;
		
		// Rainbow missiles
		//this.mesh = new THREE.Mesh( Missile.geom, mats[Math.floor(Math.random()*mats.length)] );
		
		// Regular missiles
		this.mesh = new THREE.Mesh( Missile.geom, Missile.mat );
		
		
		this.mesh.position.set( ...this.source.position.toArray() )

		this.updateVectors();

		Missile.collection.push(this);
		playSound( launchSound );
		scene.add(this.mesh);
	}

	updateVectors(){
		this.goalVector = this.mesh.position.clone().sub( this.target.position );
		let out = this.goalVector.clone().multiplyScalar(-1);
		
		const r = Math.pow(Math.min(1, this.renders / this.lifetime), 4);

		let speed = 0.05+r*2;

		//this.randomVector.clone().add(new THREE.Vector3((r*this.random), (r*23*this.random), (-r*this.random)));
		out = this.randomVector.clone().multiplyScalar(1-r*r).add( this.goalVector.clone().multiplyScalar(-r*r) )

		this.finalTrejectory = out.normalize().multiplyScalar(speed);

		this.mesh.quaternion.setFromUnitVectors(Missile.rotationAxis, this.finalTrejectory.clone().normalize());
		
		this.mesh.scale.y = speed*2;

		this.checkCollision()

	}

	checkCollision(){
		const w = this.target.position.toArray();
		if(this.mesh.position.toArray().map((x,i)=>{
			return Math.abs( x - w[i] );
		}).reduce((a,b)=>{
			return a+b;
		}) <= 3 ){
			this.kill();
			//console.log("DEAD");
			return;
		}
	}

	kill(){
		Missile.collection.splice(Missile.collection.indexOf(this),1);
		scene.remove(this.mesh);
		this.alive = false;
		this.mesh.geometry.dispose();
		new Explosion( this.mesh.position );
		setTimeout(()=>{
			//new Missile( this.target, this.source );
		}, 1000)
		delete this;
	}

	render(){
		if(!this.alive){ return; }
		this.updateVectors();
		this.mesh.position.add( this.finalTrejectory.clone() );
		this.renders++;
	}
}


function animate(){
	requestAnimationFrame( animate );
	Missile.collection.map( (missile)=>{
		missile.render();
	} )

	Explosion.collection.map( (e)=>{
		e.render();
	} )
	renderer.render( scene, camera );
	targetEntity.position.y= Math.sin(new Date().getTime()/100)*5;
	targetEntity.position.z= Math.sin(new Date().getTime()/500)*20-10;
	targetEntity.position.x= Math.sin(new Date().getTime()/1000)*5+10;
	sourceEntity.position.x=Math.cos(new Date().getTime()/100)*3-20;
}

animate();

function launch(){
	const missileCount = 32;
	const batch = 2;
	let i = 0;
	const entities = [sourceEntity, targetEntity ];
	let targetChoice = Math.floor(Math.random()*2);
	function fireMissile(){
		if(i<missileCount){
			setTimeout(fireMissile, 50);
			for( let m = 0; m < batch; m++ ){
				new Missile( entities[targetChoice%2], entities[(targetChoice+1)%2] );
			}
			i+=batch;
		}
	}
	fireMissile();
}

launch();

setInterval(launch, 2000)
