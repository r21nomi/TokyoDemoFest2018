precision mediump float;
uniform float sampleRate;
uniform float blockOffset;
uniform sampler2D texture;

#define BPM 180.0
#define PI 3.141592654

float timeToBeat(float t) {
    return t / 60.0 * BPM;
}

float beatToTime(float b) {
    return b / BPM * 60.0;
}

// TODO: texture can not be loaded.
vec4 noise(float phase) {
    vec2 uv = phase / vec2(0.512, 0.487);
    return 2.0 * texture2D(texture, uv) - 1.0;
}

float sine(float phase) {
    return sin(PI * 2.0 * phase);
}

float kick(float time) {
    float amp = exp(-5.0 * time);
    float phase = 30.0 * time - 10.0 * exp(-30.0 * time);
    return amp * sine(phase);
}

float chord(float n) {
    return (
        n < 1.0 ? 55.0 :
        n < 2.0 ? 58.0 :
        n < 3.0 ? 62.0 :
                  65.0
    );
}

float noteToFreq(float n) {
    return 440.0 * pow(2.0, (n - 69.0) / 12.0);
}

float saw(float phase) {
    return 2.0 * fract(phase) - 1.0;
}

vec2 pad(float note, float time) {
    float freq = noteToFreq(note);
    float vib = 0.2 * sine(3.0 * time);
    return vec2(
        saw(freq * 0.99 * time + vib),
        saw(freq * 1.01 * time + vib)
    );
}

vec2 mainSound(float time) {
    vec2 ret = vec2(0.0);
    float beat = timeToBeat(time);
    float kickTime = beatToTime(mod(beat, 1.3));

    ret += kick(kickTime);

    float sidechain = smoothstep(0.0, 0.8, kickTime);
    ret += sidechain * 0.6 * vec2(
            pad(chord( 0.0 ), time)
          + pad(chord( 1.0 ), time)
          + pad(chord( 2.0 ), time)
          + pad(chord( 3.0 ), time)
        ) / 4.0;

    if (time > 2.0) {

    }

    return clamp(ret, -1.0, 1.0);
}

void main() {
    float t = blockOffset + ((gl_FragCoord.x - 0.5) + (gl_FragCoord.y - 0.5) * 512.0) / sampleRate;
    vec2 y = mainSound(t);
    vec2 v  = floor((0.5 + 0.5 * y) * 65536.0);
    vec2 vl = mod(v, 256.0) / 255.0;
    vec2 vh = floor(v / 256.0) / 255.0;
    gl_FragColor = vec4(vl.x, vh.x, vl.y, vh.y);
}