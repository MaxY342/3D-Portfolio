uniform sampler2D diffuseTexture;

void main() {
    vec4 color = texture2D(diffuseTexture, gl_PointCoord);

    if (color.a < 0.1)
        discard;

    gl_FragColor = color;
}