import { NextResponse } from "next/server";
import { calculateReturnChartData } from "@/app/lib/returnEngine";
import { BirthDate, ReturnChartType } from "@/interfaces/BirthChartInterfaces";

const VALID_RETURN_TYPES: ReturnChartType[] = ["solar", "lunar"];

function hasValidCoordinates(date?: BirthDate) {
  const latitude = Number(date?.coordinates?.latitude);
  const longitude = Number(date?.coordinates?.longitude);

  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await context.params;
    const returnType = type as ReturnChartType;

    if (!VALID_RETURN_TYPES.includes(returnType)) {
      return NextResponse.json(
        { erro: "Tipo de retorno invalido. Use 'solar' ou 'lunar'." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const birthDate = body?.birthDate as BirthDate | undefined;
    const targetDate = body?.targetDate as BirthDate | undefined;

    if (!birthDate || !targetDate) {
      return NextResponse.json(
        { erro: "Faltando payload com 'birthDate' e 'targetDate'." },
        { status: 400 }
      );
    }

    if (!hasValidCoordinates(birthDate)) {
      return NextResponse.json(
        { erro: "Selecione uma cidade valida na lista antes de gerar o retorno." },
        { status: 400 }
      );
    }

    const data = await calculateReturnChartData(birthDate, targetDate, returnType);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro interno ao calcular o retorno:", error);
    return NextResponse.json(
      {
        erro:
          "Erro ao calcular o retorno: " +
          (error?.message || "Erro desconhecido"),
      },
      { status: 500 }
    );
  }
}
