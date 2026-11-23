/**
 * Car - Base Formula 1 Vehicle Entity
 * High quality retro pixel-art rendering with open wheels, wings, cockpit helmet,
 * aerodynamic telemetry, and lap timing.
 */
class Car {
    constructor(config = {}) {
        this.id = config.id || 'car_' + Math.random().toString(36).substr(2, 9);
        this.name = config.name || 'Formula 1 Racer';
        this.isPlayer = config.isPlayer || false;

        // Position & Kinematics
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.vx = 0;
        this.vy = 0;
        this.angle = config.angle || 0;
        this.speed = 0;
        this.kmh = 0;
        this.gear = 1;
        this.rpm = 0.2;
        this.slipIntensity = 0;

        // Dimensions & Hitbox
        this.length = 46;
        this.width = 24;
        this.collisionRadius = 18;
        this.mass = config.mass || 740; // kg
        this.invMass = 1 / this.mass;

        // Base Performance Attributes (Adjustable by chassis & upgrades)
        this.maxKmh = config.maxKmh || 340;
        this.maxSpeed = this.maxKmh / 18; // units/frame
        this.maxReverseSpeed = 3.5;
        this.acceleration = config.acceleration || 0.17;
        this.brakingPower = config.brakingPower || 0.35;
        this.handling = config.handling || 0.055;
        this.grip = config.grip || 0.95;
        this.downforce = config.downforce || 0.85;

        // Surface states
        this.onCurb = false;
        this.onGrass = false;
        this.onGravel = false;

        // Cosmetic / Customization
        this.primaryColor = config.primaryColor || '#e10600'; // Ferrari / Scuderia Red
        this.secondaryColor = config.secondaryColor || '#111111';
        this.accentColor = config.accentColor || '#ffffff';
        this.rimType = config.rimType || 'spoke'; // spoke, turbofan, gold_mesh, star
        this.tireCompound = config.tireCompound || 'soft'; // soft, medium, hard, wet
        this.carModelId = config.carModelId || 'scuderia';
        this.driverNumber = config.driverNumber || 16;
        this.helmetColor = config.helmetColor || '#ffff00';

        // Timing & Lap Progress
        this.currentLap = 1;
        this.lapStartTime = 0;
        this.currentLapTime = 0;
        this.bestLapTime = Infinity;
        this.lastLapTime = 0;
        this.passedSector1 = false;
        this.passedSector2 = false;
        this.raceFinished = false;
        this.finishTime = 0;
        this.lapTimes = [];
        this.racePosition = 1;
        this.distanceAlongTrack = 0;
        this.currentSegmentIndex = 0;

        // Controls input buffer
        this.controls = {
            throttle: 0,
            brake: 0,
            steer: 0,
            boost: false
        };

        // Animation counters
        this.wheelSpin = 0;
    }

    resetPosition(slot) {
        this.x = slot.x;
        this.y = slot.y;
        this.vx = 0;
        this.vy = 0;
        this.angle = slot.angle;
        this.speed = 0;
        this.kmh = 0;
        this.gear = 1;
        this.rpm = 0.2;
        this.slipIntensity = 0;
        this.currentLap = 1;
        this.lapStartTime = performance.now();
        this.currentLapTime = 0;
        this.passedSector1 = false;
        this.passedSector2 = false;
        this.raceFinished = false;
        this.finishTime = 0;
        this.lapTimes = [];
    }

    updateLapTiming(track, currentTime) {
        if (this.raceFinished) return;

        const seg = track.findClosestSegment(this.x, this.y, this.currentSegmentIndex);
        this.currentSegmentIndex = seg.index;
        this.distanceAlongTrack = (this.currentLap - 1) * track.totalLength + seg.distStart;

        // Checkpoint Sector 1
        if (seg.index >= track.sector1Index && !this.passedSector1) {
            this.passedSector1 = true;
        }

        // Checkpoint Sector 2
        if (seg.index >= track.sector2Index && this.passedSector1 && !this.passedSector2) {
            this.passedSector2 = true;
        }

        // Finish Line Crossing (Segment 0)
        if (seg.index < 10 && this.passedSector1 && this.passedSector2) {
            const lapTime = (currentTime - this.lapStartTime) / 1000;
            this.lastLapTime = lapTime;
            this.lapTimes.push(lapTime);

            if (lapTime < this.bestLapTime) {
                this.bestLapTime = lapTime;
            }

            if (this.isPlayer && window.soundManager) {
                window.soundManager.playLapChime();
            }

            this.passedSector1 = false;
            this.passedSector2 = false;
            this.lapStartTime = currentTime;

            if (this.currentLap >= track.totalLaps) {
                this.raceFinished = true;
                this.finishTime = currentTime;
            } else {
                this.currentLap++;
            }
        }

        this.currentLapTime = (currentTime - this.lapStartTime) / 1000;
    }

    /**
     * Render the F1 car in authentic 2D top-down pixel art style
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 1. Drop Shadow under car
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(-22, -11, 44, 22, 6);
        ctx.fill();

        // 2. Open Wheels (4 tires with rims & compound stripe)
        this.renderWheels(ctx);

        // 3. F1 Aerodynamic Wings & Suspension Arms
        this.renderChassis(ctx);

        // 4. Cockpit, Driver Helmet & Halo
        this.renderCockpit(ctx);

        ctx.restore();
    }

    renderWheels(ctx) {
        const halfL = 16;
        const halfW = 12;
        const tireW = 11;
        const tireH = 6;

        // Determine compound color stripe
        let stripeColor = '#e10600'; // Soft (Red)
        if (this.tireCompound === 'medium') stripeColor = '#f5c518'; // Medium (Yellow)
        if (this.tireCompound === 'hard') stripeColor = '#ffffff';   // Hard (White)
        if (this.tireCompound === 'wet') stripeColor = '#0088cc';    // Wet (Blue)

        // Steer angle for front wheels
        const frontSteerAngle = this.controls.steer * 0.35;

        // Wheel positions: Front-Left, Front-Right, Rear-Left, Rear-Right
        const wheels = [
            { x: halfL - 1, y: -halfW, isFront: true },
            { x: halfL - 1, y: halfW, isFront: true },
            { x: -halfL + 2, y: -halfW, isFront: false },
            { x: -halfL + 2, y: halfW, isFront: false }
        ];

        wheels.forEach(w => {
            ctx.save();
            ctx.translate(w.x, w.y);
            if (w.isFront) {
                ctx.rotate(frontSteerAngle);
            }

            // Black rubber tire
            ctx.fillStyle = '#1c1c1f';
            ctx.fillRect(-tireW * 0.5, -tireH * 0.5, tireW, tireH);

            // Compound side stripe
            ctx.fillStyle = stripeColor;
            ctx.fillRect(-tireW * 0.3, -tireH * 0.5, tireW * 0.6, 1.2);
            ctx.fillRect(-tireW * 0.3, tireH * 0.5 - 1.2, tireW * 0.6, 1.2);

            // Wheel Rim
            this.renderRim(ctx, tireW, tireH);

            ctx.restore();
        });

        // Carbon fiber suspension wishbones
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1.5;
        // Front wishbones
        ctx.beginPath();
        ctx.moveTo(halfL - 2, 0);
        ctx.lineTo(halfL - 1, -halfW);
        ctx.moveTo(halfL - 2, 0);
        ctx.lineTo(halfL - 1, halfW);
        // Rear wishbones
        ctx.moveTo(-halfL + 3, 0);
        ctx.lineTo(-halfL + 2, -halfW);
        ctx.moveTo(-halfL + 3, 0);
        ctx.lineTo(-halfL + 2, halfW);
        ctx.stroke();
    }

    renderRim(ctx, tireW, tireH) {
        let rimColor = '#444444';
        if (this.rimType === 'gold_mesh') rimColor = '#d4af37';
        if (this.rimType === 'turbofan') rimColor = '#e0e0e0';
        if (this.rimType === 'star') rimColor = '#999999';

        ctx.fillStyle = rimColor;
        ctx.fillRect(-2, -1.5, 4, 3);

        // Center wheel nut
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(-0.8, -0.8, 1.6, 1.6);
    }

    renderChassis(ctx) {
        // 1. Front Wing (Wide aerodynamic profile)
        ctx.fillStyle = this.secondaryColor;
        ctx.fillRect(17, -13, 5, 26); // main wing element
        ctx.fillStyle = this.accentColor;
        ctx.fillRect(20, -13, 2, 26); // wing flap
        // Endplates
        ctx.fillStyle = this.primaryColor;
        ctx.fillRect(16, -14, 6, 2);
        ctx.fillRect(16, 12, 6, 2);

        // 2. Rear Wing (High downforce wing)
        ctx.fillStyle = this.secondaryColor;
        ctx.fillRect(-21, -12, 5, 24);
        ctx.fillStyle = this.accentColor;
        ctx.fillRect(-22, -12, 2, 24); // DRS flap
        // Rear Endplates
        ctx.fillStyle = this.primaryColor;
        ctx.fillRect(-23, -13, 7, 2);
        ctx.fillRect(-23, 11, 7, 2);

        // 3. Main Monocoque Chassis & Nose Cone
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        // Nose tip
        ctx.moveTo(22, 0);
        ctx.lineTo(15, -3.5);
        ctx.lineTo(5, -4);
        // Sidepod air intake widening
        ctx.lineTo(-2, -9);
        ctx.lineTo(-14, -9);
        // Engine cover narrowing to rear
        ctx.lineTo(-19, -4.5);
        ctx.lineTo(-19, 4.5);
        ctx.lineTo(-14, 9);
        ctx.lineTo(-2, 9);
        ctx.lineTo(5, 4);
        ctx.lineTo(15, 3.5);
        ctx.closePath();
        ctx.fill();

        // 4. Sidepod Aerodynamic Louvres & Intake Ducts
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(-2, -8, 4, 2); // left radiator intake
        ctx.fillRect(-2, 6, 4, 2);  // right radiator intake

        // 5. Engine Fin / Shark Fin
        ctx.fillStyle = this.secondaryColor;
        ctx.fillRect(-16, -1, 10, 2);

        // 6. Driver Number on Nose
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.driverNumber.toString(), 11, 0);
    }

    renderCockpit(ctx) {
        // Cockpit opening
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(1, 0, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Driver Helmet
        ctx.fillStyle = this.helmetColor;
        ctx.beginPath();
        ctx.arc(1.5, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Helmet Visor
        ctx.fillStyle = '#050505';
        ctx.fillRect(2.5, -1.2, 1.2, 2.4);

        // Halo Safety Device
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(1, -3);
        ctx.moveTo(5, 0);
        ctx.lineTo(1, 3);
        ctx.stroke();
    }
}

window.Car = Car;
