export class UI {
    constructor() {
        this.healthElement = document.getElementById('health');
        this.ammoElement = document.getElementById('ammo');
        this.weaponNameElement = document.getElementById('weapon-name');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        
        this.init();
    }

    init() {
        console.log("UI System Initialized");
    }

    updateHealth(health) {
        if (this.healthElement) {
            this.healthElement.innerText = `HP: ${health}`;
        }
    }

    updateAmmo(current, total) {
        if (this.ammoElement) {
            this.ammoElement.innerText = `AMMO: ${current}/${total}`;
        }
    }

    updateWeaponName(name) {
        if (this.weaponNameElement) {
            this.weaponNameElement.innerText = name;
        }
    }

    updateScore(kills, deaths) {
        if (this.scoreElement) {
            this.scoreElement.innerText = `K: ${kills} | D: ${deaths}`;
        }
    }

    updateTimer(seconds) {
        if (this.timerElement) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            this.timerElement.innerText = `Time: ${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
}
