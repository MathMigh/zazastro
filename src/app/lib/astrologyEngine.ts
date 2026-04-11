import { SwissEphemeris } from "@swisseph/browser";
import { BirthChart, BirthDate, Planet, HousesData, PlanetType } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import {
  decorateChartWithFixedStars,
  getDecimalYearFromDate,
} from "./fixedStars";

let swe: SwissEphemeris | null = null;
let sweInitPromise: Promise<SwissEphemeris> | null = null;

interface CoordinatesLike {
  latitude: number;
  longitude: number;
  name?: string;
}

export async function getSwe(): Promise<SwissEphemeris> {
  if (swe && sweInitPromise) {
    return sweInitPromise;
  }

  if (swe) {
    return swe;
  }

  const instance = new SwissEphemeris();
  swe = instance;
  sweInitPromise = instance
    .init("https://unpkg.com/@swisseph/browser@1.1.1/dist/swisseph.wasm")
    .then(() => instance)
    .catch((error) => {
      if (swe === instance) {
        swe = null;
      }
      sweInitPromise = null;
      throw error;
    });

  return sweInitPromise;
}

const SIGNS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

export function getSignName(lon: number): string {
  const index = Math.floor(lon / 30) % 12;
  return SIGNS[index];
}

export function computeAntiscion(lon: number): number {
  return (540 - lon) % 360;
}

function normalizeLocationText(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isWithinBox(
  latitude: number,
  longitude: number,
  bounds: {
    south: number;
    north: number;
    west: number;
    east: number;
  }
): boolean {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

function getFixedOffsetTimezoneFromLongitude(longitude: number): string {
  const offsetHours = Math.max(-12, Math.min(14, Math.round(longitude / 15)));
  if (offsetHours === 0) return "Etc/GMT";
  return offsetHours > 0
    ? `Etc/GMT-${offsetHours}`
    : `Etc/GMT+${Math.abs(offsetHours)}`;
}

export function resolveTimezone(coordinates: CoordinatesLike): string {
  const latitude = Number(coordinates.latitude);
  const longitude = Number(coordinates.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "America/Sao_Paulo";
  }

  const locationText = normalizeLocationText(coordinates.name);
  const isInBrazil =
    latitude >= -34 &&
    latitude <= 6 &&
    longitude >= -75 &&
    longitude <= -28;

  const matches = (...keywords: string[]) =>
    keywords.some((keyword) => locationText.includes(keyword));

  if (
    matches("fernando de noronha") ||
    isWithinBox(latitude, longitude, {
      south: -4.2,
      north: -3.5,
      west: -32.8,
      east: -32.1,
    })
  ) {
    return "America/Noronha";
  }

  if (
    matches(
      "acre",
      "rio branco",
      "cruzeiro do sul",
      "tarauaca",
      "sena madureira",
      "feijo",
      "brasileia",
      "epitaciolandia",
      "xapuri"
    ) ||
    isWithinBox(latitude, longitude, {
      south: -11.5,
      north: -6,
      west: -74.2,
      east: -66.5,
    })
  ) {
    return "America/Rio_Branco";
  }

  if (
    matches(
      "amazonas",
      "manaus",
      "itacoatiara",
      "tefe",
      "tabatinga",
      "parintins",
      "roraima",
      "boa vista",
      "rondonia",
      "porto velho",
      "ji-parana",
      "mato grosso",
      "cuiaba",
      "rondonopolis",
      "sinop",
      "mato grosso do sul",
      "campo grande",
      "dourados",
      "corumba"
    ) ||
    isWithinBox(latitude, longitude, {
      south: -24.7,
      north: -17,
      west: -58.5,
      east: -50.8,
    }) ||
    isWithinBox(latitude, longitude, {
      south: -18.2,
      north: -7.2,
      west: -61.8,
      east: -50.6,
    }) ||
    isWithinBox(latitude, longitude, {
      south: -13.8,
      north: -7.6,
      west: -66.9,
      east: -59.7,
    }) ||
    isWithinBox(latitude, longitude, {
      south: 0.5,
      north: 5.5,
      west: -64.9,
      east: -58.4,
    }) ||
    isWithinBox(latitude, longitude, {
      south: -9.9,
      north: 2.6,
      west: -73.9,
      east: -56.1,
    })
  ) {
    return "America/Manaus";
  }

  if (isInBrazil) {
    return "America/Sao_Paulo";
  }

  return getFixedOffsetTimezoneFromLongitude(longitude);
}

// ==========================================
// C-MODULE BYPASS FUNCTIONS
// O pacote @swisseph/browser possui bugs no Javascript transpilado "(void 0).Ascendant".
// Estamos puxando a memória C++ bruta diretamente!
// ==========================================
function safeCalculatePosition(sw: any, julianDay: number, bodyId: number, flags: number) {
  const m = sw.module;
  const xxPtr = m._malloc(6 * 8);
  const serrPtr = m._malloc(256);
  const retflag = m.ccall(
    "swe_calc_ut_wrap",
    "number",
    ["number", "number", "number", "number", "number"],
    [julianDay, bodyId, flags, xxPtr, serrPtr]
  );
  if (retflag < 0) {
    const error = m.UTF8ToString(serrPtr);
    m._free(xxPtr);
    m._free(serrPtr);
    throw new Error(error);
  }
  const xx = [];
  for (let i = 0; i < 6; i++) {
    xx[i] = m.getValue(xxPtr + i * 8, "double");
  }
  m._free(xxPtr);
  m._free(serrPtr);
  return {
    longitude: xx[0],
    latitude: xx[1],
    distance: xx[2],
    longitudeSpeed: xx[3],
    latitudeSpeed: xx[4],
    distanceSpeed: xx[5],
    flags: retflag
  };
}

function safeCalculateHouses(sw: any, julianDay: number, latitude: number, longitude: number, houseSystem: string) {
  const m = sw.module;
  const cuspsPtr = m._malloc(13 * 8); // 13 doubles
  const ascmcPtr = m._malloc(10 * 8); // 10 doubles
  const hsysCode = houseSystem.charCodeAt(0);
  m.ccall(
    "swe_houses_wrap",
    "number",
    ["number", "number", "number", "number", "number", "number"],
    [julianDay, latitude, longitude, hsysCode, cuspsPtr, ascmcPtr]
  );
  const cusps = [];
  for (let i = 0; i < 13; i++) {
    cusps[i] = m.getValue(cuspsPtr + i * 8, "double");
  }
  const ascmc = [];
  for (let i = 0; i < 10; i++) {
    ascmc[i] = m.getValue(ascmcPtr + i * 8, "double");
  }
  m._free(cuspsPtr);
  m._free(ascmcPtr);
  return {
    cusps,
    ascendant: ascmc[0], // 0 is Ascendant in C Enum
    mc: ascmc[1],
    armc: ascmc[2],
    vertex: ascmc[3],
    equatorialAscendant: ascmc[4],
    coAscendant1: ascmc[5],
    coAscendant2: ascmc[6],
    polarAscendant: ascmc[7]
  };
}
// ==========================================

function hasRetrogradeMotion(longitudeSpeed: number): boolean {
  return Number.isFinite(longitudeSpeed) && longitudeSpeed < -1e-6;
}


export async function calculateBirthChart(birthDate: BirthDate): Promise<BirthChart> {
  const sw = await getSwe();
  
  // Tratamento seguro de datas faltantes ou diferentes do frontend:
  let year, month, day, time;
  
  if (typeof birthDate === 'string') {
    // Caso a API envie como string ISO
    const d = new Date(birthDate);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
      time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  } else if (birthDate && typeof birthDate === 'object') {
    year = birthDate.year;
    month = birthDate.month;
    day = birthDate.day;
    time = birthDate.time;
  }
  
  if (!year || !month || !day || !time) {
     const d = new Date();
     year = d.getFullYear();
     month = d.getMonth() + 1;
     day = d.getDate();
     time = "12:00"; 
  }

  const coordinates = (birthDate && (birthDate as any).coordinates)
    ? (birthDate as any).coordinates
    : undefined;

  if (
    !coordinates ||
    !Number.isFinite(Number(coordinates.latitude)) ||
    !Number.isFinite(Number(coordinates.longitude))
  ) {
    throw new Error("Selecione uma cidade válida na lista antes de gerar o mapa.");
  }

  // O frontend MathAstro envia 'time' convertido pra hora decimal (Ex: 06:45 = "6.75")!
  let decimalTime = 12;
  if (typeof time === 'string' && time.includes(':')) {
     const parts = time.split(":");
     decimalTime = (Number(parts[0]) || 0) + (Number(parts[1]) || 0) / 60;
  } else if (time !== undefined && time !== null) {
     decimalTime = Number(time) || 12;
  }
  
  let hh = Math.floor(decimalTime);
  let mm = Math.round((decimalTime - hh) * 60);

  if (mm === 60) {
    hh += 1;
    mm = 0;
  }

  let uYear: number, uMonth: number, uDate: number, uHour: number;

  // === DETECÇÃO DE TIMEZONE DINÂMICO ===
  // Resolve o fuso horário correto baseado nas coordenadas (Foco Brasil)
  /* const determineTimezone = (lat: number, lon: number): string => {
    // Lógica simplificada de fusos brasileiros baseada em longitudes (meridianos)
    return resolveTimezone({
    if (lon > -45) return "America/Sao_Paulo";        // UTC-3 (Brasília/SP/RJ)
    if (lon > -67.5) return "America/Manaus";         // UTC-4 (AM/MT/MS/RO/RR)
    return "America/Rio_Branco";                      // UTC-5 (AC/AM-Oeste)
  }; */

  const determineTimezone = (lat: number, lon: number): string => {
    return resolveTimezone({
      latitude: lat,
      longitude: lon,
      name: (coordinates as CoordinatesLike).name,
    });
  };

  const zone = determineTimezone(coordinates.latitude, coordinates.longitude);
  
  // Usamos moment-timezone para converter hora local da cidade em UTC real
  // Isso lida automaticamente com Horário de Verão (DST) histórico da região!
  const m = moment.tz(
    `${year}-${month}-${day} ${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`, 
    "YYYY-M-D HH:mm", 
    zone
  );

  const dateObj = m.toDate();
  
  if (isNaN(dateObj.getTime())) { 
     console.error("FALHA AO PARSEAR DATA COM MOMENT:", birthDate, "Zone:", zone);
     // Fallback de segurança se falhar
     const failDate = new Date();
     uYear = failDate.getUTCFullYear(); uMonth = failDate.getUTCMonth() + 1; uDate = failDate.getUTCDate(); uHour = failDate.getUTCHours();
  } else {
     uYear = dateObj.getUTCFullYear();
     uMonth = dateObj.getUTCMonth() + 1;
     uDate = dateObj.getUTCDate();
     uHour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600;
  }


  // 1 = Calendário Gregoriano e passamos expresso pra evitar bug (void 0).Gregorian da lib
  const jd = sw.julianDay(uYear, uMonth, uDate, uHour, 1);
  
  const planetMapping: { type: PlanetType; swId: number; name: string }[] = [
    { type: "sun", swId: 0, name: "Sol" },
    { type: "moon", swId: 1, name: "Lua" },
    { type: "mercury", swId: 2, name: "Mercúrio" },
    { type: "venus", swId: 3, name: "Vênus" },
    { type: "mars", swId: 4, name: "Marte" },
    { type: "jupiter", swId: 5, name: "Júpiter" },
    { type: "saturn", swId: 6, name: "Saturno" },
    { type: "uranus", swId: 7, name: "Urano" },
    { type: "neptune", swId: 8, name: "Netuno" },
    { type: "pluto", swId: 9, name: "Plutão" },
    { type: "northNode", swId: 10, name: "Nodo Norte" }
  ];

  const planets: Planet[] = [];
  let idCounter = 0;

  for (const p of planetMapping) {
    // 258 = SwissEphemeris | Speed flag
    const pos = safeCalculatePosition(sw, jd, p.swId, 258);
    const isRet = hasRetrogradeMotion(pos.longitudeSpeed);
    
    planets.push({
      id: idCounter++,
      type: p.type,
      name: p.name,
      longitude: pos.longitude,
      longitudeRaw: pos.longitude,
      longitudeSpeed: pos.longitudeSpeed,
      sign: getSignName(pos.longitude),
      antiscion: computeAntiscion(pos.longitude),
      antiscionRaw: computeAntiscion(pos.longitude),
      isRetrograde: isRet,
    });
  }

  // South Node calculation (reflex of north node)
  const northNode = planets.find((p) => p.type === "northNode")!;
  const southNodeLon = (northNode.longitudeRaw + 180) % 360;
  planets.push({
    id: idCounter++,
    type: "southNode",
    name: "Nodo Sul",
    longitude: southNodeLon,
    longitudeRaw: southNodeLon,
    longitudeSpeed: northNode.longitudeSpeed,
    sign: getSignName(southNodeLon),
    antiscion: computeAntiscion(southNodeLon),
    antiscionRaw: computeAntiscion(southNodeLon),
    isRetrograde: northNode.isRetrograde,
  });

  const housesCalc = safeCalculateHouses(sw, jd, coordinates.latitude, coordinates.longitude, "R");
  
  // Custom logic usually drops index 0 since cusps are 1-indexed in C
  const rawCusps = housesCalc.cusps.slice(1, 13);
  
  const housesData: HousesData = {
    house: rawCusps,
    housesWithSigns: rawCusps.map((h: number) => getSignName(h)),
    ascendant: housesCalc.ascendant,
    mc: housesCalc.mc,
    armc: housesCalc.armc,
    vertex: housesCalc.vertex,
    equatorialAscendant: housesCalc.equatorialAscendant,
    kochCoAscendant: housesCalc.coAscendant1,
    munkaseyCoAscendant: housesCalc.coAscendant1,
    munkaseyPolarAscendant: housesCalc.polarAscendant,
  };

  const chart: BirthChart = {
    planets,
    housesData,
    birthDate: {
      year, month, day, time, coordinates
    },
    fixedStars: [],
  };

  return decorateChartWithFixedStars(chart, getDecimalYearFromDate(dateObj));
}
