import * as THREE from "three";

export class Lighting {
  public sun: THREE.DirectionalLight;
  public ambient: THREE.AmbientLight;
  public helper?: THREE.CameraHelper;

  constructor(scene: THREE.Scene, withHelper = false) {
    // Ambient light – ánh sáng môi trường nhẹ
    this.ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(this.ambient);

    // Directional light – giả lập mặt trời
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.position.set(50, 100, 50);
    this.sun.castShadow = true;

    // Cài đặt shadow
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.bias = -0.0001; // giảm bóng rỗ
    this.sun.shadow.radius = 5;

    this.sun.shadow.camera.left = -50;
    this.sun.shadow.camera.right = 50;
    this.sun.shadow.camera.top = 50;
    this.sun.shadow.camera.bottom = -50;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 200;

    this.sun.target.position.set(0, 0, 0);
    scene.add(this.sun.target);
    scene.add(this.sun);

    // Nếu muốn debug camera ánh sáng
    if (withHelper) {
      this.helper = new THREE.CameraHelper(this.sun.shadow.camera);
      scene.add(this.helper);
    }
  }

  // Nếu muốn cập nhật helper sau mỗi frame
  updateHelper() {
    if (this.helper) this.helper.update();
  }
}
