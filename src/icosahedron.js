import * as THREE from "three";

let colorsPerFace = [
    0x20D8D6, 0x31A3A2, 0x53B9B8, 0x71BCBB, 0xA3DAD9
];

export const originalVerticesArray = [];

export const createObject = (radius, position) => {
    let originalVertices = [];
    let geometry = new THREE.IcosahedronGeometry(radius);

    for (let i = 0, len = geometry.faces.length; i < len; i++) {
        let face = geometry.faces[i];
        face.color.setHex(colorsPerFace[Math.floor(Math.random() * colorsPerFace.length)]);
    }

    for (let i = 0, len = geometry.vertices.length; i < len; i++) {
        let vertex = geometry.vertices[i];

        originalVertices.push({
            x: vertex.x,
            y: vertex.y
        });
    }

    let material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors
    });

    let obj = new THREE.Mesh(geometry, material);
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
    obj.castShadow = true;

    originalVerticesArray.push(originalVertices);

    return obj;
};