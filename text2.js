import * as THREE from 'three';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

THREE.Cache.enabled = true;

let container;

let camera, cameraTarget, scene, renderer;

let group, textMesh1, textGeo, materials;

let text = `what can't you see?`,

    bevelEnabled = true,

    font = undefined,

    fontName = 'optimer', // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight = 'bold'; // normal bold

const depth = 10,
    size = 2,
    hover = 10,

    curveSegments = 4,

    bevelThickness = .1,
    bevelSize = .01;

const fontMap = {

    'helvetiker': 0,
    'optimer': 1,
    'gentilis': 2,
    'droid/droid_sans': 3,
    'droid/droid_serif': 4

};

const weightMap = {

    'regular': 0,
    'bold': 1

};


let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

let fontIndex = 1;

init();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    // CAMERA

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1500);
    camera.position.set(0, 100, 200);

    cameraTarget = new THREE.Vector3(0, 120, 0);

    // SCENE

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // LIGHTS

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, 0, 1).normalize();
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 4.5, 0, 0);
    pointLight.color.setHSL(1,1,1);
    pointLight.position.set(0, 100, 90);
    scene.add(pointLight);

    materials = [
        new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
    ];

    group = new THREE.Group();
    group.position.y = 120;

    scene.add(group);

    loadFont();

    // RENDERER

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // EVENTS

    container.style.touchAction = 'none';
    container.addEventListener('pointerdown', onPointerDown);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//


function loadFont() {

    const loader = new FontLoader();
    loader.load('fonts/helvetiker_regular.typeface.json', (response) => {

        font = response;

        createText();

    });

}

function createText() {

    textGeo = new TextGeometry(text, {

        font: font,

        size: size,
        depth: depth,
        curveSegments: curveSegments,

        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled

    });

    textGeo.computeBoundingBox();

    const centerOffset = - 0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    textMesh1 = new THREE.Mesh(textGeo, materials);

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add(textMesh1);


}


function onPointerDown(event) {

    if (event.isPrimary === false) return;

    pointerXOnPointerDown = event.clientX - windowHalfX;
    targetRotationOnPointerDown = targetRotation;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    pointerX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.02;

}

function onPointerUp(event) {

    if (event.isPrimary === false) return;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

//

function animate() {

    group.rotation.y += (targetRotation - group.rotation.y) * 0.05;

    camera.lookAt(cameraTarget);

    renderer.clear();
    renderer.render(scene, camera);

}
