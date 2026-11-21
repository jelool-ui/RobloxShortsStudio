// Stage : renderer + scène + lumières + caméra. Réutilisé par toutes les scènes.
import * as THREE from 'three';

export function createStage({ width = 1080, height = 1920, background = 0x87ceeb } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
  camera.position.set(0, 4, 14);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x6b7a5a, 1.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
  sun.position.set(8, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  // Déplace le soleil (et sa zone d'ombre) vers le point filmé
  function focus(x, z) {
    sun.position.set(x + 8, 16, z + 10);
    sun.target.position.set(x, 0, z);
  }

  return {
    renderer,
    focus,
    scene,
    camera,
    lights: { hemi, sun },
    render: () => renderer.render(scene, camera),
  };
}
