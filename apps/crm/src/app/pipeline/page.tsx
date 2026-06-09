"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarCheck,
    Filter,
    MapPin,
    Search,
    TrendingUp,
    User,
    Users,
    XCircle,
} from "lucide-react";

import {
    AdvancedFilterButton,
    Card,
    DashboardHeader,
    FilterButton,
    HorizontalScroller,
    KpiCard,
    Skeleton,
} from "@engravida/components";

import SidePanelCRM from "../../components/layout/SidePanelCRM";

import type {
    CalendarPresetValue,
    DateRange,
} from "@engravida/components/ui/CalendarButton";

type Pipeline = {
    id: string;
    name: string;
    active: boolean;
};

type PipelineStage = {
    id: string;
    pipeline_id: string;
    name: string;
    position: number;
    color: string | null;
};

type Client = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    pipeline_stage_id: string | null;
    last_interaction_at: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    updated_at: string;
};

type PipelineResponse = {
    pipelines: Pipeline[];
    stages: PipelineStage[];
    clients: Client[];
};

export default function PipelinePage() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<CalendarPresetValue | null>("yesterday");
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        start: null,
        end: null,
    });

    const [pipelineIds, setPipelineIds] = useState<string[]>([]);
    const [sourceValues, setSourceValues] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    const selectedPipelineId = pipelineIds[0] ?? pipelines[0]?.id ?? null;

    async function load() {
        setLoading(true);

        const response = await fetch("/api/pipeline", {
            cache: "no-store",
        });

        if (!response.ok) {
            setLoading(false);
            console.error(await response.json());
            return;
        }

        const data = (await response.json()) as PipelineResponse;

        setPipelines(data.pipelines ?? []);
        setStages(data.stages ?? []);
        setClients(data.clients ?? []);

        if (data.pipelines?.[0]?.id) {
            setPipelineIds([data.pipelines[0].id]);
        }

        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const visibleStages = useMemo(() => {
        if (!selectedPipelineId) return [];

        return stages.filter((stage) => stage.pipeline_id === selectedPipelineId);
    }, [stages, selectedPipelineId]);

    const visibleStageIds = useMemo(() => {
        return new Set(visibleStages.map((stage) => stage.id));
    }, [visibleStages]);

    const filteredClients = useMemo(() => {
        const term = search.trim().toLowerCase();

        return clients.filter((client) => {
            if (!client.pipeline_stage_id) return false;
            if (!visibleStageIds.has(client.pipeline_stage_id)) return false;

            if (
                sourceValues.length > 0 &&
                !sourceValues.includes(client.utm_source ?? "direct")
            ) {
                return false;
            }

            if (!term) return true;

            return (
                client.name?.toLowerCase().includes(term) ||
                client.phone?.toLowerCase().includes(term) ||
                client.email?.toLowerCase().includes(term)
            );
        });
    }, [clients, search, sourceValues, visibleStageIds]);

    const clientsByStage = useMemo(() => {
        const grouped: Record<string, Client[]> = {};

        for (const stage of visibleStages) {
            grouped[stage.id] = filteredClients.filter(
                (client) => client.pipeline_stage_id === stage.id
            );
        }

        return grouped;
    }, [filteredClients, visibleStages]);

    const selectedPipeline = pipelines.find(
        (pipeline) => pipeline.id === selectedPipelineId
    );

    const totalClients = filteredClients.length;

    const scheduledStage = visibleStages.find((stage) =>
        normalize(stage.name).includes("agend")
    );

    const lostStage = visibleStages.find((stage) =>
        normalize(stage.name).includes("perdid")
    );

    const scheduledCount = scheduledStage
        ? clientsByStage[scheduledStage.id]?.length ?? 0
        : 0;

    const lostCount = lostStage ? clientsByStage[lostStage.id]?.length ?? 0 : 0;

    const advancementRate =
        totalClients > 0 ? Math.round((scheduledCount / totalClients) * 100) : 0;

    async function moveClient(clientId: string, toStageId: string) {
        if (!selectedPipelineId) return;

        const client = clients.find((client) => client.id === clientId);

        if (!client) return;

        const fromStageId = client.pipeline_stage_id;

        if (fromStageId === toStageId) return;

        const previousClients = clients;
        const now = new Date().toISOString();

        setClients((current) =>
            current.map((client) =>
                client.id === clientId
                    ? {
                        ...client,
                        pipeline_stage_id: toStageId,
                        updated_at: now,
                    }
                    : client
            )
        );

        const response = await fetch("/api/pipeline/client-stage", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                pipeline_id: selectedPipelineId,
                from_stage_id: fromStageId,
                to_stage_id: toStageId,
                moved_by_attendant_id: null,
            }),
        });

        if (!response.ok) {
            setClients(previousClients);
            console.error(await response.json());
        }
    }

    if (loading) {
        return (
            <main className="flex h-screen w-screen overflow-y-scroll bg-white text-slate-900">
                <SidePanelCRM />

                <section className="min-w-0 flex-1 px-8 py-8">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="mt-3 h-5 w-96" />
                    </div>

                    <div className="grid grid-cols-4 gap-5">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="flex h-screen w-screen overflow-y-scroll bg-white text-slate-900">
            <SidePanelCRM />

            <section className="min-w-0 flex-1 px-8 py-8">
                <DashboardHeader
                    title="Pipeline"
                    description="Acompanhe e mova clientes pelo funil comercial"
                    period={period}
                    setPeriod={setPeriod}
                    selectedRange={selectedRange}
                    setSelectedRange={setSelectedRange}
                />

                <div className="mb-8 flex justify-end gap-3">
                    <FilterButton
                        label={selectedPipeline?.name ?? "Funil Comercial Principal"}
                        values={pipelineIds}
                        onChange={(values) => {
                            setPipelineIds(values.slice(0, 1));
                        }}
                        options={pipelines.map((pipeline) => ({
                            label: pipeline.name,
                            value: pipeline.id,
                        }))}
                        widthClassName="w-[260px]"
                    />

                    <FilterButton
                        icon={<User size={16} />}
                        label="Todos os atendentes"
                        options={[]}
                        widthClassName="w-[230px]"
                    />

                    <FilterButton
                        icon={<MapPin size={16} />}
                        label="Todas as unidades"
                        options={[]}
                        widthClassName="w-[230px]"
                    />
                </div>

                <section className="mb-8 grid grid-cols-1 gap-5">
                    <HorizontalScroller scrollAmount={400}>
                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<Users size={26} />}
                                label="Clientes no funil"
                                currentValue={totalClients}
                                previousValue={null}
                                color="purple"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<CalendarCheck size={26} />}
                                label="Agendados"
                                currentValue={scheduledCount}
                                previousValue={null}
                                color="green"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<TrendingUp size={26} />}
                                label="Taxa de avanço"
                                currentValue={advancementRate}
                                previousValue={null}
                                suffix="%"
                                color="blue"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<XCircle size={26} />}
                                label="Perdidos"
                                currentValue={lostCount}
                                previousValue={null}
                                color="pink"
                            />
                        </div>
                    </HorizontalScroller>
                </section>

                <section>
                    <div className="mb-5 flex items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-text">
                                {selectedPipeline?.name ?? "Funil Comercial Principal"}
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                {totalClients} clientes distribuídos em{" "}
                                {visibleStages.length} etapas
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-[360px] items-center gap-3 rounded-xl border border-border bg-white px-4 shadow-sm">
                                <Search size={17} className="text-muted" />

                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar cliente ou telefone..."
                                    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <AdvancedFilterButton
                                icon={<Filter size={16} />}
                                sections={[
                                    {
                                        id: "source",
                                        title: "Origem",
                                        values: sourceValues,
                                        onChange: setSourceValues,
                                        options: [
                                            { label: "Meta Ads", value: "meta_ads" },
                                            { label: "Instagram", value: "instagram" },
                                            { label: "Google", value: "google" },
                                            { label: "Direto", value: "direct" },
                                        ],
                                    },
                                ]}
                            />

                            <button
                                type="button"
                                className="flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                                + Cliente
                            </button>
                        </div>
                    </div>

                    <div className="max-w-[calc(100vw-320px)] overflow-hidden pb-16">
                        <HorizontalScroller scrollAmount={520}>
                            {visibleStages.map((stage) => {
                                const stageClients = clientsByStage[stage.id] ?? [];

                                return (
                                    <PipelineColumn
                                        key={stage.id}
                                        stage={stage}
                                        clients={stageClients}
                                        onMoveClient={moveClient}
                                    />
                                );
                            })}
                        </HorizontalScroller>
                    </div>
                </section>
            </section>
        </main>
    );
}

function PipelineColumn({
                            stage,
                            clients,
                            onMoveClient,
                        }: {
    stage: PipelineStage;
    clients: Client[];
    onMoveClient: (clientId: string, stageId: string) => void;
}) {
    return (
        <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                const clientId = event.dataTransfer.getData("client_id");
                if (clientId) onMoveClient(clientId, stage.id);
            }}
            className="min-h-[560px] w-[260px] shrink-0 rounded-xl border border-border bg-slate-50 p-3"
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: stage.color ?? "#64748b" }}
                    />

                    <h3 className="truncate text-sm font-bold text-text">
                        {stage.name}
                    </h3>
                </div>

                <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-muted">
                    {clients.length}
                </span>
            </div>

            <div className="space-y-3">
                {clients.slice(0, 5).map((client) => (
                    <PipelineClientCard key={client.id} client={client} />
                ))}
            </div>

            {clients.length > 5 && (
                <button
                    type="button"
                    className="mt-5 w-full cursor-pointer text-center text-sm font-semibold text-blue"
                >
                    + Ver mais {clients.length - 5}
                </button>
            )}
        </div>
    );
}

function PipelineClientCard({ client }: { client: Client }) {
    return (
        <Card className="rounded-xl p-3">
            <div
                draggable
                onDragStart={(event) => {
                    event.dataTransfer.setData("client_id", client.id);
                }}
                className="flex cursor-grab gap-3 active:cursor-grabbing"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-soft text-xs font-bold text-purple">
                    {getInitials(client.name)}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-text">
                        {client.name ?? "Cliente sem nome"}
                    </div>

                    <div className="mt-1 truncate text-xs text-muted">
                        {client.phone ?? "Sem telefone"}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-md bg-blue-soft px-2 py-1 text-[11px] font-bold text-blue">
                            {sourceLabel(client.utm_source)}
                        </span>

                        <span className="text-[11px] font-medium text-muted">
                            {timeAgo(client.last_interaction_at)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function getInitials(name: string | null) {
    if (!name) return "?";

    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function sourceLabel(source: string | null) {
    const map: Record<string, string> = {
        meta_ads: "Meta Ads",
        facebook: "Meta Ads",
        instagram: "Instagram",
        google: "Google",
        direct: "Direto",
    };

    return map[source ?? "direct"] ?? source ?? "Direto";
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${Math.max(minutes, 1)} min`;
    if (hours < 24) return `${hours} h`;
    return `${days} dia${days > 1 ? "s" : ""}`;
}

function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}