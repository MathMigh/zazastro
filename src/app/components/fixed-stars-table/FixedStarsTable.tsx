"use client";

import React from "react";
import Image from "next/image";
import {
  FixedStarMatch,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { getPlanetImage } from "@/app/utils/chartUtils";

interface Props {
  matches?: FixedStarMatch[];
}

function getPointLabel(match: FixedStarMatch) {
  if (!match.pointPlanetType) {
    return <span className="font-semibold tracking-[0.08em]">{match.pointName}</span>;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {getPlanetImage(match.pointPlanetType as PlanetType, { size: 18 })}
      <span>{match.pointName}</span>
    </div>
  );
}

function getStarTone(match: FixedStarMatch) {
  if (match.note && match.nature) {
    return `${match.nature} - ${match.note}`;
  }

  return match.nature ?? match.note ?? "-";
}

export default function FixedStarsTable({ matches = [] }: Props) {
  return (
    <section className="w-full">
      <div className="mb-3 flex w-full items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow text-[0.62rem]!">Leitura Visual</p>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">
            Estrelas Fixas
          </h2>
        </div>

        <div className="rounded-full border border-amber-200 bg-white px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm">
          Orbe 2°
        </div>
      </div>

      <table className="flex w-full flex-col overflow-hidden rounded-[1.6rem] border border-amber-200 bg-[#fffdfa] text-center text-[0.75rem] text-slate-800 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:text-sm">
        <thead className="bg-[linear-gradient(180deg,#fffaf0_0%,#f6ead5_100%)]">
          <tr className="flex flex-row justify-between border-b border-amber-200 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-700 md:text-[0.76rem]">
            <th className="w-3/4 border-r border-amber-200 px-2 py-3 text-center">
              Elemento
            </th>
            <th className="w-full border-r border-amber-200 px-2 py-3 text-center">
              Estrela
            </th>
            <th className="w-full border-r border-amber-200 px-2 py-3 text-center">
              Posicao
            </th>
            <th className="w-2/3 border-r border-amber-200 px-2 py-3 text-center">
              Orbe
            </th>
            <th className="w-full px-2 py-3 text-center">Natureza</th>
          </tr>
        </thead>

        {matches.length > 0 && (
          <tbody className="flex flex-col bg-white">
            {matches.map((match) => (
              <tr
                className="flex flex-row border-t border-amber-100 even:bg-amber-50/30"
                key={match.key}
              >
                <td className="flex min-h-[2.9rem] w-3/4 items-center justify-center border-r border-amber-200 px-2 py-2 text-slate-800">
                  {getPointLabel(match)}
                </td>
                <td className="flex min-h-[2.9rem] w-full items-center justify-center border-r border-amber-200 px-3 py-2 text-left text-slate-800">
                  <div className="flex items-center gap-2">
                    <Image
                      alt="fixed-star"
                      src={match.isRelevant ? "/table-relevant-star.png" : "/star.png"}
                      width={11}
                      height={11}
                    />
                    <span
                      className={
                        match.isRelevant ? "font-semibold text-[#4015fa]" : "font-medium"
                      }
                    >
                      {match.starName}
                    </span>
                  </div>
                </td>
                <td className="flex min-h-[2.9rem] w-full items-center justify-center border-r border-amber-200 px-2 py-2 text-slate-800">
                  {match.starLongitudeLabel}
                </td>
                <td className="flex min-h-[2.9rem] w-2/3 items-center justify-center border-r border-amber-200 px-2 py-2 font-semibold text-slate-800">
                  {match.orbLabel}
                </td>
                <td className="flex min-h-[2.9rem] w-full items-center justify-center px-3 py-2 text-xs leading-5 text-slate-700 md:text-[0.78rem]">
                  {getStarTone(match)}
                </td>
              </tr>
            ))}
          </tbody>
        )}

        {matches.length === 0 && (
          <tbody className="flex flex-col bg-white">
            <tr className="flex flex-row border-t border-amber-100">
              <td className="w-full px-4 py-6 text-slate-700">
                Nenhuma estrela fixa ficou dentro da orbe configurada para este mapa.
              </td>
            </tr>
          </tbody>
        )}

        <tfoot className="flex items-center justify-between border-t border-amber-200 bg-[#f9f2e6] px-4 py-3 text-sm font-semibold text-slate-700">
          <span>Total de associacoes</span>
          <span>{matches.length}</span>
        </tfoot>
      </table>
    </section>
  );
}
