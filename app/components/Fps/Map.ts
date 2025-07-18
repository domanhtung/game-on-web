import * as THREE from "three";
import * as CANNON from "cannon-es";

export class GameMap {
  public group: THREE.Group;
  public bodies: CANNON.Body[] = [];

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.group = new THREE.Group();

    // Ground
    this.addGround(scene, world);

    this.addBoundaryWalls(scene, world);

    // Tường
    this.addWall(scene, world, { x: 0, y: 2, z: -10 }, { x: 20, y: 4, z: 1 }); // wall ở trước mặt

    // Thêm vài box
    this.addBox(scene, world, { x: 5, y: 1, z: 5 }, { x: 2, y: 2, z: 2 });

    scene.add(this.group);
  }

  addBoundaryWalls(scene: THREE.Scene, world: CANNON.World) {
    const height = 4;
    const thickness = 1;
    const size = 80;

    // Wall phía Bắc (trước)
    this.addWall(
      scene,
      world,
      { x: 0, y: height / 2, z: -size / 2 },
      { x: size, y: height, z: thickness }
    );

    // Wall phía Nam (sau)
    this.addWall(
      scene,
      world,
      { x: 0, y: height / 2, z: size / 2 },
      { x: size, y: height, z: thickness }
    );

    // Wall phía Đông (phải)
    this.addWall(
      scene,
      world,
      { x: size / 2, y: height / 2, z: 0 },
      { x: thickness, y: height, z: size }
    );

    // Wall phía Tây (trái)
    this.addWall(
      scene,
      world,
      { x: -size / 2, y: height / 2, z: 0 },
      { x: thickness, y: height, z: size }
    );
  }

  addGround(scene: THREE.Scene, world: CANNON.World) {
    const geometry = new THREE.BoxGeometry(80, 1, 80);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -0.5, 0);
    mesh.receiveShadow = true;

    const shape = new CANNON.Box(new CANNON.Vec3(40, 0.5, 40));
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(0, -0.5, 0);

    this.group.add(mesh);
    world.addBody(body);
    this.bodies.push(body);
  }

  addWall(
    scene: THREE.Scene,
    world: CANNON.World,
    position: { x: number; y: number; z: number },
    size: { x: number; y: number; z: number }
  ) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;

    const shape = new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);

    this.group.add(mesh);
    world.addBody(body);
    this.bodies.push(body);
  }

  addBox(
    scene: THREE.Scene,
    world: CANNON.World,
    position: { x: number; y: number; z: number },
    size: { x: number; y: number; z: number }
  ) {
    this.addWall(scene, world, position, size); // box là khối lập phương nên có thể tái dùng addWall
  }
}
