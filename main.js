import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// camera variables
let camera, scene, renderer, video;

// text variable
let container;

init();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 1;

    scene = new THREE.Scene();


    // Background image
    const loader = new THREE.TextureLoader();
    loader.load('house.png', function (texture) {
        scene.background = texture;
    });

    video = document.getElementById('video');
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const blur = {
        uniforms: {
            tDiffuse: { value: texture },
            blurAmount: { value: .0175 }
        },
        vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
        fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float blurAmount;
    varying vec2 vUv;

    void main() {
      vec4 sum = vec4(0.0);
      sum += texture2D(tDiffuse, vec2(vUv.x - 4.0*blurAmount, vUv.y)) * 0.05;
      sum += texture2D(tDiffuse, vec2(vUv.x - 3.0*blurAmount, vUv.y)) * 0.09;
      sum += texture2D(tDiffuse, vec2(vUv.x - 2.0*blurAmount, vUv.y)) * 0.12;
      sum += texture2D(tDiffuse, vec2(vUv.x - blurAmount, vUv.y)) * 0.15;
      sum += texture2D(tDiffuse, vec2(vUv.x, vUv.y)) * 0.16;
      sum += texture2D(tDiffuse, vec2(vUv.x + blurAmount, vUv.y)) * 0.15;
      sum += texture2D(tDiffuse, vec2(vUv.x + 2.0*blurAmount, vUv.y)) * 0.12;
      sum += texture2D(tDiffuse, vec2(vUv.x + 3.0*blurAmount, vUv.y)) * 0.09;
      sum += texture2D(tDiffuse, vec2(vUv.x + 4.0*blurAmount, vUv.y)) * 0.05;

      gl_FragColor = sum;
    }
  `
    };

    const blurMaterial = new THREE.ShaderMaterial(blur);
    const geometry = new THREE.PlaneGeometry(16, 9);
    geometry.scale(0.5, 0.5, 0.5);

    const count = 128;
    const radius = 32;

    for (let i = 1, l = count; i <= l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;
        const mesh = new THREE.Mesh(geometry, blurMaterial);
        mesh.position.setFromSphericalCoords(radius, phi, theta);
        mesh.lookAt(camera.position);
        scene.add(mesh);
    }


    // Rendering & Controls
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;

    window.addEventListener('resize', onWindowResize);

    // Camera Access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (error) {
                console.error('Unable to access the camera/webcam.', error);
            });
    } else {
        console.error('MediaDevices interface not available.');
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.render(scene, camera);
}

