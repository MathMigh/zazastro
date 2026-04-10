import { AspectType, ElementType } from "@/interfaces/AstroChartInterfaces";
import { PlanetType } from "@/interfaces/BirthChartInterfaces";

export interface TraditionalAspectParticipant {
  longitude: number;
  speed?: number;
  elementType: ElementType;
  planetType?: PlanetType;
  isAntiscion?: boolean;
}

export interface TraditionalAspectMatch {
  aspectType: AspectType;
  aspectAngle: number;
  orbDistance: number;
  maxOrb: number;
  applying: boolean;
}

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const PLANET_MOIETIES: Partial<Record<PlanetType, number>> = {
  sun: 7.5,
  moon: 6,
  mercury: 3.5,
  venus: 3.5,
  mars: 3.5,
  jupiter: 4.5,
  saturn: 4.5,
};

const OUTER_PLANETS = new Set<PlanetType>(["uranus", "neptune", "pluto"]);
const NODES = new Set<PlanetType>(["northNode", "southNode"]);

const SIGN_DISTANCE_TO_ASPECT: Partial<Record<number, AspectType>> = {
  0: "conjunction",
  2: "sextile",
  3: "square",
  4: "trine",
  6: "opposition",
  8: "trine",
  9: "square",
  10: "sextile",
};

export function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function getAbsoluteAngularDistance(
  firstLongitude: number,
  secondLongitude: number
): number {
  const difference = Math.abs(
    normalizeLongitude(firstLongitude) - normalizeLongitude(secondLongitude)
  );

  return difference > 180 ? 360 - difference : difference;
}

export function getAspectAngleFromType(aspectType: AspectType): number {
  return ASPECT_ANGLES[aspectType];
}

export function getSignIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

export function getDegreeInSign(longitude: number): number {
  return normalizeLongitude(longitude) % 30;
}

export function getSignDistance(
  firstLongitude: number,
  secondLongitude: number
): number {
  return (
    (getSignIndex(secondLongitude) - getSignIndex(firstLongitude) + 12) % 12
  );
}

export function getAspectTypeFromSigns(
  firstLongitude: number,
  secondLongitude: number
): AspectType | undefined {
  return SIGN_DISTANCE_TO_ASPECT[getSignDistance(firstLongitude, secondLongitude)];
}

export function getAspectOrbFromLongitudes(
  firstLongitude: number,
  secondLongitude: number,
  aspectAngle: number
): number {
  return Math.abs(
    getAbsoluteAngularDistance(firstLongitude, secondLongitude) - aspectAngle
  );
}

export function getTraditionalAspectOrbFromLongitudes(
  firstLongitude: number,
  secondLongitude: number,
  aspectType: AspectType
): number {
  if (aspectType === "conjunction") {
    return getAbsoluteAngularDistance(firstLongitude, secondLongitude);
  }

  return Math.abs(
    getDegreeInSign(firstLongitude) - getDegreeInSign(secondLongitude)
  );
}

function isOuterPlanetOrNode(planetType?: PlanetType): boolean {
  if (!planetType) {
    return false;
  }

  return OUTER_PLANETS.has(planetType) || NODES.has(planetType);
}

function participantSupportsAspect(
  participant: TraditionalAspectParticipant,
  aspectType: AspectType
): boolean {
  if (participant.elementType === "fixedStar") {
    return aspectType === "conjunction";
  }

  if (participant.isAntiscion) {
    return aspectType === "conjunction" || aspectType === "opposition";
  }

  if (
    participant.elementType === "planet" &&
    isOuterPlanetOrNode(participant.planetType)
  ) {
    return aspectType === "conjunction" || aspectType === "opposition";
  }

  return true;
}

export function getTraditionalAspectMaxOrb(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant,
  aspectType: AspectType
): number {
  const firstMoiety =
    firstParticipant.elementType === "planet" && firstParticipant.planetType
      ? PLANET_MOIETIES[firstParticipant.planetType]
      : undefined;
  const secondMoiety =
    secondParticipant.elementType === "planet" && secondParticipant.planetType
      ? PLANET_MOIETIES[secondParticipant.planetType]
      : undefined;

  if (firstMoiety !== undefined && secondMoiety !== undefined) {
    return firstMoiety + secondMoiety;
  }

  if (
    aspectType === "conjunction" &&
    (firstParticipant.elementType === "house" ||
      secondParticipant.elementType === "house")
  ) {
    return 5;
  }

  return 3;
}

function canUseCrossSignConjunction(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant
): boolean {
  const signDistance = getSignDistance(
    firstParticipant.longitude,
    secondParticipant.longitude
  );

  return signDistance === 0 || signDistance === 1 || signDistance === 11;
}

function buildTraditionalAspectMatch(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant,
  aspectType: AspectType
): TraditionalAspectMatch | null {
  if (
    !participantSupportsAspect(firstParticipant, aspectType) ||
    !participantSupportsAspect(secondParticipant, aspectType)
  ) {
    return null;
  }

  const orbDistance = getTraditionalAspectOrbFromLongitudes(
    firstParticipant.longitude,
    secondParticipant.longitude,
    aspectType
  );
  const maxOrb = getTraditionalAspectMaxOrb(
    firstParticipant,
    secondParticipant,
    aspectType
  );

  if (orbDistance > maxOrb) {
    return null;
  }

  const aspectAngle = getAspectAngleFromType(aspectType);

  return {
    aspectType,
    aspectAngle,
    orbDistance,
    maxOrb,
    applying: isApplyingByMotion({
      firstLongitude: firstParticipant.longitude,
      firstSpeed: firstParticipant.speed ?? 0,
      secondLongitude: secondParticipant.longitude,
      secondSpeed: secondParticipant.speed ?? 0,
      aspectAngle,
    }),
  };
}

export function resolveTraditionalAspect(
  firstParticipant: TraditionalAspectParticipant,
  secondParticipant: TraditionalAspectParticipant
): TraditionalAspectMatch | null {
  const candidates: TraditionalAspectMatch[] = [];
  const signAspect = getAspectTypeFromSigns(
    firstParticipant.longitude,
    secondParticipant.longitude
  );

  if (signAspect) {
    const signMatch = buildTraditionalAspectMatch(
      firstParticipant,
      secondParticipant,
      signAspect
    );

    if (signMatch) {
      candidates.push(signMatch);
    }
  }

  if (canUseCrossSignConjunction(firstParticipant, secondParticipant)) {
    const conjunctionMatch = buildTraditionalAspectMatch(
      firstParticipant,
      secondParticipant,
      "conjunction"
    );

    if (
      conjunctionMatch &&
      !candidates.some((candidate) => candidate.aspectType === "conjunction")
    ) {
      candidates.push(conjunctionMatch);
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((firstCandidate, secondCandidate) => {
    if (firstCandidate.orbDistance !== secondCandidate.orbDistance) {
      return firstCandidate.orbDistance - secondCandidate.orbDistance;
    }

    return firstCandidate.aspectAngle - secondCandidate.aspectAngle;
  });

  return candidates[0] ?? null;
}

export function isApplyingByMotion(options: {
  firstLongitude: number;
  firstSpeed?: number;
  secondLongitude: number;
  secondSpeed?: number;
  aspectAngle: number;
  timeStep?: number;
}): boolean {
  const {
    firstLongitude,
    firstSpeed = 0,
    secondLongitude,
    secondSpeed = 0,
    aspectAngle,
    timeStep = 1,
  } = options;

  const currentOrb = getAspectOrbFromLongitudes(
    firstLongitude,
    secondLongitude,
    aspectAngle
  );

  const futureOrb = getAspectOrbFromLongitudes(
    firstLongitude + firstSpeed * timeStep,
    secondLongitude + secondSpeed * timeStep,
    aspectAngle
  );

  return futureOrb < currentOrb;
}
