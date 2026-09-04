import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { lerp } from 'three/src/math/MathUtils.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import panelVertexShader from './shaders/panelVertex.glsl';
import panelFragmentShader from './shaders/panelFragment.glsl';

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

// Create project panels
async function createCarouselPanel(videoName, overlayText) {
  const video = document.getElementById(videoName);
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;
  const rtA = new THREE.WebGLRenderTarget(1280, 720);

  // Horizontal pass
  const horizontalUniforms = {
    diffuseTexture: { value: videoTexture },
    direction: { value: new THREE.Vector2(1, 0) },
    resolution: { value: new THREE.Vector2(1280, 720) },
    blurSize: { value: 4.0 } // pixels
  }
  const horizontalVideoMaterial = new THREE.ShaderMaterial({ 
    uniforms: horizontalUniforms, 
    fragmentShader: panelFragmentShader, 
    vertexShader: panelVertexShader,
    transparent: true,
    side: THREE.DoubleSide 
  });
  const blurScene = new THREE.Scene();
  const blurMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), horizontalVideoMaterial);
  const blurCamera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, -1, 1);
  blurScene.add(blurMesh);

  // Vertical pass
  const verticalUniforms = {
    diffuseTexture: { value: rtA.texture },
    direction: { value: new THREE.Vector2(0, 1) },
    resolution: { value: new THREE.Vector2(1280, 720) },
    blurSize: { value: 4.0 } // pixels
  };
  const verticalVideoMaterial = new THREE.ShaderMaterial({ 
    uniforms: verticalUniforms, 
    fragmentShader: panelFragmentShader,
    vertexShader: panelVertexShader,
    transparent: true,
    side: THREE.DoubleSide 
  });

  const videoGeometry = new THREE.PlaneGeometry(16, 9);
  const mesh = new THREE.Mesh(videoGeometry, verticalVideoMaterial);

  // Text overlay
  const overlayTextMesh = await createText(overlayText, 1, new THREE.Vector3(0, 0, 0), 0xffffff);
  return {
    video, 
    mesh,
    overlayTextMesh,

    blurCamera,
    blurScene,
    rtA,

    horizontalUniforms,
    verticalUniforms
  };
}

// Create text mesh
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
      const textMaterial = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 1.0 });
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

// Add project panel mesh and video to projects array
const videos = ['audio-visualizer-video', 'tictactoe-video', 'portfolio-video', 'netflix-replica-video', 'discord-bot-video'];
const videoNames = ['Audio Visualizer', 'Tic Tac Toe', 'Portfolio', 'Netflix Replica', 'Discord Bot'];
videos.forEach(async (videoName, index) => {
  projects.push(await createCarouselPanel(videoName, videoNames[index]));
  console.log(projects);
});

// Add project details
const details = ['audio-visualizer-details', 'tictactoe-details', 'portfolio-details', 'netflix-replica-details', 'discord-bot-details'];
details.forEach(detailName => {
  projectDetails.push(document.getElementById(detailName));
});

// Position panels in a circle
function positionPanels() {
  projects.forEach((project, i) => {
    const angle = i / 5 * Math.PI * 2;
    const z = Math.cos(angle) * radius;
    const x = Math.sin(angle) * radius;

    const mesh = project.mesh;

    mesh.position.set(x, -40, z);
    mesh.rotation.y = angle;
    project.overlayTextMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    project.overlayTextMesh.rotation.y = mesh.rotation.y;
    group.add(project.overlayTextMesh);
    group.add(mesh);
  });
}

// Carousel rotation
let carouselRotation = 0;
let rotationVelocity = 0;
let scrollSensitivity = 0.00015;
let drag = 0.92;
let snapping = false;
let scrolling = false;
let targetRotation = 0;
let scrollTimeout;
let carouselIndex = 0;
const targetPixels = (90 * window.innerHeight) / 100;
document.addEventListener('wheel', (event) => {
  if (window.scrollY > targetPixels) {
    scrolling = true;
    rotationVelocity += event.deltaY * scrollSensitivity;
    clearTimeout(scrollTimeout);
    snapping = false;
    scrollTimeout = setTimeout(() => {
      snapToNearestPanel();
    }, 1000);
  }
});

function snapToNearestPanel() {
  const angleStep = (Math.PI * 2) / projects.length;
  const closestIndex = Math.round(carouselRotation / angleStep);
  carouselIndex = closestIndex % projects.length;
  targetRotation = closestIndex * angleStep;
  snapping = true;
  scrolling = false;
}

function animateCarousel() {
  requestAnimationFrame(animateCarousel);
  rotationVelocity *= drag;
  carouselRotation += rotationVelocity;
  group.rotation.y = -carouselRotation;
  projects.forEach((p, i) => {
    const isActive = i === carouselIndex && !scrolling;
    if (isActive) {
      projects[i].video.play();
      p.mesh.scale.lerp(new THREE.Vector3(2, 2, 2), 0.05);
      p.mesh.material.opacity = THREE.MathUtils.lerp(p.mesh.material.opacity, 1.0, 0.05);
      p.overlayTextMesh.material.opacity = THREE.MathUtils.lerp(p.overlayTextMesh.material.opacity, 0.0, 0.05);
      p.horizontalUniforms.blurSize.value = THREE.MathUtils.lerp(p.horizontalUniforms.blurSize.value, 0.0, 0.05);
      p.verticalUniforms.blurSize.value = THREE.MathUtils.lerp(p.verticalUniforms.blurSize.value, 0.0, 0.05);
    } else if (!isActive || scrolling) {
      projects[i].video.pause();
      p.mesh.scale.lerp(new THREE.Vector3(1.0, 1.0, 1.0), 0.05);
      p.mesh.material.opacity = THREE.MathUtils.lerp(p.mesh.material.opacity, 0.8, 0.05);
      p.overlayTextMesh.material.opacity = THREE.MathUtils.lerp(p.overlayTextMesh.material.opacity, 1.0, 0.05);
      p.horizontalUniforms.blurSize.value = THREE.MathUtils.lerp(p.horizontalUniforms.blurSize.value, 4.0, 0.05);
      p.verticalUniforms.blurSize.value = THREE.MathUtils.lerp(p.verticalUniforms.blurSize.value, 4.0, 0.05);
    }

  })
  if (snapping) {
    carouselRotation = THREE.MathUtils.lerp(carouselRotation, targetRotation, 0.1);
    if (Math.abs(carouselRotation - targetRotation) < 0.001) {
      carouselRotation = targetRotation;
      snapping = false;
    }
  }
}
animateCarousel();

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
      document.getElementById('projects-description-back-button').style.display = 'block';
      document.getElementById('projects-back-button').style.display = 'none';
      // Change laptop screen texture to project video
      laptop.traverse(function (child) {
        applyScreenTexture(projects[carouselIndex].video);
      });
    }
  }
});

// Project details back button logic
const descriptionBackButton = document.getElementById('projects-description-back-button');
descriptionBackButton.addEventListener('click', () => {
  currentState = States.Carousel;
  projectDetails[carouselIndex].style.display = 'none';
  scene.remove(laptop);
  scene.add(group);
  document.getElementById('carousel-ui').style.display = 'flex';
  document.getElementById('projects-description-back-button').style.display = 'none';
  document.getElementById('projects-back-button').style.display = 'block';
});

//Projects back button logic
const projectsBackButton = document.getElementById('projects-back-button');
projectsBackButton.addEventListener('click', () => {
  window.location.href = 'index.html?state=menu';
});


// Camera movement on scroll
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  group.position.y = lerp(group.position.y, -t * 0.05 - 1, 0.8); // move carousel with scroll
  laptop.position.y = lerp(laptop.position.y, -t * 0.009 * -laptop.position.z -80, 0.8); // move laptop with scroll by factor of z pos
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  // Horizontal blur
  for (let i = 0; i < projects.length; i++) {
    renderer.setRenderTarget(projects[i].rtA);
    renderer.render(projects[i].blurScene, projects[i].blurCamera);
  }
  renderer.setRenderTarget(null);
  if (projects.length > 0) {
    positionPanels();
  }
  renderer.render(scene, camera);
}
animate();