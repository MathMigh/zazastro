import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

const getGlyphOnly = true;
const CIRCLE_MIN = 21600;

// ============================================
// HELPER FUNCTIONS (Conforme Solicitado)
// ============================================

// 1. toTotal: converte de signo, grau e minuto para minutos absolutos
export const toTotal = (signo: number, grau: number, minuto: number): number => {
  return (signo * 1800) + (grau * 60) + minuto;
};

// Converte graus decimais (usado nas posições) para minutos absolutos
const decimalToAbsoluteMin = (decimalLon: number): number => {
  const s = Math.floor(decimalLon / 30);
  const g = Math.floor(decimalLon % 30);
  const m = Math.round((decimalLon - (s * 30 + g)) * 60);
  return toTotal(s, g, m);
};

// 2. fromTotal: converte de minutos absolutos para signo, grau e minuto
export const fromTotal = (total: number) => {
  const signo = Math.floor(total / 1800);
  const grau = Math.floor((total - (signo * 1800)) / 60);
  const minuto = total - (signo * 1800) - (grau * 60);
  return { signo, grau, minuto };
};

// 3. normalize: ajusta valor para a faixa correta do zodíaco (0 a 21599)
export const normalize = (total: number): number => {
  let result = total;
  if (result < 0) result += CIRCLE_MIN;
  if (result >= CIRCLE_MIN) result -= CIRCLE_MIN;
  return result;
};

// 4. calcPart: fórmula base de cálculo da parte árabe (Asc + B - C)
export const calcPart = (ascTotal: number, bTotal: number, cTotal: number): number => {
  return normalize(ascTotal + bTotal - cTotal);
};

// Formatação segura (independente do getDegreeAndSign pra evitar bugs do Aries)
const formatStringSafe = (totalStr: number, glyphOnly: boolean): string => {
  const { signo, grau, minuto } = fromTotal(totalStr);
  const signs = ["♈︎","♉︎","♊︎","♋︎","♌︎","♍︎","♎︎","♏︎","♐︎","♑︎","♒︎","♓︎"];
  const signsNames = ["Áries","Touro","Gêmeos","Câncer","Leão","Virgem","Libra","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];
  const sign = glyphOnly ? signs[signo % 12] : `${signsNames[signo % 12]} ${signs[signo % 12]}`;
  const minStr = minuto.toString().padStart(2, '0');
  return `${grau}° ${minStr}'${!glyphOnly ? " de " : " "}${sign}`;
};

// Regra tradicional de antíscia (espelhamento)
const getAntiscionLocal = (total: number): number => {
  return normalize(32400 - total);
};

function getHouseIndexLocal(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 11; i++) {
    let start = cusps[i];
    let end = cusps[i + 1];
    if (end < start) {
      if (longitude >= start || longitude < end) return i + 1;
    } else {
      if (longitude >= start && longitude < end) return i + 1;
    }
  }
  return 12;
}

function getSectLocal(sunLon: number, cusps: number[]): boolean {
  const sunHouse = getHouseIndexLocal(sunLon, cusps);
  // Houses 7, 8, 9, 10, 11, 12 are above the horizon = Diurno (false). Otherwise Noturno (true).
  return sunHouse < 7; 
}

// ============================================

function getArabicPartData(total: number, ascTotal: number) {
  const antiscion = getAntiscionLocal(total);
  const rawDistanceFromASC = normalize(total - ascTotal);

  const longitudeSign = formatStringSafe(total, getGlyphOnly);
  const antiscionSign = formatStringSafe(antiscion, getGlyphOnly);

  return {
    longitude: total / 60, // em graus decimais (formato exigido p/ outros cálculos)
    antiscion: getAntiscionLocal(total), // antiscion em minutos absolutos
    antiscionRaw: getAntiscionLocal(total) / 60, // antiscion decimal
    distanceFromASC: rawDistanceFromASC / 60, // decimal graus
    rawDistanceFromASC, // minutos absolutos
    longitudeSign,
    antiscionSign,
  };
}

export function calculateLotOfFortune(chartData: BirthChart): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const sun = decimalToAbsoluteMin(sunDecimal);
  const moon = decimalToAbsoluteMin(chartData.planets.find((p) => p.type === "moon")!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, sun, moon) : calcPart(asc, moon, sun);

  return {
    name: "Fortuna",
    planet: "moon",
    partKey: "fortune",
    formulaDescription: isNight ? "AC + Sol - Lua" : "AC + Lua - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfSpirit(chartData: BirthChart): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const sun = decimalToAbsoluteMin(sunDecimal);
  const moon = decimalToAbsoluteMin(chartData.planets.find((p) => p.type === "moon")!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, moon, sun) : calcPart(asc, sun, moon);

  return {
    name: "Espírito",
    planet: "sun",
    partKey: "spirit",
    formulaDescription: isNight ? "AC + Lua - Sol" : "AC + Sol - Lua",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfNecessity(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const lotOfFortune = Math.round(arabicParts.fortune!.longitudeRaw);
  const lotOfSpirit = Math.round(arabicParts.spirit!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, lotOfSpirit, lotOfFortune) : calcPart(asc, lotOfFortune, lotOfSpirit);

  return {
    name: "Necessidade",
    planet: "mercury",
    partKey: "necessity",
    formulaDescription: isNight ? "AC + Espírito - Fortuna" : "AC + Fortuna - Espírito",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfLove(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const lotOfFortune = Math.round(arabicParts.fortune!.longitudeRaw);
  const lotOfSpirit = Math.round(arabicParts.spirit!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, lotOfFortune, lotOfSpirit) : calcPart(asc, lotOfSpirit, lotOfFortune);

  return {
    name: "Amor",
    planet: "venus",
    partKey: "love",
    formulaDescription: isNight ? "AC + Fortuna - Espírito" : "AC + Espírito - Fortuna",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfValor(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const mars = decimalToAbsoluteMin(chartData.planets.find((p) => p.type === "mars")!.longitudeRaw);
  const lotOfFortune = Math.round(arabicParts.fortune!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, mars, lotOfFortune) : calcPart(asc, lotOfFortune, mars);

  return {
    name: "Valor",
    planet: "mars",
    partKey: "valor",
    formulaDescription: isNight ? "AC + Marte - Fortuna" : "AC + Fortuna - Marte",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfVictory(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const jupiter = decimalToAbsoluteMin(chartData.planets.find((p) => p.type === "jupiter")!.longitudeRaw);
  const lotOfSpirit = Math.round(arabicParts.spirit!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, lotOfSpirit, jupiter) : calcPart(asc, jupiter, lotOfSpirit);

  return {
    name: "Vitória",
    planet: "jupiter",
    partKey: "victory",
    formulaDescription: isNight ? "AC + Espírito - Júpiter" : "AC + Júpiter - Espírito",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfCaptivity(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = decimalToAbsoluteMin(chartData.housesData.ascendant);
  const sunDecimal = chartData.planets.find((p) => p.type === "sun")!.longitudeRaw;
  const saturn = decimalToAbsoluteMin(chartData.planets.find((p) => p.type === "saturn")!.longitudeRaw);
  const lotOfFortune = Math.round(arabicParts.fortune!.longitudeRaw);

  const isNight = getSectLocal(sunDecimal, chartData.housesData.house);
  const total = isNight ? calcPart(asc, saturn, lotOfFortune) : calcPart(asc, lotOfFortune, saturn);

  return {
    name: "Cativeiro",
    planet: "saturn",
    partKey: "captivity",
    formulaDescription: isNight ? "AC + Saturno - Fortuna" : "AC + Fortuna - Saturno",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateBirthArchArabicPart(
  arabicPart: ArabicPart,
  ascendant: number
): ArabicPart {
  const ascTotal = decimalToAbsoluteMin(ascendant);
  
  const total = normalize(ascTotal + Math.round(arabicPart.rawDistanceFromASC));
  const data = getArabicPartData(total, ascTotal);

  return {
    ...arabicPart,
    ...data,
    longitudeRaw: total
  };
}
