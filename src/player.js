import * as THREE from 'three';

export class Player {
    constructor(camera, scene, weapons) {
        this.camera = camera;
        this.scene = scene;
        this.weapons = weapons;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.initControls();
    }

    initControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': if (this.canJump === true) this.velocity.y += 350; this.canJump = false; break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyD': this.moveRight = false; break;
            }
        });

        // Pointer lock for mouse look
        document.body.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(delta) {
        // Placeholder for movement logic
        // This will be expanded in the next task
    }
}
