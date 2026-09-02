uniform sampler2D diffuseTexture;

uniform vec2 direction;

uniform vec2 resolution;

uniform float blurSize;

varying vec2 vUv;

void main() {
    vec4 color = vec4(0.0);

    vec2 texel = direction / resolution * blurSize;

    float weights[5];
    weights[0] = 0.2270270270;
    weights[1] = 0.1945945946;
    weights[2] = 0.1216216216;
    weights[3] = 0.0540540541;
    weights[4] = 0.0162162162;

    color += texture2D(diffuseTexture, vUv) * weights[0];
    for (int i = 1; i < 5; i++) {
        color += texture2D(diffuseTexture, vUv + texel * float(i)) * weights[i];
        color += texture2D(diffuseTexture, vUv - texel * float(i)) * weights[i];
    }

    gl_FragColor = color;
}