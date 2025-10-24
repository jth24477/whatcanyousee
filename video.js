import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let camera, scene, renderer, video;

init();

function init() {
    // CAMERA
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.z = 10;

    // SCENE
    scene = new THREE.Scene();

    // VIDEO TEXTURE
    video = document.getElementById("video");
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    // GEOMETRY & MATERIAL
    const geometry = new THREE.PlaneGeometry(16, 9);
    geometry.scale(0.5, 0.5, 0.5);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // SINGLE VIDEO PLANE
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    // RESIZE HANDLER
    window.addEventListener("resize", onWindowResize);

    // CAMERA ACCESS
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
            video: { width: 1280, height: 720, facingMode: "user" },
        };

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((error) => {
                console.error("Unable to access the camera/webcam.", error);
            });
    } else {
        console.error("MediaDevices interface not available.");
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