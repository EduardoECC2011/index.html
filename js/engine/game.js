/**
 * Game - Master Game Engine & Race Controller
 * Coordinates game states (Menu, Garage, Driver Select, Track Select, Countdown, Racing, Podium),
 * starting grid orchestration, AI competitors, camera tracking and audio loops.
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.camera = new Camera();
        this.hud = new HUD();

        // Game State: 'MENU', 'GARAGE', 'DRIVER_SELECT', 'TRACK_SELECT', 'SETTINGS', 'COUNTDOWN', 'RACING', 'PAUSED', 'PODIUM'
        this.state = 'MENU';

        // Player configuration
        this.selectedCarId = 'scuderia';
        this.selectedDriverId = 'ayrton_s';
        this.selectedTrackId = 'monza';
        this.selectedLaps = 3;

        this.customPaint = '#e10600';
        this.customSecondary = '#111111';
        this.customRim = 'spoke';
        this.customTire = 'soft';
        this.customEngine = 'v10_screamer';

        // Video / Visual settings
        this.crtFilter = true;
        this.pixelSmoothing = false;
        this.cameraZoom = 1.2;

        // Current race entities
        this.track = null;
        this.playerCar = null;
        this.aiCars = [];
        this.allCars = [];

        // Countdown timer
        this.countdownActive = false;
        this.countdownPhase = 0; // 0: ready, 1-5: red lights, 6: GO
        this.countdownTimer = null;

        // Timing
        this.lastTime = 0;
        this.raceStartTime = 0;

        // Garage 360 preview angle
        this.garageCarAngle = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Setup default track
        this.track = new Track(window.TRACK_DATABASE[0]);

        // Start music on first interaction
        window.addEventListener('click', () => {
            if (this.state === 'MENU' && window.musicSynth && !window.musicSynth.isPlaying) {
                window.musicSynth.playTrack('menu');
            }
        }, { once: true });

        // Start requestAnimationFrame loop
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = this.pixelSmoothing;
    }

    // --- State Transitions ---
    setState(newState) {
        const prevState = this.state;
        this.state = newState;

        const pauseModal = document.getElementById('screen-pause');

        if (newState === 'PAUSED') {
            if (pauseModal) pauseModal.classList.remove('hidden');
            if (window.soundManager) window.soundManager.stopEngine();
        } else if (prevState === 'PAUSED' && newState !== 'PAUSED') {
            if (pauseModal) pauseModal.classList.add('hidden');
            if (newState === 'RACING' && window.soundManager) {
                window.soundManager.startEngine();
            }
        }

        if (newState === 'MENU') {
            if (pauseModal) pauseModal.classList.add('hidden');
            if (window.soundManager) window.soundManager.stopEngine();
            if (window.musicSynth) window.musicSynth.playTrack('menu');
        } else if (newState === 'PODIUM') {
            if (pauseModal) pauseModal.classList.add('hidden');
            if (window.soundManager) window.soundManager.stopEngine();
            if (window.musicSynth) window.musicSynth.playTrack('victory');
        }
    }

    togglePause() {
        if (this.state === 'RACING' || this.state === 'COUNTDOWN') {
            this.setState('PAUSED');
        } else if (this.state === 'PAUSED') {
            this.setState('RACING');
        }
    }

    // --- Start Race & Starting Grid Setup ---
    startRace(trackId = null) {
        if (trackId) this.selectedTrackId = trackId;

        const trackData = window.TRACK_DATABASE.find(t => t.id === this.selectedTrackId) || window.TRACK_DATABASE[0];
        this.track = new Track(trackData);
        if (this.selectedLaps) {
            this.track.totalLaps = this.selectedLaps;
        }

        // Fetch selected driver & chassis
        const driverData = window.DRIVERS_DATABASE.find(d => d.id === this.selectedDriverId) || window.DRIVERS_DATABASE[0];
        const carData = window.CARS_DATABASE.find(c => c.id === this.selectedCarId) || window.CARS_DATABASE[0];
        const tireData = window.UPGRADES_DATABASE.tires.find(t => t.id === this.customTire);
        const engineData = window.UPGRADES_DATABASE.engines.find(e => e.id === this.customEngine);

        // 1. Instantiate Player Car with Custom Upgrades & Driver Perks
        const playerConfig = {
            ...carData.physics,
            name: driverData.name,
            driverNumber: driverData.number,
            primaryColor: this.customPaint,
            secondaryColor: this.customSecondary,
            accentColor: carData.accentColor,
            helmetColor: driverData.helmetColor,
            rimType: this.customRim,
            tireCompound: this.customTire,
            carModelId: this.selectedCarId
        };

        // Apply Upgrade Modifiers
        if (tireData && tireData.modifiers) {
            if (tireData.modifiers.grip) playerConfig.grip *= tireData.modifiers.grip;
            if (tireData.modifiers.maxSpeed) playerConfig.maxKmh *= tireData.modifiers.maxSpeed;
        }
        if (engineData && engineData.modifiers) {
            if (engineData.modifiers.acceleration) playerConfig.acceleration *= engineData.modifiers.acceleration;
            if (engineData.modifiers.maxKmh) playerConfig.maxKmh += engineData.modifiers.maxKmh;
        }

        // Apply Driver Perk Modifiers
        if (driverData.perkModifier) {
            for (let prop in driverData.perkModifier) {
                if (playerConfig[prop]) playerConfig[prop] *= driverData.perkModifier[prop];
            }
        }

        this.playerCar = new PlayerCar(playerConfig);
        this.playerCar.resetPosition(this.track.gridSlots[0]); // Pole Position!

        // 2. Generate 7 AI Competitors from other drivers
        this.aiCars = [];
        const otherDrivers = window.DRIVERS_DATABASE.filter(d => d.id !== this.selectedDriverId);
        const chassisList = window.CARS_DATABASE;

        for (let i = 0; i < 7; i++) {
            const aiDriver = otherDrivers[i % otherDrivers.length];
            const aiChassis = chassisList[(i + 1) % chassisList.length];

            const aiCar = new AICar({
                ...aiChassis.physics,
                name: aiDriver.name,
                driverNumber: aiDriver.number,
                primaryColor: aiChassis.primaryColor,
                secondaryColor: aiChassis.secondaryColor,
                accentColor: aiChassis.accentColor,
                helmetColor: aiDriver.helmetColor,
                rimType: 'spoke',
                tireCompound: 'medium',
                carModelId: aiChassis.id,
                skill: 0.82 + (i * 0.025), // varied competitor skills
                aggressiveness: 0.7 + (Math.random() * 0.3)
            });

            aiCar.resetPosition(this.track.gridSlots[i + 1]);
            this.aiCars.push(aiCar);
        }

        this.allCars = [this.playerCar, ...this.aiCars];

        // Reset particle and skid mark systems
        if (window.particleSystem) {
            window.particleSystem.reset();
        }

        // Focus and immediately align camera with player car
        this.camera.reset(this.playerCar);
        this.camera.baseZoom = this.cameraZoom;

        // Switch to COUNTDOWN state
        this.setState('COUNTDOWN');
        this.startCountdownSequence();

        // Start track-specific background music
        if (window.musicSynth) {
            window.musicSynth.playTrack(this.track.themeMusic);
        }
    }

    startCountdownSequence() {
        this.countdownActive = true;
        this.countdownPhase = 0;

        // Start engine idle sound for player
        if (window.soundManager) {
            window.soundManager.startEngine();
            window.soundManager.updateEngine(0.35, 0, 1);
        }

        let step = 0;
        const interval = setInterval(() => {
            step++;
            this.countdownPhase = step;

            if (step <= 5) {
                // Red light on
                if (window.soundManager) window.soundManager.playCountdownBeep(false);
            } else if (step === 6) {
                // LIGHTS OUT AND AWAY WE GO!
                if (window.soundManager) window.soundManager.playCountdownBeep(true);
                clearInterval(interval);
                this.raceStartTime = performance.now();
                this.playerCar.lapStartTime = this.raceStartTime;
                this.aiCars.forEach(ai => ai.lapStartTime = this.raceStartTime);

                // Allow 0.8s for green flash before hiding gantry
                setTimeout(() => {
                    this.countdownActive = false;
                    this.setState('RACING');
                }, 800);
            }
        }, 900);
    }

    // --- Main Game Loop ---
    loop(currentTime) {
        const dt = Math.min(2.0, (currentTime - this.lastTime) / 16.666) || 1.0;
        this.lastTime = currentTime;

        // Handle Escape / Pause key
        if (window.inputHandler && window.inputHandler.justPressed.pause) {
            this.togglePause();
        }

        // Quick Reset (Key R)
        if (window.inputHandler && window.inputHandler.justPressed.reset && this.state === 'RACING') {
            const seg = this.track.findClosestSegment(this.playerCar.x, this.playerCar.y, this.playerCar.currentSegmentIndex);
            this.playerCar.x = seg.x;
            this.playerCar.y = seg.y;
            this.playerCar.vx = 0;
            this.playerCar.vy = 0;
            this.playerCar.angle = Math.atan2(seg.ty, seg.tx);
            this.camera.reset(this.playerCar);
        }

        // Clear canvas
        this.ctx.fillStyle = '#10141a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // State-specific updates and renders
        if (this.state === 'RACING' || this.state === 'COUNTDOWN' || this.state === 'PAUSED' || this.state === 'PODIUM') {
            this.updateRace(dt, currentTime);
            this.renderRace();
        } else if (this.state === 'GARAGE') {
            this.renderGaragePreview(dt);
        }

        // Clear input one-shot triggers
        if (window.inputHandler) {
            window.inputHandler.endFrame();
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    updateRace(dt, currentTime) {
        if (this.state === 'PAUSED') return;

        const isControlsLocked = (this.state === 'COUNTDOWN' && this.countdownPhase < 6);

        // 1. Update Player Inputs
        if (!isControlsLocked) {
            this.playerCar.updateInput();
        } else {
            // Revving engine on grid
            if (window.inputHandler && window.inputHandler.keys.up) {
                this.playerCar.rpm = Math.min(1.0, this.playerCar.rpm + 0.05);
                if (window.soundManager) window.soundManager.updateEngine(this.playerCar.rpm, 1, 1);
            } else {
                this.playerCar.rpm = Math.max(0.3, this.playerCar.rpm - 0.03);
                if (window.soundManager) window.soundManager.updateEngine(this.playerCar.rpm, 0, 1);
            }
        }

        // 2. Update AI Opponents
        if (!isControlsLocked) {
            this.aiCars.forEach(ai => ai.updateAI(this.track, this.allCars));
        }

        // 3. Update Physics & Lap Timings for All Cars
        this.allCars.forEach(car => {
            if (!isControlsLocked) {
                PhysicsEngine.updateCar(car, this.track, dt);
                car.updateLapTiming(this.track, currentTime);
            }
        });

        // 4. Car-to-Car Collisions
        for (let i = 0; i < this.allCars.length; i++) {
            for (let j = i + 1; j < this.allCars.length; j++) {
                PhysicsEngine.resolveCarCollision(this.allCars[i], this.allCars[j]);
            }
        }

        // 5. Update Real-Time Positions
        this.updateRacePositions();

        // 6. Update Particles
        if (window.particleSystem) {
            window.particleSystem.update(dt);
        }

        // 7. Update Camera
        this.camera.update(this.playerCar, dt);

        // 8. Screen shake on curb / bump
        if (this.playerCar.onCurb && this.playerCar.kmh > 120) {
            this.camera.addShake(1.5, 0.05);
        }

        // 9. Check Race Finish Condition
        if (this.playerCar.raceFinished && this.state === 'RACING') {
            setTimeout(() => {
                this.setState('PODIUM');
                if (window.menuController) {
                    window.menuController.showPodium(this.allCars);
                }
            }, 1200);
        }
    }

    updateRacePositions() {
        // Sort cars by total distance along track
        const sorted = [...this.allCars].sort((a, b) => {
            if (a.raceFinished && !b.raceFinished) return -1;
            if (!a.raceFinished && b.raceFinished) return 1;
            if (a.raceFinished && b.raceFinished) return a.finishTime - b.finishTime;
            return b.distanceAlongTrack - a.distanceAlongTrack;
        });

        sorted.forEach((car, index) => {
            car.racePosition = index + 1;
        });
    }

    renderRace() {
        // 1. Camera World Transformation
        this.camera.apply(this.ctx);

        // 2. Draw Track Surface, Curbs, and Runoffs
        this.track.render(this.ctx, this.camera);

        // 3. Draw Persistent Tire Skid Marks
        if (window.particleSystem) {
            window.particleSystem.drawSkidMarks(this.ctx, this.camera);
        }

        // 4. Draw All Cars (Opponents & Player)
        this.allCars.forEach(car => car.render(this.ctx));

        // 5. Draw Particles (Smoke, Dirt, Sparks, Flames)
        if (window.particleSystem) {
            window.particleSystem.drawParticles(this.ctx);
        }

        this.camera.restore(this.ctx);

        // 6. Render Screen-Space HUD & Telemetry
        this.hud.render(this.ctx, this.playerCar, this.allCars, this.track, {
            countdownActive: this.countdownActive,
            countdownPhase: this.countdownPhase
        });
    }

    // --- Garage 360 Rotating Car Preview ---
    renderGaragePreview(dt) {
        const cx = this.canvas.width * 0.65;
        const cy = this.canvas.height * 0.5;

        this.garageCarAngle += 0.015 * dt;

        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Spotlight circle on floor
        const grad = this.ctx.createRadialGradient(0, 0, 40, 0, 0, 180);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 180, 0, Math.PI * 2);
        this.ctx.fill();

        // Rotating Pedestal
        this.ctx.strokeStyle = '#e10600';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 130, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.scale(2.4, 2.4); // 2.4x enlarged pixel art car in garage
        this.ctx.rotate(this.garageCarAngle);

        // Create temporary preview car
        if (!this.previewCar) {
            this.previewCar = new Car();
        }
        this.previewCar.x = 0;
        this.previewCar.y = 0;
        this.previewCar.angle = 0;
        this.previewCar.primaryColor = this.customPaint;
        this.previewCar.secondaryColor = this.customSecondary;
        this.previewCar.rimType = this.customRim;
        this.previewCar.tireCompound = this.customTire;

        this.previewCar.render(this.ctx);

        this.ctx.restore();
    }
}

// Global Game instance
window.game = new Game();
