import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { lerp } from 'three/src/math/MathUtils.js';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#projects-bg'),
  antialias:true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

// States
const States = {
  Carousel: 'carousel',
  ProjectDetails: 'projectDetails'
};
let currentState = States.Carousel;

// Lights
const pointLight = new THREE.PointLight(0xffffff, 200, 100, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Test cube
/*const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(cube);
cube.position.set(0, 0, 0);*/

// Laptop
const loader = new GLTFLoader();
const laptop = new THREE.Group();

loader.load( 'src/assets/laptop333/result.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0, 0.9, 0.1); // Change starting rotation

  laptop.add(gltf.scene);
  laptop.scale.set(0.04, 0.04, 0.04);
  laptop.position.set(25, -45, -10);
  laptop.rotation.set(0, 0, 0);
}, undefined, function ( error ) {
  console.error( error );
});

// Load video texture for laptop screen
function applyScreenTexture(video) {
  laptop.traverse(function (child) {
    if (child.name.includes('Cube003')) {
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;
      videoTexture.wrapT = THREE.RepeatWrapping;
      videoTexture.repeat.y = -1;
      child.material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    }
  });
}

// Projects carousel
const group = new THREE.Group();
scene.add(group);

const radius = 15;
const projects = [];
const projectDetails = [];

// Create project panels returns [videoElement, panelMesh]
function createCarouselPanel(name) {
  const video = document.getElementById(name);
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;
  const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
  const videoGeometry = new THREE.PlaneGeometry(16, 9);
  return [video, new THREE.Mesh(videoGeometry, videoMaterial)];
}

// Add project panel mesh and video to projects array
const [audioVisualizerVideo, audioVisualizerPanelMesh] = createCarouselPanel('audio-visualizer-video');
const [tictactoeVideo, tictactoePanelMesh] = createCarouselPanel('tictactoe-video');
const [portfolioVideo, portfolioPanelMesh] = createCarouselPanel('portfolio-video');
const [netflixReplicaVideo, netflixReplicaPanelMesh] = createCarouselPanel('netflix-replica-video');
const [discordBotVideo, discordBotPanelMesh] = createCarouselPanel('discord-bot-video');
projects.push({video: audioVisualizerVideo, mesh: audioVisualizerPanelMesh});
projects.push({video: tictactoeVideo, mesh: tictactoePanelMesh});
projects.push({video: portfolioVideo, mesh: portfolioPanelMesh});
projects.push({video: netflixReplicaVideo, mesh: netflixReplicaPanelMesh});
projects.push({video: discordBotVideo, mesh: discordBotPanelMesh});

// Add project details
projectDetails.push(document.getElementById('audio-visualizer-details'));
projectDetails.push(document.getElementById('tictactoe-details'));
projectDetails.push(document.getElementById('portfolio-details'));
projectDetails.push(document.getElementById('netflix-replica-details'));
projectDetails.push(document.getElementById('discord-bot-details'));

// Position panels in a circle
for (let i = 0; i < projects.length; i++) {
  const angle = i / 5 * Math.PI * 2;
  const z = Math.cos(angle) * radius;
  const x = Math.sin(angle) * radius;

  const mesh = projects[i].mesh;

  mesh.position.set(x, -40, z);
  mesh.rotation.y = angle;
  group.add(mesh);
}

// Caurousel rotation
let currentRotation = group.rotation.y;
let targetRotation = 0;
const step = (Math.PI * 2) / projects.length;
let carouselIndex = 0;

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    targetRotation += step;
    updateCarouselIndex(-1);
  }
  else if (event.key === 'ArrowRight') {
    targetRotation -= step;
    updateCarouselIndex(1);
  }
});

document.getElementById('left-button').addEventListener('click', () => {
  targetRotation += step;
  updateCarouselIndex(-1);
});
document.getElementById('right-button').addEventListener('click', () => {
  targetRotation -= step;
  updateCarouselIndex(1);
});

function moveCarousel() {
  group.rotation.y += (targetRotation - currentRotation) * 0.1;
  currentRotation = group.rotation.y;
  // Smooth focus effect
  projects.forEach((p, i) => {
    const isActive = i === carouselIndex;

    // target values
    const targetScale = isActive ? 1.2 : 1.0;
    const targetOpacity = isActive ? 1.0 : 0.5;

    // Play video if active, pause if not
    if (isActive) {
      projects[i].video.play();
    } else {
      projects[i].video.pause();
    }

    // Lerp scale
    p.mesh.scale.x = THREE.MathUtils.lerp(p.mesh.scale.x, targetScale, 0.05);
    p.mesh.scale.y = THREE.MathUtils.lerp(p.mesh.scale.y, targetScale, 0.05);
    p.mesh.scale.z = THREE.MathUtils.lerp(p.mesh.scale.z, targetScale, 0.05);

    // Lerp opacity
    p.mesh.material.opacity = THREE.MathUtils.lerp(
      p.mesh.material.opacity,
      targetOpacity,
      0.05
    );
  });
}

function updateCarouselIndex(direction) {
  // Direction: 1 for right, -1 for left
  carouselIndex = (carouselIndex + direction + projects.length) % projects.length;
}

// Logic for clicking a project
document.addEventListener('click', (event) => {
  const raycaster = new THREE.Raycaster();
  const pointerPos = new THREE.Vector2(event.clientX / window.innerWidth * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerPos, camera);
  const intersects = raycaster.intersectObjects(group.children);
  if (intersects.length > 0) {
    const clickedPanel = intersects[0].object;
    if (clickedPanel == projects[carouselIndex].mesh && currentState === States.Carousel) {
      currentState = States.ProjectDetails;
      scene.remove(group);
      scene.add(laptop);
      projectDetails[carouselIndex].style.display = 'grid';
      document.getElementById('carousel-ui').style.display = 'none';
      document.getElementById('projects-back-button').style.display = 'block';
      // Change laptop screen texture to project video
      laptop.traverse(function (child) {
        applyScreenTexture(projects[carouselIndex].video);
      });
    }
  }
});

// Project details back button logic
const backButtons = document.querySelectorAll('.back-button');
backButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentState = States.Carousel;
    projectDetails[carouselIndex].style.display = 'none';
    scene.remove(laptop);
    scene.add(group);
    document.getElementById('carousel-ui').style.display = 'flex';
    document.getElementById('projects-back-button').style.display = 'none';
  });
});


// Camera movement on scroll
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  /*cube.rotation.x += 0.05;
  cube.rotation.y += 0.075;
  cube.rotation.z += 0.05;*/
  //group.rotation.y = t * 0.001;
  //camera.position.y = t * 0.05;
  group.position.y = lerp(group.position.y, -t * 0.05 - 1, 0.8); // move carousel with scroll
  laptop.position.y = lerp(laptop.position.y, -t * 0.009 * -laptop.position.z -80, 0.8); // move laptop with scroll by factor of z pos
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  moveCarousel();
  renderer.render(scene, camera);
}
animate();