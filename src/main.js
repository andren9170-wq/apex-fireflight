import * as THREE from 'three';
import { Player } from './player.js';
import { Map } from './map.js';
import { UI } from './ui.js';
import { WeaponSystem } from './weapons.js';
import { Bot } from './bot.js';
import { GameLoop } from './game.js';

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

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-20, 30, -20);
        this.scene.add(fillLight);

        // Systems
        this.ui = new UI();
        this.map = new Map(this.scene);
        this.weapons = new WeaponSystem(this.scene, this.camera, this.ui);
        this.player = new Player(this.camera, this.scene, this.weapons, this.ui);
        this.gameLoop = new GameLoop(this.ui, this.player, this.scene);

        // Bots
        this.bots = [];
        this.spawnBots(3);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start game
        this.gameLoop.start();

        this.animate();
    }

    spawnBots(count) {
        for (let i = 0; i < count; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 40
            );
            const bot = new Bot(this.scene, this.player, pos);
            this.bots.push(bot);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.gameLoop) this.gameLoop.update(delta);
        if (this.player) this.player.update(delta);
        if (this.weapons) this.weapons.update(delta);
        
        const playerPos = this.player ? this.player.yawObject.position : new THREE.Vector3();
        this.bots.forEach(bot => bot.update(delta, playerPos));
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
