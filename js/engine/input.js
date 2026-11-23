/**
 * InputHandler - Manages keyboard (WASD + Arrow Keys), gamepad, and touch controls.
 */
class InputHandler {
    constructor() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            handbrake: false,
            pause: false,
            reset: false
        };

        this.justPressed = {
            pause: false,
            reset: false
        };

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            // Unlock audio context on any user interaction
            if (window.soundManager) {
                window.soundManager.resume();
            }

            const code = e.code;
            let prevent = false;

            // Accelerate: W, ArrowUp
            if (code === 'KeyW' || code === 'ArrowUp') {
                this.keys.up = true;
                prevent = true;
            }
            // Brake / Reverse: S, ArrowDown
            if (code === 'KeyS' || code === 'ArrowDown') {
                this.keys.down = true;
                prevent = true;
            }
            // Steer Left: A, ArrowLeft
            if (code === 'KeyA' || code === 'ArrowLeft') {
                this.keys.left = true;
                prevent = true;
            }
            // Steer Right: D, ArrowRight
            if (code === 'KeyD' || code === 'ArrowRight') {
                this.keys.right = true;
                prevent = true;
            }
            // Handbrake / DRS / Boost: Space
            if (code === 'Space') {
                this.keys.handbrake = true;
                prevent = true;
            }
            // Pause: Escape, KeyP
            if (code === 'Escape' || code === 'KeyP') {
                if (!this.keys.pause) {
                    this.justPressed.pause = true;
                }
                this.keys.pause = true;
                prevent = true;
            }
            // Quick Reset: KeyR
            if (code === 'KeyR') {
                if (!this.keys.reset) {
                    this.justPressed.reset = true;
                }
                this.keys.reset = true;
                prevent = true;
            }

            if (prevent) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;

            if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
            if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
            if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
            if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
            if (code === 'Space') this.keys.handbrake = false;
            if (code === 'Escape' || code === 'KeyP') this.keys.pause = false;
            if (code === 'KeyR') this.keys.reset = false;
        });

        // Window blur safety
        window.addEventListener('blur', () => {
            this.reset();
        });
    }

    reset() {
        for (let k in this.keys) {
            this.keys[k] = false;
        }
        for (let k in this.justPressed) {
            this.justPressed[k] = false;
        }
    }

    // Call at the end of each game frame to clear one-shot triggers
    endFrame() {
        this.justPressed.pause = false;
        this.justPressed.reset = false;
    }
}

// Global input instance
window.inputHandler = new InputHandler();
