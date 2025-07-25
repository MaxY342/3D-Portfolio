import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 1.3), 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#title-canvas'),
  antialias:true,
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

// Laptop
const loader = new GLTFLoader();
const laptop = new THREE.Group();

loader.load( 'laptop333/result.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0.5, 0.5, 0); // Change starting rotation

  laptop.add(gltf.scene);
  laptop.scale.set(0.03, 0.03, 0.03);
  laptop.position.set(40, -15, -5);
  laptop.rotation.set(180, 180, 0);
  scene.add(laptop);
}, undefined, function ( error ) {
  console.error( error );
});

// Barbell
const barbell = new THREE.Group();;

loader.load( 'barbell/scene.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0, 0, 0); // Change starting rotation

  barbell.add(gltf.scene);
  barbell.scale.set(15, 15, 15);
  barbell.position.set(30, 10, -5);
  barbell.rotation.set(0, 0, 0);
  scene.add(barbell);
}, undefined, function ( error ) {
  console.error( error );
});

// Graduation Cap
const graduationCap = new THREE.Group();;

loader.load( 'graduation_cap/scene.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0, 0, 0); // Change starting rotation

  graduationCap.add(gltf.scene);
  graduationCap.scale.set(3, 3, 3);
  graduationCap.position.set(0, 15, -5);
  graduationCap.rotation.set(0, 0, 0);
  scene.add(graduationCap);
}, undefined, function ( error ) {
  console.error( error );
});

// Book
const book = new THREE.Group();

loader.load( 'book/scene.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0, 0, 0); // Change starting rotation

  book.add(gltf.scene);
  book.scale.set(4, 4, 4);
  book.position.set(-40, 5, -5);
  book.rotation.set(0, 0, 0);
  scene.add(book);
}, undefined, function ( error ) {
  console.error( error );
});

// Gaming Controller
const controller = new THREE.Group();

loader.load( 'console/scene.gltf', function ( gltf ) {
  gltf.scene.rotation.set(0, -1.5, 0); // Change starting rotation

  controller.add(gltf.scene);
  controller.scale.set(4, 4, 4);
  controller.position.set(-40, -15, -5);
  controller.rotation.set(0, 0, 0);
  scene.add(controller);
}, undefined, function ( error ) {
  console.error( error );
});

// Cursor Effect
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -25); // Change z position to incrase/decrease effect
const intersection = new THREE.Vector3();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
})

function cursorEffect(object) {
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, intersection);
  const targetDirection = intersection.clone().sub(object.position).normalize();
  const currentDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(object.quaternion);

  // Interpolate between current and target direction
  const dampenedDirection = currentDirection.lerp(targetDirection, 0.1).normalize();
  const targetPoint = object.position.clone().add(dampenedDirection);
  object.lookAt(targetPoint);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  cursorEffect(laptop);
  cursorEffect(barbell);
  cursorEffect(graduationCap);
  cursorEffect(book);
  cursorEffect(controller);
}

animate();