/**
 * SoundManager - Procedural Web Audio API sound synthesizer
 * Formula 1 Sound Effects: Multi-harmonic engine, gear shifts, tire screeches,
 * curb/zebra rumbles, braking, impacts, and countdown beeps.
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;

        this.masterVolume = 0.8;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.6;
        this.muted = false;

        // Engine sound nodes
        this.engineActive = false;
        this.osc1 = null;
        this.osc2 = null;
        this.oscSub = null;
        this.noiseNode = null;
        this.engineFilter = null;
        this.engineGain = null;

        // Tire screech nodes
        this.screechNode = null;
        this.screechFilter = null;
        this.screechGain = null;
        this.screeching = false;

        // Curb rumble nodes
        this.curbOsc = null;
        this.curbGain = null;
        this.onCurb = false;

        this.loadSettings();
    }

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("Web Audio API not supported in this browser.");
            return;
        }

        this.ctx = new AudioContextClass();

        // Master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // SFX bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // Music bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.setupTireScreech();
        this.setupCurbRumble();
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('retro_f1_audio_settings');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.masterVolume !== undefined) this.masterVolume = data.masterVolume;
                if (data.sfxVolume !== undefined) this.sfxVolume = data.sfxVolume;
                if (data.musicVolume !== undefined) this.musicVolume = data.musicVolume;
                if (data.muted !== undefined) this.muted = data.muted;
            }
        } catch (e) {
            console.error("Could not load audio settings", e);
        }
    }

    saveSettings() {
        try {
            const data = {
                masterVolume: this.masterVolume,
                sfxVolume: this.sfxVolume,
                musicVolume: this.musicVolume,
                muted: this.muted
            };
            localStorage.setItem('retro_f1_audio_settings', JSON.stringify(data));
        } catch (e) {
            console.error("Could not save audio settings", e);
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, val));
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
        return this.muted;
    }

    // --- Dynamic F1 Engine Synthesizer (Warm Throaty Formula 1 V10/V8 Roar) ---
    startEngine() {
        if (!this.ctx) this.init();
        if (this.engineActive) return;
        this.resume();

        const t = this.ctx.currentTime;

        // 1. Primary fundamental oscillator (Warm triangle wave - zero harsh buzz)
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = 'triangle';
        this.osc1.frequency.setValueAtTime(45, t);

        // 2. Harmonic growl oscillator (Detuned triangle for thick mechanical body)
        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = 'triangle';
        this.osc2.frequency.setValueAtTime(90, t);

        // 3. Deep Sub-bass oscillator (Pure sine wave for chest-thumping low-end rumble)
        this.oscSub = this.ctx.createOscillator();
        this.oscSub.type = 'sine';
        this.oscSub.frequency.setValueAtTime(32, t);

        // 4. Cylinder pulse modulation (LFO creating authentic mechanical cylinder firings)
        this.engineLfo = this.ctx.createOscillator();
        this.engineLfo.type = 'sawtooth';
        this.engineLfo.frequency.setValueAtTime(22, t);

        this.engineLfoGain = this.ctx.createGain();
        this.engineLfoGain.gain.setValueAtTime(12, t);
        this.engineLfo.connect(this.engineLfoGain);
        this.engineLfoGain.connect(this.osc1.frequency);
        this.engineLfoGain.connect(this.osc2.frequency);

        // 5. Warm Lowpass Acoustic Filter (Butterworth low Q - eliminates all shrill/mosquito frequencies)
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(350, t);
        this.engineFilter.Q.setValueAtTime(0.7, t);

        // 6. Engine Master Gain
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.001, t);
        this.engineGain.gain.exponentialRampToValueAtTime(0.32, t + 0.12);

        // Routing
        this.osc1.connect(this.engineFilter);
        this.osc2.connect(this.engineFilter);
        this.oscSub.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);

        this.osc1.start(t);
        this.osc2.start(t);
        this.oscSub.start(t);
        this.engineLfo.start(t);

        this.engineActive = true;
    }

    /**
     * Updates engine tone based on RPM, throttle load, and gear
     * Creates a deep, powerful, non-irritating engine rumble
     */
    updateEngine(rpm, throttle = 0, gear = 1) {
        if (!this.engineActive || !this.ctx) return;

        const t = this.ctx.currentTime;
        // Warm fundamental frequencies: 42 Hz at idle up to ~185 Hz at redline
        const baseFreq = 42 + (rpm * 135) + (gear * 4);
        const subFreq = 28 + (rpm * 45);
        const lfoFreq = 18 + (rpm * 40);

        // Warm lowpass cutoff: keeps frequencies deep and rounded (280Hz - 850Hz)
        const cutoff = 260 + (rpm * 420) + (throttle * 240);

        // Dynamic gain: punchy on throttle, pleasant low hum on coasting
        const targetGain = 0.20 + (throttle * 0.18) + (rpm * 0.08);

        this.osc1.frequency.setTargetAtTime(baseFreq, t, 0.06);
        this.osc2.frequency.setTargetAtTime(baseFreq * 2.01, t, 0.06);
        this.oscSub.frequency.setTargetAtTime(subFreq, t, 0.06);
        this.engineLfo.frequency.setTargetAtTime(lfoFreq, t, 0.06);
        this.engineLfoGain.gain.setTargetAtTime(8 + rpm * 18, t, 0.06);

        this.engineFilter.frequency.setTargetAtTime(cutoff, t, 0.06);
        this.engineGain.gain.setTargetAtTime(Math.min(0.55, targetGain), t, 0.06);
    }

    stopEngine() {
        if (!this.engineActive || !this.ctx) return;
        const t = this.ctx.currentTime;
        this.engineGain.gain.linearRampToValueAtTime(0.001, t + 0.1);
        setTimeout(() => {
            try {
                this.osc1?.stop();
                this.osc2?.stop();
                this.oscSub?.stop();
                this.engineLfo?.stop();
                this.osc1?.disconnect();
                this.osc2?.disconnect();
                this.oscSub?.disconnect();
                this.engineLfo?.disconnect();
                this.engineLfoGain?.disconnect();
                this.engineFilter?.disconnect();
                this.engineGain?.disconnect();
            } catch (e) {}
            this.engineActive = false;
        }, 120);
    }

    // --- Gear Shift / Exhaust Pop Sound ---
    playGearShift() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Exhaust backfire / throttle pop (white noise puff + low thump)
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, t);
        filter.Q.setValueAtTime(1.5, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(t);
    }

    // --- Tire Screech Synthesizer ---
    setupTireScreech() {
        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        this.screechSource = this.ctx.createBufferSource();
        this.screechSource.buffer = buffer;
        this.screechSource.loop = true;

        this.screechFilter = this.ctx.createBiquadFilter();
        this.screechFilter.type = 'bandpass';
        this.screechFilter.frequency.setValueAtTime(1600, this.ctx.currentTime);
        this.screechFilter.Q.setValueAtTime(5, this.ctx.currentTime);

        this.screechGain = this.ctx.createGain();
        this.screechGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

        this.screechSource.connect(this.screechFilter);
        this.screechFilter.connect(this.screechGain);
        this.screechGain.connect(this.sfxGain);

        this.screechSource.start();
    }

    /**
     * Updates tire screech based on slip angle and lateral force
     * @param {number} slipIntensity 0 to 1
     * @param {number} speedRatio 0 to 1
     */
    updateTireScreech(slipIntensity, speedRatio = 1) {
        if (!this.screechGain || !this.ctx) return;
        const t = this.ctx.currentTime;
        if (slipIntensity > 0.15 && speedRatio > 0.1) {
            const targetGain = Math.min(0.4, (slipIntensity - 0.1) * 0.7 * speedRatio);
            const freq = 1300 + (slipIntensity * 800) + (speedRatio * 400);
            this.screechFilter.frequency.setTargetAtTime(freq, t, 0.04);
            this.screechGain.gain.setTargetAtTime(targetGain, t, 0.04);
        } else {
            this.screechGain.gain.setTargetAtTime(0.0001, t, 0.08);
        }
    }

    // --- Brake Squeal ---
    playBrakeSound(intensity = 0.5) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200 + Math.random() * 300, t);
        osc.frequency.exponentialRampToValueAtTime(2600, t + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08 * intensity, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.2);
    }

    // --- Curb / Zebra Rumble Synthesizer ---
    setupCurbRumble() {
        this.curbOsc = this.ctx.createOscillator();
        this.curbOsc.type = 'square';
        this.curbOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

        const curbFilter = this.ctx.createBiquadFilter();
        curbFilter.type = 'lowpass';
        curbFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

        this.curbGain = this.ctx.createGain();
        this.curbGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

        this.curbOsc.connect(curbFilter);
        curbFilter.connect(this.curbGain);
        this.curbGain.connect(this.sfxGain);

        this.curbOsc.start();
    }

    setCurbRumble(active, speedRatio = 1) {
        if (!this.curbGain || !this.ctx) return;
        const t = this.ctx.currentTime;
        if (active && speedRatio > 0.05) {
            const freq = 45 + (speedRatio * 55);
            this.curbOsc.frequency.setTargetAtTime(freq, t, 0.04);
            this.curbGain.gain.setTargetAtTime(0.28 * Math.min(1, speedRatio * 1.5), t, 0.03);
        } else {
            this.curbGain.gain.setTargetAtTime(0.0001, t, 0.05);
        }
    }

    // --- Collision Impact Sound ---
    playCrashSound(intensity = 1.0) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // 1. Thud
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.5 * intensity, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        // 2. Metal crunch noise
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.Q.setValueAtTime(2, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.45 * intensity, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.22);
        noise.start(t);
    }

    // --- Starting Lights Countdown Beeps ---
    playCountdownBeep(isGo = false) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        // Red lights: 520Hz (short tone). Green / Lights Out: 1040Hz (longer tone)
        const freq = isGo ? 1046.5 : 523.25;
        const duration = isGo ? 0.6 : 0.2;

        osc.frequency.setValueAtTime(freq, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.setValueAtTime(0.3, t + duration * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    // --- UI Button Click / Hover Sounds ---
    playClick() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    playSelect() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.setValueAtTime(659.25, t + 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.13);
    }

    // Lap completed chime
    playLapChime() {
        if (!this.ctx || this.muted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.06);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15, t + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t + idx * 0.06);
            osc.stop(t + idx * 0.06 + 0.16);
        });
    }
}

// Global sound manager instance
window.soundManager = new SoundManager();
