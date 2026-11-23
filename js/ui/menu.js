/**
 * MenuController - Handles all retro arcade menus, garage customizer,
 * driver select, audio/video settings, and podium celebration screen.
 */
class MenuController {
    constructor() {
        this.activeScreen = 'main-menu';
        this.setupDOM();
        this.bindEvents();
        this.renderCarList();
        this.renderDriverList('all');
        this.renderTrackList();
        this.renderGarageOptions();
        this.updateGarageStats();
    }

    setupDOM() {
        // Cache DOM elements
        this.screens = {
            main: document.getElementById('screen-main-menu'),
            garage: document.getElementById('screen-garage'),
            drivers: document.getElementById('screen-driver-select'),
            tracks: document.getElementById('screen-track-select'),
            settings: document.getElementById('screen-settings'),
            pause: document.getElementById('screen-pause'),
            podium: document.getElementById('screen-podium')
        };
    }

    bindEvents() {
        document.getElementById('btn-hud-pause')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick();
            if (window.game) window.game.togglePause();
        });

        // Main Menu navigation buttons
        document.getElementById('btn-play-quick')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('tracks');
        });

        document.getElementById('btn-garage')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('garage');
            if (window.game) window.game.setState('GARAGE');
        });

        document.getElementById('btn-drivers')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('drivers');
        });

        document.getElementById('btn-garage-race')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('tracks');
        });

        document.getElementById('btn-drivers-race')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('tracks');
        });

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.showScreen('settings');
        });

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playClick();
                this.showScreen('main');
                if (window.game) window.game.setState('MENU');
            });
        });

        // Pause Menu buttons
        document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.screens.pause.classList.add('hidden');
            if (window.game) window.game.setState('RACING');
            if (window.soundManager) window.soundManager.startEngine();
        });

        document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.screens.pause.classList.add('hidden');
            if (window.game) window.game.startRace();
        });

        document.getElementById('btn-pause-quit')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick();
            this.screens.pause.classList.add('hidden');
            this.showScreen('main');
            if (window.game) window.game.setState('MENU');
        });

        // Podium Menu buttons
        document.getElementById('btn-podium-restart')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playSelect();
            this.screens.podium.classList.add('hidden');
            if (window.game) window.game.startRace();
        });

        document.getElementById('btn-podium-menu')?.addEventListener('click', () => {
            if (window.soundManager) window.soundManager.playClick();
            this.screens.podium.classList.add('hidden');
            this.showScreen('main');
            if (window.game) window.game.setState('MENU');
        });

        // Audio Settings Sliders (Main Settings Screen)
        const masterVol = document.getElementById('slider-master-vol');
        const sfxVol = document.getElementById('slider-sfx-vol');
        const musicVol = document.getElementById('slider-music-vol');
        const muteToggle = document.getElementById('toggle-mute');

        // Audio & Video Controls (Inside Pause Menu Modal)
        const pauseMaster = document.getElementById('pause-master-vol');
        const pauseSfx = document.getElementById('pause-sfx-vol');
        const pauseMusic = document.getElementById('pause-music-vol');
        const pauseMute = document.getElementById('pause-toggle-mute');
        const pauseCrt = document.getElementById('pause-toggle-crt');
        const crtOverlay = document.getElementById('crt-overlay');

        const syncAudioUI = () => {
            const mVal = window.soundManager.masterVolume * 100;
            const sVal = window.soundManager.sfxVolume * 100;
            const muVal = window.soundManager.musicVolume * 100;
            const isMuted = window.soundManager.muted;

            if (masterVol) masterVol.value = mVal;
            if (pauseMaster) pauseMaster.value = mVal;
            if (sfxVol) sfxVol.value = sVal;
            if (pauseSfx) pauseSfx.value = sVal;
            if (musicVol) musicVol.value = muVal;
            if (pauseMusic) pauseMusic.value = muVal;
            if (muteToggle) muteToggle.checked = isMuted;
            if (pauseMute) pauseMute.checked = isMuted;
        };

        syncAudioUI();

        const onMasterChange = (val) => {
            window.soundManager.setMasterVolume(val / 100);
            syncAudioUI();
        };
        masterVol?.addEventListener('input', (e) => onMasterChange(e.target.value));
        pauseMaster?.addEventListener('input', (e) => onMasterChange(e.target.value));

        const onSfxChange = (val) => {
            window.soundManager.setSfxVolume(val / 100);
            syncAudioUI();
        };
        sfxVol?.addEventListener('input', (e) => onSfxChange(e.target.value));
        pauseSfx?.addEventListener('input', (e) => onSfxChange(e.target.value));

        const onMusicChange = (val) => {
            window.soundManager.setMusicVolume(val / 100);
            syncAudioUI();
        };
        musicVol?.addEventListener('input', (e) => onMusicChange(e.target.value));
        pauseMusic?.addEventListener('input', (e) => onMusicChange(e.target.value));

        const onMuteChange = () => {
            window.soundManager.toggleMute();
            syncAudioUI();
        };
        muteToggle?.addEventListener('change', onMuteChange);
        pauseMute?.addEventListener('change', onMuteChange);

        // Video Settings (CRT Scanlines & Smoothing)
        const crtToggle = document.getElementById('toggle-crt');
        const onCrtChange = (checked) => {
            if (crtOverlay) crtOverlay.style.display = checked ? 'block' : 'none';
            if (crtToggle) crtToggle.checked = checked;
            if (pauseCrt) pauseCrt.checked = checked;
        };
        crtToggle?.addEventListener('change', (e) => onCrtChange(e.target.checked));
        pauseCrt?.addEventListener('change', (e) => onCrtChange(e.target.checked));

        // Lap Count Selector
        document.querySelectorAll('.lap-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playClick();
                document.querySelectorAll('.lap-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const laps = parseInt(btn.dataset.laps, 10) || 3;
                if (window.game) {
                    window.game.selectedLaps = laps;
                }
                this.renderTrackList();
            });
        });

        const smoothingToggle = document.getElementById('toggle-smoothing');
        if (smoothingToggle) {
            smoothingToggle.checked = false;
            smoothingToggle.addEventListener('change', (e) => {
                if (window.game) {
                    window.game.pixelSmoothing = e.target.checked;
                    window.game.ctx.imageSmoothingEnabled = e.target.checked;
                }
            });
        }

        // Driver gender filters
        document.querySelectorAll('.driver-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.driver-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderDriverList(btn.dataset.gender);
            });
        });

        // Custom Hex Color Picker
        const colorInput = document.getElementById('custom-color-picker');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                if (window.game) {
                    window.game.customPaint = e.target.value;
                }
            });
        }
    }

    showScreen(name) {
        for (let key in this.screens) {
            if (this.screens[key]) {
                this.screens[key].classList.add('hidden');
            }
        }
        if (this.screens[name]) {
            this.screens[name].classList.remove('hidden');
        }
        this.activeScreen = name;
    }

    // --- Render Car Chassis List & Status Bars ---
    renderCarList() {
        const container = document.getElementById('garage-car-list');
        if (!container) return;
        container.innerHTML = '';

        window.CARS_DATABASE.forEach(car => {
            const card = document.createElement('div');
            card.className = `car-card ${car.id === window.game.selectedCarId ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="car-card-header">
                    <h4>${car.name}</h4>
                    <span class="car-team">${car.team}</span>
                </div>
                <p class="car-tagline">${car.tagline}</p>
                <div class="stats-mini-container">
                    <div class="stat-row"><span>SPEED</span><div class="stat-bar"><div class="stat-fill speed" style="width: ${car.stats.topSpeed}%"></div></div></div>
                    <div class="stat-row"><span>ACCEL</span><div class="stat-bar"><div class="stat-fill accel" style="width: ${car.stats.accel}%"></div></div></div>
                    <div class="stat-row"><span>GRIP</span><div class="stat-bar"><div class="stat-fill grip" style="width: ${car.stats.handling}%"></div></div></div>
                    <div class="stat-row"><span>BRAKE</span><div class="stat-bar"><div class="stat-fill brake" style="width: ${car.stats.braking}%"></div></div></div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playSelect();
                window.game.selectedCarId = car.id;
                window.game.customPaint = car.primaryColor;
                window.game.customSecondary = car.secondaryColor;
                document.querySelectorAll('.car-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.updateGarageStats();
            });

            container.appendChild(card);
        });
    }

    updateGarageStats() {
        const car = window.CARS_DATABASE.find(c => c.id === window.game.selectedCarId) || window.CARS_DATABASE[0];
        const tire = window.UPGRADES_DATABASE.tires.find(t => t.id === window.game.customTire);
        const engine = window.UPGRADES_DATABASE.engines.find(e => e.id === window.game.customEngine);

        // Modulate stats by chosen upgrades
        let speedVal = car.stats.topSpeed;
        let accelVal = car.stats.accel;
        let gripVal = car.stats.handling;
        let brakeVal = car.stats.braking;
        let downforceVal = car.stats.downforce;

        if (engine && engine.modifiers) {
            if (engine.modifiers.maxKmh) speedVal = Math.min(100, speedVal + Math.round(engine.modifiers.maxKmh * 0.4));
            if (engine.modifiers.acceleration) accelVal = Math.min(100, Math.round(accelVal * engine.modifiers.acceleration));
        }

        if (tire && tire.modifiers) {
            if (tire.modifiers.grip) gripVal = Math.min(100, Math.round(gripVal * tire.modifiers.grip));
        }

        // Update Big Status Bars in UI
        const updateBar = (id, val, text) => {
            const el = document.getElementById(id);
            const txt = document.getElementById(id + '-text');
            if (el) el.style.width = `${val}%`;
            if (txt) txt.innerText = text;
        };

        updateBar('bar-speed', speedVal, `${Math.round(car.physics.maxKmh + (engine?.modifiers?.maxKmh || 0))} KM/H`);
        updateBar('bar-accel', accelVal, `${accelVal}/100`);
        updateBar('bar-handling', gripVal, `${gripVal}/100`);
        updateBar('bar-braking', brakeVal, `${brakeVal}/100`);
        updateBar('bar-downforce', downforceVal, `${downforceVal}/100`);

        const carTitle = document.getElementById('garage-car-title');
        const carDesc = document.getElementById('garage-car-desc');
        if (carTitle) carTitle.innerText = `${car.name} — ${car.team}`;
        if (carDesc) carDesc.innerText = car.description;
    }

    renderGarageOptions() {
        // Paint palettes
        const paintContainer = document.getElementById('palette-container');
        if (paintContainer) {
            paintContainer.innerHTML = '';
            window.UPGRADES_DATABASE.paints.forEach(p => {
                const swatch = document.createElement('button');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = p.hex;
                swatch.title = p.name;
                swatch.addEventListener('click', () => {
                    if (window.soundManager) window.soundManager.playClick();
                    window.game.customPaint = p.hex;
                    window.game.customSecondary = p.secondary;
                });
                paintContainer.appendChild(swatch);
            });
        }

        // Rims buttons
        const rimContainer = document.getElementById('rim-container');
        if (rimContainer) {
            rimContainer.innerHTML = '';
            window.UPGRADES_DATABASE.rims.forEach(r => {
                const btn = document.createElement('button');
                btn.className = `custom-option-btn ${r.id === window.game.customRim ? 'active' : ''}`;
                btn.innerText = r.name;
                btn.addEventListener('click', () => {
                    if (window.soundManager) window.soundManager.playClick();
                    window.game.customRim = r.id;
                    rimContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
                rimContainer.appendChild(btn);
            });
        }

        // Tires buttons
        const tireContainer = document.getElementById('tire-container');
        if (tireContainer) {
            tireContainer.innerHTML = '';
            window.UPGRADES_DATABASE.tires.forEach(t => {
                const btn = document.createElement('button');
                btn.className = `custom-option-btn ${t.id === window.game.customTire ? 'active' : ''}`;
                btn.innerHTML = `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${t.stripe}; margin-right:6px;"></span>${t.name}`;
                btn.addEventListener('click', () => {
                    if (window.soundManager) window.soundManager.playClick();
                    window.game.customTire = t.id;
                    tireContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateGarageStats();
                });
                tireContainer.appendChild(btn);
            });
        }

        // Engine buttons
        const engineContainer = document.getElementById('engine-container');
        if (engineContainer) {
            engineContainer.innerHTML = '';
            window.UPGRADES_DATABASE.engines.forEach(e => {
                const btn = document.createElement('button');
                btn.className = `custom-option-btn ${e.id === window.game.customEngine ? 'active' : ''}`;
                btn.innerText = e.name;
                btn.addEventListener('click', () => {
                    if (window.soundManager) window.soundManager.playClick();
                    window.game.customEngine = e.id;
                    engineContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateGarageStats();
                });
                engineContainer.appendChild(btn);
            });
        }
    }

    // --- Render Driver Selection (5 Male + 5 Female) ---
    renderDriverList(genderFilter = 'all') {
        const container = document.getElementById('driver-grid');
        if (!container) return;
        container.innerHTML = '';

        const filtered = window.DRIVERS_DATABASE.filter(d => genderFilter === 'all' || d.gender === genderFilter);

        filtered.forEach(driver => {
            const card = document.createElement('div');
            card.className = `driver-card ${driver.id === window.game.selectedDriverId ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="driver-portrait-box">
                    ${window.generateDriverPortraitSVG(driver)}
                </div>
                <div class="driver-info">
                    <div class="driver-name-row">
                        <h4>${driver.name}</h4>
                        <span class="driver-flag">${driver.flag}</span>
                    </div>
                    <span class="driver-title">${driver.title} (#${driver.number})</span>
                    <div class="driver-perk-box">
                        <span class="perk-label">PERK: ${driver.perkName}</span>
                        <p class="perk-desc">${driver.perkDescription}</p>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playSelect();
                window.game.selectedDriverId = driver.id;
                document.querySelectorAll('.driver-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            container.appendChild(card);
        });
    }

    // --- Render Track Selection ---
    renderTrackList() {
        const container = document.getElementById('track-grid');
        if (!container) return;
        container.innerHTML = '';

        window.TRACK_DATABASE.forEach(track => {
            const card = document.createElement('div');
            card.className = `track-card ${track.id === window.game.selectedTrackId ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="track-header">
                    <h3>${track.flag} ${track.name}</h3>
                    <span class="track-country">${track.country}</span>
                </div>
                <div class="track-stats-row">
                    <span>LENGTH: ${track.lengthKm}</span>
                    <span>LAPS: ${window.game?.selectedLaps || track.totalLaps}</span>
                    <span class="badge-difficulty">${track.difficulty}</span>
                </div>
                <p class="track-desc">${track.description}</p>
                <button class="btn-start-gp">START GRAND PRIX</button>
            `;

            card.querySelector('.btn-start-gp').addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.soundManager) window.soundManager.playSelect();
                window.game.selectedTrackId = track.id;
                this.showScreen('none');
                window.game.startRace(track.id);
            });

            card.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playClick();
                window.game.selectedTrackId = track.id;
                document.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });

            container.appendChild(card);
        });
    }

    showPodium(allCars) {
        this.screens.podium.classList.remove('hidden');
        const resultsContainer = document.getElementById('podium-results-body');
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        // Sort cars by finish order
        const sorted = [...allCars].sort((a, b) => a.racePosition - b.racePosition);

        sorted.forEach((car, idx) => {
            const tr = document.createElement('tr');
            const isPlayer = car.isPlayer;
            const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
            const bestLap = car.bestLapTime !== Infinity ? window.game.hud.formatTime(car.bestLapTime) : '--:--.---';

            tr.className = isPlayer ? 'row-player' : '';
            tr.innerHTML = `
                <td class="col-pos">${medal}</td>
                <td class="col-driver">${car.name} ${isPlayer ? '<span class="tag-you">(YOU)</span>' : ''}</td>
                <td class="col-best">${bestLap}</td>
                <td class="col-gap">${idx === 0 ? 'WINNER' : `+${(idx * 1.84 + Math.random() * 0.5).toFixed(3)}s`}</td>
            `;
            resultsContainer.appendChild(tr);
        });
    }
}

// Global Menu Controller instance
document.addEventListener('DOMContentLoaded', () => {
    window.menuController = new MenuController();
});
