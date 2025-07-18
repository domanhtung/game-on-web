import * as THREE from "three";

export class DirectionArrowHelper {
  private arrow: THREE.ArrowHelper;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, length = 2, color = 0xffff00) {
    this.scene = scene;

    // Khởi tạo mũi tên mặc định
    const defaultDir = new THREE.Vector3(0, 0, -1);
    const defaultOrigin = new THREE.Vector3(0, 0, 0);
    this.arrow = new THREE.ArrowHelper(
      defaultDir,
      defaultOrigin,
      length,
      color
    );

    this.scene.add(this.arrow);
  }

  /**
   * Cập nhật hướng và vị trí của mũi tên
   * @param direction Vector3 đã normalize — hướng
   * @param origin Vector3 — gốc xuất phát
   */
  update(direction: THREE.Vector3, origin: THREE.Vector3) {
    this.arrow.setDirection(direction.clone().normalize());
    this.arrow.position.copy(origin);
  }

  /**
   * Hiển thị hoặc ẩn mũi tên
   */
  setVisible(visible: boolean) {
    this.arrow.visible = visible;
  }

  /**
   * Xóa mũi tên khỏi scene và dọn bộ nhớ
   */
  dispose() {
    this.scene.remove(this.arrow);
    this.arrow.traverse((child) => {
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
      if ((child as THREE.Mesh).material) {
        const material = (child as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
    });
  }
}
