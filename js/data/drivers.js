/**
 * DRIVERS_DATABASE - 10 Diverse Formula 1 Characters (5 Male, 5 Female)
 * Each with unique backstory, nationality, perks, and retro pixel portraits.
 */
window.DRIVERS_DATABASE = [
    // --- 5 MALE DRIVERS ---
    {
        id: 'ayrton_s',
        name: 'Ayrton Silva',
        gender: 'male',
        country: 'Brazil',
        flag: '🇧🇷',
        number: 12,
        title: 'The Rain Master',
        perkName: 'Wet & Curb Traction',
        perkDescription: '+12% grip when clipping curbs and wet surfaces',
        perkModifier: { curbGrip: 1.12, handling: 1.04 },
        helmetColor: '#ffd700',
        suitColor: '#107c10',
        hairColor: '#2b1d0c',
        skinColor: '#dca177',
        bio: 'Regarded as a god of throttle modulation. Can feel grip where others find only air and asphalt.'
    },
    {
        id: 'lewis_s',
        name: 'Lewis Sterling',
        gender: 'male',
        country: 'United Kingdom',
        flag: '🇬🇧',
        number: 44,
        title: 'The Apex Knight',
        perkName: 'Late Apex Mastery',
        perkDescription: '+8% tire conservation and higher corner exit speed',
        perkModifier: { acceleration: 1.06, handling: 1.05 },
        helmetColor: '#e0ff00',
        suitColor: '#ffffff',
        hairColor: '#1a1a1a',
        skinColor: '#8d5524',
        bio: 'Calm under extreme pressure. Hits every apex with surgical precision and devastating consistency.'
    },
    {
        id: 'max_v',
        name: 'Max Van Dijk',
        gender: 'male',
        country: 'Netherlands',
        flag: '🇳🇱',
        number: 1,
        title: 'The Flying Dutchman',
        perkName: 'Relentless Attack',
        perkDescription: '+6% straight-line top speed during slipstream overtakes',
        perkModifier: { maxSpeed: 1.06, acceleration: 1.03 },
        helmetColor: '#ff6600',
        suitColor: '#0c1636',
        hairColor: '#a67244',
        skinColor: '#fcd3b6',
        bio: 'Fierce competitor who never lifts off. Will dive down the inside into turn 1 regardless of risk.'
    },
    {
        id: 'jean_l',
        name: 'Jean-Luc Laurent',
        gender: 'male',
        country: 'France',
        flag: '🇫🇷',
        number: 27,
        title: 'Le Professeur',
        perkName: 'Chassis Tuning',
        perkDescription: '+10% braking efficiency and reduced tire slip',
        perkModifier: { brakingPower: 1.10, grip: 1.04 },
        helmetColor: '#002654',
        suitColor: '#0055a5',
        hairColor: '#4a4a4a',
        skinColor: '#e8beac',
        bio: 'Master tactician who reads race telemetry like poetry. Knows exactly when to save tires and when to pounce.'
    },
    {
        id: 'kenji_t',
        name: 'Kenji Takahashi',
        gender: 'male',
        country: 'Japan',
        flag: '🇯🇵',
        number: 77,
        title: 'Suzuka Drift King',
        perkName: 'Slip Angle Wizard',
        perkDescription: '+15% stability and drift recovery during high-speed slides',
        perkModifier: { handling: 1.08, grip: 1.03 },
        helmetColor: '#ffffff',
        suitColor: '#bc002d',
        hairColor: '#111111',
        skinColor: '#fae3d9',
        bio: 'Trained on mountain touges before entering single seaters. Legendary car control on razor edge limits.'
    },

    // --- 5 FEMALE DRIVERS ---
    {
        id: 'elena_r',
        name: 'Elena Rostova',
        gender: 'female',
        country: 'Italy',
        flag: '🇮🇹',
        number: 16,
        title: 'Monza Rocket',
        perkName: 'Lightning Reflex Launch',
        perkDescription: '+15% launch acceleration from the grid and out of hairpins',
        perkModifier: { acceleration: 1.09, maxSpeed: 1.03 },
        helmetColor: '#e10600',
        suitColor: '#e10600',
        hairColor: '#8a2be2',
        skinColor: '#f1c27d',
        bio: 'Bred in the heart of Modena. Possesses electric reaction times and an uncompromising need for speed.'
    },
    {
        id: 'sofia_m',
        name: 'Sofia Martinez',
        gender: 'female',
        country: 'Spain',
        flag: '🇪🇸',
        number: 55,
        title: 'Matador of Monaco',
        perkName: 'Precision Braking',
        perkDescription: '+12% braking deceleration allowing ultra-late braking zones',
        perkModifier: { brakingPower: 1.12, handling: 1.04 },
        helmetColor: '#ffcc00',
        suitColor: '#aa0000',
        hairColor: '#1c1c1c',
        skinColor: '#c68642',
        bio: 'Feared on street tracks. Brakes meters later than anyone else into tight hairpins and chicanes.'
    },
    {
        id: 'maya_l',
        name: 'Maya Lindqvist',
        gender: 'female',
        country: 'Sweden',
        flag: '🇸🇪',
        number: 8,
        title: 'Valkyrie of Downforce',
        perkName: 'Aerodynamic Fluidity',
        perkDescription: '+10% downforce bonus in high-speed sweeping corners',
        perkModifier: { downforce: 1.10, grip: 1.05 },
        helmetColor: '#006aa7',
        suitColor: '#fecc00',
        hairColor: '#f7d560',
        skinColor: '#fde4cb',
        bio: 'Former aerospace test engineer turned racing champion. Glides effortlessly through high-G corners.'
    },
    {
        id: 'chloe_m',
        name: 'Chloe Moreau',
        gender: 'female',
        country: 'France',
        flag: '🇫🇷',
        number: 31,
        title: 'Aero Virtuoso',
        perkName: 'Boost Energy Efficiency',
        perkDescription: '+50% boost/DRS battery recharge rate',
        perkModifier: { acceleration: 1.05, maxSpeed: 1.04 },
        helmetColor: '#00e5ff',
        suitColor: '#1e3c72',
        hairColor: '#5c3317',
        skinColor: '#e0ac69',
        bio: 'Analytical genius who optimizes hybrid power deployment to deliver devastating overtakes.'
    },
    {
        id: 'sarah_j',
        name: 'Sarah Jenkins',
        gender: 'female',
        country: 'United States',
        flag: '🇺🇸',
        number: 23,
        title: 'Texas Tornado',
        perkName: 'Slipstream Siphon',
        perkDescription: '+10% draft speed increase when trailing behind opponents',
        perkModifier: { maxSpeed: 1.07, acceleration: 1.04 },
        helmetColor: '#3c3b6e',
        suitColor: '#b22234',
        hairColor: '#d62828',
        skinColor: '#ffdbac',
        bio: 'Aggressive oval racing graduate who thrives in wheel-to-wheel battles and triple-slipstream drafts.'
    }
];

/**
 * Generate a retro pixel art portrait for a driver
 */
window.generateDriverPortraitSVG = function(driver) {
    const isFemale = driver.gender === 'female';
    const hair = driver.hairColor;
    const skin = driver.skinColor;
    const helmet = driver.helmetColor;
    const suit = driver.suitColor;

    // SVG pixel-art stylized portrait (64x64)
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" style="image-rendering: pixelated; shape-rendering: crispEdges;">
        <!-- Background -->
        <rect width="64" height="64" fill="#14171d"/>
        <rect x="2" y="2" width="60" height="60" fill="#1e232d" stroke="#333945" stroke-width="2"/>
        
        <!-- Racing Suit / Shoulders -->
        <rect x="12" y="44" width="40" height="18" fill="${suit}" rx="2"/>
        <rect x="20" y="44" width="24" height="18" fill="#111111"/>
        <rect x="30" y="44" width="4" height="18" fill="#ffffff"/>
        
        <!-- Neck -->
        <rect x="26" y="38" width="12" height="8" fill="${skin}"/>
        
        <!-- Head / Face -->
        <rect x="20" y="16" width="24" height="24" fill="${skin}"/>
        
        <!-- Hair -->
        ${isFemale ? `
            <rect x="18" y="12" width="28" height="8" fill="${hair}"/>
            <rect x="16" y="18" width="6" height="24" fill="${hair}"/>
            <rect x="42" y="18" width="6" height="24" fill="${hair}"/>
            <rect x="20" y="10" width="24" height="4" fill="${hair}"/>
        ` : `
            <rect x="18" y="10" width="28" height="8" fill="${hair}"/>
            <rect x="16" y="16" width="5" height="10" fill="${hair}"/>
            <rect x="43" y="16" width="5" height="10" fill="${hair}"/>
        `}
        
        <!-- Eyes & Eyebrows -->
        <rect x="24" y="23" width="5" height="2" fill="#222"/>
        <rect x="35" y="23" width="5" height="2" fill="#222"/>
        <rect x="24" y="26" width="4" height="3" fill="#ffffff"/>
        <rect x="26" y="26" width="2" height="3" fill="#111111"/>
        <rect x="36" y="26" width="4" height="3" fill="#ffffff"/>
        <rect x="36" y="26" width="2" height="3" fill="#111111"/>
        
        <!-- Nose -->
        <rect x="31" y="29" width="2" height="4" fill="#a06040"/>
        
        <!-- Mouth / Smile -->
        <rect x="28" y="35" width="8" height="2" fill="#903030"/>
        
        <!-- Mini Helmet Badge in corner -->
        <circle cx="52" cy="14" r="7" fill="${helmet}" stroke="#ffffff" stroke-width="1.5"/>
        <rect x="52" y="12" width="6" height="4" fill="#111111"/>
    </svg>`;
};
