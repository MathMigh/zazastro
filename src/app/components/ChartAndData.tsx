"use client";

import { BirthChart, ChatDateProps } from "@/interfaces/BirthChartInterfaces";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import AspectsTable from "./aspect-table/AspectsTable";
import AstroChart from "./charts/AstroChart";
import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import ArabicPartsLayout from "./ArabicPartsLayout";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { ChartDate } from "./ChartDate";
import ChartSelectorArrows from "./ChartSelectorArrows";
import Container from "./Container";
import { SkeletonLine, SkeletonTable } from "./skeletons";
import {
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  SKELETON_LOADER_TIME,
} from "../utils/constants";
import Spinner from "./Spinner";
import ChartPositionsSummary from "./ChartPositionsSummary";
import FixedStarsTable from "./fixed-stars-table/FixedStarsTable";

interface Props {
  innerChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
  chartDateProps: ChatDateProps;
  outerChartDateProps?: ChatDateProps;
  title?: string;
}

export default function ChartAndData(props: Props) {
  const {
    innerChart,
    outerChart,
    arabicParts,
    outerArabicParts,
    tableItemsPerPage,
    chartDateProps,
    outerChartDateProps,
    title,
  } = props;

  const [loading, setLoading] = useState(true);
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage =
    tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;
  const {
    updateBirthChart,
    updateLunarDerivedChart,
    updateIsCombinedWithBirthChart,
    updateIsCombinedWithReturnChart,
    loadingNextChart,
    isMountingChart,
  } = useBirthChart();
  const {
    resetChartMenus,
    isReturnChart,
    isProgressionChart,
    isProfectionChart,
  } = useChartMenu();
  const {
    updateArabicParts,
    updateSinastryArabicParts,
    getPartsArray,
    updateSolarReturnParts,
    updateArchArabicParts,
  } = useArabicParts();
  const [partsArray, setPartsArray] = useState<ArabicPart[]>([]);
  const [useInnerParts, setUseInnerParts] = useState(true);
  const [nextChartContentLoaded, setNextChartContentLoaded] = useState(false);

  function updateParts() {
    if (useInnerParts && arabicParts) {
      setPartsArray(getPartsArray(arabicParts));
    } else if (outerArabicParts) {
      setPartsArray(getPartsArray(outerArabicParts));
    }

    setTimeout(() => {
      setLoading(false);
    }, SKELETON_LOADER_TIME);
  }

  useEffect(() => {
    updateParts();
  }, [useInnerParts, arabicParts, outerArabicParts]);

  function handleOnToggleInnerPartsVisualization(showInnerParts: boolean) {
    setUseInnerParts(showInnerParts);
  }

  useEffect(() => {
    setNextChartContentLoaded(!loadingNextChart);
  }, [loadingNextChart]);

  const handleReset = useCallback(() => {
    updateBirthChart({ chartType: "birth", chartData: undefined });
    updateBirthChart({ chartType: "return", chartData: undefined });
    updateBirthChart({ chartType: "sinastry", chartData: undefined });
    updateBirthChart({ chartType: "progression", chartData: undefined });
    updateBirthChart({ chartType: "profection", chartData: undefined });
    updateLunarDerivedChart(undefined);
    updateArabicParts(undefined);
    updateArchArabicParts(undefined);
    updateSinastryArabicParts(undefined);
    updateSolarReturnParts(undefined);
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    resetChartMenus();
  }, []);

  function handleOnUpdateAspectsData(newAspectData: PlanetAspectData[]) {
    setAspectsData(newAspectData);
  }

  function getTraditionalReportChart(): BirthChart | undefined {
    if (innerChart.traditionalReport) return innerChart;
    if (outerChart?.traditionalReport) return outerChart;
    return undefined;
  }

  function downloadTraditionalReport(reportChart: BirthChart) {
    const blob = new Blob([reportChart.traditionalReport ?? ""], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mapa_Natal_${chartDateProps.birthChart?.birthDate?.year ?? "MathAstro"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderChart(): JSX.Element {
    return (
      <Container className="w-full px-2! py-6! sm:px-4! lg:px-0!">
        <div className="relative flex w-full flex-col items-center justify-center md:min-w-[46rem] 2xl:min-w-[46rem] 3xl:min-w-48rem">
          {(loadingNextChart || isMountingChart) && (
            <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-white/10 px-3 opacity-0 backdrop-blur-sm animate-[fadeIn_0.2s_forwards] md:h-[108%] md:rounded-2xl md:px-0">
              <Spinner size="16" />
              <h2 className="mt-3 pl-10 text-lg font-bold">Carregando...</h2>
            </div>
          )}

          <ChartSelectorArrows className="mb-2 w-full md:px-6">
            {title && (
              <h1 className="text-center text-lg font-bold text-amber-50 md:text-2xl">
                {title}
              </h1>
            )}
          </ChartSelectorArrows>

          <div className="mb-2 flex flex-col items-center gap-2">
            <ChartDate {...chartDateProps} />
            {outerChartDateProps && <ChartDate {...outerChartDateProps} />}
          </div>

          <AstroChart
            props={{
              planets: innerChart.planets,
              housesData: innerChart.housesData,
              arabicParts,
              outerPlanets: outerChart?.planets,
              outerHouses: outerChart?.housesData,
              outerArabicParts,
              fixedStars: innerChart.fixedStars,
              onUpdateAspectsData: handleOnUpdateAspectsData,
              useReturnSelectorArrows:
                isReturnChart() || isProgressionChart() || isProfectionChart(),
            }}
          />

          <button
            type="button"
            className="default-btn mt-6 mb-2 w-full md:w-[25.5rem]"
            onClick={handleReset}
          >
            Menu Principal
          </button>
        </div>
      </Container>
    );
  }

  function renderArabicPartsAndAspectsTable(): JSX.Element | null {
    if (!arabicParts || !innerChart) {
      return null;
    }

    const arabicPartsContent =
      loading || loadingNextChart ? (
        <div className="w-full">
          <SkeletonLine width="w-1/3" className="mb-4" />
          <SkeletonTable rows={8} />
        </div>
      ) : (
        <ArabicPartsLayout
          parts={partsArray}
          showMenuButtons={true}
          showSwitchParts
          onToggleInnerPartsVisualization={handleOnToggleInnerPartsVisualization}
        />
      );

    return (
      <section className="grid w-full gap-5 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Container className="w-full px-4! py-6! sm:px-6!">
          {arabicPartsContent}
        </Container>

        <Container className="w-full px-4! py-6! sm:px-6!">
          <AspectsTable
            aspects={aspectsData}
            birthChart={innerChart}
            outerChart={outerChart}
            arabicParts={arabicParts}
            outerArabicParts={outerArabicParts}
            initialItemsPerPage={itemsPerPage}
          />
        </Container>
      </section>
    );
  }

  function renderFixedStarsTable(): JSX.Element | null {
    if (!innerChart.fixedStarMatches) {
      return null;
    }

    return (
      <Container className="w-full px-4! py-6! sm:px-6!">
        <FixedStarsTable matches={innerChart.fixedStarMatches} />
      </Container>
    );
  }

  function renderTraditionalReport(): JSX.Element | null {
    const reportChart = getTraditionalReportChart();

    if (!reportChart && !nextChartContentLoaded) {
      return (
        <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-5 py-6">
          <SkeletonLine width="w-1/3" className="mb-4" />
          <SkeletonTable rows={12} cols={1} />
        </div>
      );
    }

    if (!reportChart?.traditionalReport) {
      return null;
    }

    return (
      <section className="w-full overflow-hidden rounded-[1.75rem] traditional-report-shell">
        <div className="flex flex-col gap-4 border-b border-slate-400/15 px-5 pb-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="section-eyebrow text-[0.62rem]!">
              MathAstro
            </span>
            <h2 className="section-title text-2xl font-semibold text-slate-900">
              Relatório Tradicional
            </h2>
            <p className="text-sm text-slate-600">
              Leitura corrida, mais clara e posicionada no fim da página.
            </p>
          </div>

          <button
            type="button"
            onClick={() => downloadTraditionalReport(reportChart)}
            className="rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-900 transition-colors hover:bg-white"
          >
            Baixar .txt
          </button>
        </div>

        <pre className="traditional-report-text max-h-[70vh] overflow-x-auto whitespace-pre-wrap px-5 pb-5 pt-4 font-mono text-[0.8rem] leading-7 md:text-[0.92rem]">
          {reportChart.traditionalReport}
        </pre>
      </section>
    );
  }

  return (
    <div className="mt-1 mb-8 flex w-[95%] flex-col gap-6 md:w-full">
      {renderChart()}
      <ChartPositionsSummary chart={innerChart} />
      {renderFixedStarsTable()}
      {renderArabicPartsAndAspectsTable()}
      {renderTraditionalReport()}
    </div>
  );
}
