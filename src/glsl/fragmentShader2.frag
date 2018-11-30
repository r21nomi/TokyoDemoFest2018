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

mat2 rotate2d(float angle){
    return mat2(cos(angle), -sin(angle),  sin(angle), cos(angle));
}

float obliqueLine(vec2 uv){
    return step(0.6, fract((uv.x + uv.y + time * 0.8) * 2.0));
}

void main( void ) {
    vec2 uv = 2.0 * vUv - 1.0;

    float directionalLightWeighting = max(dot(normalize(vNormal), dirLightPos), 0.0);
    vec3 lightWeighting = ambientLightColor + dirLightColor * directionalLightWeighting;

    vec3 ballColor = vec3(0.139,0.000,0.426);
    vec3 shadowColor = vec3(0.0, 1.0, 1.0);
    vec3 color = mix(ballColor, shadowColor, directionalLightWeighting);
    color += obliqueLine(uv * 4.0);

    gl_FragColor = vec4(color, 1.0);
}