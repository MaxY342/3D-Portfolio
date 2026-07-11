uniform sampler2D diffuseTexture;

varying float vOpacity;

varying vec3 vColor;

void main() {
    vec4 color = texture2D(diffuseTexture, gl_PointCoord);

    color.a *= vOpacity;

    if (color.a < 0.1)
        discard;

    gl_FragColor = vec4(vColor, color.a);
}