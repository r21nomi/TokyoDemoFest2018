import * as THREE from 'three';

window.THREE = require("three");
require("three/examples/js/MarchingCubes.js");

const TWEEN = require('@tweenjs/tween.js');
const sound = require("./sound.js");
const icosahedron = require("./icosahedron.js");

const vertexShader = require('webpack-glsl-loader!./glsl/vertexShader.vert');
const fragmentShader = require('webpack-glsl-loader!./glsl/fragmentShader.frag');
const obliqueLineFragmentShader = require('webpack-glsl-loader!./glsl/obliqueLineFragmentShader.frag');
const summedWaveFragmentShader = require('webpack-glsl-loader!./glsl/summedWaveFragmentShader.frag');

const particleVertexShader = require('webpack-glsl-loader!./glsl/particleVertexShader.vert');
const particleFragmentShader = require('webpack-glsl-loader!./glsl/particleFragmentShader.frag');

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let scene, camera, clock, marchingCubes, renderer, light, pointLight, ambientLight;
let groundGeometry, groundMesh;

let blobsCount = 30;
let updatingCubeSpeedOffset = 1.6;
let groundVertexOffset = 3;
let shouldChangeSceneTo2 = true;
let shouldChangeSceneTo3 = true;
let shouldChangeSceneTo4 = true;
let shouldChangeSceneTo5 = true;
let shouldChangeSceneTo6 = true;

let particlePoints;

let icosahedronGroup = new THREE.Group();

const uniform = {
    time: {
        type: 'f',
        value: 1.0
    },
    resolution: {
        type: "v2",
        value: new THREE.Vector2()
    },
    dirLightPos: {
        type: "v3",
        value: new THREE.Vector3()
    },
    dirLightColor: {
        type: "v3",
        value: new THREE.Color(0xeeeeee)
    },
    ambientLightColor: {
        type: "v3",
        value: new THREE.Color(0x050505)
    },
    size: {
        type: 'f',
        value: 32.0
    },
};

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
    light.position.set(0.0, 0.0, 0.0);
    scene.add(light);

    pointLight = new THREE.PointLight(0x00E4BB, 30, 150);
    pointLight.position.set(0, -150, 0);
    scene.add(pointLight);

    ambientLight = new THREE.AmbientLight(0x00E4BB);
    ambientLight.position.set(0, -1.0, 0);
    scene.add(ambientLight);

    // Ground
    groundGeometry = new THREE.PlaneBufferGeometry(20000, 20000, 128, 128);
    groundGeometry.rotateX(-Math.PI / 2);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://i.imgur.com/uXLLH9G.jpg');  // Refer to remote URL to access locally.
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    const groundMaterial = new THREE.MeshBasicMaterial({
        color: 0x00E4BB,
        map: texture,
    });

    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.position.set(0, -3000, 0);
    scene.add(groundMesh);

    // Blobs
    uniform.resolution = new THREE.Vector2(windowWidth, windowHeight);
    uniform.dirLightPos.value = light.position;
    uniform.dirLightColor.value = light.color;
    uniform.ambientLightColor.value = ambientLight.color;

    const material = new THREE.ShaderMaterial({
        uniforms: uniform,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });

    const resolution = 48;
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

    sound.init();
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
            y *= groundVertexOffset;
        }
        position.setY(i, y);
    }

    position.needsUpdate = true;
};

const render = (t) => {
    TWEEN.update(t);

    clock.getDelta();
    const time = clock.elapsedTime;

    updateGround(time);

    updateCubes(marchingCubes, time * updatingCubeSpeedOffset);

    if (!shouldChangeSceneTo3) {
        marchingCubes.rotation.x = time;
        marchingCubes.rotation.y = time;
        marchingCubes.rotation.z = time;
    }

    const speed = time * 30 * (Math.PI / 180);
    const cameraX = 300 * Math.sin(speed);
    const cameraZ = 300 * Math.cos(speed);

    camera.position.x = cameraX;
    camera.position.z = cameraZ;

    if (shouldChangeSceneTo6) {
        camera.position.y = cameraX * 0.3;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    uniform.time.value = time;

    let len = icosahedronGroup.children.length;
    if (len > 0) {
        for (let i = 0; i < len; i++) {
            let object = icosahedronGroup.children[i];

            let geometry = object.geometry;
            geometry.verticesNeedUpdate = true;

            let originalVertices = icosahedron.originalVerticesArray[i];

            for (let i = 0, len = geometry.vertices.length; i < len; i++) {
                let t = time * 8 + i * 300;
                let offset = 5;
                geometry.vertices[i].x = originalVertices[i].x + Math.sin(t) * offset;
                geometry.vertices[i].y = originalVertices[i].y + Math.sin(t * 0.8) * offset;
            }
            const t = time * 5 + (i % 4) * 80;
            object.scale.x = 1.0 + Math.abs(Math.sin(t));
            object.scale.y = 1.0 + Math.abs(Math.sin(t));
            object.scale.z = 1.0 + Math.abs(Math.sin(t));
        }
    }

    if (time > 5 && shouldChangeSceneTo2) {
        toScene2();
    } else if (time > 15 && shouldChangeSceneTo3) {
        toScene3();
    } else if (time > 25 && shouldChangeSceneTo4) {
        toScene4();
    } else if (time > 30 && shouldChangeSceneTo5) {
        toScene5();
    } else if (time > 40 && shouldChangeSceneTo6) {
        toScene6();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

/**
 * Show ground.
 */
const toScene2 = () => {
    const initialY = groundMesh.position.y;
    const targetY = -500;
    const coords = {
        x: 0,
        y: initialY,
        z: 0
    };
    new TWEEN.Tween(coords)
        .to({x: 0, y: targetY, z: 0}, 3000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function () {
            groundMesh.position.y = coords.y;
            light.position.y = (initialY - coords.y) / (targetY - initialY);  // Finally y become -1.0.
        })
        .start();

    shouldChangeSceneTo2 = false;
};

/**
 * Change shader.
 */
const toScene3 = () => {
    scene.remove(marchingCubes);

    const material = new THREE.ShaderMaterial({
        uniforms: uniform,
        vertexShader: vertexShader,
        fragmentShader: summedWaveFragmentShader,
    });

    const resolution = 48;
    marchingCubes = new THREE.MarchingCubes(resolution, material, true, true);
    marchingCubes.position.set(0, 0, 0);
    marchingCubes.scale.set(100, 100, 100);

    scene.add(marchingCubes);

    scene.background = new THREE.Color(0x231B95);
    scene.fog = new THREE.FogExp2(0x231B95, 0.0003);

    groundVertexOffset = 12;
    shouldChangeSceneTo3 = false;
};

/**
 * Show particles and change shader.
 */
const toScene4 = () => {
    scene.remove(marchingCubes);

    const material1 = new THREE.ShaderMaterial({
        uniforms: uniform,
        vertexShader: vertexShader,
        fragmentShader: obliqueLineFragmentShader,
    });

    const resolution = 48;
    marchingCubes = new THREE.MarchingCubes(resolution, material1, true, true);
    marchingCubes.position.set(0, 0, 0);
    marchingCubes.scale.set(100, 100, 100);

    scene.add(marchingCubes);

    scene.background = new THREE.Color(0x4623DE);
    scene.fog = new THREE.FogExp2(0x4623DE, 0.0003);

    let colorsPerFace = [
        "#7BFFEF", "#6FE8B8", "#7FFFAC", "#6FE873", "#FFDEAA"
    ];

    const hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        };
    };

    const vertices = [];
    const colors = [];
    const particleCount = 20000;

    const geometry = new THREE.BufferGeometry();
    const dist = window.innerWidth * 0.8;

    for (let i = 0; i < particleCount; i++) {
        const x = Math.floor(Math.random() * dist - dist / 2);
        const y = Math.floor(Math.random() * dist - dist / 2);
        const z = Math.floor(Math.random() * dist - dist / 2);
        vertices.push(x, y, z);

        const rgbColor = hexToRgb(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
        colors.push(rgbColor.r, rgbColor.g, rgbColor.b);
    }

    const verticesArray = new Float32Array(vertices);
    geometry.addAttribute('position', new THREE.BufferAttribute(verticesArray, 3));

    const colorsArray = new Float32Array(colors);
    geometry.addAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const material2 = new THREE.ShaderMaterial({
        uniforms: uniform,
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    particlePoints = new THREE.Points(geometry, material2);
    scene.add(particlePoints);

    updateBlobsCount(50, 5000);

    shouldChangeSceneTo4 = false;
};

/**
 * Show icosahedron.
 */
const toScene5 = () => {
    const objectRadius = 30;
    const count = 18;
    const dist = 600;

    for (let i = 0; i < count; i++) {
        const angle = 360 / count * Math.PI / 180 * i;

        icosahedronGroup.add(icosahedron.createObject(objectRadius, {
            x: Math.cos(angle) * dist,
            y: 0,
            z: Math.sin(angle) * dist
        }));
    }
    scene.add(icosahedronGroup);

    shouldChangeSceneTo5 = false;
};

const toScene6 = () => {
    const coords = {
        y: marchingCubes.position.y
    };
    new TWEEN.Tween(coords)
        .to({y: 2000}, 8000)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(function () {
            marchingCubes.position.y = coords.y;
            camera.position.y = coords.y;
            particlePoints.position.y = coords.y;
            camera.lookAt(new THREE.Vector3(0, coords.y, 0));
        })
        .onComplete(function () {
            scene.remove(particlePoints);
            sound.stop();
        })
        .start();

    updateBlobsCount(0, 9000);

    shouldChangeSceneTo6 = false;
};

const updateBlobsCount = (count, time) => {
    const params = {
        count: blobsCount
    };
    new TWEEN.Tween(params)
        .to({count: count}, time)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function () {
            blobsCount = Math.floor(params.count);
        })
        .start();
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