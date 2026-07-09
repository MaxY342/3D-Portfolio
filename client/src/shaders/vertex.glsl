uniform float pointMultiplier;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = pointMultiplier / -mvPosition.z;
}