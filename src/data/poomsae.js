export const POOMSAE_DATA = [
    // Perusliikkeet (Gi Chu) - Keltainen teema
    { name: 'Gi Chu 1', type: 'basic' },
    { name: 'Gi Chu 2', type: 'basic' },
    { name: 'Gi Chu 3', type: 'basic' },
    // Värivyöt (Taegeuk) - Sininen/Punainen teema
    { name: 'Taegeuk 1 (Il Jang)', type: 'color' },
    { name: 'Taegeuk 2 (Yi Jang)', type: 'color' },
    { name: 'Taegeuk 3 (Sam Jang)', type: 'color' },
    { name: 'Taegeuk 4 (Sa Jang)', type: 'color' },
    { name: 'Taegeuk 5 (Oh Jang)', type: 'color' },
    { name: 'Taegeuk 6 (Yuk Jang)', type: 'color' },
    { name: 'Taegeuk 7 (Chil Jang)', type: 'color' },
    { name: 'Taegeuk 8 (Pal Jang)', type: 'color' },
    // Mustat vyöt - Tumma teema
    { name: 'Koryo', type: 'black' },
    { name: 'Keumgang', type: 'black' },
    { name: 'Taebaek', type: 'black' },
    { name: 'Pyongwon', type: 'black' },
    { name: 'Sipjin', type: 'black' },
    { name: 'Jitae', type: 'black' },
    { name: 'Chonkwon', type: 'black' },
    { name: 'Hansu', type: 'black' },
    { name: 'Ilyo', type: 'black' }
];

export const getPoomsaeColorClass = (type) => {
    switch (type) {
        case 'basic': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'color': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'black': return 'bg-slate-800 text-slate-100 border-slate-600'
        default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
}
