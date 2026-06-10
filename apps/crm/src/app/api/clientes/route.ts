import { NextResponse } from "next/server";
import { supabase } from "@engravida/lib";

export async function GET() {
    const [
        { data: stages, error: stagesError },
        { data: clients, error: clientsError },
    ] = await Promise.all([
        supabase
            .from("pipeline_stages")
            .select("id, pipeline_id, name, position, color")
            .order("position", { ascending: true }),

        supabase
            .from("clients")
            .select(
                `
                id,
                name,
                phone,
                email,
                pipeline_stage_id,
                first_seen_at,
                last_interaction_at,
                utm_source,
                utm_medium,
                utm_campaign,
                created_at,
                updated_at
                `
            )
            .order("last_interaction_at", { ascending: false }),
    ]);

    if (stagesError || clientsError) {
        return NextResponse.json(
            {
                error: "Failed to load clients data",
                details: {
                    stagesError,
                    clientsError,
                },
            },
            { status: 500 }
        );
    }

    return NextResponse.json({
        stages: stages ?? [],
        clients: (clients ?? []).map((client) => ({
            ...client,
            attendant_name: null,
        })),
    });
}