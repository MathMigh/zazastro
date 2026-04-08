import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { generateTraditionalReport } from "@/app/lib/traditionalReport";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.birthDate) {
      return NextResponse.json(
        { erro: "Faltando payload 'birthDate' na requisicao." },
        { status: 400 }
      );
    }

    const latitude = Number(body.birthDate?.coordinates?.latitude);
    const longitude = Number(body.birthDate?.coordinates?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { erro: "Selecione uma cidade valida na lista antes de gerar o mapa." },
        { status: 400 }
      );
    }

    const chartData = await calculateBirthChart(body.birthDate);
    const traditionalReport = generateTraditionalReport(chartData);

    return NextResponse.json({
      ...chartData,
      traditionalReport,
    });
  } catch (error: any) {
    console.error("Erro interno ao calcular o mapa:", error);
    return NextResponse.json(
      { erro: "Erro ao calcular o mapa: " + (error?.message || "Erro desconhecido") },
      { status: 500 }
    );
  }
}
