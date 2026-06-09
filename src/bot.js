import * as THREE from 'three';

export class Bot {
    constructor(scene, player, position) {
        this.scene = scene;
        this.player = player;
        
        this.health = 100;
        this.isDead = false;
        
        this.moveSpeed = 3.5;
        this.idleTime = 2000;
        this.lastActionTime = performance.now();
        this.state = 'idle'; // 'idle', 'moving', 'combat'
        
        this.detectionRange = 15; // Lead spec
        this.accuracy = 0.3; // 30% accuracy
        this.fireRate = 1000; // 1 shot per second
        this.lastFireTime = 0;
        
        this.mesh = this.createMesh(position);
        this.targetWaypoint = this.getRandomWaypoint();
    }

    createMesh(position) {
        const group = new THREE.Group();
        group.position.copy(position);
        group.name = "Bot-" + Math.floor(Math.random() * 1000);

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
        group.userData.botInstance = this;

        this.scene.add(group);
        return group;
    }

    getRandomWaypoint() {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 70,
            0,
            (Math.random() - 0.5) * 50
        );
    }

    update(delta, playerPos) {
        if (this.isDead) return;

        // Sync health
        this.health = this.mesh.userData.health;
        if (this.health <= 0) {
            this.die();
            return;
        }

        const distToPlayer = this.mesh.position.distanceTo(playerPos);
        const now = performance.now();

        if (distToPlayer < this.detectionRange) {
            this.state = 'combat';
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
            
            if (now - this.lastFireTime > this.fireRate) {
                this.shootAtPlayer();
                this.lastFireTime = now;
            }
        } else {
            if (this.state === 'combat') {
                this.state = 'idle';
                this.lastActionTime = now;
            }

            if (this.state === 'idle') {
                if (now - this.lastActionTime > this.idleTime) {
                    this.state = 'moving';
                    this.targetWaypoint = this.getRandomWaypoint();
                }
            } else if (this.state === 'moving') {
                const dir = this.targetWaypoint.clone().sub(this.mesh.position).normalize();
                this.mesh.position.add(dir.multiplyScalar(this.moveSpeed * delta));
                this.mesh.lookAt(this.targetWaypoint.x, this.mesh.position.y, this.targetWaypoint.z);

                if (this.mesh.position.distanceTo(this.targetWaypoint) < 1) {
                    this.state = 'idle';
                    this.lastActionTime = now;
                }
            }
        }
    }

    shootAtPlayer() {
        // Simple accuracy check
        if (Math.random() < this.accuracy) {
            console.log("Bot hit player!");
            this.player.takeDamage(10, this.mesh.name);
        }
        
        // Visual tracer for bot fire
        window.dispatchEvent(new CustomEvent('bot-fired', { 
            detail: { 
                start: this.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
                end: this.player.yawObject.position.clone(),
                attacker: this.mesh.name,
                weapon: 'AR-17'
            } 
        }));
    }

    die() {
        this.isDead = true;
        // WeaponSystem handles mesh removal
        
        // Notify for respawn
        setTimeout(() => {
            this.respawn();
        }, 3000);
    }

    respawn() {
        this.health = 100;
        this.isDead = false;
        const pos = this.getRandomWaypoint();
        this.mesh.position.copy(pos);
        this.mesh.userData.health = 100;
        this.scene.add(this.mesh);
        this.state = 'idle';
        this.lastActionTime = performance.now();
        console.log("Bot respawned");
    }
}
