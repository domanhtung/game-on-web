"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-ignore
const gunPath = "/assets/pistol.glb"; // Update to your actual gun model path

export default function FpsCamera() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera + yaw/pitch structure
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    const yawObject = new THREE.Object3D();
    yawObject.position.set(0, 1.6, 5); // người đứng
    yawObject.add(pitchObject);
    scene.add(yawObject);

    // Ground
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);

    // Walls
    const wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 5),
      new THREE.MeshStandardMaterial({ color: 0x8888ff })
    );
    wall1.position.set(-3, 1, -10);
    wall1.name = "Wall1";
    scene.add(wall1);

    const wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 5),
      new THREE.MeshStandardMaterial({ color: 0xff8888 })
    );
    wall2.position.set(3, 1, -10);
    wall2.name = "Wall2";
    scene.add(wall2);

    const wall3 = new THREE.Mesh(
      new THREE.BoxGeometry(7, 2, 1),
      new THREE.MeshStandardMaterial({ color: 0x88ff88 })
    );
    wall3.position.set(0, 1, -13);
    wall3.name = "Wall3";
    scene.add(wall3);

    let gunGroup: THREE.Group | null = null;

    // Load FBX gun
    const loader = new GLTFLoader();
    loader.load(gunPath, (gltf: { scene: THREE.Object3D }) => {
      const gunModel = gltf.scene;
      gunModel.scale.set(0.5, 0.5, 0.5); // điều chỉnh scale
      gunModel.position.set(0.2, -0.2, 0); // vị trí gần camera
      gunModel.rotation.y = 1.7;

      gunGroup = new THREE.Group();
      gunGroup.add(gltf.scene);

      camera.add(gunGroup);
    });

    // Controls
    const keys: Record<string, boolean> = {};
    document.addEventListener(
      "keydown",
      (e) => (keys[e.key.toLowerCase()] = true)
    );
    document.addEventListener(
      "keyup",
      (e) => (keys[e.key.toLowerCase()] = false)
    );

    // Mouse look
    let pitch = 0;
    let yaw = 0;

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement === canvas) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        pitchObject.rotation.x = pitch;
        yawObject.rotation.y = yaw;
      }
    });

    // Shoot ray
    const shoot = () => {
      const raycaster = new THREE.Raycaster();
      const origin = camera.getWorldPosition(new THREE.Vector3());
      const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .normalize();
      raycaster.set(origin, direction);

      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const firstHit = intersects[0];
        console.log(
          "💥 Bắn trúng:",
          firstHit.object.name || firstHit.object.uuid
        );
      }

      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const points = [
        origin,
        origin.clone().add(direction.clone().multiplyScalar(50)),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);

      if (gunGroup) {
        // Animate recoil
        const recoilDistance = -0.05;
        const duration = 50;

        const originalZ = gunGroup.position.z;
        gunGroup.position.y = originalZ + recoilDistance;

        setTimeout(() => {
          if (gunGroup) {
            gunGroup.position.y = originalZ;
          }
        }, duration);
      }

      setTimeout(() => {
        scene.remove(line);
        geometry.dispose();
        lineMaterial.dispose();
      }, 100);
    };

    document.addEventListener("mousedown", (e) => {
      if (document.pointerLockElement === canvas && e.button === 0) {
        shoot();
      }
    });

    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    const clock = new THREE.Clock();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // WASD
      direction.set(0, 0, 0);
      if (keys["w"]) direction.z -= 1;
      if (keys["s"]) direction.z += 1;
      if (keys["a"]) direction.x -= 1;
      if (keys["d"]) direction.x += 1;
      direction.normalize().applyEuler(new THREE.Euler(0, yaw, 0));
      velocity.copy(direction).multiplyScalar(5 * delta);
      yawObject.position.add(velocity);

      renderer.render(scene, camera);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} className="w-screen h-screen block" />;
}
