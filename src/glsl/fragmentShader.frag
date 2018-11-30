#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform float time;
uniform vec2 resolution;

uniform vec3 dirLightPos;
uniform vec3 dirLightColor;
uniform vec3 ambientLightColor;

varying vec2 vUv;
varying vec3 vNormal;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main( void ) {
    vec2 uv = 2.0 * vUv - 1.0;

    float directionalLightWeighting = max(dot(normalize(vNormal), dirLightPos), 0.0);
    vec3 lightWeighting = ambientLightColor + dirLightColor * directionalLightWeighting;
//    float intensity = smoothstep(0.0, 1.0, pow(length(lightWeighting), 20.0));

    uv *= 6.0;
    uv = fract(uv);
    uv -= 0.5;

    vec3 ballColor = vec3(1.0, 0.0, 0.5);
    vec3 shadowColor = vec3(0.0, 1.0, 1.0);
    vec3 color = mix(ballColor, shadowColor, directionalLightWeighting);

    color += 0.1 + 0.1 * abs(sin(time * 2.0)) / length(uv);

    gl_FragColor = vec4(color, 1.0);
}