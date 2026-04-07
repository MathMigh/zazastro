import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { generateTraditionalReport } from "@/app/lib/traditionalReport";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !body.birthDate) {
      return NextResponse.json(
        { erro: "Faltando payload 'birthDate' na requisição." },
        { status: 400 }
      );
    }

    const chartData = await calculateBirthChart(body.birthDate);
    const traditionalReport = generateTraditionalReport(chartData);
    
    return NextResponse.json({
      ...chartData,
      traditionalReport
    });
  } catch (error: any) {
    console.error("Erro interno ao calcular o mapa:", error);
    return NextResponse.json(
      { erro: "Erro ao calcular o mapa: " + (error?.message || "Erro desconhecido") },
      { status: 500 }
    );
  }
}
