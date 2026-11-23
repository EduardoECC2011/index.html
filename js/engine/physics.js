/**
 * PhysicsEngine - Formula 1 Vehicle Dynamics & Track Collision
 * Simulates engine torque curves, 7-speed gearbox, downforce, lateral tire slip,
 * surface resistance (asphalt, curb/zebra, grass, gravel) and elastic collisions.
 */
class PhysicsEngine {
    constructor() {
        this.gravity = 9.81;
        this.airDensity = 1.225;
    }

    /**
     * Compute gear and RPM from speed
     * @param {number} kmh Current speed in km/h
     * @param {number} maxKmh Maximum possible speed
     * @returns {Object} { gear, rpmRatio, targetGear }
     */
    static calculateGearAndRpm(kmh, maxKmh) {
        // Gear top speed thresholds in km/h
        const gearTops = [
            0,
            maxKmh * 0.24,  // 1st gear: ~85 km/h
            maxKmh * 0.40,  // 2nd gear: ~140 km/h
            maxKmh * 0.56,  // 3rd gear: ~195 km/h
            maxKmh * 0.70,  // 4th gear: ~245 km/h
            maxKmh * 0.82,  // 5th gear: ~285 km/h
            maxKmh * 0.92,  // 6th gear: ~320 km/h
            maxKmh * 1.05   // 7th gear: ~365 km/h
        ];

        let gear = 1;
        while (gear < 7 && kmh > gearTops[gear]) {
            gear++;
        }

        const prevTop = gear === 1 ? 0 : gearTops[gear - 1];
        const currentTop = gearTops[gear];
        const range = currentTop - prevTop;
        const currentInGear = Math.max(0, kmh - prevTop);

        // RPM ratio from 0.2 (idle) to 1.0 (redline)
        const rpmRatio = Math.min(1.0, 0.25 + (currentInGear / Math.max(1, range)) * 0.75);

        return { gear, rpmRatio };
    }

    /**
     * Updates an individual car's physics for one frame
     */
    static updateCar(car, track, dt = 1) {
        // 1. Determine surface under car (4 tire sample points for ultra-realistic handling)
        const cosA = Math.cos(car.angle);
        const sinA = Math.sin(car.angle);

        // Tire offsets relative to car center
        const halfL = car.length * 0.45;
        const halfW = car.width * 0.5;

        // Front-left, front-right, rear-left, rear-right
        const fl = { x: car.x + cosA * halfL - sinA * -halfW, y: car.y + sinA * halfL + cosA * -halfW };
        const fr = { x: car.x + cosA * halfL - sinA * halfW,  y: car.y + sinA * halfL + cosA * halfW };
        const rl = { x: car.x - cosA * halfL - sinA * -halfW, y: car.y - sinA * halfL + cosA * -halfW };
        const rr = { x: car.x - cosA * halfL - sinA * halfW,  y: car.y - sinA * halfL + cosA * halfW };

        const flSurf = track.getSurfaceAt(fl.x, fl.y);
        const frSurf = track.getSurfaceAt(fr.x, fr.y);
        const rlSurf = track.getSurfaceAt(rl.x, rl.y);
        const rrSurf = track.getSurfaceAt(rr.x, rr.y);

        // Combined surface condition: require majority of wheels (>=3) off track to trigger grass penalty
        const surfaces = [flSurf, frSurf, rlSurf, rrSurf];
        const curbCount = surfaces.filter(s => s === 'curb').length;
        const grassCount = surfaces.filter(s => s === 'grass').length;
        const gravelCount = surfaces.filter(s => s === 'gravel').length;

        car.onCurb = curbCount > 0;
        // Only trigger off-track grass state if the car is genuinely and deeply off (>= 3 wheels)
        car.onGrass = grassCount >= 3;
        car.onGravel = gravelCount >= 2;

        let surfaceGrip = 1.0;
        let surfaceDrag = 0.0025;

        // Curbs offer high grip and allow aggressive apex attacking
        if (car.onCurb) {
            surfaceGrip = 0.98;
            surfaceDrag = 0.0025;
        }

        // Minor 1-2 wheel dips on edge have minimal drag and do NOT trigger dust
        if (grassCount === 1 || grassCount === 2) {
            surfaceGrip = 0.92;
            surfaceDrag = 0.0035;
        } else if (car.onGrass) {
            // Genuine off-track: mild deceleration and controllable steering
            surfaceGrip = 0.78;
            surfaceDrag = 0.007;
        }

        if (car.onGravel) {
            surfaceGrip = 0.65;
            surfaceDrag = 0.022;
        }

        // 2. Velocity decomposition (Forward & Lateral)
        const forwardVel = car.vx * cosA + car.vy * sinA;
        const lateralVel = -car.vx * sinA + car.vy * cosA;

        // Speed in km/h (1 unit/frame at 60fps ≈ 18 km/h)
        car.speed = forwardVel;
        car.kmh = Math.round(Math.abs(forwardVel) * 18);

        // Gear & RPM
        const gearInfo = this.calculateGearAndRpm(car.kmh, car.maxKmh);
        if (car.gear !== gearInfo.gear && forwardVel > 1) {
            if (car.isPlayer && window.soundManager) {
                window.soundManager.playGearShift();
            }
            if (window.particleSystem) {
                window.particleSystem.emitExhaustFlame(car.x - cosA * halfL, car.y - sinA * halfL, car.angle);
            }
        }
        car.gear = gearInfo.gear;
        car.rpm = gearInfo.rpmRatio;

        // 3. Driver Inputs (Throttle, Brake, Steering)
        let throttle = car.controls.throttle;
        let brake = car.controls.brake;
        let steer = car.controls.steer;

        // Aerodynamic downforce scales grip with speed
        const downforceFactor = 1.0 + (Math.abs(forwardVel) / 15) * car.downforce;
        const effectiveGrip = car.grip * surfaceGrip * downforceFactor;

        // Acceleration force (smooth power delivery even when dipping off track)
        if (throttle > 0) {
            const surfaceSpeedMult = car.onGrass ? 0.82 : (car.onGravel ? 0.65 : 1.0);
            const speedRatio = Math.abs(forwardVel) / (car.maxSpeed * surfaceSpeedMult);
            const availableAccel = car.acceleration * Math.max(0.1, 1 - Math.pow(speedRatio, 1.8));
            car.vx += cosA * availableAccel * throttle * dt;
            car.vy += sinA * availableAccel * throttle * dt;
        }

        // Braking / Reverse force
        if (brake > 0) {
            if (forwardVel > 0.4) {
                // Hard braking
                const brakeForce = car.brakingPower * brake * dt;
                car.vx -= cosA * brakeForce;
                car.vy -= sinA * brakeForce;
                if (car.isPlayer && window.soundManager && car.kmh > 40) {
                    window.soundManager.playBrakeSound(brake);
                }
            } else {
                // Controlled Reversing (capped at maxReverseSpeed)
                const maxRev = car.maxReverseSpeed || 3.5;
                if (forwardVel > -maxRev) {
                    const revForce = car.acceleration * 0.35 * brake * dt;
                    car.vx -= cosA * revForce;
                    car.vy -= sinA * revForce;
                }
            }
        }

        // 4. Steering and Yaw rate
        if (Math.abs(forwardVel) > 0.1) {
            // Steering responsiveness scales with speed (high-speed twitchiness capped by F1 downforce)
            const speedTurnFactor = Math.min(1.0, Math.abs(forwardVel) / 5.0) * (1.0 / (1.0 + Math.abs(forwardVel) * 0.025));
            const turnRate = car.handling * steer * speedTurnFactor * Math.sign(forwardVel);
            car.angle += turnRate * dt;
        }

        // 5. Tire lateral grip & drift physics
        // Dampen lateral velocity based on tire grip
        const maxLateralGrip = effectiveGrip * 0.85;
        const slip = Math.abs(lateralVel);
        car.slipIntensity = Math.min(1.0, slip / 4.0);

        // Apply lateral friction
        const latFriction = Math.min(slip, maxLateralGrip);
        const latFrictionDir = Math.sign(lateralVel);

        car.vx += sinA * latFriction * latFrictionDir * 0.35 * dt;
        car.vy -= cosA * latFriction * latFrictionDir * 0.35 * dt;

        // Apply rolling resistance & aerodynamic drag (always positive resistance opposing motion)
        const absFwd = Math.abs(forwardVel);
        const aeroDrag = 0.0012 * absFwd * absFwd;
        const totalDrag = Math.min(0.25, (surfaceDrag + aeroDrag) * dt);
        car.vx *= Math.max(0, 1 - totalDrag);
        car.vy *= Math.max(0, 1 - totalDrag);

        // Velocity Clamping & NaN Safeguard
        const maxAllowedSpeed = car.maxSpeed * 1.35;
        const currentSpeed = Math.hypot(car.vx, car.vy);
        if (currentSpeed > maxAllowedSpeed && currentSpeed > 0) {
            const scale = maxAllowedSpeed / currentSpeed;
            car.vx *= scale;
            car.vy *= scale;
        }

        // 6. Integrate Position
        const prevX = car.x;
        const prevY = car.y;
        car.x += car.vx * dt;
        car.y += car.vy * dt;

        // NaN / Infinity Recovery Safeguard
        if (!isFinite(car.x) || !isFinite(car.y) || !isFinite(car.vx) || !isFinite(car.vy)) {
            console.warn("Recovering car from invalid physics state");
            const safeSeg = track.segments[0];
            car.x = safeSeg.x;
            car.y = safeSeg.y;
            car.vx = 0;
            car.vy = 0;
            car.angle = Math.atan2(safeSeg.ty, safeSeg.tx);
        }

        // 7. Skid marks & Particles
        if (window.particleSystem) {
            // Tire skids when sliding or heavy braking
            if ((car.slipIntensity > 0.25 || (brake > 0.5 && car.kmh > 80)) && Math.abs(forwardVel) > 2) {
                // Rear tires skid
                window.particleSystem.addSkidMark(rl.x, rl.y, rl.x + car.vx * 0.5, rl.y + car.vy * 0.5, car.slipIntensity);
                window.particleSystem.addSkidMark(rr.x, rr.y, rr.x + car.vx * 0.5, rr.y + car.vy * 0.5, car.slipIntensity);
                window.particleSystem.emitSmoke(rl.x, rl.y, 1);
                window.particleSystem.emitSmoke(rr.x, rr.y, 1);
            }

            // Subtle dirt spray only when deeply in grass and at significant speed
            if (car.onGrass && car.kmh > 110 && Math.random() < 0.25) {
                window.particleSystem.emitDirt(rl.x, rl.y, false, 1);
            }
            if (car.onGravel && car.kmh > 80 && Math.random() < 0.3) {
                window.particleSystem.emitDirt(rl.x, rl.y, true, 1);
            }

            // Curb sparks
            if (car.onCurb && Math.abs(forwardVel) > 8 && Math.random() < 0.3) {
                window.particleSystem.emitSparks(car.x, car.y, car.angle, 3);
            }
        }

        // 8. Track boundary / barrier collisions
        track.resolveWallCollisions(car);
    }

    /**
     * Resolves elastic collision between two cars
     */
    static resolveCarCollision(carA, carB) {
        const dx = carB.x - carA.x;
        const dy = carB.y - carA.y;
        const dist = Math.hypot(dx, dy);
        const minDist = (carA.collisionRadius + carB.collisionRadius);

        if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate cars
            const overlap = (minDist - dist) * 0.5;
            carA.x -= nx * overlap;
            carA.y -= ny * overlap;
            carB.x += nx * overlap;
            carB.y += ny * overlap;

            // Relative velocity
            const rvx = carB.vx - carA.vx;
            const rvy = carB.vy - carA.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
                const restitution = 0.45; // slightly bouncy F1 carbon fiber bump
                const impulseMag = -(1 + restitution) * velAlongNormal / (carA.invMass + carB.invMass);

                const impX = impulseMag * nx;
                const impY = impulseMag * ny;

                carA.vx -= impX * carA.invMass;
                carA.vy -= impY * carA.invMass;
                carB.vx += impX * carB.invMass;
                carB.vy += impY * carB.invMass;

                // Sound & sparks
                const collisionSpeed = Math.abs(velAlongNormal);
                if (collisionSpeed > 1.5) {
                    if ((carA.isPlayer || carB.isPlayer) && window.soundManager) {
                        window.soundManager.playCrashSound(Math.min(1.0, collisionSpeed / 6));
                    }
                    if (window.particleSystem) {
                        const midX = (carA.x + carB.x) * 0.5;
                        const midY = (carA.y + carB.y) * 0.5;
                        window.particleSystem.emitSparks(midX, midY, Math.atan2(ny, nx), 6);
                    }
                }
            }
        }
    }
}

window.PhysicsEngine = PhysicsEngine;
