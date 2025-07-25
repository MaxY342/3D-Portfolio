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
  antialias:true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

// Intro Group
const introGroup = new THREE.Group();
const portalData = createPortal(10, 0x00ff00, new THREE.Vector3(0, 0, -20));
const introPortal = portalData.torus;
const introTorusBox = portalData.torusBox;
const introPortalText = await createText('Enter', 2, introPortal.position, 0x00ff00);
introGroup.add(introPortal);
introGroup.add(introTorusBox);
introGroup.add(introPortalText);
scene.add(introGroup);

// Menu Group
const menuGroup = new THREE.Group();
const aboutMePortalData = createPortal(10, 0xff0000, new THREE.Vector3(-30, 0, -20));
const aboutMePortal = aboutMePortalData.torus;
const aboutMePortalBox = aboutMePortalData.torusBox;
const aboutMePortalText = await createText('About Me', 2, aboutMePortal.position, 0xff0000);
const projectsPortalData = createPortal(10, 0x00ff00, new THREE.Vector3(0, 0, -40));
const projectsPortal = projectsPortalData.torus;
const projectsPortalBox = projectsPortalData.torusBox;
const projectsPortalText = await createText('Projects', 2, projectsPortal.position, 0x00ff00);
const contactPortalData = createPortal(10, 0x0000ff, new THREE.Vector3(30, 0, -30));
const contactPortal = contactPortalData.torus;
const contactPortalBox = contactPortalData.torusBox;
const contactPortalText = await createText('Contact', 2, contactPortal.position, 0x0000ff);
menuGroup.add(aboutMePortal, aboutMePortalText, aboutMePortalBox);
menuGroup.add(projectsPortal, projectsPortalText, projectsPortalBox);
menuGroup.add(contactPortal, contactPortalText, contactPortalBox);
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
function createPortal(radius, color, position) {
  const geometry = new THREE.TorusGeometry(radius, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.copy(position);
  const torusBox = new THREE.Box3().setFromObject(torus);

  return { torus, torusBox };
}

// Enter Text
function createText(text, fontSize, position, color) {
  return new Promise((resolve, reject) => {
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
      resolve(textMesh);
    }, 
    undefined,
    reject
    );
  });
}

// Lights
const pointLight = new THREE.PointLight(0xffffff, 200, 100, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

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

// Async load about me, projects, and contact sections
async function loadSection(section) {
  const page = await fetch(`${section}.html`);
  window.location.href = page.url;
}

// Fate-out and camera zoom animation for portal transitions
function triggerPortalAnimation(onComplete) {
  // Fade out effect
  const overlay = document.getElementsByClassName('fade-out-screen')[0];
  overlay.style.opacity = '1';
  // Camera zoom in effect
  const initialPosition = camera.position.clone();
  const targetPosition = playerGroup.position.clone().add(new THREE.Vector3(0, 0, -5));
  const duration = 1000; // ms
  let startTime = performance.now();
  function animateCameraZoom(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    camera.position.lerpVectors(initialPosition, targetPosition, progress);
    if (progress < 1) {
      requestAnimationFrame(animateCameraZoom);
    } else {
      overlay.style.opacity = '0';
      transition = false;
      onComplete();
    }
  }
  requestAnimationFrame(animateCameraZoom);
}


// Animation loop
let previousTime = performance.now();
let transition = false;
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const delta = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  if (!transition) {
    updateCamera();
    movePlayer(delta);
  }
  renderer.render(scene, camera);

  if (introTorusBox.containsPoint(playerGroup.position)) {
    transition = true;
    triggerPortalAnimation(() => {
      switchState(GameState.MAIN);
    });
  }
  if (aboutMePortalBox.containsPoint(playerGroup.position)) {
    // Load About Me section
    transition = true;
    triggerPortalAnimation(() => {
      loadSection('about');
    });
    console.log('About Me section');
  }
  if (projectsPortalBox.containsPoint(playerGroup.position)) {
    // Load Projects section
    transition = true;
    triggerPortalAnimation(() => {
      loadSection('projects');
    });
    console.log('Projects section');
  }
  if (contactPortalBox.containsPoint(playerGroup.position)) {
    // Load Contact section
    transition = true;
    triggerPortalAnimation(() => {
      loadSection('contact');
    });
    console.log('Contact section');
  }
}

animate();