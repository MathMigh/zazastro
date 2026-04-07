import {
  ArabicPart,
  ArabicPartCalculatorDropdownItem,
  ArabicPartsType,
} from "@/interfaces/ArabicPartInterfaces";
import { AspectType } from "@/interfaces/AstroChartInterfaces";
import {
  BirthChart,
  BirthDate,
  FixedStar,
  Planet,
  PlanetType,
  planetTypes,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import Image from "next/image";

export const allSigns = [
  "Áries ♈︎",
  "Touro ♉︎",
  "Gêmeos ♊︎",
  "Câncer ♋︎",
  "Leão ♌︎",
  "Virgem ♍︎",
  "Libra ♎︎",
  "Escorpião ♏︎",
  "Sagitário ♐︎",
  "Capricórnio ♑︎",
  "Aquário ♒︎",
  "Peixes ♓︎",
];

export const signsGlpyphs = [
  "♈︎",
  "♉︎",
  "♊︎",
  "♋︎",
  "♌︎",
  "♍︎",
  "♎︎",
  "♏︎",
  "♐︎",
  "♑︎",
  "♒︎",
  "♓︎",
];

export const monthsNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// mapeamento das siglas das casas angulares
export const angularLabels: Record<number, string> = {
  0: "AC", // Casa 1 – Ascendente
  3: "IC", // Casa 4 – Fundo do Céu
  6: "DC", // Casa 7 – Descendente
  9: "MC", // Casa 10 – Meio do Céu
};

export const caldaicOrder: PlanetType[] = [
  "moon",
  "mercury",
  "venus",
  "sun",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
  "southNode",
];

export const arabicPartKeys: (keyof ArabicPartsType)[] = [
  "fortune",
  "spirit",
  "necessity",
  "love",
  "valor",
  "victory",
  "captivity",
  "marriage",
  "resignation",
  "children",
];

export const TO_MIN = 60;
export const TO_SIGN_MIN = 1800;
export const CIRCLE_MIN = 21600;

export const toTotal = (lon: number): number => {
  if (lon > 360) return Math.round(lon);
  const s = Math.floor(lon / 30);
  const g = Math.floor(lon % 30);
  const m = Math.round((lon - (s * 30 + g)) * 60);
  return (s * TO_SIGN_MIN) + (g * TO_MIN) + m;
};

export function getSign(longitude: number, getGlyphOnly = false): string {
  const signs = [
    `${!getGlyphOnly ? "Áries " : ""}♈︎`,
    `${!getGlyphOnly ? "Touro " : ""}♉︎`,
    `${!getGlyphOnly ? "Gêmeos " : ""}♊︎`,
    `${!getGlyphOnly ? "Câncer " : ""}♋︎`,
    `${!getGlyphOnly ? "Leão " : ""}♌︎`,
    `${!getGlyphOnly ? "Virgem " : ""}♍︎`,
    `${!getGlyphOnly ? "Libra " : ""}♎︎`,
    `${!getGlyphOnly ? "Escorpião " : ""}♏︎`,
    `${!getGlyphOnly ? "Sagitário " : ""}♐︎`,
    `${!getGlyphOnly ? "Capricórnio " : ""}♑︎`,
    `${!getGlyphOnly ? "Aquário " : ""}♒︎`,
    `${!getGlyphOnly ? "Peixes " : ""}♓︎`,
  ];
  
  const total = toTotal(longitude);
  const signIdx = Math.floor(total / TO_SIGN_MIN) % 12;
  return signs[signIdx];
}

export const planesNamesByType: Record<PlanetType, string> = {
  moon: "Lua",
  mercury: "Mercúrio",
  venus: "Vênus",
  sun: "Sol",
  mars: "Marte",
  jupiter: "Júpiter",
  saturn: "Saturno",
  uranus: "Urano",
  neptune: "Netuno",
  pluto: "Plutão",
  northNode: "Nodo Norte",
  southNode: "Nodo Sul",
};

export const fixedNames = {
  antiscionName: "antiscion",
  houseName: "house",
  outerKeyPrefix: "outer",
};

export const arabicPartCalculatorItems: Record<
  string,
  ArabicPartCalculatorDropdownItem[]
> = {
  Ângulos: [
    { name: "AC", type: "house", key: "house-0" },
    { name: "IC", type: "house", key: "house-3" },
    { name: "DC", type: "house", key: "house-6" },
    { name: "MC", type: "house", key: "house-9" },
  ],

  Planetas: [
    { name: "Sol", type: "planet", key: "sun" },
    { name: "Lua", type: "planet", key: "moon" },
    { name: "Mercúrio", type: "planet", key: "mercury" },
    { name: "Vênus", type: "planet", key: "venus" },
    { name: "Marte", type: "planet", key: "mars" },
    { name: "Júpiter", type: "planet", key: "jupiter" },
    { name: "Saturno", type: "planet", key: "saturn" },
  ],

  Casas: [
    { name: "Casa 1 (AC)", type: "house", key: "house-0" },
    { name: "Casa 2", type: "house", key: "house-1" },
    { name: "Casa 3", type: "house", key: "house-2" },
    { name: "Casa 4 (IC)", type: "house", key: "house-3" },
    { name: "Casa 5", type: "house", key: "house-4" },
    { name: "Casa 6", type: "house", key: "house-5" },
    { name: "Casa 7 (DC)", type: "house", key: "house-6" },
    { name: "Casa 8", type: "house", key: "house-7" },
    { name: "Casa 9", type: "house", key: "house-8" },
    { name: "Casa 10 (MC)", type: "house", key: "house-9" },
    { name: "Casa 11", type: "house", key: "house-10" },
    { name: "Casa 12", type: "house", key: "house-11" },
  ],

  "Partes Árabes": [
    { name: "Fortuna", type: "arabicPart", key: "fortune" },
    { name: "Espírito", type: "arabicPart", key: "spirit" },
    { name: "Necessidade", type: "arabicPart", key: "necessity" },
    { name: "Amor", type: "arabicPart", key: "love" },
    { name: "Valor", type: "arabicPart", key: "valor" },
    { name: "Vitória", type: "arabicPart", key: "victory" },
    { name: "Cativeiro", type: "arabicPart", key: "captivity" },
  ],
};

export const getSignGlyphUnicode = (signEmoji: string): string => {
  if (signEmoji === "♈") return "\u2648\uFE0E";
  else if (signEmoji === "♉") return "\u2649\uFE0E";
  else if (signEmoji === "♊") return "\u264A\uFE0E";
  else if (signEmoji === "♋") return "\u264B\uFE0E";
  else if (signEmoji === "♌") return "\u264C\uFE0E";
  else if (signEmoji === "♍") return "\u264D\uFE0E";
  else if (signEmoji === "♎") return "\u264E\uFE0E";
  else if (signEmoji === "♏") return "\u264F\uFE0E";
  else if (signEmoji === "♐") return "\u2650\uFE0E";
  else if (signEmoji === "♑") return "\u2651\uFE0E";
  else if (signEmoji === "♒") return "\u2652\uFE0E";
  else if (signEmoji === "♓") return "\u2653\uFE0E";

  return "\u2648\uFE0E"; // ♈︎
};

export const getSignColor = (signGlyph: string): string => {
  if (signGlyph === "♈︎" || signGlyph === "♌︎" || signGlyph === "♐︎")
    return "red";
  else if (signGlyph === "♉︎" || signGlyph === "♍︎" || signGlyph === "♑︎")
    return "green";
  else if (signGlyph === "♊︎" || signGlyph === "♎︎" || signGlyph === "♒︎")
    return "orange";
  else if (signGlyph === "♋︎" || signGlyph === "♏︎" || signGlyph === "♓︎")
    return "blue";

  return "black";
};

interface ImgOptions {
  size?: number;
  isAntiscion?: boolean;
  isRetrograde?: boolean;
}

export function getPlanetImage(
  planet: PlanetType,
  options: ImgOptions = {
    isAntiscion: false,
    isRetrograde: false,
  }
): React.ReactNode {
  const folder = "planets";
  const { isAntiscion, isRetrograde } = options;
  const path = `/${folder}${isAntiscion ? "/antiscion" : ""}/${planet}${isRetrograde ? "-rx" : ""
    }.png`;
  return (
    <Image
      alt="planet"
      src={path}
      width={options.size ?? 15}
      height={options.size ?? 15}
      unoptimized
    />
  );
}

export function getArabicPartImage(
  lot: ArabicPart,
  options: ImgOptions = {
    isAntiscion: false,
  }
): React.ReactNode {
  const folder = "planets";
  const part = lot.planet ? lot.partKey : "custom-lot";
  const path = `/${folder}${options.isAntiscion ? "/antiscion" : ""
    }/${part}.png`;
  return (
    <Image
      alt="arabicPart"
      src={path}
      width={options.size ?? 15}
      height={options.size ?? 15}
      unoptimized
    />
  );
}

export function getAspectImage(
  aspectType: AspectType,
  size = 15
): React.ReactNode {
  const folder = "aspects";
  // const aspectType = aspect.aspectType;
  const path = `/${folder}/${aspectType}.png`;

  return (
    <Image alt="aspect" src={path} width={size} height={size} unoptimized />
  );
}

export const formatSignColor = (stringWithSign: string): React.ReactNode => {
  const length = stringWithSign.length;
  // Fallback se a string for menor que o esperado para conter o signo
  if (length < 2) return <span>{stringWithSign}</span>;
  const sign = getSignGlyphUnicode(stringWithSign[length - 2]);
  const color = getSignColor(sign);
  return (
    <>
      <span>{stringWithSign.slice(0, length - 2)}</span>
      <span style={{ color }}>{sign}</span>
    </>
  );
};

export const mod360 = (n: number) => ((n % 360) + 360) % 360; // garante [0 - 359.99]

/**
 * Gets degrees and minutes inside a sign. For Legacy Float input.
 */
export function getDegreesInsideASign(longitude: number): number {
  const total = toTotal(longitude);
  const deg = Math.floor((total % TO_SIGN_MIN) / TO_MIN);
  const min = total % 60;
  return deg + (min / 100);
}

/**
 * Funcao principal de formatacao: Suporta Decimais e Minutos Absolutos.
 */
export function getDegreeAndSign(longitude: number, getGlyphOnly = false) {
  const total = toTotal(longitude);
  const sign = getSign(total, getGlyphOnly);
  
  const signIdx = Math.floor(total / TO_SIGN_MIN) % 12;
  const remainingmin = total - (signIdx * TO_SIGN_MIN);
  const deg = Math.floor(remainingmin / 60);
  const min = remainingmin % 60;

  const minStr = min.toString().padStart(2, "0");
  return `${deg}° ${minStr}'${!getGlyphOnly ? " de " : " "}${sign}`;
}

export function decimalToDegreesMinutes(decimal: number) {
  const total = toTotal(decimal);
  const deg = Math.floor(total / 60);
  const min = total % 60;
  return deg + (min / 100);
}

export function getAntiscion(longitude: number, getRaw = false) {
  const total = toTotal(longitude);
  // Regra do 59' tradicional (soma 10799 minutos total no espelhamento)
  const antTotal = ((32399 - total) % CIRCLE_MIN + CIRCLE_MIN) % CIRCLE_MIN;
  
  return getRaw ? antTotal : antTotal;
}

export function wrapZodiacLongitude(longitude: number) {
  const total = toTotal(longitude);
  return ((total % CIRCLE_MIN) + CIRCLE_MIN) % CIRCLE_MIN;
}

export function getZodiacRuler(longitude: number) {
  const total = toTotal(longitude);
  const signIdx = Math.floor(total / TO_SIGN_MIN) % 12;

  const zodiacRulers: PlanetType[] = [
    "mars", "venus", "mercury", "moon", "sun", "mercury",
    "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"
  ];

  return zodiacRulers[signIdx];
}

export function extractHouseNumber(input: string): number | null {
  const match = input.match(/-(0|1[0-2]|[1-9])$/);
  return match ? parseInt(match[1], 10) : null;
}

export function getHourAndMinute(decimalTime: number): string {
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  const hoursString = hours.toString().padStart(2, "0");
  return `${hoursString}:${minutes}`;
}

export function convertDegMinToDecimal(deg: number, min: number) {
  const decimal = deg + min / 60;
  return parseFloat(decimal.toFixed(4));
}

export function convertDegMinNumberToDecimal(degMin: number) {
  const degrees = Math.floor(degMin);
  const minutes = Number.parseFloat(((degMin - degrees) * 100).toFixed(2));
  const result = degrees + minutes / 60;
  return result;
}

export const clampLongitude = (
  rawString: string,
  degThreshold: number
): number => {
  if (rawString.length === 0) return 0;
  const deg = rawString.split(".")[0];
  const min = rawString.split(".")[1];
  let degNumber = deg === undefined ? 0 : Number.parseInt(deg);
  let minNumber = min === undefined ? 0 : Number.parseInt(min.padEnd(2, "0"));
  if (degNumber < 0) degNumber = 0;
  else if (degNumber > degThreshold) degNumber = degThreshold;
  if (minNumber > 59) minNumber = 59;
  return degNumber + minNumber / 100;
};

export function getReturnDateRangeString(
  returnTime: string,
  returnType: ReturnChartType
): string {
  const [datePart] = returnTime.split(" ");
  const [targetYear, targetMonth] = datePart.split("-").map(Number);
  if (returnType === "solar") {
    return `${targetYear}/${targetYear + 1}`;
  } else {
    const year = targetYear;
    const month = `${targetMonth.toString().padStart(2, "0")}`;
    let nextMonth: string = (targetMonth + 1).toString().padStart(2, "0");
    let nextMonthYear = year.toString();
    if (nextMonth === "13") {
      nextMonth = "01";
      nextMonthYear = (year + 1).toString();
    }
    return `${month}/${year} - ${nextMonth}/${nextMonthYear}`;
  }
}

export function chartsAreEqual(
  chart: BirthChart,
  chartToCompare: BirthChart
): boolean {
  let result = true;
  for (let index = 0; index < chart.planets.length; index++) {
    const planet = chart.planets[index];
    const planetToCompare = chartToCompare.planets[index];
    const longitudesAreEqual =
      planet.longitudeRaw === planetToCompare.longitudeRaw;
    result = result && longitudesAreEqual;
    if (!result) return false;
  }
  for (let index = 0; index < chart.housesData.house.length; index++) {
    const houseLongitude = chart.housesData.house[index];
    const houseToCompareLongitude = chartToCompare.housesData.house[index];
    const longitudesAreEqual = houseLongitude === houseToCompareLongitude;
    result = result && longitudesAreEqual;
    if (!result) return false;
  }
  return true;
}

export function convertDecimalIntoDegMinString(decimal: number): string {
  const array = decimal.toString().split(".");
  const deg = array[0];
  let min = array[1];
  if (!min) min = "00";
  else if (min.length === 1) min = min.padEnd(2, "0") ?? "";
  return `${deg}°${min}'`;
}

export function makeLunarDerivedChart(data: any, birthDate: BirthDate, targetDate: BirthDate): BirthChart {
  return {
    ...data,
    returnTime: data.returnTime,
    birthDate,
    targetDate,
    planets: data.returnPlanets.map((planet: Planet) => {
      const total = toTotal(planet.longitude);
      return {
        ...planet,
        longitude: total,
        antiscion: getAntiscion(total),
        longitudeRaw: planet.longitude,
        antiscionRaw: getAntiscion(total, true),
        type: planetTypes[planet.id],
      };
    }),
    planetsWithSigns: data.returnPlanets.map((planet: Planet) => {
      const total = toTotal(planet.longitude);
      return {
        position: getDegreeAndSign(total, true),
        antiscion: getDegreeAndSign(getAntiscion(total), true),
      };
    }),
    housesData: {
      ...data?.returnHousesData,
      housesWithSigns: data.returnHousesData?.house.map(
        (houseLong: number) => {
          const total = toTotal(houseLong);
          return getDegreeAndSign(total, true);
        }
      ),
    },
    fixedStars: data.fixedStars.map((star: FixedStar) => ({
      ...star,
      elementType: "fixedStar",
      isAntiscion: false,
      isFromOuterChart: false,
      longitudeSign: getDegreeAndSign(toTotal(star.longitude), true),
    })),
  };
}

export const getHousesProfection = (houses: number[], years: number) => {
  const offset = (years * 30) % 360;
  return houses.map(h => ((h + offset) % 360 + 360) % 360);
}

export const getPlanetsProfection = (planets: Planet[], years: number): Planet[] => {
  const offset = (years * 30) % 360;
  return planets.map(p => ({
    ...p,
    longitude: ((p.longitude + offset) % 360 + 360) % 360,
    longitudeRaw: ((p.longitudeRaw + offset) % 360 + 360) % 360
  }));
}

export const getProfectionChart = (birthChart: BirthChart, profectionYear: number) => {
  const profectedHousesData = getHousesProfection(birthChart.housesData.house, profectionYear);
  const profectedPlanetsData = getPlanetsProfection(birthChart.planets, profectionYear);

  const profectedChart: BirthChart = {
    ...birthChart,
    birthDate: {
      ...birthChart.birthDate,
      year: profectionYear ? birthChart.birthDate.year + profectionYear : birthChart.birthDate.year,
    },
    planets: profectedPlanetsData,
    housesData: {
      ...birthChart.housesData,
      ascendant: profectedHousesData[0],
      mc: profectedHousesData[9],
      house: profectedHousesData,
    },
  }

  return profectedChart;
}