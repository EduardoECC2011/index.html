/**
 * Camera - Dynamic 2D Top-Down Chase Camera
 * Always stays aligned with the car heading (car points UP on screen),
 * providing natural arcade perspective with speed zoom and collision shake.
 */
class Camera {
    constructor(viewportWidth = 1280, viewportHeight = 720) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;

        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.targetAngle = 0;

        this.zoom = 1.05;
        this.targetZoom = 1.05;
        this.baseZoom = 1.05;

        // Screen shake
        this.shakeTime = 0;
        this.shakeIntensity = 0;
    }

    resize(w, h) {
        this.viewportWidth = w;
        this.viewportHeight = h;
    }

    reset(targetCar) {
        if (!targetCar) return;
        this.x = targetCar.x;
        this.y = targetCar.y;
        this.angle = -targetCar.angle - Math.PI * 0.5;
        this.targetAngle = this.angle;
    }

    addShake(intensity = 6, duration = 0.2) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeTime = Math.max(this.shakeTime, duration);
    }

    update(targetCar, dt = 1) {
        if (!targetCar) return;

        // 1. Smooth Position Tracking (Lerp)
        const lerpFactor = Math.min(1.0, 0.22 * dt);
        this.x += (targetCar.x - this.x) * lerpFactor;
        this.y += (targetCar.y - this.y) * lerpFactor;

        // 2. Camera Rotation Alignment: car always points UP on the screen
        // In Canvas coords, nose at angle A becomes UP (-PI/2) when rotated by -A - PI/2
        this.targetAngle = -targetCar.angle - Math.PI * 0.5;

        let angleDiff = this.targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Smooth angle tracking without latency
        const rotFactor = Math.min(1.0, 0.20 * dt);
        this.angle += angleDiff * rotFactor;

        // 3. Speed-dependent zoom (zooms out slightly at high velocity for greater road view)
        const speedRatio = Math.min(1.0, targetCar.kmh / 340);
        this.targetZoom = this.baseZoom - (speedRatio * 0.16);
        this.zoom += (this.targetZoom - this.zoom) * 0.05 * dt;

        // 4. Update screen shake
        if (this.shakeTime > 0) {
            this.shakeTime -= (dt / 60);
            if (this.shakeTime <= 0) {
                this.shakeIntensity = 0;
            }
        }

        // 5. Non-finite / NaN Safeguard (Guarantees screen never turns black)
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.angle) || !isFinite(this.zoom)) {
            this.x = targetCar.x || 0;
            this.y = targetCar.y || 0;
            this.angle = -targetCar.angle - Math.PI * 0.5;
            this.zoom = this.baseZoom;
        }
    }

    apply(ctx) {
        ctx.save();
        // Pivot point at center horizontally and 62% vertically (places car lower for maximum view ahead)
        ctx.translate(this.viewportWidth * 0.5, this.viewportHeight * 0.62);
        ctx.scale(this.zoom, this.zoom);

        // Rotate so car is facing straight UP
        ctx.rotate(this.angle);

        let shakeX = 0;
        let shakeY = 0;
        if (this.shakeIntensity > 0) {
            shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        }

        ctx.translate(-this.x + shakeX, -this.y + shakeY);
    }

    restore(ctx) {
        ctx.restore();
    }
}

window.Camera = Camera;
