import moment, { Moment } from "moment-timezone";
import {
  BirthChart,
  BirthDate,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import { calculateBirthChart, getSwe, resolveTimezone } from "./astrologyEngine";
import { generateTraditionalReport } from "./traditionalReportV2";

interface ReturnCalculationConfig {
  bodyId: number;
  searchWindowHours: number;
  coarseStepMinutes: number;
}

interface ReturnChartResponse {
  returnPlanets: BirthChart["planets"];
  returnHousesData: BirthChart["housesData"];
  returnTime: string;
  fixedStars: BirthChart["fixedStars"];
  fixedStarMatches?: BirthChart["fixedStarMatches"];
  timezone: string;
  traditionalReport: string;
}

interface LongitudeSample {
  moment: Moment;
  delta: number;
}

const RETURN_CONFIG: Record<ReturnChartType, ReturnCalculationConfig> = {
  solar: {
    bodyId: 0,
    searchWindowHours: 72,
    coarseStepMinutes: 360,
  },
  lunar: {
    bodyId: 1,
    searchWindowHours: 48,
    coarseStepMinutes: 120,
  },
};

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function normalizeSignedAngle(angle: number): number {
  return ((angle + 540) % 360) - 180;
}

function getTimeParts(time: string | number | undefined): {
  hours: number;
  minutes: number;
} {
  if (typeof time === "string" && time.includes(":")) {
    const [rawHours, rawMinutes] = time.split(":");
    const hours = Number.parseInt(rawHours, 10) || 0;
    const minutes = Number.parseInt(rawMinutes, 10) || 0;
    return { hours, minutes };
  }

  const decimalTime =
    typeof time === "number" ? time : Number.parseFloat(time ?? "12");
  const safeDecimalTime = Number.isFinite(decimalTime) ? decimalTime : 12;
  const hours = Math.floor(safeDecimalTime);
  const minutes = Math.round((safeDecimalTime - hours) * 60);

  if (minutes === 60) {
    return { hours: hours + 1, minutes: 0 };
  }

  return { hours, minutes };
}

function getMomentForBirthDate(birthDate: BirthDate): {
  localMoment: Moment;
  timezone: string;
} {
  const timezone = resolveTimezone(birthDate.coordinates);
  const { hours, minutes } = getTimeParts(birthDate.time);
  const localMoment = moment.tz(
    `${birthDate.year}-${birthDate.month}-${birthDate.day} ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    "YYYY-M-D HH:mm",
    timezone
  );

  if (!localMoment.isValid()) {
    throw new Error("Nao foi possivel interpretar a data do retorno.");
  }

  return { localMoment, timezone };
}

function buildBirthDateFromMoment(
  localMoment: Moment,
  baseBirthDate: BirthDate
): BirthDate {
  return {
    ...baseBirthDate,
    day: localMoment.date(),
    month: localMoment.month() + 1,
    year: localMoment.year(),
    time: localMoment.format("HH:mm"),
    coordinates: {
      ...baseBirthDate.coordinates,
    },
  };
}

function safeCalculatePosition(sw: any, julianDay: number, bodyId: number, flags: number) {
  const moduleRef = sw.module;
  const xxPtr = moduleRef._malloc(6 * 8);
  const serrPtr = moduleRef._malloc(256);

  try {
    const retflag = moduleRef.ccall(
      "swe_calc_ut_wrap",
      "number",
      ["number", "number", "number", "number", "number"],
      [julianDay, bodyId, flags, xxPtr, serrPtr]
    );

    if (retflag < 0) {
      throw new Error(moduleRef.UTF8ToString(serrPtr));
    }

    return moduleRef.getValue(xxPtr, "double");
  } finally {
    moduleRef._free(xxPtr);
    moduleRef._free(serrPtr);
  }
}

async function getBodyLongitudeAtMoment(
  localMoment: Moment,
  bodyId: number
): Promise<number> {
  const sw = (await getSwe()) as any;
  const utcMoment = localMoment.clone().utc();
  const julianDay = sw.julianDay(
    utcMoment.year(),
    utcMoment.month() + 1,
    utcMoment.date(),
    utcMoment.hour() + utcMoment.minute() / 60 + utcMoment.second() / 3600,
    1
  );

  return normalizeLongitude(safeCalculatePosition(sw, julianDay, bodyId, 258));
}

async function getReturnLongitudeDelta(
  localMoment: Moment,
  referenceLongitude: number,
  bodyId: number,
  cache: Map<string, number>
): Promise<number> {
  const cacheKey = localMoment.format("YYYY-MM-DD HH:mm");
  const cachedLongitude = cache.get(cacheKey);
  const longitude =
    cachedLongitude ?? (await getBodyLongitudeAtMoment(localMoment, bodyId));

  if (cachedLongitude === undefined) {
    cache.set(cacheKey, longitude);
  }

  return normalizeSignedAngle(longitude - referenceLongitude);
}

async function findClosestSample(
  centerMoment: Moment,
  rangeMinutes: number,
  stepMinutes: number,
  referenceLongitude: number,
  bodyId: number,
  cache: Map<string, number>
): Promise<LongitudeSample> {
  let bestSample: LongitudeSample | null = null;

  for (
    let offsetMinutes = -rangeMinutes;
    offsetMinutes <= rangeMinutes;
    offsetMinutes += stepMinutes
  ) {
    const candidateMoment = centerMoment.clone().add(offsetMinutes, "minutes");
    const delta = await getReturnLongitudeDelta(
      candidateMoment,
      referenceLongitude,
      bodyId,
      cache
    );

    if (
      !bestSample ||
      Math.abs(delta) < Math.abs(bestSample.delta)
    ) {
      bestSample = {
        moment: candidateMoment,
        delta,
      };
    }
  }

  if (!bestSample) {
    throw new Error("Nao foi possivel localizar a janela do retorno.");
  }

  return bestSample;
}

async function refineBracket(
  lowerMoment: Moment,
  upperMoment: Moment,
  lowerDelta: number,
  upperDelta: number,
  referenceLongitude: number,
  bodyId: number,
  cache: Map<string, number>
): Promise<Moment> {
  let lowMoment = lowerMoment.clone();
  let highMoment = upperMoment.clone();
  let lowDelta = lowerDelta;
  let highDelta = upperDelta;
  let bestSample: LongitudeSample =
    Math.abs(lowDelta) <= Math.abs(highDelta)
      ? { moment: lowMoment.clone(), delta: lowDelta }
      : { moment: highMoment.clone(), delta: highDelta };

  for (let iteration = 0; iteration < 18; iteration += 1) {
    const midpointMs = (lowMoment.valueOf() + highMoment.valueOf()) / 2;
    const midpoint = moment.tz(midpointMs, lowMoment.tz() ?? "UTC");
    const midDelta = await getReturnLongitudeDelta(
      midpoint,
      referenceLongitude,
      bodyId,
      cache
    );

    if (Math.abs(midDelta) < Math.abs(bestSample.delta)) {
      bestSample = {
        moment: midpoint.clone(),
        delta: midDelta,
      };
    }

    if (Math.abs(highMoment.diff(lowMoment, "minutes")) <= 1) {
      break;
    }

    if (
      Math.sign(midDelta) === Math.sign(lowDelta) &&
      Math.sign(midDelta) !== 0
    ) {
      lowMoment = midpoint;
      lowDelta = midDelta;
    } else {
      highMoment = midpoint;
      highDelta = midDelta;
    }
  }

  const minuteRefined = await findClosestSample(
    bestSample.moment,
    4,
    1,
    referenceLongitude,
    bodyId,
    cache
  );

  return minuteRefined.moment;
}

async function findReturnMoment(
  birthDate: BirthDate,
  targetDate: BirthDate,
  returnType: ReturnChartType
): Promise<{
  returnMoment: Moment;
  timezone: string;
}> {
  const config = RETURN_CONFIG[returnType];
  const { localMoment: baseMoment, timezone } = getMomentForBirthDate({
    ...targetDate,
    coordinates: {
      ...birthDate.coordinates,
    },
  });
  const referenceMoment = getMomentForBirthDate({
    ...birthDate,
    coordinates: {
      ...birthDate.coordinates,
    },
  }).localMoment;
  const cache = new Map<string, number>();
  const referenceLongitude = await getBodyLongitudeAtMoment(
    referenceMoment,
    config.bodyId
  );
  const searchWindowMinutes = config.searchWindowHours * 60;
  let previousSample: LongitudeSample | null = null;
  let closestSample: LongitudeSample | null = null;

  for (
    let offsetMinutes = -searchWindowMinutes;
    offsetMinutes <= searchWindowMinutes;
    offsetMinutes += config.coarseStepMinutes
  ) {
    const candidateMoment = baseMoment.clone().add(offsetMinutes, "minutes");
    const delta = await getReturnLongitudeDelta(
      candidateMoment,
      referenceLongitude,
      config.bodyId,
      cache
    );
    const sample = {
      moment: candidateMoment,
      delta,
    };

    if (!closestSample || Math.abs(delta) < Math.abs(closestSample.delta)) {
      closestSample = sample;
    }

    if (Math.abs(delta) < 0.0001) {
      return {
        returnMoment: candidateMoment,
        timezone,
      };
    }

    if (
      previousSample &&
      Math.sign(previousSample.delta) !== Math.sign(sample.delta)
    ) {
      const refinedMoment = await refineBracket(
        previousSample.moment,
        sample.moment,
        previousSample.delta,
        sample.delta,
        referenceLongitude,
        config.bodyId,
        cache
      );

      return {
        returnMoment: refinedMoment,
        timezone,
      };
    }

    previousSample = sample;
  }

  if (!closestSample) {
    throw new Error("Nao foi possivel localizar o retorno solicitado.");
  }

  const fineSample = await findClosestSample(
    closestSample.moment,
    config.coarseStepMinutes,
    10,
    referenceLongitude,
    config.bodyId,
    cache
  );
  const minuteSample = await findClosestSample(
    fineSample.moment,
    20,
    1,
    referenceLongitude,
    config.bodyId,
    cache
  );

  return {
    returnMoment: minuteSample.moment,
    timezone,
  };
}

export async function calculateReturnChartData(
  birthDate: BirthDate,
  targetDate: BirthDate,
  returnType: ReturnChartType
): Promise<ReturnChartResponse> {
  const { returnMoment, timezone } = await findReturnMoment(
    birthDate,
    targetDate,
    returnType
  );
  const returnBirthDate = buildBirthDateFromMoment(returnMoment, {
    ...targetDate,
    coordinates: {
      ...birthDate.coordinates,
    },
  });
  const returnChart = await calculateBirthChart(returnBirthDate);
  const traditionalReport = await generateTraditionalReport(returnChart);

  return {
    returnPlanets: returnChart.planets,
    returnHousesData: returnChart.housesData,
    returnTime: returnMoment.format("YYYY-MM-DD HH:mm:ss"),
    fixedStars: returnChart.fixedStars,
    fixedStarMatches: returnChart.fixedStarMatches,
    timezone,
    traditionalReport,
  };
}
