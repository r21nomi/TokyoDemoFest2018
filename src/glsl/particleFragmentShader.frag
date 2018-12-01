uniform sampler2D texture;
uniform float time;

varying vec4 vMvPosition;
varying vec3 vColor;

void main() {
    float opacity = 200.0 / length(vMvPosition.xyz);

    vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;

    float orb = 0.1 / length(vec2(0.0) - uv) * step(0.5, 1.0 - length(uv));
    orb = smoothstep(0.0, 1.0, orb);

    vec3 color = vec3(orb) * vColor;

    gl_FragColor = vec4(color, 1.0);
}
