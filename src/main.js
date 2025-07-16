import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Initialize scene, camera, and renderer
const GameState = {
  INTRO: 'intro',
  MENU: 'menu'
}
let currentState = GameState.INTRO;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

// Intro Group
const introGroup = new THREE.Group();
const portalData = createPortal(10, 0, 0, -20);
const introPortal = portalData.torus;
const torusBox = portalData.torusBox;
const introPortalText = createText('Enter', 2, introPortal.position, 0x00ff00);
introGroup.add(introPortal);
introGroup.add(torusBox);
introGroup.add(introPortalText);
scene.add(introGroup);

// Menu Group
const menuGroup = new THREE.Group();
scene.add(menuGroup);
menuGroup.visible = false;

// Switching states
function switchState(newState) {
  if (newState != currentState) {
    introGroup.visible = false;
    menuGroup.visible = true;
    playerGroup.position.set(0, 0, 0); // reposition if needed
  }

  currentState = newState;
}

// Portal
function createPortal(radius, x, y, z) {
  const geometry = new THREE.TorusGeometry(radius, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.set(x, y, z);
  const torusBox = new THREE.Box3().setFromObject(torus);

  return { torus, torusBox };
}

// Enter Text
function createText(text, fontSize, position, color) {
  const fontLoader = new FontLoader();
  fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: fontSize,
      height: 0.5,
      depth: 0.1,
    });
    const textMaterial = new THREE.MeshStandardMaterial({ color: color });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);
    textGeometry.center();
    return textMesh;
  });
}

// Lights
const pointLight = new THREE.PointLight(0xffffff, 200, 100, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

// Interactive Player
const playerGroup = new THREE.Group();
scene.add(playerGroup);

const loader = new GLTFLoader();

loader.load( 'low-poly_spaceship/scene.gltf', function ( gltf ) {

  gltf.scene.scale.set(0.5, 0.5, 0.5);
  gltf.scene.position.set(0, -2, 1.5);
  gltf.scene.rotation.set(0, -89 * Math.PI/180, 0); // Rotate to face
  playerGroup.add( gltf.scene );

}, undefined, function ( error ) {

  console.error( error );

} );

// User movement
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

// Camera tracking player
function updateCamera() {
  const offset = new THREE.Vector3(0, 3, 10);
  const targetPosition = camera.position.copy(playerGroup.position).add(offset);
  camera.position.lerp(targetPosition, 0.1); //smooth camera movement
  camera.lookAt(playerGroup.position);
}

// Add stars to the scene
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

// Animation loop
let previousTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const delta = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  movePlayer(delta);
  updateCamera();
  renderer.render(scene, camera);

  if (torusBox.containsPoint(playerGroup.position)) {
    switchState(GameState.MAIN);
  }
}

animate();