"use client";

import * as THREE from "three";

export class InputManager {
  keys: Record<string, boolean> = {};

  constructor() {
    document.addEventListener(
      "keydown",
      (e) => (this.keys[e.key.toLowerCase()] = true)
    );
    document.addEventListener(
      "keyup",
      (e) => (this.keys[e.key.toLowerCase()] = false)
    );
  }

  getDirection(): THREE.Vector3 {
    const dir = new THREE.Vector3();
    if (this.keys["w"]) dir.z -= 1;
    if (this.keys["s"]) dir.z += 1;
    if (this.keys["a"]) dir.x -= 1;
    if (this.keys["d"]) dir.x += 1;
    return dir.normalize();
  }
}
