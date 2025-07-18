import * as THREE from "three";

export const GUN_VERTEX = `
    attribute float aAlpha;
    varying float vAlpha;
    void main() {
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
export const GUN_FRAGMENT = `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        vec3 brightColor = mix(uColor, vec3(1.0), 0.5);
        float boostedAlpha = pow(vAlpha, 0.9); 
        gl_FragColor = vec4(brightColor, boostedAlpha);
    }
  `;

export const SPRAY_PATTERN = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0, 0.01),
  new THREE.Vector2(0, 0.015),
  new THREE.Vector2(0, 0.02),
  new THREE.Vector2(0, 0.025),
  new THREE.Vector2(0, 0.03),
  new THREE.Vector2(0, 0.035),
  new THREE.Vector2(0, 0.04),
];
