import * as THREE from 'three';
import { Player } from './player.js';
import { Map } from './map.js';
import { UI } from './ui.js';
import { WeaponSystem } from './weapons.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.Fog(0x111111, 0, 100);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        
        this.init();
    }

    async init() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(20, 50, 20);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Add a second light for better coverage
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-20, 30, -20);
        this.scene.add(fillLight);

        // Systems
        this.ui = new UI();
        this.map = new Map(this.scene);
        this.weapons = new WeaponSystem(this.scene, this.camera, this.ui);
        this.player = new Player(this.camera, this.scene, this.weapons);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.player) this.player.update(delta);
        if (this.weapons) this.weapons.update(delta);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
