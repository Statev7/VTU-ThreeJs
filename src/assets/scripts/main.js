import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

const parameters = {
  scene: null,
  camera: null,
  renderer: null,
  light: null,
  controls: null,
  gltfLoader: null,
  mainCube: null,
  smallerCubes: [],
  rotationSpeed: 0.01,
  rotationSpeedSmall: 0.005,
  spreadDistance: 5,
  isExploded: false,
  objectPath: './assets/objects/cube.glb',
}

function setupsGraphics(){
  parameters.scene = new THREE.Scene();
  parameters.scene.background = new THREE.Color("rgb(255, 255, 255)");
  parameters.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Set renderer
  parameters.renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('background'),
  });

  parameters.renderer.setPixelRatio(window.devicePixelRatio);
  parameters.renderer.setSize(window.innerWidth, window.innerHeight);
  parameters.camera.position.setZ(35);

  //Set initial Light
  parameters.light = new THREE.HemisphereLight(
    new THREE.Color("rgb(150, 150, 150)"),
    new THREE.Color("rgb(0, 0, 0)"),
    1
  );

  parameters.scene.add(parameters.light);
  parameters.controls = new OrbitControls(parameters.camera, parameters.renderer.domElement);
}

function loadMainCube(){
  parameters.gltfLoader = new GLTFLoader();
  parameters.gltfLoader.load(parameters.objectPath, (gltf) => {
    parameters.mainCube = gltf.scene;
    const scaleFactor = 7;
    parameters.mainCube.scale.set(scaleFactor, scaleFactor, scaleFactor);
    parameters.scene.add(parameters.mainCube);
  });
}

async function loadSmallCube() {
  return new Promise((resolve, reject) => {
    parameters.gltfLoader.load(parameters.objectPath, (gltf) => {
      const cube = gltf.scene;
      const scaleFactor = 2;
      cube.scale.set(scaleFactor, scaleFactor, scaleFactor);
      parameters.scene.add(cube);
      resolve(cube);
    }, undefined, reject);
  });
}

async function splitMainCube() {
  if (parameters.isExploded) {
    return; 
  }

  parameters.isExploded = true;
  parameters.scene.remove(parameters.mainCube);

  const numCubes = 8;
  const size = 15 / Math.sqrt(numCubes);

  for (let i = 0; i < numCubes; i++) {
    const cube = await loadSmallCube();

    cube.position.set(
      (i % 2 === 0 ? 1 : -1) * (size + Math.random() * parameters.spreadDistance),    // X-axis
      Math.floor(i / 2) % 2 === 0 ? size + Math.random() * parameters.spreadDistance : -size - Math.random() * parameters.spreadDistance,  // Y-axis
      Math.floor(i / 4) % 2 === 0 ? size + Math.random() * parameters.spreadDistance : -size - Math.random() * parameters.spreadDistance   // Z-axis
    );

    parameters.smallerCubes.push(cube);
  }

  parameters.scene.remove(parameters.light);

  parameters.scene.background = new THREE.Color("rgb(0,0,0)");
  parameters.light = new THREE.HemisphereLight(
    new THREE.Color("rgb(255, 255, 255)"),
    new THREE.Color("rgb(0, 0, 0)"),
    1
  );

  parameters.scene.add(parameters.light);
}

function animate() {
  requestAnimationFrame(animate);

  if (parameters.mainCube && !parameters.isExploded) {
    parameters.mainCube.rotation.x += parameters.rotationSpeed;
    parameters.mainCube.rotation.y += parameters.rotationSpeed * 0.5;
    parameters.mainCube.rotation.z += parameters.rotationSpeed;
  }

  parameters.smallerCubes.forEach(cube => {
    cube.rotation.x += parameters.rotationSpeedSmall;
    cube.rotation.y += parameters.rotationSpeedSmall * 0.5;
    cube.rotation.z += parameters.rotationSpeedSmall;
  });

  parameters.controls.update();

  parameters.renderer.render(parameters.scene, parameters.camera);
}

window.addEventListener('click', () => {
  splitMainCube();
});

setupsGraphics();
loadMainCube();
animate();