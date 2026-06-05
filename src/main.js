import * as THREE from 'three';
import { Player } from './player.js';
import { Map } from './map.js';
import { UI } from './ui.js';
import { WeaponSystem } from './weapons.js';
import { Bot } from './bot.js';

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
        
        // Game State
        this.kills = 0;
        this.deaths = 0;
        this.roundTime = 120; // 2 minutes
        this.isRoundActive = true;
        
        this.initEventListeners();
        this.init();
    }

    initEventListeners() {
        window.addEventListener('enemy-killed', (e) => {
            this.kills++;
            this.ui.updateScore(this.kills, this.deaths);
            console.log(`Enemy Killed! Total Kills: ${this.kills}`);
        });

        window.addEventListener('player-died', () => {
            this.deaths++;
            this.ui.updateScore(this.kills, this.deaths);
            console.log(`Player Died! Total Deaths: ${this.deaths}`);
        });
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
        this.player = new Player(this.camera, this.scene, this.weapons, this.ui);

        // Bots
        this.bots = [];
        this.spawnBots(5);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

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
        
        if (this.isRoundActive) {
            this.roundTime -= delta;
            if (this.roundTime <= 0) {
                this.roundTime = 0;
                this.isRoundActive = false;
                this.endRound();
            }
            this.ui.updateTimer(Math.ceil(this.roundTime));
        }
        
        if (this.player) this.player.update(delta);
        if (this.weapons) this.weapons.update(delta);
        
        const playerPos = this.player ? this.player.yawObject.position : new THREE.Vector3();
        this.bots.forEach(bot => bot.update(delta, playerPos));
        
        // Filter out dead bots
        this.bots = this.bots.filter(bot => !bot.isDead);
        // Respawn bots if needed
        if (this.bots.length < 5) {
            this.spawnBots(1);
        }

        this.renderer.render(this.scene, this.camera);
    }

    endRound() {
        console.log("Round Ended!");
        alert(`Round Over! Final Score: K: ${this.kills} | D: ${this.deaths}`);
        // Reset or something
        location.reload(); 
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
