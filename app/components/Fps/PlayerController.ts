import * as THREE from "three";
import * as CANNON from "cannon-es";

type KeyMap = Record<string, boolean>;

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public yawObject: THREE.Object3D;
  public pitchObject: THREE.Object3D;
  public keys: KeyMap = {};
  public body: CANNON.Body;
  public characterHeight = 3.2; // chiều cao của nhân vật

  private direction = new THREE.Vector3();
  private canJump = false;

  private walkSpeed = 15;
  private runSpeed = 30;
  private jumpForce = 6;
  private jumpMovementFactor = 0.2; // giảm tốc độ khi đang nhảy

  public yaw = 0;
  public pitch = 0;

  constructor(slipperyMat: CANNON.Material) {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(this.camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.set(0, 0, 0);
    this.yawObject.add(this.pitchObject);

    this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Cylinder(0.3, 0.3, this.characterHeight, 8),
      fixedRotation: true,
      position: new CANNON.Vec3(0, this.characterHeight, 0),
    });
    this.body.linearDamping = 0.9; // để không trượt mãi

    this.body.addEventListener("collide", (event: { contact: any }) => {
      const contact = event.contact;

      // mặt tiếp xúc phải nằm bên dưới player (hướng lên trên)
      const normal = contact.ni.clone();
      if (contact.bi.id === this.body.id) {
        normal.negate(); // đảm bảo normal luôn hướng từ vật khác về player
      }

      if (normal.y > 0.5) {
        this.canJump = true;
      }
    });
    this.body.material = slipperyMat;

    this.addListeners();
  }

  addToScene(scene: THREE.Scene, world: CANNON.World) {
    scene.add(this.yawObject);
    world.addBody(this.body); // body vật lý
  }

  update() {
    this.direction.set(0, 0, 0);
    if (this.keys["w"]) this.direction.z -= 1;
    if (this.keys["s"]) this.direction.z += 1;
    if (this.keys["a"]) this.direction.x -= 1;
    if (this.keys["d"]) this.direction.x += 1;

    this.direction.normalize().applyEuler(new THREE.Euler(0, this.yaw, 0));

    const speed = this.keys["shift"] ? this.walkSpeed : this.runSpeed;

    // Di chuyển bằng cannon-es (gán velocity)
    const impulse = new CANNON.Vec3(
      this.canJump
        ? this.direction.x * speed
        : this.direction.x * speed * this.jumpMovementFactor,
      0,
      this.canJump
        ? this.direction.z * speed
        : this.direction.z * speed * this.jumpMovementFactor
    );
    this.body.velocity.x = 0;
    this.body.velocity.z = 0;
    this.body.applyImpulse(impulse, this.body.position);

    // Đồng bộ vị trí từ body → yawObject (để giữ camera)
    this.yawObject.position.copy(this.body.position as any);
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

  private addListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.code === "Space" && this.canJump) {
        this.body.velocity.y = this.jumpForce;
        this.canJump = false;
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }
}
