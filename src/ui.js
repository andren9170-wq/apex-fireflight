export class UI {
    constructor() {
        this.healthElement = document.getElementById('health');
        this.ammoElement = document.getElementById('ammo');
        
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
}
