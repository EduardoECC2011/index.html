/**
 * Track - Formula 1 Circuit Definitions & Geometry Engine
 * Non-self-intersecting wide circuits, starting grid aligned to real track segments,
 * procedural grass and asphalt textures, tiered grandstands with animated crowd spectators.
 */
class Track {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.country = data.country;
        this.flag = data.flag;
        this.themeMusic = data.themeMusic;
        this.totalLaps = data.totalLaps || 3;
        this.lengthKm = data.lengthKm || "5.79 km";
        this.difficulty = data.difficulty || "Medium";
        this.description = data.description || "";
        this.roadWidth = data.roadWidth || 300;
        this.curbWidth = data.curbWidth || 45;

        this.rawPoints = data.points;
        this.segments = [];
        this.totalLength = 0;
        this.gridSlots = [];
        this.grandstands = data.grandstands || [];

        // Generate procedural textures
        this.createEnvironmentTextures();
        this.generateCircuitGeometry();
    }

    createEnvironmentTextures() {
        // 1. Procedural Mown Grass Pattern (128x128)
        const grassCanvas = document.createElement('canvas');
        grassCanvas.width = 128;
        grassCanvas.height = 128;
        const gctx = grassCanvas.getContext('2d');

        // Alternating mown-lawn strips
        gctx.fillStyle = '#3a7224';
        gctx.fillRect(0, 0, 128, 64);
        gctx.fillStyle = '#31631e';
        gctx.fillRect(0, 64, 128, 64);

        // Micro pixel noise for organic grass texture
        for (let i = 0; i < 400; i++) {
            const px = Math.floor(Math.random() * 128);
            const py = Math.floor(Math.random() * 128);
            const shades = ['#44832a', '#2d591c', '#4d9630', '#254b17'];
            gctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
            gctx.fillRect(px, py, 2, 2);
        }
        this.grassPattern = null;
        this.grassCanvas = grassCanvas;

        // 2. Procedural Asphalt Pattern (64x64)
        const aspCanvas = document.createElement('canvas');
        aspCanvas.width = 64;
        aspCanvas.height = 64;
        const actx = aspCanvas.getContext('2d');

        actx.fillStyle = '#22252b';
        actx.fillRect(0, 0, 64, 64);

        for (let i = 0; i < 350; i++) {
            const px = Math.floor(Math.random() * 64);
            const py = Math.floor(Math.random() * 64);
            actx.fillStyle = Math.random() < 0.5 ? '#1a1c22' : '#2b2f37';
            actx.fillRect(px, py, 1.5, 1.5);
        }
        this.asphaltPattern = null;
        this.asphaltCanvas = aspCanvas;
    }

    initPatterns(ctx) {
        if (!this.grassPattern) {
            this.grassPattern = ctx.createPattern(this.grassCanvas, 'repeat');
        }
        if (!this.asphaltPattern) {
            this.asphaltPattern = ctx.createPattern(this.asphaltCanvas, 'repeat');
        }
    }

    generateCircuitGeometry() {
        const raw = this.rawPoints;
        const numRaw = raw.length;
        const subSteps = 16;
        const densePoints = [];

        // Catmull-Rom spline interpolation
        for (let i = 0; i < numRaw; i++) {
            const p0 = raw[(i - 1 + numRaw) % numRaw];
            const p1 = raw[i];
            const p2 = raw[(i + 1) % numRaw];
            const p3 = raw[(i + 2) % numRaw];

            for (let t = 0; t < 1; t += 1 / subSteps) {
                const t2 = t * t;
                const t3 = t2 * t;

                const x = 0.5 * ((2 * p1.x) +
                    (-p0.x + p2.x) * t +
                    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

                const y = 0.5 * ((2 * p1.y) +
                    (-p0.y + p2.y) * t +
                    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

                const curbL = t < 0.5 ? (p1.curbL !== undefined ? p1.curbL : true) : (p2.curbL !== undefined ? p2.curbL : true);
                const curbR = t < 0.5 ? (p1.curbR !== undefined ? p1.curbR : true) : (p2.curbR !== undefined ? p2.curbR : true);
                const gravel = t < 0.5 ? (p1.gravel || false) : (p2.gravel || false);
                const targetSpeed = p1.targetSpeed ? (p1.targetSpeed * (1 - t) + (p2.targetSpeed || p1.targetSpeed) * t) : 260;

                densePoints.push({ x, y, curbL, curbR, gravel, targetSpeed });
            }
        }

        // Build continuous segments with normals and distances
        this.segments = [];
        let accumulatedDist = 0;
        const total = densePoints.length;

        for (let i = 0; i < total; i++) {
            const pA = densePoints[i];
            const pB = densePoints[(i + 1) % total];

            const dx = pB.x - pA.x;
            const dy = pB.y - pA.y;
            const len = Math.hypot(dx, dy);

            // Tangent and Normal vectors
            const tx = dx / (len || 1);
            const ty = dy / (len || 1);
            const nx = -ty;
            const ny = tx;

            const halfW = this.roadWidth * 0.5;
            const curbW = this.curbWidth;
            const gravelW = pA.gravel ? 120 : 0;

            const seg = {
                index: i,
                x: pA.x,
                y: pA.y,
                nextX: pB.x,
                nextY: pB.y,
                tx, ty, nx, ny,
                length: len,
                distStart: accumulatedDist,
                targetSpeed: pA.targetSpeed,
                curbL: pA.curbL,
                curbR: pA.curbR,
                gravel: pA.gravel,
                // Road edges
                leftX: pA.x + nx * halfW,
                leftY: pA.y + ny * halfW,
                rightX: pA.x - nx * halfW,
                rightY: pA.y - ny * halfW,
                // Curb edges
                curbLeftX: pA.x + nx * (halfW + curbW),
                curbLeftY: pA.y + ny * (halfW + curbW),
                curbRightX: pA.x - nx * (halfW + curbW),
                curbRightY: pA.y - ny * (halfW + curbW),
                // Barrier boundaries
                wallLeftX: pA.x + nx * (halfW + curbW + gravelW + 200),
                wallLeftY: pA.y + ny * (halfW + curbW + gravelW + 200),
                wallRightX: pA.x - nx * (halfW + curbW + gravelW + 200),
                wallRightY: pA.y - ny * (halfW + curbW + gravelW + 200)
            };

            accumulatedDist += len;
            this.segments.push(seg);
        }

        this.totalLength = accumulatedDist;

        // --- STARTING GRID GENERATION ---
        // Staggered 1-2-1-2 Formula 1 grid close together for competitive, fair racing
        this.gridSlots = [];
        const totalSegs = this.segments.length;

        for (let i = 0; i < 8; i++) {
            // Staggered: P1 (i=0) on inside pole, P2 (i=1) on outside slightly behind, P3 behind P1, etc.
            const side = (i % 2 === 0) ? 1 : -1; // 1 = inside / pole side, -1 = outside

            // Stagger each grid slot evenly: ~3.5 segments per car slot (compact & competitive)
            const backSteps = Math.round(5 + (i * 3.5));
            const segIndex = (totalSegs - backSteps + totalSegs) % totalSegs;
            const seg = this.segments[segIndex];

            // Lateral offset safely centered in lane (18% of road width from center)
            const lateral = side * (this.roadWidth * 0.18);

            const gridX = seg.x + seg.nx * lateral;
            const gridY = seg.y + seg.ny * lateral;
            const gridAngle = Math.atan2(seg.ty, seg.tx);

            this.gridSlots.push({
                x: gridX,
                y: gridY,
                angle: gridAngle,
                gridPosition: i + 1,
                segmentIndex: segIndex
            });
        }

        // Sectors (Sector 1: 0% - 33%, Sector 2: 33% - 66%, Sector 3: 66% - 100%)
        this.sector1Index = Math.floor(totalSegs * 0.33);
        this.sector2Index = Math.floor(totalSegs * 0.66);
    }

    findClosestSegment(x, y, hintIndex = 0) {
        let minDistSq = Infinity;
        let bestIndex = 0;
        const total = this.segments.length;

        // Search in a window around hintIndex first
        const windowSize = 50;
        for (let offset = -windowSize; offset <= windowSize; offset++) {
            const idx = (hintIndex + offset + total) % total;
            const seg = this.segments[idx];
            const dx = x - seg.x;
            const dy = y - seg.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                bestIndex = idx;
            }
        }

        // Full scan fallback
        if (minDistSq > 360000) {
            for (let i = 0; i < total; i++) {
                const seg = this.segments[i];
                const dx = x - seg.x;
                const dy = y - seg.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    bestIndex = i;
                }
            }
        }

        return this.segments[bestIndex];
    }

    getSurfaceAt(x, y) {
        const seg = this.findClosestSegment(x, y);
        const dx = x - seg.x;
        const dy = y - seg.y;

        const lateralDist = dx * seg.nx + dy * seg.ny;
        const absLat = Math.abs(lateralDist);
        const halfRoad = this.roadWidth * 0.5;
        const curbLimit = halfRoad + this.curbWidth + 24;
        const isLeft = lateralDist > 0;
        const hasCurb = isLeft ? seg.curbL : seg.curbR;

        // Generous asphalt boundary tolerance
        if (absLat <= halfRoad + 10) {
            return 'asphalt';
        } else if (hasCurb && absLat <= curbLimit) {
            return 'curb';
        } else if (seg.gravel && absLat <= curbLimit + 100) {
            return 'gravel';
        } else {
            return 'grass';
        }
    }

    resolveWallCollisions(car) {
        const seg = this.findClosestSegment(car.x, car.y, car.currentSegmentIndex || 0);
        car.currentSegmentIndex = seg.index;

        const dx = car.x - seg.x;
        const dy = car.y - seg.y;
        const lateralDist = dx * seg.nx + dy * seg.ny;
        const maxDist = (this.roadWidth * 0.5) + this.curbWidth + (seg.gravel ? 100 : 0) + 160;

        if (Math.abs(lateralDist) > maxDist) {
            const sign = Math.sign(lateralDist);
            const pushBack = (Math.abs(lateralDist) - maxDist);
            car.x -= seg.nx * sign * pushBack;
            car.y -= seg.ny * sign * pushBack;

            car.vx *= 0.5;
            car.vy *= 0.5;

            if (car.isPlayer && window.soundManager) {
                window.soundManager.playCrashSound(0.5);
            }
            if (window.particleSystem) {
                window.particleSystem.emitSparks(car.x, car.y, car.angle, 5);
            }
        }
    }

    render(ctx, camera) {
        this.initPatterns(ctx);

        const total = this.segments.length;
        const halfRoad = this.roadWidth * 0.5;
        const curbW = this.curbWidth;

        // 1. Draw Textured Mown Grass Background
        ctx.save();
        ctx.fillStyle = this.grassPattern || '#386f23';
        // Fill an expansive area around camera
        const cx = camera.x - 2500;
        const cy = camera.y - 2500;
        ctx.fillRect(cx, cy, 5000, 5000);
        ctx.restore();

        // 2. Render Gravel Traps
        ctx.fillStyle = '#c49f64';
        for (let i = 0; i < total; i++) {
            const sA = this.segments[i];
            const sB = this.segments[(i + 1) % total];
            if (sA.gravel || sB.gravel) {
                ctx.beginPath();
                ctx.moveTo(sA.x + sA.nx * (halfRoad + curbW), sA.y + sA.ny * (halfRoad + curbW));
                ctx.lineTo(sA.x + sA.nx * (halfRoad + curbW + 110), sA.y + sA.ny * (halfRoad + curbW + 110));
                ctx.lineTo(sB.x + sB.nx * (halfRoad + curbW + 110), sB.y + sB.ny * (halfRoad + curbW + 110));
                ctx.lineTo(sB.x + sB.nx * (halfRoad + curbW), sB.y + sB.ny * (halfRoad + curbW));
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(sA.x - sA.nx * (halfRoad + curbW), sA.y - sA.ny * (halfRoad + curbW));
                ctx.lineTo(sA.x - sA.nx * (halfRoad + curbW + 110), sA.y - sA.ny * (halfRoad + curbW + 110));
                ctx.lineTo(sB.x - sB.nx * (halfRoad + curbW + 110), sB.y - sB.ny * (halfRoad + curbW + 110));
                ctx.lineTo(sB.x - sB.nx * (halfRoad + curbW), sB.y - sB.ny * (halfRoad + curbW));
                ctx.fill();
            }
        }

        // 3. Render Curbs (Zebras - Red and White alternating stripes)
        for (let i = 0; i < total; i++) {
            const sA = this.segments[i];
            const sB = this.segments[(i + 1) % total];
            const isRed = Math.floor(i / 2) % 2 === 0;
            const curbColor = isRed ? '#e71d36' : '#f8f9fa';

            // Left Curb
            if (sA.curbL) {
                ctx.fillStyle = curbColor;
                ctx.beginPath();
                ctx.moveTo(sA.leftX, sA.leftY);
                ctx.lineTo(sA.curbLeftX, sA.curbLeftY);
                ctx.lineTo(sB.curbLeftX, sB.curbLeftY);
                ctx.lineTo(sB.leftX, sB.leftY);
                ctx.fill();
            }

            // Right Curb
            if (sA.curbR) {
                ctx.fillStyle = curbColor;
                ctx.beginPath();
                ctx.moveTo(sA.rightX, sA.rightY);
                ctx.lineTo(sA.curbRightX, sA.curbRightY);
                ctx.lineTo(sB.curbRightX, sB.curbRightY);
                ctx.lineTo(sB.rightX, sB.rightY);
                ctx.fill();
            }
        }

        // 4. Render Textured Asphalt Roadbed
        ctx.fillStyle = this.asphaltPattern || '#22252b';
        for (let i = 0; i < total; i++) {
            const sA = this.segments[i];
            const sB = this.segments[(i + 1) % total];
            ctx.beginPath();
            ctx.moveTo(sA.leftX, sA.leftY);
            ctx.lineTo(sB.leftX, sB.leftY);
            ctx.lineTo(sB.rightX, sB.rightY);
            ctx.lineTo(sA.rightX, sA.rightY);
            ctx.fill();
        }

        // 5. Dark Rubber Racing Groove (Where F1 cars lay down rubber)
        ctx.strokeStyle = 'rgba(12, 14, 18, 0.45)';
        ctx.lineWidth = 48;
        ctx.beginPath();
        for (let i = 0; i <= total; i++) {
            const seg = this.segments[i % total];
            if (i === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
        }
        ctx.stroke();

        // 6. Track Boundary White Lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i <= total; i++) {
            const seg = this.segments[i % total];
            if (i === 0) ctx.moveTo(seg.leftX, seg.leftY);
            else ctx.lineTo(seg.leftX, seg.leftY);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i <= total; i++) {
            const seg = this.segments[i % total];
            if (i === 0) ctx.moveTo(seg.rightX, seg.rightY);
            else ctx.lineTo(seg.rightX, seg.rightY);
        }
        ctx.stroke();

        // 7. Centerline Dashes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 30]);
        ctx.beginPath();
        for (let i = 0; i <= total; i++) {
            const seg = this.segments[i % total];
            if (i === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // 8. Starting Grid & Finish Line
        this.renderFinishLine(ctx);
        this.renderGridBoxes(ctx);

        // 9. Grandstands, Spectator Crowd & Sponsorship Banners
        this.renderGrandstands(ctx);
    }

    renderFinishLine(ctx) {
        const seg = this.segments[0];
        ctx.save();
        ctx.translate(seg.x, seg.y);
        ctx.rotate(Math.atan2(seg.ty, seg.tx));

        const checkers = 16;
        const boxH = this.roadWidth / checkers;
        const boxW = 12;

        for (let row = -2; row < 2; row++) {
            for (let col = 0; col < checkers; col++) {
                const isWhite = (row + col) % 2 === 0;
                ctx.fillStyle = isWhite ? '#ffffff' : '#111111';
                const yPos = -this.roadWidth * 0.5 + col * boxH;
                ctx.fillRect(row * boxW, yPos, boxW, boxH);
            }
        }
        ctx.restore();
    }

    renderGridBoxes(ctx) {
        ctx.save();
        this.gridSlots.forEach((slot) => {
            ctx.save();
            ctx.translate(slot.x, slot.y);
            ctx.rotate(slot.angle);

            // White box outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(-26, -16, 52, 32);

            // Grid slot number
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(slot.gridPosition.toString(), 0, 0);

            ctx.restore();
        });
        ctx.restore();
    }

    renderGrandstands(ctx) {
        // Animation counter for waving flags
        const time = Date.now() * 0.005;

        this.grandstands.forEach(gs => {
            ctx.save();
            ctx.translate(gs.x, gs.y);
            ctx.rotate(gs.angle);

            const w = gs.width || 320;
            const h = gs.depth || 90;

            // 1. Drop shadow of grandstand
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(-w * 0.5 + 8, -h * 0.5 + 8, w, h);

            // 2. Concrete Bleachers Tier Base
            ctx.fillStyle = '#8a94a6';
            ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

            // Tier rows
            const rows = 5;
            const rowH = h / rows;
            for (let r = 0; r < rows; r++) {
                ctx.fillStyle = r % 2 === 0 ? '#747f93' : '#636e82';
                ctx.fillRect(-w * 0.5, -h * 0.5 + r * rowH, w, rowH - 1);

                // 3. Pixel Spectator Crowd (Torcida)
                const crowdColors = ['#e10600', '#ffd700', '#00d2be', '#ffffff', '#005aff', '#ff8700', '#222222'];
                const peopleInRow = Math.floor(w / 10);
                for (let p = 0; p < peopleInRow; p++) {
                    const px = -w * 0.5 + 5 + p * 10 + (r % 2) * 4;
                    const py = -h * 0.5 + r * rowH + 4;
                    const c = crowdColors[(p * 3 + r * 5) % crowdColors.length];

                    // Spectator head & shirt
                    ctx.fillStyle = '#f1c27d';
                    ctx.fillRect(px, py, 3, 3);
                    ctx.fillStyle = c;
                    ctx.fillRect(px - 1, py + 3, 5, 5);

                    // Occasional waving flags
                    if ((p + r) % 6 === 0) {
                        const flagWave = Math.sin(time + p) * 3;
                        ctx.strokeStyle = '#222';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(px + 4, py + 6);
                        ctx.lineTo(px + 4, py - 6 + flagWave);
                        ctx.stroke();

                        ctx.fillStyle = gs.flagColor || '#e10600';
                        ctx.fillRect(px + 4, py - 6 + flagWave, 7, 5);
                    }
                }
            }

            // 4. Grandstand Canopy Roof
            ctx.fillStyle = gs.roofColor || '#2c3545';
            ctx.fillRect(-w * 0.5, -h * 0.5 - 12, w, 14);

            // 5. Track-Side Sponsorship Banner
            ctx.fillStyle = gs.bannerColor || '#e10600';
            ctx.fillRect(-w * 0.5, h * 0.5 - 8, w, 16);

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 11px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(gs.bannerText || 'FORMULA 1 GRAND PRIX', 0, h * 0.5);

            ctx.restore();
        });
    }
}

// Track Database: Non-self-intersecting, massive wide circuits with grandstands & crowd
window.TRACK_DATABASE = [
    {
        id: 'monza',
        name: 'Autodromo di Monza',
        country: 'Italy',
        flag: '🇮🇹',
        themeMusic: 'monza',
        totalLaps: 3,
        lengthKm: '5.79 km',
        difficulty: 'High Speed',
        description: 'The historic Temple of Speed! Wide straights, Rettifilo chicane, Ascari, and the legendary Parabolica.',
        roadWidth: 310,
        curbWidth: 46,
        points: [
            // Start/Finish main straight (bottom straight going East)
            { x: 1200, y: 3200, targetSpeed: 350, curbL: false, curbR: false },
            { x: 3000, y: 3200, targetSpeed: 355, curbL: false, curbR: false },
            // Variante del Rettifilo
            { x: 3800, y: 3150, targetSpeed: 140, curbL: true, curbR: true, gravel: true },
            { x: 4100, y: 2900, targetSpeed: 160, curbL: true, curbR: true },
            { x: 4400, y: 2950, targetSpeed: 210, curbL: true, curbR: true },
            // Curva Grande (sweeping Northeast)
            { x: 5000, y: 2700, targetSpeed: 290, curbL: false, curbR: true },
            { x: 5400, y: 2100, targetSpeed: 300, curbL: false, curbR: true },
            // Variante della Roggia
            { x: 5400, y: 1400, targetSpeed: 165, curbL: true, curbR: true, gravel: true },
            { x: 5200, y: 1100, targetSpeed: 180, curbL: true, curbR: true },
            // Lesmo 1 & 2 (turning Northwest)
            { x: 4600, y: 800,  targetSpeed: 230, curbL: false, curbR: true, gravel: true },
            { x: 3900, y: 800,  targetSpeed: 220, curbL: true, curbR: true },
            // Serraglio straight (top straight going West)
            { x: 2900, y: 800,  targetSpeed: 335, curbL: false, curbR: false },
            // Variante Ascari
            { x: 2100, y: 950,  targetSpeed: 200, curbL: true, curbR: true, gravel: true },
            { x: 1800, y: 1200, targetSpeed: 230, curbL: true, curbR: true },
            // Back straight (going South)
            { x: 1400, y: 1700, targetSpeed: 340, curbL: false, curbR: false },
            { x: 1100, y: 2300, targetSpeed: 210, curbL: true, curbR: true, gravel: true },
            // Curva Parabolica
            { x: 1000, y: 2850, targetSpeed: 255, curbL: true, curbR: true, gravel: true }
        ],
        grandstands: [
            { x: 2000, y: 3420, angle: 0, width: 450, depth: 85, bannerText: 'PIRELLI - TEMPLE OF SPEED', roofColor: '#e10600', flagColor: '#e10600' },
            { x: 4000, y: 3350, angle: -0.15, width: 320, depth: 80, bannerText: 'ROLEX - VARIANTE RETTIFILO', roofColor: '#00552b', flagColor: '#ffd700' },
            { x: 780,  y: 2850, angle: 1.57, width: 350, depth: 85, bannerText: 'FERRARI TIFOSI - CURVA PARABOLICA', roofColor: '#e10600', flagColor: '#e10600' }
        ]
    },
    {
        id: 'monaco',
        name: 'Circuit de Monaco',
        country: 'Monaco',
        flag: '🇲🇨',
        themeMusic: 'monaco',
        totalLaps: 3,
        lengthKm: '3.34 km',
        difficulty: 'Technical Street',
        description: 'Glamour, yachts and precision! Clean non-intersecting street ribbon with Sainte Dévote, hairpins, and oceanfront chicane.',
        roadWidth: 270,
        curbWidth: 40,
        points: [
            // Start/Finish straight along harbor
            { x: 1400, y: 3200, targetSpeed: 280, curbL: false, curbR: false },
            { x: 2800, y: 3200, targetSpeed: 285, curbL: false, curbR: false },
            // Sainte Dévote (Turn 1 uphill)
            { x: 3400, y: 3000, targetSpeed: 140, curbL: true, curbR: true },
            // Beau Rivage climb
            { x: 3800, y: 2500, targetSpeed: 250, curbL: false, curbR: false },
            { x: 3800, y: 1800, targetSpeed: 230, curbL: false, curbR: false },
            // Massenet & Casino Square
            { x: 3400, y: 1100, targetSpeed: 170, curbL: true, curbR: false },
            { x: 2700, y: 900,  targetSpeed: 180, curbL: false, curbR: true },
            // Mirabeau & Grand Hotel Hairpin
            { x: 2000, y: 1100, targetSpeed: 135, curbL: true, curbR: true },
            { x: 1500, y: 1300, targetSpeed: 95,  curbL: true, curbR: true },
            // Portier into seaside boulevard
            { x: 1600, y: 1800, targetSpeed: 140, curbL: false, curbR: true },
            // Seaside Boulevard
            { x: 2000, y: 2200, targetSpeed: 290, curbL: false, curbR: false },
            { x: 2400, y: 2500, targetSpeed: 280, curbL: false, curbR: false },
            // Nouvelle Chicane
            { x: 2200, y: 2800, targetSpeed: 120, curbL: true, curbR: true },
            // Tabac & Swimming pool
            { x: 1800, y: 2950, targetSpeed: 200, curbL: true, curbR: true },
            // La Rascasse & Antony Noghès
            { x: 1300, y: 3050, targetSpeed: 110, curbL: true, curbR: true }
        ],
        grandstands: [
            { x: 2100, y: 3400, angle: 0, width: 420, depth: 80, bannerText: 'AUTOMOBILE CLUB DE MONACO', roofColor: '#ffffff', flagColor: '#e10600' },
            { x: 3980, y: 2100, angle: -1.57, width: 340, depth: 80, bannerText: 'TAG HEUER - BEAU RIVAGE', roofColor: '#1c1c1c', flagColor: '#ff0033' },
            { x: 2550, y: 2350, angle: 0.6, width: 280, depth: 75, bannerText: 'YACHT CLUB DE MONACO', roofColor: '#0055aa', flagColor: '#ffffff' }
        ]
    },
    {
        id: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos)',
        country: 'Brazil',
        flag: '🇧🇷',
        themeMusic: 'interlagos',
        totalLaps: 3,
        lengthKm: '4.31 km',
        difficulty: 'Challenging',
        description: 'Senna S downhill chicane, Curva do Sol, Reta Oposta, and the thrilling uphill Subida dos Boxes.',
        roadWidth: 300,
        curbWidth: 45,
        points: [
            // Start/Finish straight (right side going South)
            { x: 4200, y: 1600, targetSpeed: 330, curbL: false, curbR: false },
            { x: 4200, y: 2800, targetSpeed: 340, curbL: false, curbR: false },
            // Senna 'S' (Turn 1 & 2 downhill chicane)
            { x: 4100, y: 3400, targetSpeed: 145, curbL: true, curbR: true, gravel: true },
            { x: 3700, y: 3700, targetSpeed: 155, curbL: true, curbR: true },
            { x: 3200, y: 3600, targetSpeed: 190, curbL: true, curbR: true },
            // Curva do Sol (Turn 3 sweeping West)
            { x: 2500, y: 3200, targetSpeed: 275, curbL: false, curbR: true },
            // Reta Oposta (back straight going Northwest)
            { x: 1800, y: 2700, targetSpeed: 335, curbL: false, curbR: false },
            { x: 1400, y: 2100, targetSpeed: 335, curbL: false, curbR: false },
            // Descida do Lago (Turn 4 & 5)
            { x: 1200, y: 1400, targetSpeed: 160, curbL: true, curbR: true, gravel: true },
            { x: 1500, y: 1000, targetSpeed: 180, curbL: true, curbR: true },
            // Ferradura (double apex right sweeper)
            { x: 2100, y: 900,  targetSpeed: 235, curbL: false, curbR: true },
            { x: 2700, y: 1050, targetSpeed: 225, curbL: false, curbR: true },
            // Pinheirinho & Bico de Pato
            { x: 3100, y: 1350, targetSpeed: 150, curbL: true, curbR: true },
            { x: 3200, y: 1750, targetSpeed: 110, curbL: true, curbR: true },
            // Mergulho & Junção (climbing left onto pit straight)
            { x: 2800, y: 2100, targetSpeed: 210, curbL: true, curbR: false },
            { x: 2500, y: 2400, targetSpeed: 155, curbL: true, curbR: true, gravel: true },
            // Subida dos Boxes (Full throttle uphill sweep)
            { x: 2800, y: 2700, targetSpeed: 260, curbL: false, curbR: true },
            { x: 3400, y: 2400, targetSpeed: 290, curbL: false, curbR: true },
            { x: 3900, y: 1900, targetSpeed: 310, curbL: false, curbR: false }
        ],
        grandstands: [
            { x: 4420, y: 2200, angle: 1.57, width: 480, depth: 90, bannerText: 'SENNA SEMPRE - GP DO BRASIL', roofColor: '#ffd700', flagColor: '#107c10' },
            { x: 4000, y: 3820, angle: -0.3, width: 340, depth: 80, bannerText: "ARQUIBANCADA 'S' DO SENNA", roofColor: '#107c10', flagColor: '#ffd700' },
            { x: 1600, y: 2900, angle: -0.6, width: 320, depth: 75, bannerText: 'PETROBRAS - RETA OPOSTA', roofColor: '#008542', flagColor: '#ffd700' }
        ]
    },
    {
        id: 'suzuka',
        name: 'Suzuka International Racing Course',
        country: 'Japan',
        flag: '🇯🇵',
        themeMusic: 'suzuka',
        totalLaps: 3,
        lengthKm: '5.81 km',
        difficulty: 'Expert Master',
        description: 'Clean continuous Grand Prix loop! Rhythmic S-Curves, Degner corners, the Hairpin, Spoon Curve, and flat-out 130R.',
        roadWidth: 290,
        curbWidth: 44,
        points: [
            // Start/Finish straight (bottom straight going East)
            { x: 1400, y: 3400, targetSpeed: 320, curbL: false, curbR: false },
            { x: 2600, y: 3400, targetSpeed: 330, curbL: false, curbR: false },
            // First Turn & S-Curves (snaking left-right-left going North)
            { x: 3200, y: 3100, targetSpeed: 210, curbL: true, curbR: true },
            { x: 3500, y: 2700, targetSpeed: 205, curbL: true, curbR: true },
            { x: 3200, y: 2300, targetSpeed: 200, curbL: true, curbR: true },
            { x: 3600, y: 1900, targetSpeed: 195, curbL: true, curbR: true },
            // Dunlop curve (sweeping left)
            { x: 3400, y: 1400, targetSpeed: 245, curbL: true, curbR: false },
            { x: 2800, y: 1000, targetSpeed: 230, curbL: false, curbR: true },
            // Degner 1 & 2
            { x: 2300, y: 900,  targetSpeed: 200, curbL: false, curbR: true, gravel: true },
            { x: 1900, y: 900,  targetSpeed: 150, curbL: true, curbR: true, gravel: true },
            // Hairpin
            { x: 1400, y: 1100, targetSpeed: 95,  curbL: true, curbR: true, gravel: true },
            { x: 1300, y: 1500, targetSpeed: 130, curbL: true, curbR: true },
            // 200R & Spoon Curve (sweeping dual-apex left)
            { x: 1600, y: 2000, targetSpeed: 265, curbL: false, curbR: true },
            { x: 1300, y: 2500, targetSpeed: 175, curbL: true, curbR: true, gravel: true },
            // Back straight into 130R
            { x: 1100, y: 2900, targetSpeed: 340, curbL: false, curbR: false },
            { x: 1200, y: 3250, targetSpeed: 290, curbL: true, curbR: true }
        ],
        grandstands: [
            { x: 2000, y: 3600, angle: 0, width: 460, depth: 85, bannerText: 'HONDA MOTORSPORT - SUZUKA MAIN', roofColor: '#cc0000', flagColor: '#ffffff' },
            { x: 3750, y: 2300, angle: -1.57, width: 380, depth: 80, bannerText: 'BRIDGESTONE - S-CURVES', roofColor: '#111111', flagColor: '#e10600' },
            { x: 1150, y: 1100, angle: -0.8, width: 260, depth: 75, bannerText: 'CASIO - HAIRPIN GRANDSTAND', roofColor: '#003399', flagColor: '#ffffff' }
        ]
    }
];
