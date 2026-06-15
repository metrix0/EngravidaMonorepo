import { NextResponse } from "next/server";
import { supabase } from "@engravida/lib";

type PipelineStage = {
    id: string;
    pipeline_id: string;
    name: string;
};

type PipelineHistoryMove = {
    client_id: string;
    from_stage_id: string | null;
    to_stage_id: string | null;
};

type DateRange = {
    start: string;
    end: string;
};

const DEFAULT_PIPELINE_ID = "22222222-2222-2222-2222-222222222222";
const DEFAULT_DAYS = 30;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const selectedPipelineId =
        searchParams.get("pipeline_id") ?? DEFAULT_PIPELINE_ID;

    const currentRange = getDateRange({
        days: Number(searchParams.get("days") ?? DEFAULT_DAYS),
        startDate: searchParams.get("start_date"),
        endDate: searchParams.get("end_date"),
    });

    const previousRange = getPreviousDateRange(currentRange);

    const [
        { data: pipelines, error: pipelinesError },
        { data: stages, error: stagesError },
        { data: clients, error: clientsError },
        { data: currentHistory, error: currentHistoryError },
        { data: previousHistory, error: previousHistoryError },
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

        supabase
            .from("pipeline_history")
            .select("client_id, from_stage_id, to_stage_id")
            .eq("pipeline_id", selectedPipelineId)
            .gte("moved_at", currentRange.start)
            .lte("moved_at", currentRange.end),

        supabase
            .from("pipeline_history")
            .select("client_id, from_stage_id, to_stage_id")
            .eq("pipeline_id", selectedPipelineId)
            .gte("moved_at", previousRange.start)
            .lte("moved_at", previousRange.end),
    ]);

    if (
        pipelinesError ||
        stagesError ||
        clientsError ||
        currentHistoryError ||
        previousHistoryError
    ) {
        return NextResponse.json(
            {
                error: "Failed to load pipeline data",
                details: {
                    pipelinesError,
                    stagesError,
                    clientsError,
                    currentHistoryError,
                    previousHistoryError,
                },
            },
            { status: 500 }
        );
    }

    const pipelineStages = (stages ?? []) as PipelineStage[];
    const currentMoves = (currentHistory ?? []) as PipelineHistoryMove[];
    const previousMoves = (previousHistory ?? []) as PipelineHistoryMove[];

    return NextResponse.json({
        pipelines: pipelines ?? [],
        stages: stages ?? [],
        clients: clients ?? [],

        kpis: buildPipelineKpis({
            history: currentMoves,
            stages: pipelineStages,
            pipelineId: selectedPipelineId,
        }),

        previous_kpis: buildPipelineKpis({
            history: previousMoves,
            stages: pipelineStages,
            pipelineId: selectedPipelineId,
        }),
    });
}

function buildPipelineKpis({
                               history,
                               stages,
                               pipelineId,
                           }: {
    history: PipelineHistoryMove[];
    stages: PipelineStage[];
    pipelineId: string;
}) {
    const stageById = new Map(
        stages
            .filter((stage) => stage.pipeline_id === pipelineId)
            .map((stage) => [stage.id, stage])
    );

    const pipelineEntries = countUniqueClients(
        history.filter((move) => move.from_stage_id === null && move.to_stage_id)
    );

    const evaluationsDoneMoves = history.filter((move) => {
        const toStageName = getStageName(move.to_stage_id, stageById);

        return toStageName.includes("avaliacao realizada");
    });

    const evaluationToProcedureMoves = history.filter((move) => {
        const fromStageName = getStageName(move.from_stage_id, stageById);
        const toStageName = getStageName(move.to_stage_id, stageById);

        return (
            fromStageName.includes("avaliacao realizada") &&
            toStageName.includes("procedimento agendado")
        );
    });

    const evaluationsDone = countUniqueClients(evaluationsDoneMoves);
    const proceduresScheduled = countUniqueClients(evaluationToProcedureMoves);

    return {
        pipeline_entries: pipelineEntries,
        evaluations_done: evaluationsDone,
        procedures_scheduled: proceduresScheduled,
        procedure_conversion_rate: percentage(
            proceduresScheduled,
            evaluationsDone
        ),
    };
}

function getStageName(
    stageId: string | null,
    stageById: Map<string, PipelineStage>
) {
    if (!stageId) return "";

    return normalize(stageById.get(stageId)?.name ?? "");
}

function countUniqueClients(history: PipelineHistoryMove[]) {
    return new Set(history.map((move) => move.client_id).filter(Boolean)).size;
}

function getDateRange({
                          days,
                          startDate,
                          endDate,
                      }: {
    days: number;
    startDate: string | null;
    endDate: string | null;
}): DateRange {
    if (startDate) {
        return {
            start: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
            end: new Date(`${endDate ?? startDate}T23:59:59.999Z`).toISOString(),
        };
    }

    const end = new Date();

    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
}

function getPreviousDateRange(currentRange: DateRange): DateRange {
    const currentStart = new Date(currentRange.start);
    const currentEnd = new Date(currentRange.end);

    const durationMs = currentEnd.getTime() - currentStart.getTime();

    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    return {
        start: previousStart.toISOString(),
        end: previousEnd.toISOString(),
    };
}

function percentage(value: number, total: number) {
    if (total === 0) return 0;

    return Math.round((value / total) * 1000) / 10;
}

function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}