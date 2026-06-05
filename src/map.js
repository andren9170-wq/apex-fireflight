import * as THREE from 'three';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Simple ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Simple box as placeholder
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(0, 1, -5);
        box.castShadow = true;
        this.scene.add(box);
    }
}
