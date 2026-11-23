/**
 * HUD - Formula 1 Heads-Up Display & Race Telemetry
 * Digital Speedometer in km/h, Gear Indicator, F1 Shift Lights, Lap Timers,
 * Real-Time Circuit Minimap, and 5-Light Starting Gantry.
 */
class HUD {
    constructor() {
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.width = 180;
        this.minimapCanvas.height = 140;
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.cachedTrackId = null;
        this.mapScale = 1;
        this.mapOffsetX = 0;
        this.mapOffsetY = 0;
    }

    formatTime(seconds) {
        if (!seconds || seconds === Infinity || isNaN(seconds)) return '--:--.---';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }

    cacheMinimap(track) {
        if (this.cachedTrackId === track.id) return;
        this.cachedTrackId = track.id;

        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Find bounding box of track
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        track.segments.forEach(seg => {
            if (seg.x < minX) minX = seg.x;
            if (seg.x > maxX) maxX = seg.x;
            if (seg.y < minY) minY = seg.y;
            if (seg.y > maxY) maxY = seg.y;
        });

        const trackW = maxX - minX;
        const trackH = maxY - minY;
        const padding = 20;

        this.mapScale = Math.min((w - padding * 2) / trackW, (h - padding * 2) / trackH);
        this.mapOffsetX = padding + ((w - padding * 2) - trackW * this.mapScale) * 0.5 - minX * this.mapScale;
        this.mapOffsetY = padding + ((h - padding * 2) - trackH * this.mapScale) * 0.5 - minY * this.mapScale;

        // Draw track outline on cached canvas
        ctx.strokeStyle = '#444d5d';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        track.segments.forEach((seg, i) => {
            const mx = seg.x * this.mapScale + this.mapOffsetX;
            const my = seg.y * this.mapScale + this.mapOffsetY;
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
        });
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#8a99ad';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }

    render(ctx, playerCar, allCars, track, gameState) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // 1. Starting Lights Countdown Gantry
        if (gameState.countdownActive) {
            this.renderCountdownGantry(ctx, width, gameState.countdownPhase);
        }

        if (!playerCar) return;

        // 2. Telemetry Timing Box (Top-Left)
        this.renderTimingBox(ctx, playerCar, track);

        // 3. Position & Lap Counter (Top-Right)
        this.renderPositionBadge(ctx, playerCar, allCars, track, width);

        // 4. Digital Speedometer & Tachometer Cluster (Bottom-Right)
        this.renderSpeedometerCluster(ctx, playerCar, width, height);

        // 5. Circuit Minimap (Bottom-Left)
        this.renderMinimap(ctx, track, playerCar, allCars, height);

        // 6. ERS / Boost Bar (Bottom-Center)
        this.renderBoostBar(ctx, playerCar, width, height);
    }

    renderCountdownGantry(ctx, screenWidth, phase) {
        ctx.save();
        const boxW = 320;
        const boxH = 90;
        const x = (screenWidth - boxW) * 0.5;
        const y = 80;

        // Dark gantry frame
        ctx.fillStyle = 'rgba(10, 12, 16, 0.9)';
        ctx.strokeStyle = '#e10600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText("FIA FORMULA 1 STARTING GRID", screenWidth * 0.5, y + 22);

        // 5 Red Lights Columns
        const startX = x + 40;
        const spacing = 58;

        for (let i = 0; i < 5; i++) {
            const lx = startX + i * spacing;
            const ly = y + 55;

            // Outer bezel
            ctx.fillStyle = '#1c1f26';
            ctx.beginPath();
            ctx.arc(lx, ly, 16, 0, Math.PI * 2);
            ctx.fill();

            // Light bulb
            const isActive = phase > 0 && phase <= 5 && i < phase;
            if (isActive) {
                // Bright Red Light
                ctx.fillStyle = '#ff1100';
                ctx.shadowColor = '#ff2200';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(lx, ly, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (phase === 6) {
                // LIGHTS OUT! Green flash
                ctx.fillStyle = '#00ff66';
                ctx.shadowColor = '#00ff66';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(lx, ly, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Inactive dim grey/red
                ctx.fillStyle = '#3a0808';
                ctx.beginPath();
                ctx.arc(lx, ly, 11, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (phase === 6) {
            ctx.fillStyle = '#00ff66';
            ctx.font = 'bold 22px monospace';
            ctx.fillText("LIGHTS OUT! GO!", screenWidth * 0.5, y + boxH + 35);
        }

        ctx.restore();
    }

    renderTimingBox(ctx, car, track) {
        ctx.save();
        const x = 20;
        const y = 20;
        const w = 240;
        const h = 100;

        // Translucent carbon backing
        ctx.fillStyle = 'rgba(12, 15, 20, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#8b9bb4';
        ctx.textAlign = 'left';

        // Current Lap Time
        ctx.fillText("CURRENT", x + 15, y + 25);
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.formatTime(car.currentLapTime), x + 85, y + 26);

        // Best Lap Time
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#d4af37';
        ctx.fillText("BEST", x + 15, y + 55);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#a682ff'; // Purple sector color
        ctx.fillText(this.formatTime(car.bestLapTime), x + 85, y + 56);

        // Last Lap Time
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText("LAST", x + 15, y + 83);
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText(this.formatTime(car.lastLapTime), x + 85, y + 84);

        ctx.restore();
    }

    renderPositionBadge(ctx, car, allCars, track, screenWidth) {
        ctx.save();
        const w = 220;
        const h = 75;
        const x = screenWidth - w - 20;
        const y = 20;

        ctx.fillStyle = 'rgba(12, 15, 20, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Position Badge (P1, P2...)
        const posColor = car.racePosition === 1 ? '#ffd700' : (car.racePosition === 2 ? '#c0c0c0' : (car.racePosition === 3 ? '#cd7f32' : '#ffffff'));

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText("POSITION", x + 18, y + 26);

        ctx.font = 'bold 32px monospace';
        ctx.fillStyle = posColor;
        ctx.fillText(`P${car.racePosition}`, x + 15, y + 60);

        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = '#667788';
        ctx.fillText(`/${allCars.length}`, x + 62, y + 58);

        // Lap Counter
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#8b9bb4';
        ctx.fillText("LAP", x + 120, y + 26);

        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${Math.min(car.currentLap, track.totalLaps)}/${track.totalLaps}`, x + 120, y + 58);

        ctx.restore();
    }

    renderSpeedometerCluster(ctx, car, screenWidth, screenHeight) {
        ctx.save();
        const w = 260;
        const h = 145;
        const x = screenWidth - w - 20;
        const y = screenHeight - h - 20;

        // Cluster Frame
        ctx.fillStyle = 'rgba(10, 12, 16, 0.9)';
        ctx.strokeStyle = '#e10600';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.stroke();

        // 1. Shift Lights (15 LED indicators)
        const ledCount = 15;
        const ledW = 12;
        const ledH = 8;
        const ledStartX = x + 20;
        const ledY = y + 16;
        const activeLeds = Math.floor(car.rpm * ledCount);
        const isRedline = car.rpm >= 0.92;

        for (let i = 0; i < ledCount; i++) {
            const lx = ledStartX + i * (ledW + 2.5);
            let color = '#202530'; // inactive

            if (i < activeLeds) {
                if (i < 5) color = '#00ff44'; // Green
                else if (i < 10) color = '#ff3b30'; // Red
                else color = isRedline && Math.floor(Date.now() / 80) % 2 === 0 ? '#ffffff' : '#bf5af2'; // Purple/Blink
            }

            ctx.fillStyle = color;
            ctx.fillRect(lx, ledY, ledW, ledH);
        }

        // 2. Large Digital Speedometer (km/h)
        ctx.font = '900 52px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(car.kmh.toString(), x + 165, y + 88);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#e10600';
        ctx.textAlign = 'left';
        ctx.fillText("KM/H", x + 172, y + 85);

        // 3. Gear Indicator Box
        ctx.fillStyle = '#161a22';
        ctx.strokeStyle = '#333e50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 20, y + 42, 54, 52, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#7a889b';
        ctx.textAlign = 'center';
        ctx.fillText("GEAR", x + 47, y + 54);

        ctx.font = '900 30px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(car.speed < -0.1 ? 'R' : car.gear.toString(), x + 47, y + 86);

        // 4. Throttle & Brake mini telemetry bars
        const barW = 100;
        const barH = 6;
        const barX = x + 135;

        // Throttle (Green)
        ctx.fillStyle = '#1a221a';
        ctx.fillRect(barX, y + 106, barW, barH);
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(barX, y + 106, barW * car.controls.throttle, barH);

        // Brake (Red)
        ctx.fillStyle = '#221a1a';
        ctx.fillRect(barX, y + 120, barW, barH);
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(barX, y + 120, barW * car.controls.brake, barH);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#8899aa';
        ctx.textAlign = 'right';
        ctx.fillText("THR", barX - 6, y + 112);
        ctx.fillText("BRK", barX - 6, y + 126);

        ctx.restore();
    }

    renderMinimap(ctx, track, playerCar, allCars, screenHeight) {
        ctx.save();
        this.cacheMinimap(track);

        const x = 20;
        const y = screenHeight - 160;
        const w = 180;
        const h = 140;

        // Minimap panel background
        ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Draw cached track image
        ctx.drawImage(this.minimapCanvas, x, y);

        // Render AI opponent blips
        for (let i = 0; i < allCars.length; i++) {
            const car = allCars[i];
            if (car === playerCar) continue;

            const mx = x + car.x * this.mapScale + this.mapOffsetX;
            const my = y + car.y * this.mapScale + this.mapOffsetY;

            ctx.fillStyle = car.primaryColor || '#ffffff';
            ctx.beginPath();
            ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render Player blip (larger bright yellow with heading arrow)
        const px = x + playerCar.x * this.mapScale + this.mapOffsetX;
        const py = y + playerCar.y * this.mapScale + this.mapOffsetY;

        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player heading tick
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(playerCar.angle) * 9, py + Math.sin(playerCar.angle) * 9);
        ctx.stroke();

        ctx.restore();
    }

    renderBoostBar(ctx, car, screenWidth, screenHeight) {
        ctx.save();
        const barW = 200;
        const barH = 12;
        const x = (screenWidth - barW) * 0.5;
        const y = screenHeight - 34;

        ctx.fillStyle = 'rgba(12, 15, 20, 0.8)';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 4);
        ctx.fill();
        ctx.stroke();

        // Battery energy fill
        const fillW = (car.boostEnergy / car.maxBoostEnergy) * (barW - 4);
        ctx.fillStyle = car.controls.boost ? '#ff0055' : '#00e5ff';
        ctx.fillRect(x + 2, y + 2, fillW, barH - 4);

        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText("ERS BOOST [SPACE]", screenWidth * 0.5, y + 9);

        ctx.restore();
    }
}

window.HUD = HUD;
