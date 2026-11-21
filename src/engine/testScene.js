// Scène de test : vérifie que Three.js + rendu headless fonctionnent dans le projet.
// Sera remplacée par le vrai moteur (personnages, école) en phases 3–4.
import * as THREE from 'three';

export function createTestScene({ width, height }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(5, 10, 6);
  sun.castShadow = true;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x4caf50 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xffc107 }),
  );
  cube.castShadow = true;
  scene.add(cube);

  function renderAt(t) {
    cube.position.y = 1 + Math.abs(Math.sin(t * 3)) * 1.5;
    cube.rotation.y = t * 1.5;
    camera.position.set(Math.sin(t * 0.5) * 6, 3, Math.cos(t * 0.5) * 6);
    camera.lookAt(0, 1.2, 0);
    renderer.render(scene, camera);
  }

  return { renderer, scene, camera, renderAt };
}
