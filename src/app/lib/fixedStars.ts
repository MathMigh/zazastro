import {
  BirthChart,
  FixedStar,
  FixedStarMatch,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { FIXED_STARS, PRECESSION_RATE, SIGNS } from "./traditionalTables";

const FIXED_STAR_ORB_DEGREES = 2;
const PARTILE_EXACT_ORB = 1 / 6;
const PARTILE_ORB = 0.5;

type FixedStarTarget = {
  pointName: string;
  pointElementType: "planet" | "house";
  pointPlanetType?: PlanetType;
  pointLongitude: number;
};

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function getAngularDistance(first: number, second: number): number {
  const diff = Math.abs(normalizeDegrees(first) - normalizeDegrees(second));
  return diff > 180 ? 360 - diff : diff;
}

function formatDegrees(longitude: number): string {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30) % 12;
  const degreesInSign = normalized - signIndex * 30;
  const degree = Math.floor(degreesInSign);
  const minute = Math.round((degreesInSign - degree) * 60);
  const safeDegree = minute === 60 ? degree + 1 : degree;
  const safeMinute = minute === 60 ? 0 : minute;

  return `${safeDegree}°${safeMinute.toString().padStart(2, "0")}' de ${SIGNS[signIndex]}`;
}

function formatOrb(orb: number): string {
  const degree = Math.floor(orb);
  const minute = Math.round((orb - degree) * 60);
  const safeDegree = minute === 60 ? degree + 1 : degree;
  const safeMinute = minute === 60 ? 0 : minute;

  return `${safeDegree}°${safeMinute.toString().padStart(2, "0")}'`;
}

function getDescriptor(orb: number): string {
  if (orb <= PARTILE_EXACT_ORB) return "Conjuncao Partil Exata";
  if (orb <= PARTILE_ORB) return "Conjuncao Partil";
  return "Forte Conjuncao";
}

function isRelevantStar(star: {
  magnitude?: number;
  extra?: string;
}): boolean {
  return star.extra === "Estrela Real" || (star.magnitude ?? Number.POSITIVE_INFINITY) <= 1.5;
}

export function getDecimalYearFromDate(date: Date): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1, 0, 0, 0);
  const end = Date.UTC(year + 1, 0, 1, 0, 0, 0);

  return year + (date.getTime() - start) / (end - start);
}

function getDecimalYearFromBirthDate(chart: BirthChart): number {
  const { year, month, day, time } = chart.birthDate;
  const [hoursString = "12", minutesString = "00"] = `${time}`.includes(":")
    ? `${time}`.split(":")
    : [Math.floor(Number(time) || 12).toString(), "00"];
  const hours = Number(hoursString) || 0;
  const minutes = Number(minutesString) || 0;

  return getDecimalYearFromDate(
    new Date(Date.UTC(year, Math.max(0, month - 1), day, hours, minutes))
  );
}

function getFixedStarTargets(chart: BirthChart): FixedStarTarget[] {
  const planetTargets = chart.planets
    .filter((planet) =>
      ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].includes(planet.type)
    )
    .map((planet) => ({
      pointName: planet.name,
      pointElementType: "planet" as const,
      pointPlanetType: planet.type,
      pointLongitude: planet.longitudeRaw,
    }));

  return [
    {
      pointName: "ASC",
      pointElementType: "house",
      pointLongitude: chart.housesData.ascendant,
    },
    {
      pointName: "MC",
      pointElementType: "house",
      pointLongitude: chart.housesData.mc,
    },
    ...planetTargets,
  ];
}

function buildFixedStarMatchKey(target: FixedStarTarget, starName: string): string {
  return `${target.pointName}-${starName}`.toLowerCase().replace(/\s+/g, "-");
}

export function getFixedStarLongitude(
  baseLongitude: number,
  decimalYear: number
): number {
  return normalizeDegrees(baseLongitude + (decimalYear - 2000) * PRECESSION_RATE);
}

export function calculateFixedStarMatches(
  chart: BirthChart,
  decimalYear = getDecimalYearFromBirthDate(chart)
): FixedStarMatch[] {
  const targets = getFixedStarTargets(chart);
  const matches: FixedStarMatch[] = [];

  targets.forEach((target) => {
    FIXED_STARS.forEach((star) => {
      const starLongitude = getFixedStarLongitude(star.lon, decimalYear);
      const orb = getAngularDistance(target.pointLongitude, starLongitude);

      if (orb > FIXED_STAR_ORB_DEGREES) {
        return;
      }

      matches.push({
        key: buildFixedStarMatchKey(target, star.name),
        pointName: target.pointName,
        pointPlanetType: target.pointPlanetType,
        pointElementType: target.pointElementType,
        pointLongitude: target.pointLongitude,
        starName: star.name,
        starLongitude,
        starLongitudeLabel: formatDegrees(starLongitude),
        orb,
        orbLabel: formatOrb(orb),
        nature: star.nature,
        note: star.extra,
        magnitude: star.magnitude,
        descriptor: getDescriptor(orb),
        isRelevant: isRelevantStar(star),
      });
    });
  });

  return matches.sort((first, second) => first.orb - second.orb);
}

export function buildFixedStarsFromMatches(matches: FixedStarMatch[]): FixedStar[] {
  const byStarName = new Map<string, FixedStar>();

  matches.forEach((match, index) => {
    if (byStarName.has(match.starName)) {
      return;
    }

    byStarName.set(match.starName, {
      id: index,
      name: match.starName,
      longitude: match.starLongitude,
      longitudeSign: match.starLongitudeLabel,
      latitude: 0,
      magnitude: match.magnitude ?? 0,
      nature: match.nature,
      note: match.note,
      isRelevant: match.isRelevant,
      elementType: "fixedStar",
      isAntiscion: false,
      isFromOuterChart: false,
      isRetrograde: false,
    });
  });

  return Array.from(byStarName.values());
}

export function buildFixedStarReportLine(match: FixedStarMatch): string {
  const parts = [
    `${match.starName} (${match.starLongitudeLabel}, orbe ${match.orbLabel}) - ${match.descriptor}`,
  ];

  if (match.nature) {
    parts.push(`natureza ${match.nature}`);
  }

  if (match.note) {
    parts.push(match.note);
  }

  return parts.join(", ");
}

export function getFixedStarConjunctions(
  longitude: number,
  year: number
): string[] {
  const decimalYear = Number.isFinite(year) ? year : 2000;

  return FIXED_STARS.map((star) => {
    const starLongitude = getFixedStarLongitude(star.lon, decimalYear);
    const orb = getAngularDistance(longitude, starLongitude);

    if (orb > FIXED_STAR_ORB_DEGREES) {
      return undefined;
    }

    return buildFixedStarReportLine({
      key: `legacy-${star.name}`,
      pointName: "legacy",
      pointElementType: "house",
      pointLongitude: longitude,
      pointPlanetType: undefined,
      starName: star.name,
      starLongitude,
      starLongitudeLabel: formatDegrees(starLongitude),
      orb,
      orbLabel: formatOrb(orb),
      nature: star.nature,
      note: star.extra,
      magnitude: star.magnitude,
      descriptor: getDescriptor(orb),
      isRelevant: isRelevantStar(star),
    });
  }).filter((entry): entry is string => Boolean(entry));
}

export function decorateChartWithFixedStars(
  chart: BirthChart,
  decimalYear?: number
): BirthChart {
  const fixedStarMatches = calculateFixedStarMatches(chart, decimalYear);
  const fixedStars = buildFixedStarsFromMatches(fixedStarMatches);

  return {
    ...chart,
    fixedStars,
    fixedStarMatches,
  };
}
