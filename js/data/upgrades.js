/**
 * UPGRADES_DATABASE - Garage Customization Options
 * Liveries, custom colors, wheel rims, tire compounds, and engine packages.
 */
window.UPGRADES_DATABASE = {
    paints: [
        { id: 'scuderia_red', name: 'Scuderia Red', hex: '#e10600', secondary: '#111111' },
        { id: 'silver_chrome', name: 'Silver Arrow', hex: '#c0c0c0', secondary: '#00d2be' },
        { id: 'papaya_speed', name: 'Papaya Orange', hex: '#ff8700', secondary: '#111111' },
        { id: 'racing_green', name: 'British Racing Green', hex: '#004225', secondary: '#c0c0c0' },
        { id: 'black_gold', name: 'Lotus Black & Gold', hex: '#111111', secondary: '#d4af37' },
        { id: 'williams_blue', name: 'Monaco Royal Blue', hex: '#005aff', secondary: '#ffffff' },
        { id: 'cyber_cyan', name: 'Neon Cyber Cyan', hex: '#00f0ff', secondary: '#7b00ff' },
        { id: 'pure_pearl', name: 'Pearl White GP', hex: '#f0f0f0', secondary: '#e10600' }
    ],

    rims: [
        { id: 'spoke', name: 'Classic Spoke', desc: 'Standard F1 magnesium wheel' },
        { id: 'turbofan', name: 'Aero Turbofan', desc: 'Carbon aerodynamic flow cover' },
        { id: 'gold_mesh', name: 'Retro Gold Mesh', desc: 'Legendary 90s BBS cross-spoke' },
        { id: 'star', name: 'Lightweight Star', desc: '5-star lightweight alloy rim' }
    ],

    tires: [
        {
            id: 'soft',
            name: 'P-Zero Soft (Red)',
            desc: 'Maximum asphalt grip and cornering speed',
            stripe: '#e10600',
            modifiers: { grip: 1.06, maxSpeed: 1.02 }
        },
        {
            id: 'medium',
            name: 'P-Zero Medium (Yellow)',
            desc: 'Balanced traction and progressive slide feedback',
            stripe: '#f5c518',
            modifiers: { grip: 1.0, maxSpeed: 1.0 }
        },
        {
            id: 'hard',
            name: 'P-Zero Hard (White)',
            desc: 'Maximum high-speed stability and slide durability',
            stripe: '#ffffff',
            modifiers: { grip: 0.94, maxSpeed: 1.04 }
        },
        {
            id: 'wet',
            name: 'Cinturato Wet (Blue)',
            desc: 'Deep groove tread: unrivaled curb & wet asphalt grip',
            stripe: '#0088cc',
            modifiers: { curbGrip: 1.25, grassGrip: 1.20 }
        }
    ],

    engines: [
        {
            id: 'v8_turbo',
            name: '1.6L V8 Turbo Hybrid',
            desc: 'Snappy low-RPM torque for devastating corner exit punch',
            modifiers: { acceleration: 1.08, maxKmh: 0 }
        },
        {
            id: 'v10_screamer',
            name: '3.0L V10 High-RPM Screamer',
            desc: 'High-revving atmospheric icon. Roars at 18,000 RPM!',
            modifiers: { acceleration: 1.04, maxKmh: 12 }
        },
        {
            id: 'v12_heritage',
            name: '3.5L V12 Grand Prix Classic',
            desc: 'Pure thunderous straight-line velocity',
            modifiers: { acceleration: 1.02, maxKmh: 18 }
        },
        {
            id: 'hybrid_kers',
            name: 'Cyber Dual-MGU ERS',
            desc: 'Electric booster system with 40% faster battery recharge',
            modifiers: { acceleration: 1.06, maxKmh: 6, boostRate: 1.4 }
        }
    ]
};
