export class UI {
    constructor() {
        this.healthElement = document.getElementById('health');
        this.ammoElement = document.getElementById('ammo');
        this.weaponNameElement = document.getElementById('weapon-name');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.uiLayer = document.getElementById('ui-layer');
        
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

    showDamageNumber(point, amount, camera) {
        // Simple screen-space damage number
        const vector = point.clone().project(camera);
        
        const x = (vector.x * .5 + 0.5) * window.innerWidth;
        const y = (vector.y * -.5 + 0.5) * window.innerHeight;

        const damageEl = document.createElement('div');
        damageEl.innerText = amount;
        damageEl.style.position = 'absolute';
        damageEl.style.left = `${x}px`;
        damageEl.style.top = `${y}px`;
        damageEl.style.color = '#ffff00';
        damageEl.style.fontSize = '20px';
        damageEl.style.fontWeight = 'bold';
        damageEl.style.pointerEvents = 'none';
        damageEl.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        
        this.uiLayer.appendChild(damageEl);

        requestAnimationFrame(() => {
            damageEl.style.transform = 'translateY(-50px)';
            damageEl.style.opacity = '0';
        });

        setTimeout(() => {
            if (damageEl.parentNode) this.uiLayer.removeChild(damageEl);
        }, 500);
    }
}
