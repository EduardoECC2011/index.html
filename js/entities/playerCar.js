/**
 * PlayerCar - Human Controlled Formula 1 Racer
 * Handles keyboard input (WASD + Arrows), sound synthesizer hooks, and player telemetry.
 */
class PlayerCar extends Car {
    constructor(config = {}) {
        super({
            ...config,
            isPlayer: true
        });

        this.boostEnergy = 100;
        this.maxBoostEnergy = 100;
        this.boostDepleted = false;
    }

    updateInput() {
        const input = window.inputHandler;
        if (!input) return;

        // Throttle (W, ArrowUp)
        this.controls.throttle = input.keys.up ? 1.0 : 0;

        // Brake (S, ArrowDown)
        this.controls.brake = input.keys.down ? 1.0 : 0;

        // Steering (A/Left = -1, D/Right = +1)
        let steerVal = 0;
        if (input.keys.left) steerVal -= 1.0;
        if (input.keys.right) steerVal += 1.0;
        this.controls.steer = steerVal;

        // DRS / ERS Boost (Spacebar) - strictly depletes and turns off when empty
        if (input.keys.handbrake) {
            if (!this.boostDepleted && this.boostEnergy > 0) {
                this.controls.boost = true;
                this.boostEnergy = Math.max(0, this.boostEnergy - 0.65);
                // Extra acceleration kick
                this.vx += Math.cos(this.angle) * 0.09;
                this.vy += Math.sin(this.angle) * 0.09;
                if (window.particleSystem && Math.random() < 0.45) {
                    window.particleSystem.emitExhaustFlame(this.x - Math.cos(this.angle) * 20, this.y - Math.sin(this.angle) * 20, this.angle);
                }

                if (this.boostEnergy <= 0) {
                    this.boostEnergy = 0;
                    this.boostDepleted = true; // Locks out until spacebar is released and recharged
                    this.controls.boost = false;
                }
            } else {
                // Key held down but battery is empty: strictly NO boost and NO recharge!
                this.controls.boost = false;
            }
        } else {
            this.controls.boost = false;
            // Recharges battery ONLY when Spacebar is released
            if (this.boostEnergy < this.maxBoostEnergy) {
                this.boostEnergy = Math.min(this.maxBoostEnergy, this.boostEnergy + 0.2);
            }
            // Unlock boost once battery has recovered to at least 20%
            if (this.boostEnergy >= 20) {
                this.boostDepleted = false;
            }
        }

        // Synchronize with procedural Web Audio engine
        if (window.soundManager) {
            window.soundManager.updateEngine(this.rpm, this.controls.throttle, this.gear);
            window.soundManager.updateTireScreech(this.slipIntensity, Math.min(1.0, this.kmh / 250));
            window.soundManager.setCurbRumble(this.onCurb, Math.min(1.0, this.kmh / 220));
        }
    }
}

window.PlayerCar = PlayerCar;
