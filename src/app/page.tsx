"use client";

import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import BirthChart from "./components/charts/BirthChart";
import { AspectsContextProvider } from "@/contexts/AspectsContext";
import { ChartMenuContextProvider } from "@/contexts/ChartMenuContext";
import { ProfilesContextProvider } from "@/contexts/ProfilesContext";
import { ScreenDimensionsContextProvider } from "@/contexts/ScreenDimensionsContext";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-amber-300/8 blur-3xl" />
        <div className="absolute left-[8%] top-[18%] h-3 w-3 rounded-full bg-amber-200/60 shadow-[0_0_35px_rgba(245,214,149,0.6)]" />
        <div className="absolute right-[12%] top-[12%] h-2 w-2 rounded-full bg-white/60 shadow-[0_0_28px_rgba(255,255,255,0.55)]" />
        <div className="absolute left-[16%] top-[64%] h-2 w-2 rounded-full bg-white/45 shadow-[0_0_24px_rgba(255,255,255,0.4)]" />
        <div className="absolute right-[18%] top-[58%] h-3 w-3 rounded-full bg-amber-200/40 shadow-[0_0_28px_rgba(245,214,149,0.5)]" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 pb-8 pt-8 md:px-8">
        <div className="w-full max-w-6xl">
          <header className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <h1 className="section-title text-4xl font-semibold tracking-[0.08em] text-amber-100 sm:text-5xl md:text-6xl">
              Math, o Mágico
            </h1>
            <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.38em] text-amber-200/80">
              Astrologia Tradicional Ocidental
            </p>
            <p className="section-copy mt-5 max-w-3xl text-sm md:text-base">
              Mapas natais com Swiss Ephemeris, leitura tradicional mais clara
              e uma interface mais elegante para consulta longa, sem ruído
              visual.
            </p>

          </header>

          <ProfilesContextProvider>
            <ChartMenuContextProvider>
              <BirthChartContextProvider>
                <ArabicPartsContextProvider>
                  <AspectsContextProvider>
                    <ScreenDimensionsContextProvider>
                      <BirthChart />
                    </ScreenDimensionsContextProvider>
                  </AspectsContextProvider>
                </ArabicPartsContextProvider>
              </BirthChartContextProvider>
            </ChartMenuContextProvider>
          </ProfilesContextProvider>
        </div>

        <Footer />
      </main>
    </div>
  );
}
