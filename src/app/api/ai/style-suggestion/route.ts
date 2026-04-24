import { NextResponse } from "next/server";
import { z } from "zod";
import { generateStyleSuggestion } from "@/lib/ai";

const schema = z.object({
  hairType:       z.enum(["STRAIGHT", "WAVY", "CURLY", "COILY"]),
  skinTone:       z.enum(["LIGHT", "MEDIUM", "OLIVE", "DARK"]),
  faceShape:      z.enum(["OVAL", "ROUND", "SQUARE", "HEART", "DIAMOND"]),
  preferredStyle: z.enum(["ELEGANT", "URBAN", "EXECUTIVE", "CASUAL", "AVANT_GARDE"]),
  age:            z.number().int().min(16).max(100),
  serviceHistory: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos incompletos", detail: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const suggestion = generateStyleSuggestion(parsed.data);
    return NextResponse.json(suggestion);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
