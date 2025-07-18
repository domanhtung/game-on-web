import * as THREE from "three";
import * as CANNON from "cannon-es";

export class Wall {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(
    size: CANNON.Vec3,
    position: CANNON.Vec3,
    color: number,
    scene: THREE.Scene,
    world: CANNON.World,
    slipperyMat: CANNON.Material
  ) {
    // Cannon body
    const shape = new CANNON.Box(size);
    this.body = new CANNON.Body({ mass: 0 });
    this.body.addShape(shape);
    this.body.position.copy(position);
    world.addBody(this.body);
    this.body.material = slipperyMat;

    // Three.js mesh
    const geometry = new THREE.BoxGeometry(
      size.x * 1.8,
      size.y * 1.8,
      size.z * 1.8
    );
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = true;

    scene.add(this.mesh);
  }

  update() {
    // Sync mesh with body (if dynamic in tương lai)
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
