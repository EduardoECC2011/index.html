/**
 * MusicSynth - Procedural Multi-Channel 90s Arcade / PS1 Chiptune Tracker
 * Synthesizes dynamic background music for Menu, Tracks (Monza, Monaco, Interlagos, Suzuka) and Victory.
 */
class MusicSynth {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.currentTrackId = null;
        this.tempo = 130; // BPM
        this.timerId = null;
        this.step = 0;
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1; // seconds

        // Note frequencies dictionary
        this.NOTES = {
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
            'C6': 1046.50, '---': null
        };

        this.initPatterns();
    }

    init() {
        if (!window.soundManager) return;
        window.soundManager.init();
        this.ctx = window.soundManager.ctx;
        if (!this.gainNode && this.ctx) {
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.gainNode.connect(window.soundManager.musicGain);
        }
    }

    initPatterns() {
        // --- 1. MENU THEME: Groovy 90s Paddock Arcade Funk (124 BPM) ---
        this.menuTrack = {
            tempo: 124,
            length: 32,
            bass: [
                'C2','---','C2','---', 'Eb2','---','F2','---',
                'G2','---','G2','---', 'Bb2','---','C3','---',
                'Ab2','---','Ab2','---','Bb2','---','Bb2','---',
                'G2','---','F2','---', 'Eb2','---','D2','---'
            ],
            lead: [
                'C4','Eb4','G4','Bb4','C5','---','Bb4','G4',
                'Eb4','---','F4','G4','---','F4','Eb4','C4',
                'Ab4','C5','Eb5','C5','Bb4','D5','F5','D5',
                'G4','Bb4','D5','Bb4','G4','F4','Eb4','D4'
            ],
            arp: [
                'C3','G3','C4','Eb4','C3','G3','C4','Eb4',
                'G2','D3','G3','Bb3','G2','D3','G3','Bb3',
                'Ab2','Eb3','Ab3','C4','Bb2','F3','Bb3','D4',
                'G2','D3','G3','B3', 'G2','D3','G3','B3'
            ],
            drums: [
                'K','H','S','H', 'K','H','S','H',
                'K','H','S','H', 'K','K','S','O',
                'K','H','S','H', 'K','H','S','H',
                'K','H','S','H', 'K','S','K','S'
            ]
        };

        // --- 2. MONZA THEME: Eurobeat Apex Rush (144 BPM) ---
        this.monzaTrack = {
            tempo: 144,
            length: 32,
            bass: [
                'A2','A2','A2','A2', 'F2','F2','F2','F2',
                'G2','G2','G2','G2', 'E2','E2','E2','E2',
                'F2','F2','F2','F2', 'D2','D2','D2','D2',
                'E2','E2','E2','E2', 'A2','G2','F2','E2'
            ],
            lead: [
                'A4','---','C5','---','E5','---','D5','C5',
                'D5','---','F5','---','E5','D5','C5','B4',
                'C5','---','E5','---','D5','C5','B4','A4',
                'B4','---','D5','---','C5','B4','A4','G#4'
            ],
            arp: [
                'A3','E4','A4','C5','F3','C4','F4','A4',
                'G3','D4','G4','B4','E3','B3','E4','G4',
                'F3','C4','F4','A4','D3','A3','D4','F4',
                'E3','B3','E4','G#4','A3','E4','A4','C5'
            ],
            drums: [
                'K','H','S','H', 'K','H','S','H',
                'K','H','S','H', 'K','H','S','O',
                'K','H','S','H', 'K','H','S','H',
                'K','K','S','H', 'K','S','K','O'
            ]
        };

        // --- 3. MONACO THEME: Riviera Synthwave / Seaside Luxury (120 BPM) ---
        this.monacoTrack = {
            tempo: 120,
            length: 32,
            bass: [
                'D2','---','D2','---', 'F2','---','F2','---',
                'G2','---','G2','---', 'A2','---','A2','---',
                'Bb2','---','Bb2','---','C3','---','C3','---',
                'A2','---','A2','---', 'D2','---','D2','---'
            ],
            lead: [
                '---','D4','F4','A4','---','C5','A4','F4',
                'G4','---','Bb4','D5','---','C5','A4','F4',
                'F4','G4','A4','D5','---','E5','D5','C5',
                'D5','---','---','---','---','---','---','---'
            ],
            arp: [
                'D3','A3','D4','F4','F3','C4','F4','A4',
                'G3','D4','G4','Bb4','A3','E4','A4','C5',
                'Bb3','F4','Bb4','D5','C4','G4','C5','E5',
                'A3','E4','A4','C#5','D3','A3','D4','F4'
            ],
            drums: [
                'K','---','S','H', 'K','---','S','H',
                'K','---','S','H', 'K','H','S','O',
                'K','---','S','H', 'K','---','S','H',
                'K','K','S','H', 'K','---','S','O'
            ]
        };

        // --- 4. INTERLAGOS THEME: Brazilian Samba Speed Grand Prix (136 BPM) ---
        this.interlagosTrack = {
            tempo: 136,
            length: 32,
            bass: [
                'D2','---','D2','D2', 'G2','---','G2','---',
                'A2','---','A2','A2', 'D2','---','F2','---',
                'G2','---','G2','G2', 'Bb2','---','Bb2','---',
                'A2','---','A2','---', 'D2','C2','B2','A2'
            ],
            lead: [
                'D4','F#4','A4','D5','C5','B4','A4','F#4',
                'G4','B4','D5','E5','D5','C5','B4','G4',
                'Bb4','D5','F5','G5','F5','Eb5','D5','Bb4',
                'A4','C#5','E5','A5','G5','E5','C#5','A4'
            ],
            arp: [
                'D3','F#3','A3','D4','G2','B3','D4','G4',
                'A2','C#4','E4','A4','D3','F3','A3','D4',
                'G3','Bb3','D4','G4','Bb3','D4','F4','Bb4',
                'A3','C#4','E4','A4','D3','A3','D4','F#4'
            ],
            drums: [
                'K','H','S','K', 'H','K','S','H',
                'K','H','S','K', 'H','K','S','O',
                'K','H','S','K', 'H','K','S','H',
                'K','K','S','K', 'K','S','K','O'
            ]
        };

        // --- 5. SUZUKA THEME: Cyberpunk Neo-Tokyo GP (142 BPM) ---
        this.suzukaTrack = {
            tempo: 142,
            length: 32,
            bass: [
                'E2','E2','---','E2', 'C2','C2','---','C2',
                'D2','D2','---','D2', 'B2','B2','---','B2',
                'C2','C2','---','C2', 'A2','A2','---','A2',
                'B2','B2','---','B2', 'E2','---','G2','---'
            ],
            lead: [
                'E5','---','B4','C5','D5','---','C5','B4',
                'C5','---','A4','---','B4','---','G4','---',
                'A4','---','E4','F4','G4','---','F4','E4',
                'F#4','---','G4','---','A4','---','B4','---'
            ],
            arp: [
                'E3','B3','E4','G4','C3','G3','C4','E4',
                'D3','A3','D4','F#4','B2','F#3','B3','D#4',
                'C3','G3','C4','E4','A2','E3','A3','C4',
                'B2','F#3','B3','D#4','E3','B3','E4','G4'
            ],
            drums: [
                'K','H','S','H', 'K','H','S','H',
                'K','H','S','H', 'K','H','S','O',
                'K','H','S','H', 'K','H','S','H',
                'K','S','K','S', 'K','K','S','O'
            ]
        };

        // --- 6. VICTORY FANFARE (Celebration theme) ---
        this.victoryTrack = {
            tempo: 130,
            length: 16,
            bass: [
                'C2','---','C2','---', 'G2','---','G2','---',
                'A2','---','F2','---', 'G2','---','C2','---'
            ],
            lead: [
                'C4','E4','G4','C5', '---','G4','C5','---',
                'A4','C5','F5','---', 'G4','B4','D5','C5'
            ],
            arp: [
                'C3','G3','C4','E4', 'G2','D3','G3','B3',
                'A2','E3','A3','C4', 'G2','D3','G3','C4'
            ],
            drums: [
                'K','H','S','H', 'K','H','S','H',
                'K','H','S','H', 'K','K','S','O'
            ]
        };
    }

    playTrack(trackName) {
        this.init();
        if (!this.ctx) return;

        let pattern = this.menuTrack;
        if (trackName === 'monza') pattern = this.monzaTrack;
        else if (trackName === 'monaco') pattern = this.monacoTrack;
        else if (trackName === 'interlagos') pattern = this.interlagosTrack;
        else if (trackName === 'suzuka') pattern = this.suzukaTrack;
        else if (trackName === 'victory') pattern = this.victoryTrack;

        if (this.currentTrackId === trackName && this.isPlaying) return;

        this.stop();
        this.currentTrack = pattern;
        this.currentTrackId = trackName;
        this.tempo = pattern.tempo;
        this.step = 0;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime + 0.05;

        // Start scheduler loop
        this.schedule();
    }

    schedule() {
        if (!this.isPlaying) return;

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.playStep(this.step, this.nextNoteTime);
            const secondsPerBeat = 60.0 / this.tempo;
            const secondsPer16th = secondsPerBeat / 4;
            this.nextNoteTime += secondsPer16th;
            this.step = (this.step + 1) % this.currentTrack.length;
        }

        this.timerId = setTimeout(() => this.schedule(), 35);
    }

    playStep(stepIndex, time) {
        if (!this.ctx || !this.currentTrack) return;

        const bassNote = this.currentTrack.bass[stepIndex];
        const leadNote = this.currentTrack.lead[stepIndex];
        const arpNote = this.currentTrack.arp[stepIndex];
        const drumHit = this.currentTrack.drums[stepIndex];

        // 1. Bass voice (Punchy triangle wave with fast decay)
        if (bassNote && this.NOTES[bassNote]) {
            this.triggerBass(this.NOTES[bassNote], time);
        }

        // 2. Arp / Chord accompaniment (Warm pulse/saw)
        if (arpNote && this.NOTES[arpNote]) {
            this.triggerArp(this.NOTES[arpNote], time);
        }

        // 3. Lead melody (Crisp retro square wave)
        if (leadNote && this.NOTES[leadNote]) {
            this.triggerLead(this.NOTES[leadNote], time);
        }

        // 4. Drum channel
        if (drumHit) {
            this.triggerDrum(drumHit, time);
        }
    }

    triggerBass(freq, time) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    triggerArp(freq, time) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + 0.13);
    }

    triggerLead(freq, time) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + 0.24);
    }

    triggerDrum(type, time) {
        // Kick
        if (type === 'K') {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, time);
            osc.frequency.exponentialRampToValueAtTime(35, time + 0.1);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

            osc.connect(gain);
            gain.connect(this.gainNode);

            osc.start(time);
            osc.stop(time + 0.13);
        }
        // Snare
        else if (type === 'S') {
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.28, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.gainNode);

            noise.start(time);
        }
        // Closed Hi-Hat
        else if (type === 'H') {
            const bufferSize = this.ctx.sampleRate * 0.04;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(7000, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.gainNode);

            noise.start(time);
        }
        // Open Hi-Hat
        else if (type === 'O') {
            const bufferSize = this.ctx.sampleRate * 0.18;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(6000, time);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.gainNode);

            noise.start(time);
        }
    }

    stop() {
        this.isPlaying = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.currentTrackId = null;
    }
}

// Global music synth instance
window.musicSynth = new MusicSynth();
