// TODO: Put css into html
import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

// Initialize states
const GameState = {
  INTRO: 'intro',
  MENU: 'menu'
}
let currentState = GameState.INTRO;

// Initialize scene, camera, and renderer
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

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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

// Switching states
function switchState(newState) {
  console.log(`Switching to state: ${newState}`);
  if (newState == GameState.MENU) {
    scene.remove(introGroup);
    scene.add(menuGroup);
    playerGroup.position.set(0, 0, 0);
  }
  else {
    scene.remove(menuGroup);
    scene.add(introGroup);
    playerGroup.position.set(0, 0, 0);
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

// Interactive Player
const playerGroup = new THREE.Group();
scene.add(playerGroup);

const loader = new GLTFLoader();

loader.load( 'src/assets/low-poly_spaceship/scene.gltf', function ( gltf ) {

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

let movingForward = false;
function movePlayer(delta) {
  const speed = 10;
  const direction = new THREE.Vector3();
  const rotation = playerGroup.rotation;

  if (keysPressed['w']) {
    direction.z -= 1;
    movingForward = true;
  } else {
    movingForward = false;
  }
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

// Add star field
const starGeometry = new LineSegmentsGeometry();
const vertices = [];
const velocities = [];
for (let i = 0; i < 1200; i++) {
  let x = THREE.MathUtils.randFloatSpread(300);
  let y = THREE.MathUtils.randFloatSpread(300);
  let z = THREE.MathUtils.randFloatSpread(300);
  vertices.push(x, y, z+0.001, x, y, z); // leading and trailing points
  velocities.push(0, 0)
}
starGeometry.setPositions(vertices);
const material = new LineMaterial({ 
  color: 0xffffff, 
  linewidth: 0.2,
  worldUnits: true,
});
const lines = new LineSegments2(starGeometry, material);
scene.add(lines);

// Async load about me, projects, and contact sections
async function loadSection(section) {
  const page = await fetch(`${section}.html`);
  window.location.href = page.url;
}

// TODO: Add star warp effect
function starWarpEffect() {
  for (let i = 0; i < velocities.length; i += 2) {
    // Move trailing + leading points along z
    vertices[i * 3 + 2] += +1.0; // leading
    vertices[i * 3 + 5] += +0.6; // trailing

    // Reset if out of view
    if (vertices[i * 3 + 2] > 100) {
      const x = THREE.MathUtils.randFloatSpread(300);
      const y = THREE.MathUtils.randFloatSpread(300);
      const z = -150;
      vertices[i * 3 + 0] = x;
      vertices[i * 3 + 1] = y;
      vertices[i * 3 + 2] = z;
      vertices[i * 3 + 3] = x;
      vertices[i * 3 + 4] = y;
      vertices[i * 3 + 5] = z;
    }
  }
  starGeometry.setPositions(vertices);
}

function endStarWarpEffect() {
  for (let i = 0; i < velocities.length; i += 2) {
    // Match trailing with leading points
    if (vertices[i * 3 + 5] < vertices[i * 3 + 2]) {
      vertices[i * 3 + 5] = THREE.MathUtils.lerp(vertices[i * 3 + 5], vertices[i * 3 + 2] + 0.002, 0.15);
    }
  }
  starGeometry.setPositions(vertices);
}

// Fate-out and camera zoom animation for portal transitions
function triggerPortalAnimation(onComplete) {
  // Fade out effect
  const overlay = document.getElementsByClassName('fade-out-screen')[0];
  // Camera zoom in effect
  const initialPosition = camera.position.clone();
  const targetPosition = playerGroup.position.clone().add(new THREE.Vector3(0, 0, -5));
  const duration = 1500; // ms
  let startTime = performance.now();
  overlay.style.opacity = '1';
  function animateCameraZoom(time) {
    starWarpEffect();
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

// Particle System
// TODO: Animate particles to simulate jet thrusters (add colour change, size change, and opacity change)
class ParticleSystem {
  constructor(params) {
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load('src/assets/star.png'),
      },
      pointMultiplier: {
        value: window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)),
      },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    this.camera = params.camera;
    this.particles = [];
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    this.geometry.setAttribute('opacity', new THREE.Float32BufferAttribute([], 1));
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }
  
  AddParticle(position, velocity, lifetime, color) {
    const particle = {
      position: new THREE.Vector3(
        position.x + THREE.MathUtils.randFloatSpread(0.5),
        position.y + THREE.MathUtils.randFloatSpread(0.5),
        position.z + THREE.MathUtils.randFloatSpread(0.5)
      ),
      velocity: new THREE.Vector3(
        velocity.x + THREE.MathUtils.randFloatSpread(1.0),
        velocity.y + THREE.MathUtils.randFloatSpread(1.0),
        velocity.z + THREE.MathUtils.randFloatSpread(1.0)
      ),
      lifetime: lifetime,
      maxLifetime: lifetime,
      opacity: 1.0,
      color: color,
      size: 1.0,
    }
    this.particles.push(particle);
  }
  
  UpdateGeometry() {
    const positions = [];
    const opacities = [];
    const colors = [];
    const sizes = [];
    this.particles.forEach((particle) => {
      positions.push(particle.position.x, particle.position.y, particle.position.z);
      opacities.push(particle.opacity);
      colors.push(particle.color.r, particle.color.g, particle.color.b);
      sizes.push(particle.size);
    });
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.opacity.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
  }

  RemoveParticle(particle) {
    this.particles = this.particles.filter(p => p !== particle);
  }
}

const particleSystem = new ParticleSystem({ scene, camera });

// Menu state back button functionality
const backButton = document.getElementById('index-back-button');
backButton.addEventListener('click', () => {
  if (currentState === GameState.MENU && !transition) {
    transition = true;
    triggerPortalAnimation(() => {
      switchState(GameState.INTRO);
      backButton.style.display = 'none';
    });
  }
});

// Animation loop
let previousTime = performance.now();
let transition = false;
function animate() {
  requestAnimationFrame(animate);
  const currentTime = performance.now();
  const delta = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  if (currentState === GameState.MENU) {
    backButton.style.display = 'block';
  }

  if (movingForward) {
    starWarpEffect();
    const spawnPosition = new THREE.Vector3(0.2, 0.2, 1.7);
    const direction = new THREE.Vector3(0, 0, 1);
    playerGroup.localToWorld(spawnPosition);
    direction.applyQuaternion(playerGroup.quaternion);
    particleSystem.AddParticle(spawnPosition, direction.multiplyScalar(5), 1.5, new THREE.Color(0x00ffff));
  }

  for (let i = 0; i < particleSystem.particles.length; i++) {
    const particle = particleSystem.particles[i];
    particle.position.addScaledVector(particle.velocity, delta);
    particle.velocity.multiplyScalar(0.98);
    particle.lifetime -= delta;
    const lifeRatio = particle.lifetime / particle.maxLifetime;
    const endColor = new THREE.Color(0xffffff);
    particle.opacity = Math.max(lifeRatio, 0);
    particle.color.lerp(endColor, 0.05);
    particle.size = THREE.MathUtils.lerp(1.0, 0.1, 1 - lifeRatio);
    if (particle.lifetime <= 0) {
        particleSystem.RemoveParticle(particle);
    }
  }
  particleSystem.UpdateGeometry();

  if (!transition) {
    updateCamera();
    endStarWarpEffect();
    movePlayer(delta);
  }
  renderer.render(scene, camera);
  if (!transition) {
    if (introTorusBox.containsPoint(playerGroup.position) && currentState === GameState.INTRO) {
      transition = true;
      triggerPortalAnimation(() => {
        switchState(GameState.MENU);
      });
    }
    if (aboutMePortalBox.containsPoint(playerGroup.position) && currentState === GameState.MENU) {
      // Load About Me section
      transition = true;
      triggerPortalAnimation(() => {
        loadSection('about');
      });
      console.log('About Me section');
    }
    if (projectsPortalBox.containsPoint(playerGroup.position) && currentState === GameState.MENU) {
      // Load Projects section
      transition = true;
      triggerPortalAnimation(() => {
        loadSection('projects');
      });
      console.log('Projects section');
    }
    if (contactPortalBox.containsPoint(playerGroup.position) && currentState === GameState.MENU) {
      // Load Contact section
      transition = true;
      triggerPortalAnimation(() => {
        loadSection('contact');
      });
      console.log('Contact section');
    }
  }
}

animate();