import { NextResponse } from "next/server";
import { supabase } from "@engravida/lib";

export async function GET() {
    const [
        { data: pipelines, error: pipelinesError },
        { data: stages, error: stagesError },
        { data: clients, error: clientsError },
    ] = await Promise.all([
        supabase
            .from("pipelines")
            .select("id, name, active, created_at, updated_at")
            .eq("active", true)
            .order("created_at", { ascending: true }),

        supabase
            .from("pipeline_stages")
            .select("id, pipeline_id, name, position, color, created_at, updated_at")
            .order("position", { ascending: true }),

        supabase
            .from("clients")
            .select(
                `
                id,
                name,
                phone,
                email,
                external_contact_id,
                first_seen_at,
                last_interaction_at,
                pipeline_stage_id,
                utm_source,
                utm_medium,
                utm_campaign,
                state,
                country,
                created_at,
                updated_at
                `
            )
            .not("pipeline_stage_id", "is", null)
            .order("last_interaction_at", { ascending: false }),
    ]);

    if (pipelinesError || stagesError || clientsError) {
        return NextResponse.json(
            {
                error: "Failed to load pipeline data",
                details: {
                    pipelinesError,
                    stagesError,
                    clientsError,
                },
            },
            { status: 500 }
        );
    }

    return NextResponse.json({
        pipelines: pipelines ?? [],
        stages: stages ?? [],
        clients: clients ?? [],
    });
}