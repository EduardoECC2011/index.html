/**
 * ParticleSystem - High-performance pixel-art particles and persistent tire skid marks
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;

        // Persistent skid mark segments
        this.skidMarks = [];
        this.maxSkidMarks = 1200;
    }

    reset() {
        this.particles = [];
        this.skidMarks = [];
    }

    /**
     * Add a skid mark segment
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} opacity 
     * @param {number} width 
     */
    addSkidMark(x1, y1, x2, y2, opacity = 0.4, width = 3) {
        if (this.skidMarks.length >= this.maxSkidMarks) {
            this.skidMarks.shift(); // remove oldest
        }
        this.skidMarks.push({
            x1, y1, x2, y2,
            opacity: Math.min(0.65, opacity),
            width
        });
    }

    /**
     * Emit tire smoke particles
     */
    emitSmoke(x, y, count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            this.particles.push({
                type: 'smoke',
                x: x + (Math.random() - 0.5) * 4,
                y: y + (Math.random() - 0.5) * 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                maxLife: 20 + Math.random() * 15,
                life: 0,
                color: 'rgba(220, 225, 230, '
            });
        }
    }

    /**
     * Emit dirt / grass particles
     */
    emitDirt(x, y, isGravel = false, count = 2) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.5;
            const baseColor = isGravel ? '180, 160, 120' : '75, 135, 45';
            this.particles.push({
                type: 'dirt',
                x: x + (Math.random() - 0.5) * 4,
                y: y + (Math.random() - 0.5) * 4,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 2,
                maxLife: 15 + Math.random() * 10,
                life: 0,
                color: `rgba(${baseColor}, `
            });
        }
    }

    /**
     * Emit sparks on curb hit or wall collision
     */
    emitSparks(x, y, baseAngle = 0, count = 4) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const angle = baseAngle + (Math.random() - 0.5) * 1.2 + Math.PI;
            const speed = 2.0 + Math.random() * 4.0;
            const colors = ['255, 220, 60', '255, 140, 30', '255, 255, 200'];
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push({
                type: 'spark',
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 1.5,
                maxLife: 8 + Math.random() * 8,
                life: 0,
                color: `rgba(${c}, `
            });
        }
    }

    /**
     * Emit exhaust flame pop
     */
    emitExhaustFlame(x, y, angle) {
        for (let i = 0; i < 4; i++) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            const spread = (Math.random() - 0.5) * 0.4;
            const speed = -(2.5 + Math.random() * 2);
            const pAngle = angle + spread;
            const colors = ['60, 160, 255', '255, 180, 50', '255, 90, 20'];
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push({
                type: 'flame',
                x, y,
                vx: Math.cos(pAngle) * speed,
                vy: Math.sin(pAngle) * speed,
                size: 2 + Math.random() * 2.5,
                maxLife: 6 + Math.random() * 4,
                life: 0,
                color: `rgba(${c}, `
            });
        }
    }

    update(dt = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'smoke') {
                p.size += 0.15 * dt;
                p.vx *= 0.92;
                p.vy *= 0.92;
            } else if (p.type === 'dirt') {
                p.vx *= 0.90;
                p.vy *= 0.90;
            } else if (p.type === 'spark') {
                p.vx *= 0.88;
                p.vy *= 0.88;
            }

            if (p.life >= p.maxLife) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render skid marks under cars with radial distance culling for rotating camera
     */
    drawSkidMarks(ctx, camera) {
        if (this.skidMarks.length === 0) return;
        ctx.save();
        ctx.lineCap = 'round';

        // Radial view cull radius based on viewport diagonal
        const viewDiagonal = Math.hypot(camera.viewportWidth, camera.viewportHeight);
        const maxDistSq = Math.pow((viewDiagonal / (camera.zoom || 1)) * 0.7 + 100, 2);

        for (let i = 0; i < this.skidMarks.length; i++) {
            const sm = this.skidMarks[i];
            const dx = sm.x1 - camera.x;
            const dy = sm.y1 - camera.y;
            if (dx * dx + dy * dy > maxDistSq) {
                continue;
            }
            ctx.strokeStyle = `rgba(20, 20, 25, ${sm.opacity})`;
            ctx.lineWidth = sm.width;
            ctx.beginPath();
            ctx.moveTo(sm.x1, sm.y1);
            ctx.lineTo(sm.x2, sm.y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Render active particles above cars
     */
    drawParticles(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const alpha = Math.max(0, 1 - (p.life / p.maxLife));
            ctx.fillStyle = p.color + alpha + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Global particle system instance
window.particleSystem = new ParticleSystem();
