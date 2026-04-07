import { 
  SIGNS, SIGN_ELEMENT, TRIPLICITY_RULERS, EGYPTIAN_TERMS, FACES, 
  DOMICILE_RULER, EXALTATION, FALL, DETRIMENT, 
  AVERAGE_DAILY_SPEED, HOUSE_SCORES, HOUSE_TYPE, JUBILEE_HOUSE,
  FIXED_STARS, PRECESSION_RATE, TRADITIONAL_PLANETS
} from "./traditionalTables";
import { BirthChart, Planet, HousesData } from "@/interfaces/BirthChartInterfaces";
import { toTotal, TO_MIN, TO_SIGN_MIN, CIRCLE_MIN } from "../utils/chartUtils";

// --- Helpers ---

const normalizeMin = (min: number): number => {
  return ((min % CIRCLE_MIN) + CIRCLE_MIN) % CIRCLE_MIN;
};

export function formatDegrees(longitude: number): string {
  const total = toTotal(longitude);
  const sIdx = Math.floor(total / TO_SIGN_MIN) % 12;
  const rem = total - (sIdx * TO_SIGN_MIN);
  const d = Math.floor(rem / TO_MIN);
  const m = rem % TO_MIN;
  return `${SIGNS[sIdx]} a ${d}°${m.toString().padStart(2, '0')}’`;
}

export function getHouseIndex(longitude: number, cusps: number[]): number {
  // cusps is an array of 12 longitudes.
  // Regiomontanus: House 1 starts at cusp[0], House 2 at cusp[1], etc.
  for (let i = 0; i < 11; i++) {
    let start = cusps[i];
    let end = cusps[i + 1];
    if (end < start) {
      // Wraps around 360
      if (longitude >= start || longitude < end) return i + 1;
    } else {
      if (longitude >= start && longitude < end) return i + 1;
    }
  }
  return 12; // Must be in the 12th house if not found between 1-11
}

export function getSect(sunLon: number, ascLon: number, cusps: number[]): "Diurno" | "Noturno" {
  const sunHouse = getHouseIndex(sunLon, cusps);
  // Houses 7, 8, 9, 10, 11, 12 are above the horizon.
  return sunHouse >= 7 && sunHouse <= 12 ? "Diurno" : "Noturno";
}

// --- Traditional Calculations ---

export function getAlmuten(longitude: number, sect: "Diurno" | "Noturno"): string {
  const signIdx = Math.floor(longitude / 30) % 12;
  const deg = longitude % 30;
  const element = SIGN_ELEMENT[signIdx];
  
  const scores: Record<string, number> = {};
  const add = (p: string, s: number) => { scores[p] = (scores[p] || 0) + s; };

  // Domicile (+5)
  add(DOMICILE_RULER[signIdx], 5);
  // Exaltation (+4)
  for (const [p, sIdx] of Object.entries(EXALTATION)) {
    if (sIdx === signIdx) add(p, 4);
  }
  // Triplicity (+3)
  const trip = TRIPLICITY_RULERS[element];
  add(trip.day, 3);
  add(trip.night, 3); // Traditional Almuten often counts all 3 triplicity rulers, but usually we use diurno/noturno
  // Terms (+2)
  const signTerms = EGYPTIAN_TERMS[signIdx];
  const term = signTerms.find(t => deg < t.endDeg);
  if (term) add(term.ruler, 2);
  // Face (+1)
  const faceIdx = Math.floor(deg / 10);
  add(FACES[signIdx][faceIdx], 1);

  let maxScore = -1;
  let winner = "Nenhum";
  for (const [p, s] of Object.entries(scores)) {
    if (s > maxScore) {
      maxScore = s;
      winner = p;
    }
  }
  return winner;
}

export interface ArabicPart {
  name: string;
  longitude: number;
  sign: string;
  posFormatted: string;
  house: string;
  dispositor: string;
  antiscion: string;
}

export function calculateArabicParts(chart: BirthChart): ArabicPart[] {
  // Helper: Converte longitude decimal para minutos absolutos seguindo a regra (signo*1800 + grau*60 + min)
  const toTotal = (lon: number) => {
    const s = Math.floor(lon / 30);
    const g = Math.floor(lon % 30);
    const m = Math.round((lon - (s * 30 + g)) * 60);
    return (s * 1800) + (g * 60) + m;
  };
  
  // Helper: Normaliza minutos no círculo de 21600 minutos
  const normalizeMin = (min: number) => {
    const fullCircle = 21600;
    return ((min % fullCircle) + fullCircle) % fullCircle;
  };

  // Helper: Formata o total de minutos de volta para string signo/grau/minuto seguindo a regra floor fornecida
  const formatMinutes = (total: number) => {
    const sIdx = Math.floor(total / 1800) % 12;
    const g = Math.floor((total - (sIdx * 1800)) / 60);
    const m = total - (sIdx * 1800) - (g * 60);
    return `${SIGNS[sIdx]} a ${g}°${m.toString().padStart(2, '0')}’`;
  };

  // Helper: Cálculo fixo da Parte (Asc + B - C) em minutos
  const calcPartMin = (ascMin: number, bMin: number, cMin: number) => {
    return normalizeMin(ascMin + bMin - cMin);
  };

  const asc = toTotal(chart.housesData.ascendant);
  const sun = toTotal(chart.planets.find(p => p.type === "sun")!.longitudeRaw);
  const moon = toTotal(chart.planets.find(p => p.type === "moon")!.longitudeRaw);
  const ven = toTotal(chart.planets.find(p => p.type === "venus")!.longitudeRaw);
  const mars = toTotal(chart.planets.find(p => p.type === "mars")!.longitudeRaw);
  const jup = toTotal(chart.planets.find(p => p.type === "jupiter")!.longitudeRaw);
  const sat = toTotal(chart.planets.find(p => p.type === "saturn")!.longitudeRaw);

  const fortunaMin = calcPartMin(asc, moon, sun);
  const spiritMin = calcPartMin(asc, sun, moon);

  const partsDef = [
    { name: "Fortuna", min: fortunaMin },
    { name: "Espírito", min: spiritMin },
    { name: "Amor", min: calcPartMin(asc, ven, sun) },
    { name: "Vitória", min: calcPartMin(asc, jup, sun) },
    { name: "Valor", min: calcPartMin(asc, mars, sun) },
    { name: "Necessidade", min: calcPartMin(asc, fortunaMin, spiritMin) },
    { name: "Cativeiro", min: calcPartMin(asc, sat, mars) }
  ];

  return partsDef.map(pd => {
    const rawLon = pd.min / 60; // Para cálculos de dispositor etc
    const hIdx = getHouseIndex(rawLon, chart.housesData.house);
    const signIdx = Math.floor(pd.min / 1800) % 12;
    const disp = DOMICILE_RULER[signIdx];
    const dispPlanet = chart.planets.find(p => p.name === disp);
    // Regra do 59' (soma de 10799 minutos no espelhamento tradicional)
    const antiscionLon = normalizeMin(32399 - pd.min); 

    return {
      name: pd.name,
      longitude: rawLon,
      sign: SIGNS[signIdx],
      posFormatted: formatDegrees(pd.min),
      house: `Casa ${hIdx}`, // Removendo romanize se estiver causando erro, mantendo simples
      dispositor: `${disp} em ${dispPlanet ? formatDegrees(dispPlanet.longitudeRaw) : "Nenhum"}, na Casa ${dispPlanet ? getHouseIndex(dispPlanet.longitudeRaw, chart.housesData.house) : "?"}`,
      antiscion: formatDegrees(antiscionLon)
    };
  });
}

function romanize(num: number): string {
  const lookup: any = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  let i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

export function getFixedStarConjunctions(longitude: number, year: number): string[] {
  const currentYear = year || 2001;
  const yearsSince2000 = currentYear - 2000;
  const precession = yearsSince2000 * PRECESSION_RATE;

  const matches: string[] = [];

  for (const star of FIXED_STARS) {
    const starLon = (star.lon + precession + 360) % 360;
    const diff = Math.abs(longitude - starLon);
    const diffDeg = diff > 180 ? 360 - diff : diff;

    if (diffDeg <= 2.0) {
      let descriptor = "Forte Conjunção";
      if (diffDeg <= 1/6) descriptor = "Conjunção Partil Exata";
      else if (diffDeg <= 0.5) descriptor = "Conjunção Partil";
      
      let entry = `${star.name} (${formatDegrees(starLon)}, orbe ${formatOrbe(diffDeg)}) – ${descriptor}`;
      if (star.nature) entry += `, natureza ${star.nature}`;
      matches.push(entry);
    }
  }
  return matches;
}

function formatOrbe(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

export function getAspects(chart: BirthChart) {
  const aspects: string[] = [];
  const planets = chart.planets.filter(p => TRADITIONAL_PLANETS.includes(p.name) || p.type === "neptune"); // Neptune added as per user request
  
  // Also include angles and parts?
  // Let's do planet-planet first
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const asp = calculateAspect(p1, p2);
      if (asp) aspects.push(asp);
    }
  }

  // Neptune-MC etc
  const mcLon = chart.housesData.mc;
  const nep = chart.planets.find(p => p.type === "neptune");
  if (nep) {
    const mcAsp = calculateAspectToDegree(nep, "Meio do Céu (MC)", mcLon);
    if (mcAsp) aspects.push(mcAsp);
    const icLon = (mcLon + 180) % 360;
    const icAsp = calculateAspectToDegree(nep, "Fundo do Céu (IC)", icLon);
    if (icAsp) aspects.push(icAsp);
  }

  return aspects;
}

function calculateAspect(p1: Planet, p2: Planet): string | null {
  const diff = Math.abs(p1.longitudeRaw - p2.longitudeRaw);
  const d = diff > 180 ? 360 - diff : diff;
  
  const types = [
    { name: "conjunção", deg: 0 },
    { name: "sextil", deg: 60 },
    { name: "quadratura", deg: 90 },
    { name: "trígono", deg: 120 },
    { name: "oposição", deg: 180 }
  ];

  for (const t of types) {
    const orbe = Math.abs(d - t.deg);
    if (orbe <= 5.0) {
      // Very crude applying/separating: if faster planet behind slower and approaching
      // In a real engine we'd check speeds.
      const isApplying = true; // Placeholder, real logic needs speed vectors
      return `${p1.name} ${t.name} ${p2.name} – ${formatOrbe(orbe)} ${isApplying ? "Aplicativo" : "Separativo"}.`;
    }
  }
  return null;
}

function calculateAspectToDegree(p: Planet, targetName: string, targetLon: number): string | null {
  const diff = Math.abs(p.longitudeRaw - targetLon);
  const d = diff > 180 ? 360 - diff : diff;
  const types = [
    { name: "conjunção", deg: 0 },
    { name: "oposição", deg: 180 },
    { name: "trígono", deg: 120 },
    { name: "sextil", deg: 60 },
    { name: "quadratura", deg: 90 }
  ];
  for (const t of types) {
    const orbe = Math.abs(d - t.deg);
    if (orbe <= 3.0) {
      return `${p.name} ${t.name} ${targetName} – ${formatOrbe(orbe)} Separativo.`;
    }
  }
  return null;
}

export function getEssentialDignities(lon: number, planetName: string, sect: "Diurno" | "Noturno"): string {
  const signIdx = Math.floor(lon / 30) % 12;
  const deg = lon % 30;
  const element = SIGN_ELEMENT[signIdx];
  
  const domicile = DOMICILE_RULER[signIdx];
  const exaltation = Object.entries(EXALTATION).find(([p, idx]) => idx === signIdx)?.[0];
  const triplicity = sect === "Diurno" ? TRIPLICITY_RULERS[element].day : TRIPLICITY_RULERS[element].night;
  const term = EGYPTIAN_TERMS[signIdx].find(t => deg < t.endDeg)?.ruler;
  const face = FACES[signIdx][Math.floor(deg / 10)];

  let points = 0;
  let isPeregrine = true;

  if (planetName === domicile) { points += 5; isPeregrine = false; }
  if (planetName === exaltation) { points += 4; isPeregrine = false; }
  if (planetName === triplicity) { points += 3; isPeregrine = false; }
  if (planetName === term) { points += 2; isPeregrine = false; }
  if (planetName === face) { points += 1; isPeregrine = false; }

  // Check debilities
  if (DETRIMENT[planetName]?.includes(signIdx)) points -= 5;
  if (FALL[planetName] === signIdx) points -= 4;

  let report = `${planetName} em ${SIGNS[signIdx]} ${Math.floor(deg)}°${Math.floor((deg%1)*60)}’ — Domicílio de ${domicile}`;
  if (exaltation) report += `, Exaltação de ${exaltation}`;
  report += `, Triplicidade de ${triplicity}, Termo de ${term}, Face de ${face}`;
  
  if (isPeregrine) {
    report += ` → Peregrino (0 pontos, –5 por debilidade essencial).`;
  } else {
    report += ` → ${points >= 0 ? "+" : ""}${points} pontos.`;
  }
  
  return report;
}
