// Thanks to https://blog.gmork.in/entry/2017/12/16/013121

import * as THREE from 'three';

let node;

export const init = () => {
    const DURATION = 90;
    const WIDTH = 512;
    const HEIGHT = 512;
    const fragmentShader = require('webpack-glsl-loader!./glsl/soundShader.frag');

    const ctx = new window.AudioContext();
    node = ctx.createBufferSource();
    node.connect(ctx.destination);
    node.loop = true;

    const uniforms = {
        blockOffset: {
            type: 'f',
            value: 0.0
        },
        sampleRate: {
            type: 'f',
            value: ctx.sampleRate
        },
        texture: {
            type: 't',
            value: new THREE.TextureLoader().load('https://i.imgur.com/uXLLH9G.jpg')  // TODO: texture can not be applied.
        },
    };

    const audioBuffer = ctx.createBuffer(2, ctx.sampleRate * DURATION, ctx.sampleRate);
    const renderer = new THREE.WebGLRenderer();
    const wctx = renderer.getContext();

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        uniforms,
        fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 1);

    const scene = new THREE.Scene();
    scene.add(mesh);

    const samples = WIDTH * HEIGHT;
    const numBlocks = (ctx.sampleRate * DURATION) / samples;

    const target = new THREE.WebGLRenderTarget(WIDTH, HEIGHT);

    for (let i = 0; i < numBlocks; i++) {
        uniforms.blockOffset.value = i * samples / ctx.sampleRate;
        renderer.render(scene, camera, target, true);

        const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
        wctx.readPixels(0, 0, WIDTH, HEIGHT, wctx.RGBA, wctx.UNSIGNED_BYTE, pixels);

        const outputDataL = audioBuffer.getChannelData(0);
        const outputDataR = audioBuffer.getChannelData(1);
        for (let j = 0; j < samples; j++) {
            outputDataL[i * samples + j] = (pixels[j * 4 + 0] + 256 * pixels[j * 4 + 1]) / 65535 * 2 - 1;
            outputDataR[i * samples + j] = (pixels[j * 4 + 2] + 256 * pixels[j * 4 + 3]) / 65535 * 2 - 1;
        }
    }

    node.buffer = audioBuffer;
    node.start(0);
};

export const stop = () => {
    node.stop();
};