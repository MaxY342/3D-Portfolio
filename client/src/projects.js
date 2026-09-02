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
function createCarouselPanel(videoName, overlayText) {
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
  return {
    video, 
    mesh,
    overlayText,

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

// Add project panel mesh and video to projects array
const videos = ['audio-visualizer-video', 'tictactoe-video', 'portfolio-video', 'netflix-replica-video', 'discord-bot-video'];
const videoNames = ['Audio Visualizer', 'Tic Tac Toe', 'Portfolio', 'Netflix Replica', 'Discord Bot'];
videos.forEach((videoName, index) => {
  projects.push(createCarouselPanel(videoName, videoNames[index]));
});

// Add project details
const details = ['audio-visualizer-details', 'tictactoe-details', 'portfolio-details', 'netflix-replica-details', 'discord-bot-details'];
details.forEach(detailName => {
  projectDetails.push(document.getElementById(detailName));
});

// Position panels in a circle
for (let i = 0; i < projects.length; i++) {
  const angle = i / 5 * Math.PI * 2;
  const z = Math.cos(angle) * radius;
  const x = Math.sin(angle) * radius;

  const mesh = projects[i].mesh;

  mesh.position.set(x, -40, z);
  mesh.rotation.y = angle;
  const text = await createText(projects[i].overlayText, 1, mesh.position, 0xffffff);
  text.rotation.y = angle;
  group.add(text);
  group.add(mesh);
}

// Carousel rotation
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
  carouselIndex = (carouselIndex + direction) % projects.length;
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
  moveCarousel();
  renderer.render(scene, camera);
}
animate();