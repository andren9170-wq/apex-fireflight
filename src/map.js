import * as THREE from 'three';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Simple ground (80m x 60m)
        const groundGeometry = new THREE.PlaneGeometry(80, 60);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.name = "Ground";
        this.scene.add(ground);

        // Grid helper for better orientation during dev
        const grid = new THREE.GridHelper(80, 80, 0x444444, 0x222222);
        this.scene.add(grid);

        // Placeholder targets/cover based on Neon Foundry greybox
        this.createBox(4, 2.5, 2, 0, 1.25, -10, 0x00ff00, "A-Box"); // A-Box
        this.createBox(0.8, 4, 0.8, 10, 2, -5, 0x555555, "Pillar"); // Pillar
        this.createBox(2, 1.2, 0.5, -5, 0.6, -15, 0x0000ff, "Half-Wall"); // Half-Wall
        
        // Add some random targets
        for(let i = 0; i < 5; i++) {
            this.createBox(1, 1, 1, Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20, 0xff0000, "Target-" + i);
        }
    }

    createBox(w, h, d, x, y, z, color, name) {
        const geometry = new THREE.BoxGeometry(w, h, d);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(x, y, z);
        box.castShadow = true;
        box.receiveShadow = true;
        box.name = name;
        
        // Custom property for shooting mechanics
        box.userData.isShootable = true;
        box.userData.health = 100;
        
        this.scene.add(box);
    }
}
