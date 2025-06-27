import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
const torus = new THREE.Mesh(geometry, material);
torus.position.set(0, 0, -20);

scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff, 200, 100, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

const playerGroup = new THREE.Group();
scene.add(playerGroup);

const loader = new GLTFLoader();

loader.load( 'low-poly_spaceship/scene.gltf', function ( gltf ) {

  gltf.scene.scale.set(0.5, 0.5, 0.5);
  gltf.scene.position.set(0, 0, 1.5);
  gltf.scene.rotation.set(0, -89 * Math.PI/180, 0); // Rotate to face
  playerGroup.add( gltf.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

const keysPressed = {};

window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
})

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
})

function movePlayer(delta) {
  const speed = 10;
  const direction = new THREE.Vector3();
  const rotation = playerGroup.rotation;

  if (keysPressed['w']) direction.z -= 1;
  if (keysPressed['s']) direction.z += 1;
  if (keysPressed['a']) {
    if (keysPressed['w'] || keysPressed['s']) {
      rotation.y += 0.02;
    }
    rotation.z += 0.05;
  }
  if (keysPressed['d']) {
    if (keysPressed['w'] || keysPressed['s']) {
      rotation.y -= 0.02;
    }
    rotation.z -= 0.05;
  }
  if (rotation.z > 0.3) {
    rotation.z = 0.3; // limit rotation
  } else if (rotation.z < -0.3) {
    rotation.z = -0.3; // limit rotation
  }

  if (!keysPressed['a'] && !keysPressed['d']) {
    rotation.z *= 0.9; // gradually reduce tilt when not turning
  }

  direction.normalize();
  direction.applyEuler(rotation);
  playerGroup.position.addScaledVector(direction, speed * delta);
}

function updateCamera() {
  const offset = new THREE.Vector3(0, 5, 10);
  const targetPosition = camera.position.copy(playerGroup.position).add(offset);
  camera.position.lerp(targetPosition, 0.1); //smooth camera movement
  camera.lookAt(playerGroup.position);
}

function rotateTorus() {
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;
}

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

for (let i = 0; i < 200; i++) {
  addStar();
}

let previousTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const delta = (currentTime - previousTime) / 1000;
  previousTime = currentTime;


  movePlayer(delta);
  updateCamera();
  //controls.update();
  renderer.render(scene, camera);
}

animate();