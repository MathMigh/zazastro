import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";

export type ArabicLotCalculationMode = "traditional" | "simplified";

export const ARABIC_PARTS_CYCLE = 21600;
export const DEFAULT_ARABIC_PARTS_MODE: ArabicLotCalculationMode = "simplified";
export const ORDERED_ARABIC_PART_KEYS: (keyof ArabicPartsType)[] = [
  "fortune",
  "spirit",
  "necessity",
  "love",
  "valor",
  "victory",
  "captivity",
];

const SIGN_NAMES = [
  "\u00c1ries",
  "Touro",
  "G\u00eameos",
  "C\u00e2ncer",
  "Le\u00e3o",
  "Virgem",
  "Libra",
  "Escorpi\u00e3o",
  "Sagit\u00e1rio",
  "Capric\u00f3rnio",
  "Aqu\u00e1rio",
  "Peixes",
];

const SIGN_GLYPHS = [
  "\u2648\uFE0E",
  "\u2649\uFE0E",
  "\u264A\uFE0E",
  "\u264B\uFE0E",
  "\u264C\uFE0E",
  "\u264D\uFE0E",
  "\u264E\uFE0E",
  "\u264F\uFE0E",
  "\u2650\uFE0E",
  "\u2651\uFE0E",
  "\u2652\uFE0E",
  "\u2653\uFE0E",
];

const ARABIC_PART_METADATA: Record<
  keyof ArabicPartsType,
  { name: string; planet: PlanetType }
> = {
  fortune: { name: "Fortuna", planet: "moon" },
  spirit: { name: "Esp\u00edrito", planet: "sun" },
  necessity: { name: "Necessidade", planet: "mercury" },
  love: { name: "Amor", planet: "venus" },
  valor: { name: "Valor", planet: "mars" },
  victory: { name: "Vit\u00f3ria", planet: "jupiter" },
  captivity: { name: "Cativeiro", planet: "saturn" },
};

interface ArabicLotBuildOptions {
  formulaDescription: string;
  ascendantTotal: number;
  total: number;
  partKey: keyof ArabicPartsType;
}

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function toTotal(signo: number, grau: number, minuto: number): number {
  return (signo * 1800) + (grau * 60) + minuto;
}

export function normalize(total: number): number {
  const rounded = Math.round(total);
  return ((rounded % ARABIC_PARTS_CYCLE) + ARABIC_PARTS_CYCLE) % ARABIC_PARTS_CYCLE;
}

export function fromTotal(total: number): {
  signo: number;
  grau: number;
  minuto: number;
} {
  const normalized = normalize(total);
  const signo = Math.floor(normalized / 1800);
  const withinSign = normalized % 1800;
  const grau = Math.floor(withinSign / 60);
  const minuto = withinSign % 60;

  return { signo, grau, minuto };
}

export function longitudeToAbsoluteMinutes(longitude: number): number {
  return normalize(Math.round(normalizeLongitude(longitude) * 60));
}

export function calcPart(
  ascendantTotal: number,
  bTotal: number,
  cTotal: number,
  isDiurno = true,
  mode: ArabicLotCalculationMode = "simplified",
): number {
  if (mode === "simplified" || isDiurno) {
    return normalize(ascendantTotal + bTotal - cTotal);
  }

  return normalize(ascendantTotal + cTotal - bTotal);
}

function getHouseIndex(longitude: number, cusps: number[]): number {
  for (let index = 0; index < 11; index += 1) {
    const start = cusps[index];
    const end = cusps[index + 1];

    if (end < start) {
      if (longitude >= start || longitude < end) {
        return index + 1;
      }

      continue;
    }

    if (longitude >= start && longitude < end) {
      return index + 1;
    }
  }

  return 12;
}

export function isDiurnalChart(chart: BirthChart): boolean {
  const sun = chart.planets.find((planet) => planet.type === "sun");

  if (!sun) {
    throw new Error("N\u00e3o foi poss\u00edvel calcular a secta sem o Sol.");
  }

  const sunHouse = getHouseIndex(sun.longitudeRaw, chart.housesData.house);
  return sunHouse >= 7;
}

function formatAbsoluteMinutes(total: number, glyphOnly: boolean): string {
  const { signo, grau, minuto } = fromTotal(total);
  const sign = glyphOnly
    ? SIGN_GLYPHS[signo]
    : `${SIGN_NAMES[signo]} ${SIGN_GLYPHS[signo]}`;
  const minute = minuto.toString().padStart(2, "0");

  return `${grau}\u00b0 ${minute}'${glyphOnly ? " " : " de "}${sign}`;
}

function getAntiscion(total: number): number {
  return normalize(32400 - total);
}

function getFormulaDescription(
  bLabel: string,
  cLabel: string,
  isDiurno: boolean,
  mode: ArabicLotCalculationMode,
): string {
  if (mode === "simplified" || isDiurno) {
    return `AC + ${bLabel} - ${cLabel}`;
  }

  return `AC + ${cLabel} - ${bLabel}`;
}

function getPlanetTotal(chart: BirthChart, type: PlanetType): number {
  const planet = chart.planets.find((item) => item.type === type);

  if (!planet) {
    throw new Error(`Planeta obrigat\u00f3rio ausente para o c\u00e1lculo: ${type}.`);
  }

  return longitudeToAbsoluteMinutes(planet.longitudeRaw);
}

function buildArabicPart({
  formulaDescription,
  ascendantTotal,
  total,
  partKey,
}: ArabicLotBuildOptions): ArabicPart {
  const antiscion = getAntiscion(total);
  const rawDistanceFromASC = normalize(total - ascendantTotal);
  const metadata = ARABIC_PART_METADATA[partKey];

  return {
    name: metadata.name,
    planet: metadata.planet,
    partKey,
    formulaDescription,
    longitudeRaw: total,
    longitude: total / 60,
    longitudeSign: formatAbsoluteMinutes(total, true),
    antiscion,
    antiscionRaw: antiscion / 60,
    antiscionSign: formatAbsoluteMinutes(antiscion, true),
    distanceFromASC: rawDistanceFromASC / 60,
    rawDistanceFromASC,
  };
}

export function calculateArabicLots(
  chart: BirthChart,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPartsType {
  const isDiurno = isDiurnalChart(chart);
  const ascendantTotal = longitudeToAbsoluteMinutes(chart.housesData.ascendant);
  const sunTotal = getPlanetTotal(chart, "sun");
  const moonTotal = getPlanetTotal(chart, "moon");
  const venusTotal = getPlanetTotal(chart, "venus");
  const marsTotal = getPlanetTotal(chart, "mars");
  const jupiterTotal = getPlanetTotal(chart, "jupiter");
  const saturnTotal = getPlanetTotal(chart, "saturn");

  const fortuneTotal = calcPart(
    ascendantTotal,
    moonTotal,
    sunTotal,
    isDiurno,
    mode,
  );
  const spiritTotal = calcPart(
    ascendantTotal,
    sunTotal,
    moonTotal,
    isDiurno,
    mode,
  );

  const necessityTotal =
    mode === "traditional"
      ? calcPart(ascendantTotal, fortuneTotal, saturnTotal, isDiurno, mode)
      : calcPart(ascendantTotal, fortuneTotal, spiritTotal);
  const loveTotal =
    mode === "traditional"
      ? calcPart(ascendantTotal, venusTotal, sunTotal, isDiurno, mode)
      : calcPart(ascendantTotal, spiritTotal, fortuneTotal);
  const valorTotal =
    mode === "traditional"
      ? calcPart(ascendantTotal, marsTotal, sunTotal, isDiurno, mode)
      : calcPart(ascendantTotal, fortuneTotal, marsTotal);
  const victoryTotal =
    mode === "traditional"
      ? calcPart(ascendantTotal, jupiterTotal, sunTotal, isDiurno, mode)
      : calcPart(ascendantTotal, jupiterTotal, spiritTotal);
  const captivityTotal =
    mode === "traditional"
      ? calcPart(ascendantTotal, saturnTotal, marsTotal, isDiurno, mode)
      : calcPart(ascendantTotal, fortuneTotal, saturnTotal);

  return {
    fortune: buildArabicPart({
      partKey: "fortune",
      total: fortuneTotal,
      ascendantTotal,
      formulaDescription: getFormulaDescription("Lua", "Sol", isDiurno, mode),
    }),
    spirit: buildArabicPart({
      partKey: "spirit",
      total: spiritTotal,
      ascendantTotal,
      formulaDescription: getFormulaDescription("Sol", "Lua", isDiurno, mode),
    }),
    necessity: buildArabicPart({
      partKey: "necessity",
      total: necessityTotal,
      ascendantTotal,
      formulaDescription:
        mode === "traditional"
          ? getFormulaDescription("Fortuna", "Saturno", isDiurno, mode)
          : "AC + Fortuna - Esp\u00edrito",
    }),
    love: buildArabicPart({
      partKey: "love",
      total: loveTotal,
      ascendantTotal,
      formulaDescription:
        mode === "traditional"
          ? getFormulaDescription("V\u00eanus", "Sol", isDiurno, mode)
          : "AC + Esp\u00edrito - Fortuna",
    }),
    valor: buildArabicPart({
      partKey: "valor",
      total: valorTotal,
      ascendantTotal,
      formulaDescription:
        mode === "traditional"
          ? getFormulaDescription("Marte", "Sol", isDiurno, mode)
          : "AC + Fortuna - Marte",
    }),
    victory: buildArabicPart({
      partKey: "victory",
      total: victoryTotal,
      ascendantTotal,
      formulaDescription:
        mode === "traditional"
          ? getFormulaDescription("J\u00fapiter", "Sol", isDiurno, mode)
          : "AC + J\u00fapiter - Esp\u00edrito",
    }),
    captivity: buildArabicPart({
      partKey: "captivity",
      total: captivityTotal,
      ascendantTotal,
      formulaDescription:
        mode === "traditional"
          ? getFormulaDescription("Saturno", "Marte", isDiurno, mode)
          : "AC + Fortuna - Saturno",
    }),
  };
}

export function calculateLotOfFortune(
  chart: BirthChart,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).fortune!;
}

export function calculateLotOfSpirit(
  chart: BirthChart,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).spirit!;
}

export function calculateLotOfNecessity(
  chart: BirthChart,
  _arabicParts?: ArabicPartsType,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).necessity!;
}

export function calculateLotOfLove(
  chart: BirthChart,
  _arabicParts?: ArabicPartsType,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).love!;
}

export function calculateLotOfValor(
  chart: BirthChart,
  _arabicParts?: ArabicPartsType,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).valor!;
}

export function calculateLotOfVictory(
  chart: BirthChart,
  _arabicParts?: ArabicPartsType,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).victory!;
}

export function calculateLotOfCaptivity(
  chart: BirthChart,
  _arabicParts?: ArabicPartsType,
  mode: ArabicLotCalculationMode = DEFAULT_ARABIC_PARTS_MODE,
): ArabicPart {
  return calculateArabicLots(chart, mode).captivity!;
}

export function calculateBirthArchArabicPart(
  arabicPart: ArabicPart,
  ascendant: number,
): ArabicPart {
  const ascendantTotal = longitudeToAbsoluteMinutes(ascendant);
  const total = normalize(ascendantTotal + Math.round(arabicPart.rawDistanceFromASC));
  const projectedPart = buildArabicPart({
    partKey: arabicPart.partKey,
    total,
    ascendantTotal,
    formulaDescription: arabicPart.formulaDescription,
  });

  return {
    ...arabicPart,
    ...projectedPart,
  };
}

