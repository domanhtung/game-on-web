"use client";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { GUN_FRAGMENT, GUN_VERTEX, SPRAY_PATTERN } from "@/app/constants/gun";
import { BotEnemy } from "./BotEnemy";

export class Gun {
  group: THREE.Group | null = null;
  muzzle: THREE.Object3D | null = null;
  gunModel: THREE.Object3D | null = null;
  private recoilIndex: number = 0;
  private shooting = false;
  private shootIntervalId: ReturnType<typeof setInterval> | null = null;
  private bots: BotEnemy[] = [];

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.Camera,
    bots: BotEnemy[]
  ) {
    this.bots = bots;
  }

  load(gunPath: string) {
    const loader = new GLTFLoader();
    loader.load(gunPath, (gltf: { scene: THREE.Object3D }) => {
      this.gunModel = gltf.scene;
      this.gunModel.scale.set(0.5, 0.5, 0.5);
      this.gunModel.position.set(0.2, -0.2, 0);
      this.gunModel.rotation.y = 1.7;

      this.group = new THREE.Group();
      this.group.add(this.gunModel);
      this.camera.add(this.group);

      this.muzzle = new THREE.Object3D();
      this.muzzle.position.set(0.2, -0.2, 0);
      this.gunModel.add(this.muzzle);
      this.gunModel.userData.ignoreRaycast = true;
    });
  }

  startShooting() {
    if (this.shooting) return;
    this.shooting = true;

    this.shoot(); // bắn viên đầu tiên ngay
    this.shootIntervalId = setInterval(() => {
      this.shoot();
    }, 120); // 100ms mỗi viên = 10 viên/giây (tùy vũ khí)
  }

  stopShooting() {
    this.shooting = false;
    if (this.shootIntervalId) {
      clearInterval(this.shootIntervalId);
      this.shootIntervalId = null;
      this.recoilIndex = 0; // reset recoil index
    }
  }

  private shoot() {
    // 1. Raycast từ camera theo hướng nhìn
    const camPos = this.camera.getWorldPosition(new THREE.Vector3());
    const camDir = this.camera
      .getWorldDirection(new THREE.Vector3())
      .normalize();
    // this.camera.getWorldDirection(camDir);

    // Tạo spray
    const offset = SPRAY_PATTERN[this.recoilIndex] ?? SPRAY_PATTERN.at(-1)!;
    camDir.x += offset.x;
    camDir.y += offset.y;
    camDir.normalize();

    this.recoilIndex++;

    const allObjects: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (!child.userData.ignoreRaycast) {
        allObjects.push(child);
      }
    });

    const raycaster = new THREE.Raycaster(camPos, camDir);
    const intersects = raycaster.intersectObjects(allObjects, true);

    // 2. Xác định điểm kết thúc
    let hitPoint: THREE.Vector3;
    if (intersects.length > 0) {
      hitPoint = intersects[0].point;
      const botHit = this.bots.find(
        (b) => b.mesh.uuid === intersects[0].object.uuid
      );
      if (botHit) {
        botHit.takeDamage();
      }
      console.log("🎯 Trúng vật thể tại:", hitPoint, intersects[0].object.uuid);
    } else {
      hitPoint = camPos.clone().add(camDir.clone().multiplyScalar(50));
      console.log("🎯 Không trúng, bắn thẳng tới xa:", hitPoint);
    }

    // 3. Lấy vị trí nòng súng và điều chỉnh cao hơn 1 chút
    const muzzlePos = new THREE.Vector3();
    this.muzzle?.getWorldPosition(muzzlePos);
    muzzlePos.y += 0.2; // tăng nhẹ chiều cao đầu nòng súng

    const geometry = new THREE.BufferGeometry().setFromPoints([
      muzzlePos.clone(),
      hitPoint.clone(),
    ]);
    const alphaArray = new Float32Array([0, 1]); // mờ ở đầu, rõ ở cuối
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphaArray, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(0xffff00) },
      },
      vertexShader: GUN_VERTEX,
      fragmentShader: GUN_FRAGMENT,
    });
    const bulletLine = new THREE.Line(geometry, material);
    bulletLine.userData.ignoreRaycast = true;

    this.scene.add(bulletLine);

    // 5. Hiệu ứng recoil (giật súng nhẹ)
    if (this.group) {
      const recoilDistance = -0.05;
      const duration = 50;
      const originalY = this.group.position.y;
      this.group.position.y = originalY + recoilDistance;
      setTimeout(() => {
        this.group!.position.y = originalY;
      }, duration);
    }

    // 6. Tự xóa đường đạn sau một thời gian
    setTimeout(() => {
      this.scene.remove(bulletLine);
      bulletLine.geometry.dispose();
      (bulletLine.material as THREE.Material).dispose();
    }, 100);
  }
}
