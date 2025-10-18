import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let camera, scene, renderer, video;

init();

function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 0.01;

    scene = new THREE.Scene();

    video = document.getElementById('video');

    // Adding texture
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(16, 9);
    geometry.scale(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    const count = 128;
    const radius = 32;

    for (let i = 1; i <= count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.pi) * phi;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.setFromSphericalCoords(radius, phi, theta);
        mesh.lookAt(camera.position);
        scene.add(mesh);
    }

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    window.addEventListener('resize', onWindowResize);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                // Create video texture for blur
                const videoTexture = new THREE.VideoTexture(video);

                // Post-processing
                const composer = new THREE.EffectComposer(renderer);
                composer.addPass(new THREE.RenderPass(scene, camera));

                // Horizontal Blur
                const hBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
                hBlur.uniforms.tDiffuse.value = videoTexture;
                hBlur.uniforms.h.value = 1.0 / window.innerWidth;
                composer.addPass(hBlur);

                // Vertical Blur
                const vBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
                vBlur.uniforms.tDiffuse.value = videoTexture;
                vBlur.uniforms.v.value = 1.0 / window.innerHeight;
                composer.addPass(vBlur);

                composer.addPass(new THREE.OutputPass());

            }).catch((error) => {
                console.error('Unable to access the camera', error);
            });
    } else {
        console.error('MediaDevices interface not available');
    }
} // init

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
} // onWindowResize

function animate() {
    requestAnimationFrame(animate);
    composer.render();
    renderer.render(scene, camera);
} // animate