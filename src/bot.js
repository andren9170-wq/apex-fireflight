import * as THREE from 'three';

export class Bot {
    constructor(scene, player, position) {
        this.scene = scene;
        this.player = player;
        
        this.health = 100;
        this.isDead = false;
        
        this.moveSpeed = 3.0;
        this.fireRate = 1000; // ms
        this.lastFireTime = 0;
        this.detectionRange = 30;
        
        this.velocity = new THREE.Vector3();
        this.mesh = this.createMesh(position);
        
        this.targetPosition = this.getRandomPosition();
    }

    createMesh(position) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = "Bot-" + Math.floor(Math.random() * 1000);
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
        group.userData.botInstance = this; // Reference back to this class

        this.scene.add(group);
        return group;
    }

    getRandomPosition() {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 60,
            0,
            (Math.random() - 0.5) * 40
        );
    }

    update(delta, playerPos) {
        if (this.isDead) return;

        // Sync health from mesh userData (since WeaponSystem updates that)
        this.health = this.mesh.userData.health;
        if (this.health <= 0) {
            this.die();
            return;
        }

        const distToPlayer = this.mesh.position.distanceTo(playerPos);

        // Move towards target position
        const dirToTarget = this.targetPosition.clone().sub(this.mesh.position).normalize();
        this.mesh.position.add(dirToTarget.multiplyScalar(this.moveSpeed * delta));

        if (this.mesh.position.distanceTo(this.targetPosition) < 1) {
            this.targetPosition = this.getRandomPosition();
        }

        // Shooting logic
        if (distToPlayer < this.detectionRange) {
            // Look at player
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
            
            const now = performance.now();
            if (now - this.lastFireTime > this.fireRate) {
                this.shootAtPlayer();
                this.lastFireTime = now;
            }
        }
    }

    shootAtPlayer() {
        console.log("Bot shooting at player!");
        // Simulate hit with some probability
        if (Math.random() > 0.7) {
            this.player.takeDamage(10);
            console.log("Bot hit player!");
        }
    }

    die() {
        this.isDead = true;
        // The WeaponSystem handles removing the mesh from scene
        console.log("Bot died");
    }
}
