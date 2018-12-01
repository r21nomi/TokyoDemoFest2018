attribute vec3 color;

uniform float time;
uniform float size;

varying vec4 vMvPosition;
varying vec3 vColor;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vMvPosition = mvPosition;
    vColor = color;

    gl_PointSize = (size + map(sin(time * 0.05), -1.0, 1.0, 0.0, 100.0)) * (100.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}
