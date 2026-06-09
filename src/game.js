import * as THREE from 'three';

export class GameLoop {
    constructor(ui, player, scene) {
        this.ui = ui;
        this.player = player;
        this.scene = scene;
        
        // Match settings
        this.ROUND_DURATION = 120; // 2 minutes
        this.RESPAWN_TIME = 3.0;
        
        // Game state
        this.kills = 0;
        this.deaths = 0;
        this.timeLeft = this.ROUND_DURATION;
        this.isRoundActive = false;
        
        this.alphaSpawn = new THREE.Vector3(-35, 1.7, 0);
        this.bravoSpawn = new THREE.Vector3(35, 1.7, 0);
        
        this.init();
    }

    init() {
        console.log("Game Loop Initialized");
        this.setupEventListeners();
    }

    start() {
        this.isRoundActive = true;
        this.timeLeft = this.ROUND_DURATION;
        this.ui.updateScore(this.kills, this.deaths);
        this.ui.updateTimer(Math.ceil(this.timeLeft));
        
        // Position player at spawn
        this.player.yawObject.position.copy(this.alphaSpawn);
    }

    setupEventListeners() {
        window.addEventListener('enemy-killed', (e) => {
            if (!this.isRoundActive) return;
            this.kills++;
            this.ui.updateScore(this.kills, this.deaths);
            const weapon = e.detail.weapon || 'Weapon';
            this.showKillFeed(`Player [${weapon}] ${e.detail.name}`);
        });

        window.addEventListener('player-died', (e) => {
            if (!this.isRoundActive) return;
            this.deaths++;
            this.ui.updateScore(this.kills, this.deaths);
            const attacker = e.detail ? e.detail.attacker : 'Bot';
            const weapon = (e.detail && e.detail.weapon) ? e.detail.weapon : 'Weapon';
            this.showKillFeed(`${attacker} [${weapon}] Player`);
        });

        window.addEventListener('player-respawn-ready', () => {
            this.player.respawn(this.alphaSpawn);
        });
        
        window.addEventListener('bot-fired', (e) => {
            // Main.js or WeaponSystem could handle this visual, 
            // but let's just let WeaponSystem listen to it for tracers
        });
    }

    update(delta) {
        if (!this.isRoundActive) return;
        
        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.endRound();
        }
        
        this.ui.updateTimer(Math.ceil(this.timeLeft));
    }

    endRound() {
        this.isRoundActive = false;
        console.log("Round Ended!");
        alert(`Round Over! Final Score: Kills: ${this.kills} | Deaths: ${this.deaths}`);
        location.reload(); 
    }

    showKillFeed(message) {
        const feed = document.getElementById('kill-feed');
        if (feed) {
            const entry = document.createElement('div');
            entry.innerText = message;
            entry.style.background = 'rgba(0,0,0,0.5)';
            entry.style.padding = '5px';
            entry.style.marginBottom = '5px';
            feed.appendChild(entry);
            setTimeout(() => {
                if (entry.parentNode) feed.removeChild(entry);
            }, 3000);
        }
    }
}
