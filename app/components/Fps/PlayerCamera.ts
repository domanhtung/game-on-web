"use client";

import * as THREE from "three";

export class PlayerCamera {
  camera: THREE.PerspectiveCamera;
  yawObject: THREE.Object3D;
  pitchObject: THREE.Object3D;
  pitch = 0;
  yaw = 0;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(this.camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.set(0, 2, 0);
    this.yawObject.add(this.pitchObject);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.yawObject);
  }

  updateMouseLook(dx: number, dy: number) {
    this.yaw -= dx * 0.002;
    this.pitch -= dy * 0.002;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    this.pitchObject.rotation.x = this.pitch;
    this.yawObject.rotation.y = this.yaw;
  }

  get position() {
    return this.yawObject.position;
  }
}
