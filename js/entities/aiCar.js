/**
 * AICar - Intelligent Formula 1 Artificial Intelligence Opponent
 * Follows dynamic racing lines, brakes realistically before corners,
 * avoids collisions, slipstreams and overtakes.
 */
class AICar extends Car {
    constructor(config = {}) {
        super({
            ...config,
            isPlayer: false
        });

        this.targetSpeed = 260; // target km/h
        this.lookaheadDist = 180;
        this.racingLineOffset = (Math.random() - 0.5) * 110; // wide track lane distribution
        this.aggressiveness = config.aggressiveness || (0.7 + Math.random() * 0.3);
        this.skill = config.skill || (0.8 + Math.random() * 0.2);
    }

    updateAI(track, allCars) {
        if (this.raceFinished) {
            this.controls.throttle = 0.3;
            this.controls.brake = 0.2;
            this.controls.steer = 0;
            return;
        }

        const totalSegs = track.segments.length;
        const currentSeg = track.findClosestSegment(this.x, this.y, this.currentSegmentIndex);
        this.currentSegmentIndex = currentSeg.index;

        // 1. Dynamic Lookahead Target based on current speed
        const speedRatio = Math.max(0.2, this.kmh / 320);
        const lookaheadSteps = Math.max(8, Math.floor(22 * speedRatio));
        const targetSegIndex = (currentSeg.index + lookaheadSteps) % totalSegs;
        const targetSeg = track.segments[targetSegIndex];

        // 2. Corner Curvature Detection & Target Cornering Speed
        // Check curvature 20-30 steps ahead to brake before entry
        const farSegIndex = (currentSeg.index + Math.floor(28 * speedRatio)) % totalSegs;
        const farSeg = track.segments[farSegIndex];
        const upcomingTargetKmh = farSeg.targetSpeed * this.skill;

        // 3. Collision avoidance & Overtaking Offset
        let avoidOffset = 0;
        let emergencyBrake = false;

        for (let i = 0; i < allCars.length; i++) {
            const other = allCars[i];
            if (other === this) continue;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.hypot(dx, dy);

            // Car is in front of us
            const toOtherAngle = Math.atan2(dy, dx);
            let angleDiff = toOtherAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            if (dist < 140 && Math.abs(angleDiff) < 0.65) {
                // Too close behind: overtake along open side
                const side = (angleDiff > 0) ? -1 : 1;
                avoidOffset += side * 60;

                if (dist < 60 && other.kmh < this.kmh) {
                    emergencyBrake = true;
                }
            }
        }

        // Target point on track with offset
        const lateral = this.racingLineOffset + avoidOffset;
        const targetX = targetSeg.x + targetSeg.nx * lateral;
        const targetY = targetSeg.y + targetSeg.ny * lateral;

        // 4. Steering Calculation
        const targetAngle = Math.atan2(targetY - this.y, targetX - this.x);
        let steerDiff = targetAngle - this.angle;
        while (steerDiff > Math.PI) steerDiff -= Math.PI * 2;
        while (steerDiff < -Math.PI) steerDiff += Math.PI * 2;

        this.controls.steer = Math.max(-1, Math.min(1, steerDiff * 3.5));

        // 5. Throttle & Brake Decision
        if (emergencyBrake || this.kmh > upcomingTargetKmh + 20) {
            this.controls.throttle = 0;
            this.controls.brake = 0.85;
        } else if (this.kmh > upcomingTargetKmh) {
            this.controls.throttle = 0.2;
            this.controls.brake = 0.3;
        } else {
            // Accelerate hard
            this.controls.throttle = 1.0;
            this.controls.brake = 0;
        }
    }
}

window.AICar = AICar;
