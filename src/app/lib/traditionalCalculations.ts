import { 
  SIGNS, SIGN_ELEMENT, TRIPLICITY_RULERS, EGYPTIAN_TERMS, FACES,
  DOMICILE_RULER, EXALTATION, FALL, DETRIMENT, 
  FIXED_STARS, PRECESSION_RATE
} from "./traditionalTables";
import {
  BirthChart,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { toTotal, TO_MIN, TO_SIGN_MIN, CIRCLE_MIN } from "../utils/chartUtils";
import {
  resolveTraditionalAspect,
  TraditionalAspectParticipant,
} from "./aspectDynamics";
import {
  calculateArabicLots,
  ORDERED_ARABIC_PART_KEYS,
} from "./arabicLots";

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
    const start = cusps[i];
    const end = cusps[i + 1];
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
  add(sect === "Diurno" ? trip.day : trip.night, 3);
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
  // --- 6. ESTRUTURA DE FUNÇÕES (SUGERIDA) ---
  const toTotal = (signo: number, grau: number, minuto: number) => {
    return (signo * 1800) + (grau * 60) + minuto;
  };

  const fromTotal = (total: number) => {
    const signo = Math.floor(total / 1800);
    const grau = Math.floor((total - (signo * 1800)) / 60);
    const minuto = total - (signo * 1800) - (grau * 60);
    return { signo, grau, minuto };
  };

  const normalize = (total: number) => {
    let result = total;
    if (result < 0) {
      result += 21600;
    }
    if (result >= 21600) {
      result -= 21600;
    }
    return result;
  };

  const calcPart = (asc: number, b: number, c: number) => {
    return normalize(asc + b - c);
  };

  // Helper para isolar signo, grau e minuto antes de chamar toTotal
  const getAbsoluteMin = (lon: number) => {
    const signo = Math.floor(lon / 30);
    const grau = Math.floor(lon % 30);
    const minuto = Math.round((lon - (signo * 30 + grau)) * 60);
    return toTotal(signo, grau, minuto);
  };

  const ascTotal = getAbsoluteMin(chart.housesData.ascendant);
  const solTotal = getAbsoluteMin(chart.planets.find(p => p.type === "sun")!.longitudeRaw);
  const luaTotal = getAbsoluteMin(chart.planets.find(p => p.type === "moon")!.longitudeRaw);
  const venusTotal = getAbsoluteMin(chart.planets.find(p => p.type === "venus")!.longitudeRaw);
  const marteTotal = getAbsoluteMin(chart.planets.find(p => p.type === "mars")!.longitudeRaw);
  const jupiterTotal = getAbsoluteMin(chart.planets.find(p => p.type === "jupiter")!.longitudeRaw);
  const saturnoTotal = getAbsoluteMin(chart.planets.find(p => p.type === "saturn")!.longitudeRaw);

  const sect = getSect(chart.planets.find(p => p.type === "sun")!.longitudeRaw, chart.housesData.ascendant, chart.housesData.house);
  const isNight = sect === "Noturno";

  const fortunaTotal  = isNight ? calcPart(ascTotal, solTotal, luaTotal) : calcPart(ascTotal, luaTotal, solTotal);
  const espiritoTotal = isNight ? calcPart(ascTotal, luaTotal, solTotal) : calcPart(ascTotal, solTotal, luaTotal);
  const amorTotal     = isNight ? calcPart(ascTotal, fortunaTotal, espiritoTotal) : calcPart(ascTotal, espiritoTotal, fortunaTotal);
  const vitoriaTotal  = isNight ? calcPart(ascTotal, espiritoTotal, jupiterTotal) : calcPart(ascTotal, jupiterTotal, espiritoTotal);
  const valorTotal    = isNight ? calcPart(ascTotal, marteTotal, fortunaTotal) : calcPart(ascTotal, fortunaTotal, marteTotal);
  const necessTotal   = isNight ? calcPart(ascTotal, espiritoTotal, fortunaTotal) : calcPart(ascTotal, fortunaTotal, espiritoTotal);
  const cativTotal    = isNight ? calcPart(ascTotal, saturnoTotal, fortunaTotal) : calcPart(ascTotal, fortunaTotal, saturnoTotal);
  
  const partsDef = [
    { name: "Parte da Fortuna", min: fortunaTotal },
    { name: "Parte do Espírito", min: espiritoTotal },
    { name: "Parte do Amor", min: amorTotal },
    { name: "Parte da Vitória", min: vitoriaTotal },
    { name: "Parte do Valor", min: valorTotal },
    { name: "Parte da Necessidade", min: necessTotal },
    { name: "Parte do Cativeiro", min: cativTotal }
  ];

  return partsDef.map(pd => {
    const { signo, grau, minuto } = fromTotal(pd.min);
    const rawLon = pd.min / 60; 
    const hIdx = getHouseIndex(rawLon, chart.housesData.house);
    
    // Regra do 59' para Antíscia (32399 = 21599 + 10800, espelhamento)
    const antiscionLon = normalize(32399 - pd.min); 
    const antis = fromTotal(antiscionLon);

    const disp = DOMICILE_RULER[signo % 12];
    const dispPlanet = chart.planets.find(p => p.name === disp);

    return {
      name: pd.name,
      longitude: rawLon,
      sign: SIGNS[signo % 12],
      posFormatted: `${SIGNS[signo % 12]} a ${grau}°${minuto.toString().padStart(2, '0')}’`,
      house: `Casa ${hIdx}`,
      dispositor: `${disp} em ${dispPlanet ? formatDegrees(dispPlanet.longitudeRaw) : "Nenhum"}, na Casa ${dispPlanet ? getHouseIndex(dispPlanet.longitudeRaw, chart.housesData.house) : "?"}`,
      antiscion: `${SIGNS[antis.signo % 12]} a ${antis.grau}°${antis.minuto.toString().padStart(2, '0')}’`
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

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "conjun\u00e7\u00e3o",
  sextile: "sextil",
  square: "quadratura",
  trine: "tr\u00edgono",
  opposition: "oposi\u00e7\u00e3o",
};

interface ReportAspectParticipant extends TraditionalAspectParticipant {
  name: string;
}

interface ReportAspectLine {
  line: string;
  orbDistance: number;
}

function buildPlanetAspectParticipants(
  chart: BirthChart
): ReportAspectParticipant[] {
  return chart.planets.map((planet) => ({
    name: planet.name,
    longitude: planet.longitudeRaw,
    speed: planet.longitudeSpeed,
    elementType: "planet",
    planetType: planet.type,
  }));
}

function getHouseAspectName(index: number): string {
  if (index === 0) return "Ascendente (AC)";
  if (index === 3) return "Fundo do C\u00e9u (IC)";
  if (index === 6) return "Descendente (DC)";
  if (index === 9) return "Meio do C\u00e9u (MC)";

  return `Casa ${index + 1}`;
}

function buildHouseAspectParticipants(
  chart: BirthChart
): ReportAspectParticipant[] {
  return chart.housesData.house.map((longitude, index) => ({
    name: getHouseAspectName(index),
    longitude,
    elementType: "house",
  }));
}

function getArabicPartDisplayName(partKey: string): string {
  if (partKey === "fortune") return "Parte da Fortuna";
  if (partKey === "spirit") return "Parte do Esp\u00edrito";
  if (partKey === "necessity") return "Parte da Necessidade";
  if (partKey === "love") return "Parte do Amor";
  if (partKey === "valor") return "Parte do Valor";
  if (partKey === "victory") return "Parte da Vit\u00f3ria";

  return "Parte do Cativeiro";
}

function buildArabicPartAspectParticipants(
  chart: BirthChart
): ReportAspectParticipant[] {
  const lots = calculateArabicLots(chart);

  return ORDERED_ARABIC_PART_KEYS.flatMap((partKey) => {
    const lot = lots[partKey];
    if (!lot) {
      return [];
    }

    return [
      {
        name: getArabicPartDisplayName(partKey),
        longitude: lot.longitude,
        elementType: "arabicPart",
      } satisfies ReportAspectParticipant,
    ];
  });
}

function isOuterPlanetOrNode(planetType?: PlanetType): boolean {
  if (!planetType) {
    return false;
  }

  return (
    planetType === "uranus" ||
    planetType === "neptune" ||
    planetType === "pluto" ||
    planetType === "northNode" ||
    planetType === "southNode"
  );
}

function shouldSkipAspectPair(
  firstParticipant: ReportAspectParticipant,
  secondParticipant: ReportAspectParticipant
): boolean {
  if (
    firstParticipant.elementType === "house" &&
    secondParticipant.elementType === "house"
  ) {
    return true;
  }

  if (
    firstParticipant.elementType === "arabicPart" &&
    secondParticipant.elementType === "arabicPart"
  ) {
    return true;
  }

  if (
    firstParticipant.elementType === "arabicPart" &&
    secondParticipant.elementType === "planet" &&
    isOuterPlanetOrNode(secondParticipant.planetType)
  ) {
    return true;
  }

  if (
    secondParticipant.elementType === "arabicPart" &&
    firstParticipant.elementType === "planet" &&
    isOuterPlanetOrNode(firstParticipant.planetType)
  ) {
    return true;
  }

  return false;
}

function buildAspectLine(
  firstParticipant: ReportAspectParticipant,
  secondParticipant: ReportAspectParticipant
): ReportAspectLine | null {
  if (shouldSkipAspectPair(firstParticipant, secondParticipant)) {
    return null;
  }

  const aspectMatch = resolveTraditionalAspect(
    firstParticipant,
    secondParticipant
  );

  if (!aspectMatch) {
    return null;
  }

  return {
    line: `${firstParticipant.name} ${ASPECT_LABELS[aspectMatch.aspectType]} ${secondParticipant.name} - ${formatOrbe(aspectMatch.orbDistance)} ${aspectMatch.applying ? "Aplicativo" : "Separativo"}.`,
    orbDistance: aspectMatch.orbDistance,
  };
}

function collectAspectLines(
  firstParticipants: ReportAspectParticipant[],
  secondParticipants: ReportAspectParticipant[],
  sameCollection = false
): string[] {
  const lines: ReportAspectLine[] = [];

  for (let firstIndex = 0; firstIndex < firstParticipants.length; firstIndex += 1) {
    const firstParticipant = firstParticipants[firstIndex];
    const startIndex = sameCollection ? firstIndex + 1 : 0;

    for (
      let secondIndex = startIndex;
      secondIndex < secondParticipants.length;
      secondIndex += 1
    ) {
      const secondParticipant = secondParticipants[secondIndex];
      const aspectLine = buildAspectLine(firstParticipant, secondParticipant);

      if (aspectLine) {
        lines.push(aspectLine);
      }
    }
  }

  lines.sort((firstLine, secondLine) => {
    return firstLine.orbDistance - secondLine.orbDistance;
  });

  return lines.map((entry) => entry.line);
}

export function getAspects(chart: BirthChart) {
  const planets = buildPlanetAspectParticipants(chart);
  const houses = buildHouseAspectParticipants(chart);
  
  const arabicParts = buildArabicPartAspectParticipants(chart);

  return [
    ...collectAspectLines(planets, planets, true),
    ...collectAspectLines(planets, houses),

    ...collectAspectLines(planets, arabicParts),
    ...collectAspectLines(arabicParts, houses),
  ];
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
