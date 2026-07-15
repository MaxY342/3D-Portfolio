uniform float pointMultiplier;

attribute float opacity;
varying float vOpacity;

attribute vec3 color;
varying vec3 vColor;

attribute float size;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = size * (pointMultiplier / -mvPosition.z);
    
    vOpacity = opacity; 

    vColor = color;
}