import { NextResponse } from "next/server";
import { supabase } from "@engravida/lib";

type Body = {
    client_id: string;
    pipeline_id: string;
    from_stage_id: string | null;
    to_stage_id: string;
    moved_by_attendant_id?: string | null;
};

export async function PATCH(request: Request) {
    try {
        const body = (await request.json()) as Body;

        if (!body.client_id || !body.pipeline_id || !body.to_stage_id) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Missing required fields",
                    received: body,
                },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const { data: updatedClient, error: updateError } = await supabase
            .from("clients")
            .update({
                pipeline_stage_id: body.to_stage_id,
                updated_at: now,
            })
            .eq("id", body.client_id)
            .select("id, pipeline_stage_id")
            .single();

        if (updateError) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Failed to update client stage",
                    details: updateError,
                },
                { status: 500 }
            );
        }

        const { data: history, error: historyError } = await supabase
            .from("pipeline_history")
            .insert({
                client_id: body.client_id,
                pipeline_id: body.pipeline_id,
                from_stage_id: body.from_stage_id,
                to_stage_id: body.to_stage_id,
                moved_by_attendant_id: body.moved_by_attendant_id ?? null,
                moved_at: now,
            })
            .select("id")
            .single();

        if (historyError) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Client moved, but failed to insert pipeline history",
                    details: historyError,
                    updatedClient,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            client: updatedClient,
            history,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: "Unexpected server error in client-stage route",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}