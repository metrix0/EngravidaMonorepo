// apps/insights/src/app/api/debug/env/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    return NextResponse.json({
        ok: true,
        vercelEnv: process.env.VERCEL_ENV ?? null,
        nodeEnv: process.env.NODE_ENV ?? null,

        hasGoogleServiceAccountJson: Boolean(raw),
        length: raw?.length ?? 0,

        firstChar: raw?.trim()?.[0] ?? null,
        lastChar: raw?.trim()?.at(-1) ?? null,

        startsWithBrace: raw?.trim()?.startsWith("{") ?? false,
        startsWithSingleQuote: raw?.trim()?.startsWith("'") ?? false,

        googleLikeKeys: Object.keys(process.env).filter((key) =>
            key.toLowerCase().includes("google")
        ),
    });
}