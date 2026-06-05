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
                headshotMultiplier: 2,
                clipSize: 12,
                currentClip: 12,
                totalAmmo: 90,
                fireRate: 400, // RPM
                lastFireTime: 0,
                reloadTime: 2000, // ms
                isReloading: false
            }
        ];
        
        this.currentWeaponIndex = 0;
        this.raycaster = new THREE.Raycaster();
        
        // UI elements for feedback
        this.hitMarkerTimeout = null;
        
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

        // Add Hit Marker to DOM
        this.createHitMarkerUI();
    }

    createHitMarkerUI() {
        const marker = document.createElement('div');
        marker.id = 'hit-marker';
        marker.innerHTML = '╳';
        marker.style.position = 'absolute';
        marker.style.top = '50%';
        marker.style.left = '50%';
        marker.style.transform = 'translate(-50%, -50%) scale(0)';
        marker.style.color = '#ff0000';
        marker.style.fontSize = '24px';
        marker.style.fontWeight = 'bold';
        marker.style.pointerEvents = 'none';
        marker.style.transition = 'transform 0.1s ease-out';
        marker.style.zIndex = '1000';
        document.getElementById('ui-layer').appendChild(marker);
    }

    updateUI() {
        const weapon = this.weapons[this.currentWeaponIndex];
        this.ui.updateAmmo(weapon.currentClip, weapon.totalAmmo);
    }

    update(delta) {
        // Handle animations or cleanup if needed
    }

    fire() {
        const weapon = this.weapons[this.currentWeaponIndex];
        
        if (weapon.isReloading) return;
        if (weapon.currentClip <= 0) {
            this.reload();
            return;
        }

        const now = performance.now();
        const fireInterval = 60000 / weapon.fireRate;
        
        if (now - weapon.lastFireTime < fireInterval) return;

        weapon.lastFireTime = now;
        weapon.currentClip--;
        this.updateUI();

        // Crosshair shrink feedback
        this.animateCrosshair();

        // Raycasting from camera center
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        let hitPoint = null;
        if (intersects.length > 0) {
            const hit = intersects[0];
            hitPoint = hit.point;
            
            // Check for shootable
            let target = hit.object;
            while(target && !target.userData.isShootable && target.parent) {
                target = target.parent;
            }

            if (target && target.userData.isShootable) {
                const isHeadshot = hit.object.name === "Head";
                const damage = isHeadshot ? weapon.damage * weapon.headshotMultiplier : weapon.damage;
                this.handleHit(target, damage);
                this.showHitMarker();
            }
            
            this.createHitFeedback(hit.point, hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0));
        } else {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            hitPoint = this.camera.position.clone().add(direction.multiplyScalar(100));
        }

        this.createTracer(this.camera.position, hitPoint);
    }

    animateCrosshair() {
        const crosshair = document.getElementById('crosshair');
        if (!crosshair) return;
        crosshair.style.transform = 'translate(-50%, -50%) scale(0.7)';
        setTimeout(() => {
            crosshair.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 50);
    }

    showHitMarker() {
        const marker = document.getElementById('hit-marker');
        if (!marker) return;
        
        clearTimeout(this.hitMarkerTimeout);
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        
        this.hitMarkerTimeout = setTimeout(() => {
            marker.style.transform = 'translate(-50%, -50%) scale(0)';
        }, 150);
    }

    handleHit(object, damage) {
        if (object.userData.health === undefined) return;
        
        object.userData.health -= damage;
        console.log(`${object.name} hit! Damage: ${damage}. Health: ${object.userData.health}`);
        
        // Visual feedback on the object
        const meshes = [];
        object.traverse(child => { if(child.isMesh) meshes.push(child); });
        
        meshes.forEach(mesh => {
            if (mesh.material && mesh.material.color) {
                const originalColor = mesh.material.color.clone();
                mesh.material.color.set(object.userData.health <= 0 ? 0xff0000 : 0xffffff);
                setTimeout(() => {
                    if (object.userData.health > 0) {
                        mesh.material.color.copy(originalColor);
                    }
                }, 100);
            }
        });

        if (object.userData.health <= 0) {
            setTimeout(() => {
                this.scene.remove(object);
            }, 200);
        }
    }

    createTracer(start, end) {
        const muzzleOffset = new THREE.Vector3(0.2, -0.2, -0.5);
        muzzleOffset.applyQuaternion(this.camera.quaternion);
        const muzzlePos = this.camera.position.clone().add(muzzleOffset);

        const points = [muzzlePos, end.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(geometry, material);
        
        this.scene.add(line);

        let opacity = 0.8;
        const fade = () => {
            opacity -= 0.16; // Faster fade to hit ~100ms (20ms * 5 steps = 100ms)
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
