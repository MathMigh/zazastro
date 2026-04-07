// ============================================================
// traditionalTables.ts — Tabelas de Referência Astrológica Tradicional
// Sistema: Ptolemaico / Lilly / Frawley
// ============================================================

export const SIGNS = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];

// Elementos: 0=Fogo, 1=Terra, 2=Ar, 3=Água
export const SIGN_ELEMENT: number[] = [0,1,2,3,0,1,2,3,0,1,2,3];
export const ELEMENT_NAMES = ["Fogo","Terra","Ar","Água"];

// Qualidades (quente/frio, úmido/seco)
// [hot, moist] — true/false
export const SIGN_QUALITIES: [boolean,boolean][] = [
  [true,false],   // Áries: quente, seco
  [false,false],  // Touro: frio, seco
  [true,true],    // Gêmeos: quente, úmido
  [false,true],   // Câncer: frio, úmido
  [true,false],   // Leão: quente, seco
  [false,false],  // Virgem: frio, seco
  [true,true],    // Libra: quente, úmido
  [false,true],   // Escorpião: frio, úmido
  [true,false],   // Sagitário: quente, seco
  [false,false],  // Capricórnio: frio, seco
  [true,true],    // Aquário: quente, úmido
  [false,true],   // Peixes: frio, úmido
];

// Gênero: true = masculino, false = feminino
export const SIGN_GENDER: boolean[] = [true,false,true,false,true,false,true,false,true,false,true,false];

// ============================================================
// DOMICÍLIOS (Regentes dos Signos)
// signIndex → planeta regente
// ============================================================
export const DOMICILE_RULER: string[] = [
  "Marte",    // Áries
  "Vênus",    // Touro
  "Mercúrio", // Gêmeos
  "Lua",      // Câncer
  "Sol",      // Leão
  "Mercúrio", // Virgem
  "Vênus",    // Libra
  "Marte",    // Escorpião
  "Júpiter",  // Sagitário
  "Saturno",  // Capricórnio
  "Saturno",  // Aquário
  "Júpiter",  // Peixes
];

// ============================================================
// EXALTAÇÕES
// planeta → signIndex
// ============================================================
export const EXALTATION: Record<string, number> = {
  "Sol": 0,       // Áries
  "Lua": 1,       // Touro
  "Mercúrio": 5,  // Virgem
  "Vênus": 11,    // Peixes
  "Marte": 9,     // Capricórnio
  "Júpiter": 3,   // Câncer
  "Saturno": 6,   // Libra
};

// ============================================================
// DETRIMENTOS (Exílio) — signo(s) onde o planeta está debilitado
// ============================================================
export const DETRIMENT: Record<string, number[]> = {
  "Sol": [10],        // Aquário
  "Lua": [9],         // Capricórnio
  "Mercúrio": [8,11], // Sagitário, Peixes
  "Vênus": [0,7],     // Áries, Escorpião
  "Marte": [1,6],     // Touro, Libra
  "Júpiter": [2,5],   // Gêmeos, Virgem
  "Saturno": [3,4],   // Câncer, Leão
};

// ============================================================
// QUEDAS — signo onde o planeta está em queda
// ============================================================
export const FALL: Record<string, number> = {
  "Sol": 6,       // Libra
  "Lua": 7,       // Escorpião
  "Mercúrio": 11, // Peixes
  "Vênus": 5,     // Virgem
  "Marte": 3,     // Câncer
  "Júpiter": 9,   // Capricórnio
  "Saturno": 0,   // Áries
};

// ============================================================
// TRIPLICIDADES (Dorothean) — elemento → regente diurno/noturno
// ============================================================
export const TRIPLICITY_RULERS: Record<number, {day: string; night: string}> = {
  0: { day: "Sol",     night: "Júpiter" }, // Fogo
  1: { day: "Vênus",   night: "Lua" },     // Terra
  2: { day: "Saturno", night: "Mercúrio" },// Ar
  3: { day: "Vênus",   night: "Marte" },   // Água (Mars por noite, Venus por dia)
};

// ============================================================
// TERMOS EGÍPCIOS
// Para cada signo (0-11), array de { ruler, endDeg } — limites acumulados
// Grau do planeta (0-29.99) → primeiro termo onde grau < endDeg
// ============================================================
export const EGYPTIAN_TERMS: {ruler: string; endDeg: number}[][] = [
  // Áries
  [{ ruler:"Júpiter", endDeg:6 },{ ruler:"Vênus", endDeg:12 },{ ruler:"Mercúrio", endDeg:20 },{ ruler:"Marte", endDeg:25 },{ ruler:"Saturno", endDeg:30 }],
  // Touro
  [{ ruler:"Vênus", endDeg:8 },{ ruler:"Mercúrio", endDeg:14 },{ ruler:"Júpiter", endDeg:22 },{ ruler:"Saturno", endDeg:27 },{ ruler:"Marte", endDeg:30 }],
  // Gêmeos
  [{ ruler:"Mercúrio", endDeg:6 },{ ruler:"Júpiter", endDeg:12 },{ ruler:"Vênus", endDeg:17 },{ ruler:"Marte", endDeg:24 },{ ruler:"Saturno", endDeg:30 }],
  // Câncer
  [{ ruler:"Marte", endDeg:7 },{ ruler:"Vênus", endDeg:13 },{ ruler:"Mercúrio", endDeg:19 },{ ruler:"Júpiter", endDeg:26 },{ ruler:"Saturno", endDeg:30 }],
  // Leão
  [{ ruler:"Júpiter", endDeg:6 },{ ruler:"Vênus", endDeg:11 },{ ruler:"Saturno", endDeg:18 },{ ruler:"Mercúrio", endDeg:24 },{ ruler:"Marte", endDeg:30 }],
  // Virgem
  [{ ruler:"Mercúrio", endDeg:7 },{ ruler:"Vênus", endDeg:17 },{ ruler:"Júpiter", endDeg:21 },{ ruler:"Marte", endDeg:28 },{ ruler:"Saturno", endDeg:30 }],
  // Libra
  [{ ruler:"Saturno", endDeg:6 },{ ruler:"Mercúrio", endDeg:14 },{ ruler:"Júpiter", endDeg:21 },{ ruler:"Vênus", endDeg:28 },{ ruler:"Marte", endDeg:30 }],
  // Escorpião
  [{ ruler:"Marte", endDeg:7 },{ ruler:"Vênus", endDeg:11 },{ ruler:"Mercúrio", endDeg:19 },{ ruler:"Júpiter", endDeg:24 },{ ruler:"Saturno", endDeg:30 }],
  // Sagitário
  [{ ruler:"Júpiter", endDeg:12 },{ ruler:"Vênus", endDeg:17 },{ ruler:"Mercúrio", endDeg:21 },{ ruler:"Saturno", endDeg:26 },{ ruler:"Marte", endDeg:30 }],
  // Capricórnio
  [{ ruler:"Mercúrio", endDeg:7 },{ ruler:"Júpiter", endDeg:14 },{ ruler:"Vênus", endDeg:22 },{ ruler:"Saturno", endDeg:26 },{ ruler:"Marte", endDeg:30 }],
  // Aquário
  [{ ruler:"Mercúrio", endDeg:7 },{ ruler:"Vênus", endDeg:13 },{ ruler:"Júpiter", endDeg:20 },{ ruler:"Marte", endDeg:25 },{ ruler:"Saturno", endDeg:30 }],
  // Peixes
  [{ ruler:"Vênus", endDeg:12 },{ ruler:"Júpiter", endDeg:16 },{ ruler:"Mercúrio", endDeg:19 },{ ruler:"Marte", endDeg:28 },{ ruler:"Saturno", endDeg:30 }],
];

// ============================================================
// FACES / DECANATOS (Ordem Caldeia)
// Cada signo tem 3 faces de 10° cada
// ============================================================
export const FACES: string[][] = [
  ["Marte","Sol","Vênus"],           // Áries
  ["Mercúrio","Lua","Saturno"],      // Touro
  ["Júpiter","Marte","Sol"],         // Gêmeos
  ["Vênus","Mercúrio","Lua"],        // Câncer
  ["Saturno","Júpiter","Marte"],     // Leão
  ["Sol","Vênus","Mercúrio"],        // Virgem
  ["Lua","Saturno","Júpiter"],       // Libra
  ["Marte","Sol","Vênus"],           // Escorpião
  ["Mercúrio","Lua","Saturno"],      // Sagitário
  ["Júpiter","Marte","Sol"],         // Capricórnio
  ["Vênus","Mercúrio","Lua"],        // Aquário
  ["Saturno","Júpiter","Marte"],     // Peixes
];

// ============================================================
// VELOCIDADES MÉDIAS DIÁRIAS (°/dia)
// ============================================================
export const AVERAGE_DAILY_SPEED: Record<string, number> = {
  "Sol": 0.9856,
  "Lua": 13.176,
  "Mercúrio": 1.383,
  "Vênus": 1.200,
  "Marte": 0.524,
  "Júpiter": 0.0831,
  "Saturno": 0.0335,
  "Urano": 0.0117,
  "Netuno": 0.006,
  "Plutão": 0.004,
};

// ============================================================
// PONTUAÇÃO DE CASAS (Lilly) — índice 0 = Casa 1
// ============================================================
export const HOUSE_SCORES: number[] = [
  +5, // Casa 1 (Angular)
  +3, // Casa 2 (Sucedente)
  -3, // Casa 3 (Cadente)
  +4, // Casa 4 (Angular)
  +3, // Casa 5 (Sucedente)
  -4, // Casa 6 (Cadente — pior)
  +4, // Casa 7 (Angular)
  -4, // Casa 8 (Sucedente Maléfica)
  +2, // Casa 9 (Cadente — melhor)
  +5, // Casa 10 (Angular)
  +4, // Casa 11 (Sucedente)
  -5, // Casa 12 (Cadente — pior de todas)
];

// Tipo da casa
export const HOUSE_TYPE: string[] = [
  "Angular","Sucedente","Cadente","Angular","Sucedente","Cadente",
  "Angular","Sucedente Maléfica","Cadente","Angular","Sucedente","Cadente"
];

// ============================================================
// JÚBILOS PLANETÁRIOS — casa onde o planeta se alegra
// ============================================================
export const JUBILEE_HOUSE: Record<string, number> = {
  "Mercúrio": 1, // Casa 1
  "Lua": 3,      // Casa 3
  "Vênus": 5,    // Casa 5
  "Marte": 6,    // Casa 6
  "Sol": 9,      // Casa 9
  "Júpiter": 11, // Casa 11
  "Saturno": 12, // Casa 12
};

// ============================================================
// ESTRELAS FIXAS — Longitude Eclíptica J2000.0
// Precessão: ~50.29"/ano = 0.01397°/ano
// ============================================================
export interface FixedStarData {
  name: string;
  lon: number;       // ecliptic longitude J2000.0 em graus decimais
  nature?: string;   // natureza planetária
  magnitude?: number;
  extra?: string;    // nota adicional (ex: "Plêiades")
}

export const FIXED_STARS: FixedStarData[] = [
  // === ÁRIES ===
  { name:"Kerb", lon:1.05, magnitude:4.4 },
  { name:"Deneb Kaitos", lon:2.35, nature:"Saturno", magnitude:2.0 },
  { name:"Difda", lon:2.58, nature:"Saturno", magnitude:2.0 },
  { name:"Erakis", lon:9.70, magnitude:3.6 },
  { name:"Alderamin", lon:12.78, nature:"Júpiter e Saturno", magnitude:2.5 },
  { name:"Alpheratz", lon:14.30, nature:"Júpiter e Vênus", magnitude:2.1 },
  { name:"Baten Kaitos", lon:21.95, nature:"Saturno", magnitude:3.7 },
  { name:"Alrischa", lon:29.38, nature:"Marte e Mercúrio", magnitude:3.8 },
  
  // === TOURO ===
  { name:"Mirach", lon:30.42, nature:"Vênus e Mercúrio", magnitude:2.1 },
  { name:"Mira", lon:31.53, magnitude:2.0 },
  { name:"Angetenar", lon:32.63, magnitude:4.8 },
  { name:"Tyl", lon:32.70, magnitude:4.3 },
  { name:"Mesarthim", lon:33.18, magnitude:3.9 },
  { name:"Sheratan", lon:33.95, nature:"Marte e Saturno", magnitude:2.6 },
  { name:"Metallah", lon:36.87, magnitude:3.4 },
  { name:"Hamal", lon:37.67, nature:"Marte e Saturno", magnitude:2.0 },
  { name:"Schedir", lon:37.78, nature:"Saturno e Vênus", magnitude:2.2 },
  { name:"Adhil", lon:37.87, magnitude:4.5 },
  { name:"Azha", lon:38.75, magnitude:3.9 },
  { name:"Kaffaljidhma", lon:39.43, magnitude:3.5 },
  { name:"Almach", lon:44.23, nature:"Vênus", magnitude:2.3 },
  { name:"Menkar", lon:44.33, nature:"Saturno", magnitude:2.5 },
  { name:"Zaurak", lon:44.03, nature:"Saturno", magnitude:3.2 },
  { name:"Algol", lon:56.17, nature:"Saturno e Júpiter", magnitude:2.1 },
  { name:"Miram", lon:58.72, magnitude:4.1 },
  
  // === GÊMEOS ===
  { name:"Alcyone", lon:60.00, nature:"Marte e Lua", magnitude:2.9, extra:"Plêiades" },
  { name:"Alrai", lon:60.10, magnitude:3.2 },
  { name:"Keid", lon:60.18, magnitude:4.4 },
  { name:"Atlas", lon:60.37, magnitude:3.6, extra:"Plêiades" },
  { name:"Pleione", lon:60.38, magnitude:5.1, extra:"Plêiades" },
  { name:"Atiks", lon:61.15, magnitude:2.8 },
  { name:"Menkib", lon:64.98, magnitude:4.0 },
  { name:"Sceptrum", lon:65.27, magnitude:4.0 },
  { name:"Aldebaran", lon:69.80, nature:"Marte", magnitude:0.9, extra:"Estrela Real" },
  { name:"Tabit", lon:71.93, magnitude:3.2 },
  { name:"Heka", lon:73.72, nature:"Marte e Mercúrio", magnitude:3.4 },
  { name:"Rigel", lon:76.83, nature:"Júpiter e Saturno", magnitude:0.1 },
  { name:"Bellatrix", lon:80.95, nature:"Marte e Mercúrio", magnitude:1.6 },
  { name:"Capella", lon:81.85, nature:"Marte e Mercúrio", magnitude:0.1 },
  { name:"Mintaka", lon:82.40, magnitude:2.2 },
  { name:"Alnilam", lon:83.47, nature:"Júpiter e Saturno", magnitude:1.7 },
  { name:"Alnitak", lon:84.70, magnitude:2.1 },
  { name:"Betelgeuse", lon:88.75, nature:"Marte e Mercúrio", magnitude:0.5 },
  
  // === CÂNCER ===
  { name:"Canopus", lon:104.93, nature:"Saturno e Júpiter", magnitude:-0.7 },
  { name:"Sirius", lon:104.08, nature:"Júpiter e Marte", magnitude:-1.5 },
  { name:"Castor", lon:110.23, nature:"Mercúrio e Júpiter", magnitude:1.6 },
  { name:"Pollux", lon:113.22, nature:"Marte", magnitude:1.1 },
  { name:"Procyon", lon:115.78, nature:"Marte e Mercúrio", magnitude:0.4 },
  { name:"Praecipua", lon:150.88, magnitude:3.8 }, // Virgo technically, but needed
  { name:"Praesepe", lon:127.17, nature:"Marte e Lua", magnitude:3.7 },
  { name:"Wasat", lon:108.53, magnitude:3.5 },
  { name:"Aludra", lon:119.55, magnitude:2.5 },
  
  // === LEÃO ===
  { name:"Asellus Borealis", lon:127.40, nature:"Sol e Marte", magnitude:4.7 },
  { name:"Asellus Australis", lon:128.72, nature:"Sol e Marte", magnitude:3.9 },
  { name:"Acubens", lon:133.55, nature:"Saturno e Mercúrio", magnitude:4.3 },
  { name:"Regulus", lon:149.83, nature:"Marte e Júpiter", magnitude:1.4, extra:"Estrela Real" },
  { name:"Zosma", lon:141.33, nature:"Saturno e Vênus", magnitude:2.6 },
  { name:"Denebola", lon:171.62, nature:"Saturno e Vênus", magnitude:2.1 },
  
  // === VIRGEM ===
  { name:"Vindemiatrix", lon:159.93, nature:"Saturno e Mercúrio", magnitude:2.8 },
  { name:"Porrima", lon:160.17, nature:"Mercúrio e Vênus", magnitude:2.7 },
  { name:"Markeb", lon:178.90, magnitude:2.5 },
  { name:"Spica", lon:203.83, nature:"Vênus e Marte", magnitude:1.0 },
  
  // === LIBRA ===
  { name:"Arcturus", lon:204.23, nature:"Marte e Júpiter", magnitude:-0.1 },
  { name:"Algorab", lon:193.55, nature:"Marte e Saturno", magnitude:3.0 },
  { name:"Foramen", lon:202.05, magnitude:1.8 },
  
  // === ESCORPIÃO ===
  { name:"Ceginus", lon:215.10, magnitude:3.0 },
  { name:"Zubenelgenubi", lon:225.08, nature:"Marte e Saturno", magnitude:2.8 },
  { name:"Zubeneschamali", lon:229.37, nature:"Júpiter e Mercúrio", magnitude:2.6 },
  { name:"Unukalhai", lon:232.07, nature:"Saturno e Marte", magnitude:2.6 },
  { name:"Agena", lon:233.88, nature:"Vênus e Júpiter", magnitude:0.6 },
  { name:"Dschubba", lon:242.22, nature:"Marte e Saturno", magnitude:2.3 },
  { name:"Antares", lon:249.77, nature:"Marte e Júpiter", magnitude:1.1, extra:"Estrela Real" },
  
  // === SAGITÁRIO ===
  { name:"Grumium", lon:264.72, magnitude:3.7 },
  { name:"Kelb Alrai", lon:265.33, magnitude:3.2 },
  { name:"Sargas", lon:265.60, nature:"Mercúrio e Saturno", magnitude:1.9 },
  { name:"Aculeus", lon:267.78, nature:"Sol e Marte", magnitude:3.2 },
  { name:"Etamin", lon:267.95, nature:"Saturno e Marte", magnitude:2.2 },
  { name:"Acumen", lon:268.70, nature:"Sol e Marte", magnitude:3.2 },
  { name:"Kaus Borealis", lon:276.12, nature:"Júpiter e Marte", magnitude:2.7 },
  { name:"Vega", lon:285.32, nature:"Vênus e Mercúrio", magnitude:0.0 },
  { name:"Nunki", lon:282.27, nature:"Júpiter e Mercúrio", magnitude:2.0 },
  
  // === CAPRICÓRNIO ===
  { name:"Polis", lon:273.22, magnitude:3.0 },
  { name:"Sheliak", lon:288.37, nature:"Vênus e Mercúrio", magnitude:3.5 },
  { name:"Deneb Algedi", lon:293.35, nature:"Saturno e Júpiter", magnitude:2.9 },
  { name:"Nashira", lon:291.95, nature:"Saturno e Júpiter", magnitude:3.7 },
  
  // === AQUÁRIO ===
  { name:"Altair", lon:301.78, nature:"Marte e Júpiter", magnitude:0.8 },
  { name:"Sadalsuud", lon:323.40, nature:"Saturno e Mercúrio", magnitude:2.9 },
  { name:"Sadalmelik", lon:323.53, nature:"Saturno e Mercúrio", magnitude:3.0 },
  { name:"Fomalhaut", lon:333.87, nature:"Vênus e Mercúrio", magnitude:1.2, extra:"Estrela Real" },
  
  // === PEIXES ===
  { name:"Skat", lon:338.78, nature:"Saturno e Júpiter", magnitude:3.3 },
  { name:"Markab", lon:353.48, nature:"Marte e Mercúrio", magnitude:2.5 },
  { name:"Scheat", lon:359.37, nature:"Marte e Mercúrio", magnitude:2.4 },
];

// Taxa de precessão anual em graus
export const PRECESSION_RATE = 0.01397; // ~50.29"/ano

// Planetas tradicionais (os 7 visíveis)
export const TRADITIONAL_PLANETS = ["Sol","Lua","Mercúrio","Vênus","Marte","Júpiter","Saturno"];
export const OUTER_PLANETS = ["Urano","Netuno","Plutão"];
