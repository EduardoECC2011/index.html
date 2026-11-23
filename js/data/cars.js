/**
 * CARS_DATABASE - Formula 1 Chassis Models with distinct physics and status bars
 */
window.CARS_DATABASE = [
    {
        id: 'scuderia',
        name: 'Scuderia V10',
        team: 'Scuderia Corsa',
        tagline: 'Pure Italian Horsepower',
        description: 'Iconic roaring V10 machine built for raw high-speed domination. High top speed and blistering straight-line acceleration.',
        primaryColor: '#e10600',
        secondaryColor: '#1a1a1a',
        accentColor: '#ffffff',
        helmetColor: '#ffff00',
        stats: {
            topSpeed: 95,   // maxKmh ~355 km/h
            accel: 88,
            handling: 80,
            braking: 82,
            downforce: 80
        },
        physics: {
            maxKmh: 355,
            acceleration: 0.185,
            handling: 0.054,
            grip: 0.96,
            brakingPower: 0.36,
            downforce: 0.85,
            mass: 745
        }
    },
    {
        id: 'silver_arrow',
        name: 'Silver Arrow GP',
        team: 'Stuttgart Dynamics',
        tagline: 'German Engineering & Aerodynamic Balance',
        description: 'Impeccable balance of chassis stiffness and power delivery. Razor-sharp corner entries and smooth tire response.',
        primaryColor: '#c0c0c0',
        secondaryColor: '#00d2be',
        accentColor: '#111111',
        helmetColor: '#00d2be',
        stats: {
            topSpeed: 88,
            accel: 94,
            handling: 90,
            braking: 88,
            downforce: 89
        },
        physics: {
            maxKmh: 345,
            acceleration: 0.195,
            handling: 0.058,
            grip: 0.98,
            brakingPower: 0.38,
            downforce: 0.90,
            mass: 735
        }
    },
    {
        id: 'bull_apex',
        name: 'Apex Bull RB',
        team: 'Apex Energy Racing',
        tagline: 'The Downforce & Cornering Monster',
        description: 'Unrivaled aerodynamic downforce allows you to take fast sweepers flat-out and brake deeper than anyone else.',
        primaryColor: '#0c1636',
        secondaryColor: '#dc0000',
        accentColor: '#ffd700',
        helmetColor: '#dc0000',
        stats: {
            topSpeed: 84,
            accel: 90,
            handling: 98,
            braking: 95,
            downforce: 98
        },
        physics: {
            maxKmh: 338,
            acceleration: 0.188,
            handling: 0.063,
            grip: 1.05,
            brakingPower: 0.42,
            downforce: 1.05,
            mass: 730
        }
    },
    {
        id: 'heritage_turbo',
        name: 'Heritage 98 Turbo',
        team: 'Legacy Grand Prix',
        tagline: 'Lightweight Raw Mechanical Beast',
        description: 'A tribute to the golden turbo era. Ultra-light chassis with explosive power surges. Demands precision throttle control.',
        primaryColor: '#111111',
        secondaryColor: '#d4af37',
        accentColor: '#d4af37',
        helmetColor: '#107c10',
        stats: {
            topSpeed: 98,
            accel: 96,
            handling: 74,
            braking: 78,
            downforce: 75
        },
        physics: {
            maxKmh: 362,
            acceleration: 0.205,
            handling: 0.051,
            grip: 0.92,
            brakingPower: 0.34,
            downforce: 0.78,
            mass: 695
        }
    },
    {
        id: 'cyber_gp',
        name: 'Cyber GP-2000',
        team: 'Neo-Tokyo Motorsport',
        tagline: 'High-Tech Hybrid Prototype',
        description: 'Next-generation experimental prototype equipped with dual electric recovery motors for instant off-the-line launch.',
        primaryColor: '#00f0ff',
        secondaryColor: '#7b00ff',
        accentColor: '#ffffff',
        helmetColor: '#00f0ff',
        stats: {
            topSpeed: 91,
            accel: 98,
            handling: 85,
            braking: 92,
            downforce: 87
        },
        physics: {
            maxKmh: 350,
            acceleration: 0.210,
            handling: 0.056,
            grip: 0.97,
            brakingPower: 0.40,
            downforce: 0.88,
            mass: 755
        }
    }
];
