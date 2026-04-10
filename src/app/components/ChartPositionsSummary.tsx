"use client";

import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { getPlanetImage } from "../utils/chartUtils";

const HOUSE_LABELS = [
  "Casa 1 (AC)",
  "Casa 2",
  "Casa 3",
  "Casa 4 (IC)",
  "Casa 5",
  "Casa 6",
  "Casa 7 (DC)",
  "Casa 8",
  "Casa 9",
  "Casa 10 (MC)",
  "Casa 11",
  "Casa 12",
];

export default function ChartPositionsSummary({
  chart,
}: {
  chart: BirthChart;
}) {
  return (
    <section className="grid w-full gap-5 xl:grid-cols-2">
      <SummaryCard title="Planetas">
        {chart.planets.map((planet) => (
          <SummaryRow
            key={planet.type}
            label={planet.name}
            icon={getPlanetImage(planet.type, {
              size: 18,
              isRetrograde: planet.isRetrograde,
            })}
            position={renderLongitude(planet.longitudeRaw)}
            antiscion={renderLongitude(planet.antiscionRaw)}
          />
        ))}
      </SummaryCard>

      <SummaryCard title="Casas">
        {chart.housesData.house.map((houseLongitude, index) => (
          <SummaryRow
            key={HOUSE_LABELS[index]}
            label={HOUSE_LABELS[index]}
            position={renderLongitude(houseLongitude)}
            antiscion={renderLongitude((540 - houseLongitude) % 360)}
            highlight={index % 3 === 0}
          />
        ))}
      </SummaryCard>
    </section>
  );
}

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

const SIGN_COLORS = [
  "red",
  "green",
  "orange",
  "blue",
  "red",
  "green",
  "orange",
  "blue",
  "red",
  "green",
  "orange",
  "blue",
];

function renderLongitude(longitude: number) {
  const totalMinutes = ((Math.round(longitude * 60) % 21600) + 21600) % 21600;
  const signIndex = Math.floor(totalMinutes / 1800) % 12;
  const remainingMinutes = totalMinutes - signIndex * 1800;
  const degree = Math.floor(remainingMinutes / 60);
  const minute = remainingMinutes % 60;

  return (
    <>
      <span>{degree}° {minute.toString().padStart(2, "0")}' </span>
      <span style={{ color: SIGN_COLORS[signIndex] }}>
        {SIGN_GLYPHS[signIndex]}
      </span>
    </>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,238,228,0.98))] text-slate-900 shadow-[0_26px_70px_rgba(0,0,0,0.22)]">
      <div className="border-b border-slate-200/80 px-6 pb-4 pt-5">
        <h2 className="font-[var(--font-geist-mono)] text-2xl font-semibold text-slate-900">
          {title}:
        </h2>
      </div>

      <div className="space-y-3 px-6 py-5">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  icon,
  position,
  antiscion,
  highlight = false,
}: {
  label: string;
  icon?: React.ReactNode;
  position: React.ReactNode;
  antiscion: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-2 border-b border-slate-200/80 pb-3 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex items-center gap-3">
        {icon && <span className="flex h-5 w-5 items-center justify-center">{icon}</span>}
        <span className={`text-sm md:text-base ${highlight ? "font-semibold" : "font-medium"}`}>
          {label}
        </span>
      </div>

      <div className="text-sm md:text-base">
        <span className="font-semibold text-slate-700">Posição:</span>{" "}
        <span className="font-medium">{position}</span>
      </div>

      <div className="text-sm md:text-base">
        <span className="font-semibold text-slate-700">Antiscion:</span>{" "}
        <span className="font-medium">{antiscion}</span>
      </div>
    </div>
  );
}
