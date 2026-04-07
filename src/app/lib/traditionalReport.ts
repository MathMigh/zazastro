import { 
  formatDegrees, getSect, getHouseIndex, getAlmuten, 
  calculateArabicParts, getFixedStarConjunctions, 
  getAspects, getEssentialDignities 
} from "./traditionalCalculations";
import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import { SIGNS, FIXED_STARS, PRECESSION_RATE } from "./traditionalTables";

export function generateTraditionalReport(chart: BirthChart): string {
  const sect = getSect(
    chart.planets.find(p => p.type === "sun")!.longitudeRaw, 
    chart.housesData.ascendant, 
    chart.housesData.house
  );
  
  const planets = chart.planets;
  const sun = planets.find(p => p.type === "sun")!;
  const moon = planets.find(p => p.type === "moon")!;
  const merc = planets.find(p => p.type === "mercury")!;
  const ven = planets.find(p => p.type === "venus")!;
  const mars = planets.find(p => p.type === "mars")!;
  const jup = planets.find(p => p.type === "jupiter")!;
  const sat = planets.find(p => p.type === "saturn")!;
  
  const asc = chart.housesData.ascendant;
  const mc = chart.housesData.mc;
  const desc = (asc + 180) % 360;
  const ic = (mc + 180) % 360;

  let report = `MAPA TRADICIONAL OCIDENTAL:\n\n`;
  report += `Ascendente em ${formatDegrees(asc)} (Lento).\n`;
  report += `Descendente em ${formatDegrees(desc)} (Lento).\n`;
  report += `Meio do Céu (MC) em ${formatDegrees(mc)} (Lento).\n`;
  report += `Fundo do Céu (IC) em ${formatDegrees(ic)} (Lento).\n\n`;

  const tradPlanets = [sun, moon, merc, ven, mars, jup, sat];
  tradPlanets.forEach(p => {
    const hIdx = getHouseIndex(p.longitudeRaw, chart.housesData.house);
    report += `${p.name} em ${formatDegrees(p.longitudeRaw)}, na Casa ${romanize(hIdx)} (${p.isRetrograde ? "Retrógrado" : "Movimento Direto"}).\n`;
  });

  report += `\n`;
  const outer = planets.filter(p => ["uranus", "neptune", "pluto"].includes(p.type));
  outer.forEach(p => {
    const hIdx = getHouseIndex(p.longitudeRaw, chart.housesData.house);
    report += `${p.name} em ${formatDegrees(p.longitudeRaw)} na Casa ${romanize(hIdx)} (${p.isRetrograde ? "Retrógrado" : "Movimento Direto"}) (Só considerado como Estrela Fixa na Astrologia Tradicional).\n`;
  });

  report += `\n`;
  const nodes = planets.filter(p => ["northNode", "southNode"].includes(p.type));
  nodes.forEach(p => {
    const hIdx = getHouseIndex(p.longitudeRaw, chart.housesData.house);
    report += `${p.name} em ${formatDegrees(p.longitudeRaw)}, na Casa ${romanize(hIdx)} (Retrógrado).\n`;
  });

  report += `--------------------------------------------------------------------\n`;
  report += `Secto: ${sect}.\n`;
  report += `--------------------------------------------------------------------\n`;
  report += `Temperamento: (Processando...)\n`; // Simplified for now
  report += `--------------------------------------------------------------------\n`;
  report += `Mentalidade: (Desejado...)\n`;
  report += `--------------------------------------------------------------------\n`;
  
  report += `CÚSPIDES DAS CASAS:\n\n`;
  chart.housesData.house.forEach((cuspLon, idx) => {
    const hNum = idx + 1;
    const almuten = getAlmuten(cuspLon, sect);
    const antiscionLon = (540 - cuspLon) % 360;
    report += `Casa ${hNum} em ${formatDegrees(cuspLon)}, almuten ${almuten}. (antiscion: ${formatDegrees(antiscionLon)}).\n`;
  });

  report += `--------------------------------------------------------------------\n`;
  report += `PARTES ÁRABES:\n\n`;
  const parts = calculateArabicParts(chart, sect);
  parts.forEach(p => {
    report += `Parte d${p.name.endsWith('o') || p.name === 'Valor' || p.name === 'Espírito' ? 'o' : 'a'} ${p.name} em ${p.posFormatted} na ${p.house}. (Dispositor: ${p.dispositor}). Antiscion: ${p.antiscion}.\n`;
  });

  report += `--------------------------------------------------------------------\n`;
  report += `ANTÍSCIOS:\n\n`;
  // List antiscia and check fixed star contact
  planets.concat(parts.map(p => ({ 
    name: p.name, 
    longitudeRaw: p.longitude 
  } as any))).forEach(p => {
    const antLon = (540 - p.longitudeRaw) % 360;
    const contraStr = formatDegrees((antLon + 180) % 360);
    report += `${p.name} — antiscion: ${formatDegrees(antLon)} · contrantiscion: ${contraStr}.\n`;
  });

  report += `--------------------------------------------------------------------\n`;
  report += `ESTRELAS FIXAS:\n\n`;
  // Check angles and planets
  const starCheckList = [
    { name: "ASC", lon: asc },
    { name: "MC", lon: mc },
    sun, moon, merc, ven, mars, jup, sat
  ];
  starCheckList.forEach(item => {
    const name = (item as any).name;
    const lon = (item as any).longitudeRaw !== undefined ? (item as any).longitudeRaw : (item as any).lon;
    const stars = getFixedStarConjunctions(lon, chart.birthDate.year);
    if (stars.length > 0) {
      report += `${name} em ${formatDegrees(lon)}: ${stars.join("; ")};\n`;
    }
  });

  report += `--------------------------------------------------------------------\n`;
  report += `ASPECTOS ENTRE PLANETAS:\n\n`;
  const aspList = getAspects(chart);
  aspList.forEach(a => {
    report += a + "\n";
  });

  report += `-------------------------------------------------------------------\n`;
  report += `DIGNIDADES E DEBILIDADES ESSENCIAIS:\n\n`;
  tradPlanets.forEach(p => {
    report += getEssentialDignities(p.longitudeRaw, p.name, sect) + "\n";
  });

  report += `--------------------------------------------------------------------\n`;
  report += `DISPOSITORES:\n\n`;
  // Simple chain report
  tradPlanets.forEach(p => {
    const currentSignIdx = Math.floor(p.longitudeRaw / 30) % 12;
    const ruler = DOMICILE_RULER[currentSignIdx];
    report += `${p.name} em ${SIGNS[currentSignIdx]} → Dispositor: ${ruler}.\n`;
  });
  
  report += `--------------------------------------------------------------------\n`;

  return report;
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

const DOMICILE_RULER: string[] = ["Marte","Vênus","Mercúrio","Lua","Sol","Mercúrio","Vênus","Marte","Júpiter","Saturno","Saturno","Júpiter"];
