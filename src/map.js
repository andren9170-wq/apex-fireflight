import * as THREE from 'three';

export class Map {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Floor (80m x 60m)
        this.createBox(80, 0.2, 60, 0, -0.1, 0, 0x222222, "Floor");

        // Boundary Walls (4m tall)
        this.createBox(80, 4, 0.3, 0, 2, -30, 0x333333, "Wall-North");
        this.createBox(80, 4, 0.3, 0, 2, 30, 0x333333, "Wall-South");
        this.createBox(0.3, 4, 60, -40, 2, 0, 0x333333, "Wall-West");
        this.createBox(0.3, 4, 60, 40, 2, 0, 0x333333, "Wall-East");

        // --- LANE 1: A-SITE (NORTH) ---
        // A-Site Area
        this.createMarker(-15, 0.05, -20, 0x00ffff, "A-Site-Marker"); // Cyan marker
        this.createCover(4, 2.5, 2, -15, 1.25, -20, 0x555555, "A-Box", 500); 
        this.createCover(0.8, 4, 0.8, -25, 2, -25, 0x555555, "A-Pillar-1", 1000);
        this.createCover(0.8, 4, 0.8, -10, 2, -25, 0x555555, "A-Pillar-2", 1000);
        
        // A-Catwalk (Upper)
        this.createBox(15, 0.2, 1.5, -20, 3.5, -12, 0x444444, "A-Catwalk");
        this.createStairs(-27.5, 0, -12, 5, 3.5, 1.5, 0, "A-Catwalk-Stairs");

        // --- LANE 2: MIDDLE ---
        this.createBox(3, 4, 3, 0, 2, 0, 0x666666, "Middle-Tower");
        this.createStairs(0, 0, 2.5, 1.5, 4, 2, Math.PI, "Tower-Stairs"); // Simplified spiral as straight for now
        
        // Barrels
        this.createCover(1, 1.2, 1, 8, 0.6, 5, 0x777777, "Mid-Barrel-1", 100);
        this.createCover(1, 1.2, 1, -8, 0.6, -5, 0x777777, "Mid-Barrel-2", 100);

        // --- LANE 3: B-SITE (SOUTH) ---
        this.createMarker(15, 0.05, 20, 0xff8800, "B-Site-Marker"); // Orange marker
        this.createCover(4, 2.5, 2, 15, 1.25, 20, 0x555555, "B-Box", 500);
        this.createCover(2, 1.2, 0.5, 10, 0.6, 25, 0x555555, "B-HalfWall", 300);

        // --- SPAWNS ---
        // Alpha Spawn (West) - Cyan
        this.createSpawn(-35, 0, 0, 0x00ffff, "Alpha-Spawn");
        // Bravo Spawn (East) - Orange
        this.createSpawn(35, 0, 0, 0xff8800, "Bravo-Spawn");

        // --- INTERIOR WALLS ---
        this.createBox(50, 4, 0.5, -10, 2, -10, 0x333333, "Divider-1");
        this.createBox(50, 4, 0.5, 10, 2, 10, 0x333333, "Divider-2");

        // Targets
        this.createTargetDummy(-15, 0, -17, "Target-A");
        this.createTargetDummy(15, 0, 17, "Target-B");
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
        return box;
    }

    createCover(w, h, d, x, y, z, color, name, health = 500) {
        const box = this.createBox(w, h, d, x, y, z, color, name);
        box.userData.isShootable = true;
        box.userData.health = health;
        return box;
    }

    createStairs(x, y, z, w, h, d, rotation, name) {
        // Simple slanted ramp for greybox stairs
        const geometry = new THREE.BoxGeometry(w, 0.1, d * 1.5);
        const material = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const ramp = new THREE.Mesh(geometry, material);
        
        // Position at middle of height
        ramp.position.set(x, y + h/2, z);
        ramp.rotation.x = -Math.atan(h / d);
        ramp.rotation.y = rotation;
        
        ramp.receiveShadow = true;
        ramp.name = name;
        this.scene.add(ramp);
    }

    createSpawn(x, z, rotation, color, name) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // Spawn floor
        const floorGeom = new THREE.PlaneGeometry(10, 10);
        const floorMat = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 0.2 });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.01;
        group.add(floor);

        // Back wall
        const wallGeom = new THREE.BoxGeometry(0.3, 4, 10);
        const wallMat = new THREE.MeshStandardMaterial({ color: color });
        const wall = new THREE.Mesh(wallGeom, wallMat);
        wall.position.set(x < 0 ? -5 : 5, 2, 0);
        group.add(wall);

        // Side walls with "doorway" (gap)
        this.createBox(0.3, 4, 4, x, 2, -3, color, name + "-Wall-Side-1");
        this.createBox(0.3, 4, 4, x, 2, 3, color, name + "-Wall-Side-2");

        this.scene.add(group);
    }

    createMarker(x, y, z, color, name) {
        const geometry = new THREE.CircleGeometry(3, 32);
        const material = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 0.5 });
        const marker = new THREE.Mesh(geometry, material);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, y, z);
        marker.name = name;
        this.scene.add(marker);
    }

    createTargetDummy(x, y, z, name) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.name = name;

        // Body
        const bodyGeom = new THREE.BoxGeometry(0.6, 1.2, 0.4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.6;
        body.name = "Body";
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.35;
        head.name = "Head";
        head.castShadow = true;
        group.add(head);

        group.userData.isShootable = true;
        group.userData.health = 100;

        this.scene.add(group);
        return group;
    }
}
