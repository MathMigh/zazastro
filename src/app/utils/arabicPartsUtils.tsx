import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import {
  getAntiscion,
  getDegreeAndSign,
  toTotal,
} from "./chartUtils";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";

const getGlyphOnly = true;

const CIRCLE_MIN = 21600;

function normalizeMin(min: number): number {
  return ((min % CIRCLE_MIN) + CIRCLE_MIN) % CIRCLE_MIN;
}

function getArabicPartData(total: number, ascTotal: number) {
  const antiscion = getAntiscion(total);
  const rawDistanceFromASC = normalizeMin(total - ascTotal);

  const longitudeSign = getDegreeAndSign(total, getGlyphOnly);
  const antiscionSign = getDegreeAndSign(antiscion, getGlyphOnly);

  return {
    longitude: total / 60,
    antiscion,
    antiscionRaw: antiscion / 60,
    distanceFromASC: rawDistanceFromASC / 60,
    rawDistanceFromASC,
    longitudeSign,
    antiscionSign,
  };
}

export function calculateLotOfFortune(chartData: BirthChart): ArabicPart {
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);
  const moon = toTotal(chartData.planets.find((p) => p.type === "moon")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + moon - sun);

  return {
    name: "Fortuna",
    planet: "moon",
    partKey: "fortune",
    formulaDescription: "AC + Lua - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfSpirit(chartData: BirthChart): ArabicPart {
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);
  const moon = toTotal(chartData.planets.find((p) => p.type === "moon")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + sun - moon);

  return {
    name: "Espírito",
    planet: "sun",
    partKey: "spirit",
    formulaDescription: "AC + Sol - Lua",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfNecessity(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const asc = toTotal(chartData.housesData.ascendant);
  const lotOfFortune = Math.round(arabicParts.fortune!.longitudeRaw);
  const lotOfSpirit = Math.round(arabicParts.spirit!.longitudeRaw);

  const total = normalizeMin(asc + lotOfFortune - lotOfSpirit);

  return {
    name: "Necessidade",
    planet: "mercury",
    partKey: "necessity",
    formulaDescription: "AC + Fortuna - Espírito",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfLove(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);
  const venus = toTotal(chartData.planets.find((p) => p.type === "venus")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + venus - sun);

  return {
    name: "Amor",
    planet: "venus",
    partKey: "love",
    formulaDescription: "AC + Vênus - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfValor(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);
  const mars = toTotal(chartData.planets.find((p) => p.type === "mars")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + mars - sun);

  return {
    name: "Valor",
    planet: "mars",
    partKey: "valor",
    formulaDescription: "AC + Marte - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfVictory(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);
  const jupiter = toTotal(chartData.planets.find((p) => p.type === "jupiter")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + jupiter - sun);

  return {
    name: "Vitória",
    planet: "jupiter",
    partKey: "victory",
    formulaDescription: "AC + Júpiter - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfCaptivity(
  chartData: BirthChart,
  arabicParts: ArabicPartsType
): ArabicPart {
  const mars = toTotal(chartData.planets.find((p) => p.type === "mars")!.longitudeRaw);
  const saturn = toTotal(chartData.planets.find((p) => p.type === "saturn")!.longitudeRaw);
  const asc = toTotal(chartData.housesData.ascendant);

  const total = normalizeMin(asc + saturn - mars);

  return {
    name: "Cativeiro",
    planet: "saturn",
    partKey: "captivity",
    formulaDescription: "AC + Saturno - Marte",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfMarriage(chartData: BirthChart): ArabicPart {
  const asc = toTotal(chartData.housesData.ascendant);
  const dsc = toTotal(chartData.housesData.house[6]);
  const venus = toTotal(chartData.planets.find((p) => p.type === "venus")!.longitudeRaw);

  const total = normalizeMin(asc + dsc - venus);

  return {
    name: "Casamento",
    partKey: "marriage",
    formulaDescription: "AC + DC - Vênus",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfResignation(chartData: BirthChart): ArabicPart {
  const asc = toTotal(chartData.housesData.ascendant);
  const saturn = toTotal(chartData.planets.find((p) => p.type === "saturn")!.longitudeRaw);
  const jupiter = toTotal(chartData.planets.find((p) => p.type === "jupiter")!.longitudeRaw);
  const sun = toTotal(chartData.planets.find((p) => p.type === "sun")!.longitudeRaw);

  const total = normalizeMin(saturn + jupiter - sun);

  return {
    name: "Renúncia",
    partKey: "resignation",
    formulaDescription: "Saturno + Júpiter - Sol",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateLotOfChildren(chartData: BirthChart): ArabicPart {
  const asc = toTotal(chartData.housesData.ascendant);
  const saturn = toTotal(chartData.planets.find((p) => p.type === "saturn")!.longitudeRaw);
  const jupiter = toTotal(chartData.planets.find((p) => p.type === "jupiter")!.longitudeRaw);

  const total = normalizeMin(asc + saturn - jupiter);

  return {
    name: "Filhos",
    partKey: "children",
    formulaDescription: "AC + Saturno - Júpiter",
    longitudeRaw: total,
    ...getArabicPartData(total, asc),
  };
}

export function calculateBirthArchArabicPart(
  arabicPart: ArabicPart,
  ascendant: number
): ArabicPart {
  const total = normalizeMin(toTotal(ascendant) + toTotal(arabicPart.rawDistanceFromASC));
  const data = getArabicPartData(total, toTotal(ascendant));

  return {
    ...arabicPart,
    ...data,
    longitudeRaw: total
  };
}
