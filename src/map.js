import * as THREE from 'three';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Floor (80m x 60m)
        this.createBox(80, 0.2, 60, 0, -0.1, 0, 0x222222, "Floor");

        // Boundary Walls
        this.createBox(80, 4, 0.3, 0, 2, -30, 0x444444, "Wall-North");
        this.createBox(80, 4, 0.3, 0, 2, 30, 0x444444, "Wall-South");
        this.createBox(0.3, 4, 60, -40, 2, 0, 0x444444, "Wall-West");
        this.createBox(0.3, 4, 60, 40, 2, 0, 0x444444, "Wall-East");

        // --- LANE 1: A-SITE (NORTH) ---
        // A-Site Site (Alpha)
        this.createBox(4, 2.5, 2, -15, 1.25, -20, 0x555555, "A-Box"); // Large container
        this.createBox(0.8, 4, 0.8, -25, 2, -25, 0x555555, "A-Pillar-1");
        this.createBox(0.8, 4, 0.8, -10, 2, -25, 0x555555, "A-Pillar-2");
        
        // A-Catwalk (Upper)
        this.createBox(15, 0.2, 1.5, -20, 3.5, -15, 0x666666, "A-Catwalk");
        
        // --- LANE 2: MIDDLE ---
        // Central Tower
        this.createBox(3, 4, 3, 0, 2, 0, 0x777777, "Middle-Tower");
        // Lower Walls/Cover
        this.createBox(1, 1.2, 1, 5, 0.6, 5, 0x444444, "Mid-Barrel-1");
        this.createBox(1, 1.2, 1, -5, 0.6, -5, 0x444444, "Mid-Barrel-2");

        // --- LANE 3: B-SITE (SOUTH) ---
        // B-Site Site (Bravo)
        this.createBox(4, 2.5, 2, 15, 1.25, 20, 0x555555, "B-Box"); // Large container
        this.createBox(2, 1.2, 0.5, 10, 0.6, 25, 0x444444, "B-HalfWall");
        
        // --- INTERIOR WALLS (Lane Dividers) ---
        // Wall between Lane 1 and 2
        this.createBox(60, 4, 0.3, -10, 2, -10, 0x333333, "Divider-1-2");
        // Wall between Lane 2 and 3
        this.createBox(60, 4, 0.3, 10, 2, 10, 0x333333, "Divider-2-3");

        // --- SPAWNS ---
        // Alpha Spawn (West)
        this.createBox(5, 4, 10, -35, 2, 0, 0x224422, "Alpha-Spawn");
        // Bravo Spawn (East)
        this.createBox(5, 4, 10, 35, 2, 0, 0x442222, "Bravo-Spawn");

        // Target Dummies for testing
        this.createTargetDummy(-15, 0, -18, "Target-A"); // On A-Site
        this.createTargetDummy(15, 0, 18, "Target-B");   // On B-Site
        this.createTargetDummy(0, 4, 0, "Target-Tower"); // Top of tower
        
        // Grid helper for scale reference
        const grid = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
        this.scene.add(grid);
    }

    createTargetDummy(x, y, z, name) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.name = name;

        // Body
        const bodyGeom = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.6; // Feet at 0
        body.name = "Body";
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.35; // Above body
        head.name = "Head";
        head.castShadow = true;
        group.add(head);

        group.userData.isShootable = true;
        group.userData.health = 100;

        this.scene.add(group);
        return group;
    }

    createBox(w, h, d, x, y, z, color, name) {
        const geometry = new THREE.BoxGeometry(w, h, d);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(x, y, z);
        box.castShadow = true;
        box.receiveShadow = true;
        box.name = name;
        this.scene.add(box);
    }
}
