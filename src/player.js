import * as THREE from 'three';

export class Player {
    constructor(camera, scene, weapons) {
        this.camera = camera;
        this.scene = scene;
        this.weapons = weapons;
        
        // Player state
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        
        // Configurable Constants (Lead Specs)
        this.WALK_SPEED = 8.0;
        this.GRAVITY = 25.0;
        this.JUMP_FORCE = 5.0;
        this.PLAYER_HEIGHT = 1.7; // Eye height

        // Container for camera rotation (Yaw)
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = this.PLAYER_HEIGHT;
        this.yawObject.add(this.camera);
        this.scene.add(this.yawObject);
        
        // Reset camera local position/rotation (Pitch handles X-axis)
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);

        this.initControls();
    }

    initControls() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': 
                    if (this.canJump) {
                        this.velocity.y = this.JUMP_FORCE;
                        this.canJump = false;
                    }
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Mouse look
        const onMouseMove = (event) => {
            if (document.pointerLockElement === document.body) {
                const movementX = event.movementX || 0;
                const movementY = event.movementY || 0;

                // Yaw (Y-axis rotation on parent)
                this.yawObject.rotation.y -= movementX * 0.002;
                // Pitch (X-axis rotation on camera, clamped)
                this.camera.rotation.x -= movementY * 0.002;
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        };

        document.addEventListener('mousemove', onMouseMove);

        // Pointer lock trigger
        document.body.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(delta) {
        if (delta > 0.1) delta = 0.1; // Cap delta to prevent physics glitches

        // Apply Gravity
        this.velocity.y -= this.GRAVITY * delta;

        // Calculate Movement Direction
        const zMove = Number(this.moveForward) - Number(this.moveBackward);
        const xMove = Number(this.moveRight) - Number(this.moveLeft);
        
        this.direction.set(xMove, 0, -zMove); // -z is forward in Three.js
        this.direction.normalize();

        // Apply Horizontal Movement
        // We calculate horizontal velocity separately to match the 8 units/sec spec
        const horizontalVelocity = new THREE.Vector3();
        if (zMove !== 0 || xMove !== 0) {
            horizontalVelocity.copy(this.direction).multiplyScalar(this.WALK_SPEED);
        }

        // Move relative to yawObject orientation
        // We use the yawObject's quaternion to rotate our movement vector
        horizontalVelocity.applyQuaternion(this.yawObject.quaternion);

        // Apply velocities
        this.yawObject.position.x += horizontalVelocity.x * delta;
        this.yawObject.position.z += horizontalVelocity.z * delta;
        this.yawObject.position.y += this.velocity.y * delta;

        // Ground Collision
        if (this.yawObject.position.y <= this.PLAYER_HEIGHT) {
            this.velocity.y = 0;
            this.yawObject.position.y = this.PLAYER_HEIGHT;
            this.canJump = true;
        }
    }
}
