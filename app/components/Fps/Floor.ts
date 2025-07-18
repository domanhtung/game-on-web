import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Floor {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(
    size: { width: number; height: number },
    color: number,
    scene: THREE.Scene,
    world: CANNON.World
  ) {
    // THREE.js - mặt sàn
    const geometry = new THREE.PlaneGeometry(size.width, size.height);
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // CANNON.js - mặt sàn vật lý
    const shape = new CANNON.Plane();
    this.body = new CANNON.Body({ mass: 0 });
    this.body.addShape(shape);
    this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(this.body);
  }

  update() {
    // Chỉ cần nếu body thay đổi (rare for static floor)
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
