import * as THREE from 'three';

window.THREE = require("three");
require("three/examples/js/MarchingCubes.js");

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let scene, camera, clock, marchingCubes, renderer, light, pointLight, ambientLight;

let blobsCount = 30;
let updatingCubeSpeedOffset = 1.6;

let groundGeometry;

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0099);
    scene.fog = new THREE.FogExp2(0xff0099, 0.0003);

    clock = new THREE.Clock();

    // Camera
    camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 1, 10000);
    camera.position.set(0, 100, 300);

    // Light
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 0);
    scene.add(light);

    pointLight = new THREE.PointLight(0x00E4BB, 30, 150);
    pointLight.position.set(0, -150, 0);
    scene.add(pointLight);

    ambientLight = new THREE.AmbientLight(0x00E4BB);
    ambientLight.position.set(0, -100, 0);
    scene.add(ambientLight);

    // Ground
    groundGeometry = new THREE.PlaneBufferGeometry(20000, 20000, 128, 128);
    groundGeometry.rotateX(-Math.PI / 2);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://i.imgur.com/uXLLH9G.jpg');  // Refer to remote URL to access locally.
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    const material1 = new THREE.MeshBasicMaterial({
        color: 0x00E4BB,
        map: texture,
    });

    const mesh = new THREE.Mesh(groundGeometry, material1);
    mesh.position.set(0, -500, 0);
    scene.add(mesh);

    // Blobs
    const resolution = 48;
    const material = new THREE.MeshPhongMaterial({color: 0xff00ff, specular: 0x111111, shininess: 10});

    marchingCubes = new THREE.MarchingCubes(resolution, material, true, true);
    marchingCubes.position.set(0, 0, 0);
    marchingCubes.scale.set(100, 100, 100);

    scene.add(marchingCubes);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);

    document.body.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.autoClear = false;
};

const updateCubes = (object, time) => {
    object.reset();

    let i, ballx, bally, ballz, subtract, strength;
    subtract = 18;
    strength = 1.2 / ((Math.sqrt(blobsCount) - 1) / 4 + 1);

    for (i = 0; i < blobsCount; i++) {
        ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5;
        bally = Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i)) * 0.27 + 0.5;
        ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin((0.92 + 0.53 * i))) * 0.27 + 0.5;
        object.addBall(ballx, bally, ballz, strength, subtract);
    }
};

const updateGround = (time) => {
    const position = groundGeometry.attributes.position;

    for (let i = 0, len = position.count; i < len; i++) {
        let y = 30 * Math.sin(i / 2 + (time * 5 + i));

        if (i % 14 === 0) {
            y *= 3;
        }
        position.setY(i, y);
    }

    position.needsUpdate = true;
};

const render = () => {
    clock.getDelta();
    const time = clock.elapsedTime;

    updateGround(time);

    updateCubes(marchingCubes, time * updatingCubeSpeedOffset);

    const speed = time * 30 * (Math.PI / 180);
    const cameraX = 300 * Math.sin(speed);
    const cameraZ = 300 * Math.cos(speed);

    camera.position.x = cameraX;
    camera.position.y = cameraX * 0.3;
    camera.position.z = cameraZ;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    light.position.x = cameraX;
    light.position.z = cameraZ;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

const onResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowWidth, windowHeight);
};

window.addEventListener("resize", onResize);

init();
onResize();
render();