import * as THREE from "three";
import * as CANNON from "cannon-es";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
const humanPath = "/assets/human.glb";

export class BotEnemy {
  public mesh: THREE.Object3D;
  public body: CANNON.Body;
  public isAlive: boolean = true;

  private targetPosition: CANNON.Vec3 | undefined;
  private speed = 2;
  private tmpVec = new CANNON.Vec3();

  constructor(
    position: CANNON.Vec3,
    scene: THREE.Scene,
    world: CANNON.World,
    material: CANNON.Material
  ) {
    const size = new CANNON.Vec3(0.07, 1.6, 0.07);

    const shape = new CANNON.Box(size);
    this.body = new CANNON.Body({
      mass: 0,
      position,
      material,
    });
    this.body.addShape(shape);
    world.addBody(this.body);

    this.mesh = new THREE.Group();
    scene.add(this.mesh);

    const loader = new GLTFLoader();
    loader.load(humanPath, (gltf: { scene: THREE.Object3D }) => {
      const model = gltf.scene;
      model.scale.set(0.028, 0.028, 0.028);
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
        }
      });
      this.mesh.add(model);
    });
  }

  setTarget(target: CANNON.Vec3) {
    this.targetPosition = target.clone();
  }

  move(delta: number, world: CANNON.World) {

    // Áp dụng vận tốc
    // this.body.velocity.x += 0.01;
    // this.body.velocity.z += 0.01;
    // console.log("Bot moving to target:", this.tmpVec);
  }

  update(delta: number, world: CANNON.World) {
    this.move(delta, world);
    this.mesh.position.copy(this.body.velocity as unknown as THREE.Vector3);
    this.mesh.quaternion.copy(
      this.body.quaternion as unknown as THREE.Quaternion
    );
  }

  takeDamage() {
    if (this.isAlive) {
      this.isAlive = false;
      this.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
            color: 0x444444,
          });
        }
      });
    }
  }
}
