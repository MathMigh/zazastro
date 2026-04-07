const CIRCLE_MIN = 21600;

function toTotal(signo, grau, minuto) {
  return (signo * 1800) + (grau * 60) + minuto;
}

function decimalToAbsoluteMin(decimalLon) {
  const s = Math.floor(decimalLon / 30);
  const g = Math.floor(decimalLon % 30);
  const m = Math.round((decimalLon - (s * 30 + g)) * 60);
  return toTotal(s, g, m);
}

function normalize(total) {
  let result = total;
  if (result < 0) result += CIRCLE_MIN;
  if (result >= CIRCLE_MIN) result -= CIRCLE_MIN;
  return result;
}

function calcPart(ascTotal, bTotal, cTotal) {
  return normalize(ascTotal + bTotal - cTotal);
}

function fromTotal(total) {
  const signo = Math.floor(total / 1800);
  const grau = Math.floor((total - (signo * 1800)) / 60);
  const minuto = total - (signo * 1800) - (grau * 60);
  return { signo, grau, minuto };
}

function formatSafe(totalStr) {
  const { signo, grau, minuto } = fromTotal(totalStr);
  const signs = ["♈︎","♉︎","♊︎","♋︎","♌︎","♍︎","♎︎","♏︎","♐︎","♑︎","♒︎","♓︎"];
  return `${grau}° ${minuto}' ${signs[signo]}`;
}

// April 21, 2001, 06:45 AM, Barra Mansa, RJ
// Approximate True Node or Swisseph coordinates (J2000 roughly):
const planets = {
  asc: 39.8, // Taurus
  sun: 31.05, // Taurus
  moon: 14.5, // Aries
  venus: 9.5, // Aries
  mars: 255.5, // Sagittarius
  jupiter: 72.8, // Gemini
  saturn: 58.0 // Taurus
};

console.log("Asc: ", formatSafe(decimalToAbsoluteMin(planets.asc)));
console.log("Sun: ", formatSafe(decimalToAbsoluteMin(planets.sun)));
console.log("Moon: ", formatSafe(decimalToAbsoluteMin(planets.moon)));

const ascMin = decimalToAbsoluteMin(planets.asc);
const sunMin = decimalToAbsoluteMin(planets.sun);
const moonMin = decimalToAbsoluteMin(planets.moon);
const venusMin = decimalToAbsoluteMin(planets.venus);
const marsMin = decimalToAbsoluteMin(planets.mars);
const jupiterMin = decimalToAbsoluteMin(planets.jupiter);
const saturnMin = decimalToAbsoluteMin(planets.saturn);

const fortuna = calcPart(ascMin, moonMin, sunMin);
console.log("Fortuna (Asc+Moon-Sun):", formatSafe(fortuna));

const espirito = calcPart(ascMin, sunMin, moonMin);
console.log("Espirito (Asc+Sun-Moon):", formatSafe(espirito));

const necessidade = calcPart(ascMin, saturnMin, marsMin);
console.log("Necessidade (Asc+Saturn-Mars):", formatSafe(necessidade));

const amor = calcPart(ascMin, venusMin, sunMin);
console.log("Amor (Asc+Venus-Sun):", formatSafe(amor));

const valor = calcPart(ascMin, marsMin, sunMin);
console.log("Valor (Asc+Mars-Sun):", formatSafe(valor));

const vitoria = calcPart(ascMin, jupiterMin, sunMin);
console.log("Vitoria (Asc+Jupiter-Sun):", formatSafe(vitoria));

const cativeiro = calcPart(ascMin, fortuna, saturnMin);
console.log("Cativeiro (Asc+Fortuna-Saturn):", formatSafe(cativeiro));

