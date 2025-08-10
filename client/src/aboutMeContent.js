import './styles/style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 1.3), 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#side-canvas'),
  antialias:true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight / 1.3);
camera.position.setZ(30);
renderer.render(scene, camera);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 200, 100, 1);
pointLight.position.set(0, 0, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Load cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(cube);