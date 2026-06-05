import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene, camera, ui) {
        this.scene = scene;
        this.camera = camera;
        this.ui = ui;
        
        this.weapons = [
            {
                name: 'Sidearm-S9',
                type: 'pistol',
                damage: 35,
                clipSize: 12,
                currentClip: 12,
                totalAmmo: 36,
                fireRate: 400, // RPM
                lastFireTime: 0,
                reloadTime: 1500, // ms
                isReloading: false
            }
        ];
        
        this.currentWeaponIndex = 0;
        this.raycaster = new THREE.Raycaster();
        
        // Shootable objects
        this.shootableObjects = [];
        
        this.init();
    }

    init() {
        console.log("Weapon System Initialized");
        this.updateUI();
        
        // Listen for mouse clicks
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && document.pointerLockElement === document.body) { // Left click + pointer lock
                this.fire();
            }
        });
        
        // Listen for R key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                this.reload();
            }
        });
    }

    updateUI() {
        const weapon = this.weapons[this.currentWeaponIndex];
        this.ui.updateAmmo(weapon.currentClip, weapon.totalAmmo);
    }

    update(delta) {
        // Cleanup old tracers or update animations
    }

    fire() {
        const weapon = this.weapons[this.currentWeaponIndex];
        
        if (weapon.isReloading) return;
        if (weapon.currentClip <= 0) {
            console.log("Out of ammo!");
            this.reload();
            return;
        }

        const now = performance.now();
        const fireInterval = 60000 / weapon.fireRate;
        
        if (now - weapon.lastFireTime < fireInterval) return;

        weapon.lastFireTime = now;
        weapon.currentClip--;
        this.updateUI();

        console.log(`Fired ${weapon.name}! Ammo: ${weapon.currentClip}/${weapon.totalAmmo}`);

        // Raycasting
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // For now, raycast against everything in the scene
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        let hitPoint = null;
        if (intersects.length > 0) {
            const hit = intersects[0];
            hitPoint = hit.point;
            
            if (hit.object.userData.isShootable) {
                this.handleHit(hit.object, weapon.damage);
            }
            
            console.log("Hit:", hit.object.name || "Object", "at", hit.point);
            
            // Hit feedback
            this.createHitFeedback(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
        } else {
            // Default hit point far away if nothing hit
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            hitPoint = this.camera.position.clone().add(direction.multiplyScalar(100));
        }

        this.createTracer(this.camera.position, hitPoint);
    }

    handleHit(object, damage) {
        if (!object.userData.health) return;
        
        object.userData.health -= damage;
        console.log(`${object.name} took ${damage} damage. Health remaining: ${object.userData.health}`);
        
        if (object.userData.health <= 0) {
            console.log(`${object.name} destroyed!`);
            // Flash red or something
            if (object.material && object.material.color) {
                const originalColor = object.material.color.clone();
                object.material.color.set(0xff0000);
                setTimeout(() => {
                    if (object.parent) {
                        this.scene.remove(object);
                    }
                }, 200);
            } else {
                this.scene.remove(object);
            }
        } else {
            // Flash briefly on hit
            if (object.material && object.material.color) {
                const originalColor = object.material.color.clone();
                object.material.color.set(0xffffff);
                setTimeout(() => {
                    object.material.color.copy(originalColor);
                }, 50);
            }
        }
    }

    createTracer(start, end) {
        // Simple line tracer
        // Start muzzle position slightly offset from camera
        const muzzleOffset = new THREE.Vector3(0.2, -0.2, -0.5);
        muzzleOffset.applyQuaternion(this.camera.quaternion);
        const muzzlePos = this.camera.position.clone().add(muzzleOffset);

        const points = [muzzlePos, end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(geometry, material);
        
        this.scene.add(line);

        // Fade out and remove
        let opacity = 0.8;
        const fade = () => {
            opacity -= 0.1;
            line.material.opacity = opacity;
            if (opacity > 0) {
                setTimeout(fade, 20);
            } else {
                this.scene.remove(line);
                geometry.dispose();
                material.dispose();
            }
        };
        fade();
    }

    createHitFeedback(point, normal) {
        // Simple spark/impact effect
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const spark = new THREE.Mesh(geometry, material);
        spark.position.copy(point);
        this.scene.add(spark);

        setTimeout(() => {
            this.scene.remove(spark);
            geometry.dispose();
            material.dispose();
        }, 100);
    }

    reload() {
        const weapon = this.weapons[this.currentWeaponIndex];
        
        if (weapon.isReloading || weapon.currentClip === weapon.clipSize || weapon.totalAmmo <= 0) return;

        console.log("Reloading...");
        weapon.isReloading = true;
        
        setTimeout(() => {
            const needed = weapon.clipSize - weapon.currentClip;
            const available = Math.min(needed, weapon.totalAmmo);
            
            weapon.currentClip += available;
            weapon.totalAmmo -= available;
            weapon.isReloading = false;
            this.updateUI();
            console.log("Reloaded!");
        }, weapon.reloadTime);
    }
}
