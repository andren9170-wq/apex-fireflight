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
        
        // Physics constants
        this.WALK_SPEED = 50.0;
        this.GRAVITY = 30.0;
        this.JUMP_FORCE = 15.0;
        this.FRICTION = 10.0;
        this.PLAYER_HEIGHT = 1.7;

        // Container for camera rotation
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = this.PLAYER_HEIGHT;
        this.yawObject.add(this.camera);
        this.scene.add(this.yawObject);
        
        // Reset camera local position/rotation
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);

        this.initControls();
    }

    initControls() {
        // Keyboard controls
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

                this.yawObject.rotation.y -= movementX * 0.002;
                this.camera.rotation.x -= movementY * 0.002;

                // Clamp pitch
                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        };

        document.addEventListener('mousemove', onMouseMove);

        // Pointer lock
        document.body.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(delta) {
        if (delta > 0.1) delta = 0.1; // Prevent huge jumps on lag

        // Apply friction
        this.velocity.x -= this.velocity.x * this.FRICTION * delta;
        this.velocity.z -= this.velocity.z * this.FRICTION * delta;

        // Apply gravity
        this.velocity.y -= this.GRAVITY * delta;

        // Calculate movement direction
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        // Apply movement relative to yaw rotation
        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.WALK_SPEED * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.WALK_SPEED * delta;
        }

        // Apply velocities to yawObject
        this.yawObject.translateX(-this.velocity.x * delta);
        this.yawObject.translateZ(this.velocity.z * delta);
        this.yawObject.position.y += this.velocity.y * delta;

        // Basic ground collision
        if (this.yawObject.position.y < this.PLAYER_HEIGHT) {
            this.velocity.y = 0;
            this.yawObject.position.y = this.PLAYER_HEIGHT;
            this.canJump = true;
        }
    }
}
