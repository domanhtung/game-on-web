import * as THREE from "three";
import * as CANNON from "cannon-es";

export class BotEnemy {
  public mesh: THREE.Mesh;
  public body: CANNON.Body;
  public isAlive: boolean = true;

  constructor(
    position: CANNON.Vec3,
    scene: THREE.Scene,
    world: CANNON.World,
    material: CANNON.Material
  ) {
    const size = new CANNON.Vec3(1, 2, 1); // chiều cao như player

    // Cannon body
    const shape = new CANNON.Box(size);
    this.body = new CANNON.Body({
      mass: 0,
      position,
      material,
    });
    this.body.addShape(shape);
    world.addBody(this.body);

    // Three mesh
    const geometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
    const materialMesh = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, materialMesh);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  update() {
    this.mesh.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion
    );
  }

  takeDamage() {
    if (this.isAlive) {
      this.isAlive = false;
      this.mesh.material = new THREE.MeshStandardMaterial({ color: 0x444444 });
    }
  }
}
