// apps/crm/src/app/clientes/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarCheck,
    Clock,
    Filter,
    MapPin,
    Search,
    User,
    UserPlus,
    Users,
} from "lucide-react";

import {
    AdvancedFilterButton,
    DashboardHeader,
    FilterButton,
    HorizontalScroller,
    KpiCard, Pagination,
    Skeleton,
} from "@engravida/components";

import SidePanelCRM from "../../components/layout/SidePanelCRM";

import type {
    CalendarPresetValue,
    CalendarPreset,
    DateRange,
} from "@engravida/components/ui/CalendarButton";
import {InitialsAvatar} from "@engravida/components/conversations/InitialsAvatar";

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
    first_seen_at: string;
    last_interaction_at: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    attendant_name: string | null;
};

type ClientsResponse = {
    clients: Client[];
    stages: PipelineStage[];
};

const CLIENTS_PER_PAGE = 100;

const CLIENTES_DATE_PRESETS: CalendarPreset[] = [
    {
        label: "Sempre",
        value: "always",
        startOffsetDays: 0,
        endOffsetDays: 0,
    },
    {
        label: "Ontem",
        value: "yesterday",
        startOffsetDays: -1,
        endOffsetDays: -1,
    },
    {
        label: "7 dias",
        value: "7",
        startOffsetDays: -6,
        endOffsetDays: 0,
    },
    {
        label: "30 dias",
        value: "30",
        startOffsetDays: -29,
        endOffsetDays: 0,
    },
    {
        label: "90 dias",
        value: "90",
        startOffsetDays: -89,
        endOffsetDays: 0,
    },
];

export default function ClientesPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [loading, setLoading] = useState(true);

    const [period, setPeriod] = useState<CalendarPresetValue | null>("always");
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        start: null,
        end: null,
    });

    const [currentPage, setCurrentPage] = useState(1);

    const [stageValues, setStageValues] = useState<string[]>([]);
    const [sourceValues, setSourceValues] = useState<string[]>([]);
    const [search, setSearch] = useState("");

    async function load() {
        setLoading(true);

        try {
            const response = await fetch("/api/clientes", {
                cache: "no-store",
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (!response.ok) {
                console.error("[clientes] failed to load", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                });
                return;
            }

            setClients(data?.clients ?? []);
            setStages(data?.stages ?? []);
        } catch (error) {
            console.error("[clientes] unexpected load error", error);
            setClients([]);
            setStages([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const stageById = useMemo(() => {
        return new Map(stages.map((stage) => [stage.id, stage]));
    }, [stages]);

    const interactionDateRange = useMemo(() => {
        return getInteractionDateRange(period, selectedRange);
    }, [period, selectedRange]);

    const filteredClients = useMemo(() => {
        const term = search.trim().toLowerCase();

        return clients.filter((client) => {
            if (
                stageValues.length > 0 &&
                (!client.pipeline_stage_id ||
                    !stageValues.includes(client.pipeline_stage_id))
            ) {
                return false;
            }

            if (
                sourceValues.length > 0 &&
                !sourceValues.includes(client.utm_source ?? "direct")
            ) {
                return false;
            }
            if (interactionDateRange) {
                const interactionDate = toDateString(client.last_interaction_at);

                if (
                    interactionDate < interactionDateRange.start ||
                    interactionDate > interactionDateRange.end
                ) {
                    return false;
                }
            }

            if (!term) return true;

            return (
                client.name?.toLowerCase().includes(term) ||
                client.phone?.toLowerCase().includes(term) ||
                client.email?.toLowerCase().includes(term)
            );
        });
    }, [clients, search, sourceValues, stageValues, interactionDateRange]);

    const totalClients = filteredClients.length;

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        stageValues,
        sourceValues,
        period,
        selectedRange.start,
        selectedRange.end,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredClients.length / CLIENTS_PER_PAGE)
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * CLIENTS_PER_PAGE;
        const end = start + CLIENTS_PER_PAGE;

        return filteredClients.slice(start, end);
    }, [filteredClients, currentPage]);

    const pageStart =
        filteredClients.length === 0
            ? 0
            : (currentPage - 1) * CLIENTS_PER_PAGE + 1;

    const pageEnd = Math.min(
        currentPage * CLIENTS_PER_PAGE,
        filteredClients.length
    );

    const newLeads = filteredClients.filter((client) => {
        const stage = client.pipeline_stage_id
            ? stageById.get(client.pipeline_stage_id)
            : null;

        return normalize(stage?.name ?? "").includes("novo");
    }).length;

    const scheduled = filteredClients.filter((client) => {
        const stage = client.pipeline_stage_id
            ? stageById.get(client.pipeline_stage_id)
            : null;

        return normalize(stage?.name ?? "").includes("agend");
    }).length;

    const withoutInteraction = filteredClients.filter((client) => {
        const diff = Date.now() - new Date(client.last_interaction_at).getTime();
        return diff > 24 * 60 * 60 * 1000;
    }).length;

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
                    title="Clientes"
                    description="Visualize e gerencie todos os clientes do CRM"
                    period={period}
                    setPeriod={setPeriod}
                    selectedRange={selectedRange}
                    setSelectedRange={setSelectedRange}
                    presets={CLIENTES_DATE_PRESETS}
                />

                <div className="mb-8 flex justify-end gap-3">
                    <FilterButton
                        icon={<User size={16} />}
                        label="Todos os atendentes"
                        options={[]}
                        widthClassName="w-[230px]"
                    />

                    <FilterButton
                        icon={<Filter size={16} />}
                        label="Todos os estágios"
                        values={stageValues}
                        onChange={setStageValues}
                        options={stages.map((stage) => ({
                            label: stage.name,
                            value: stage.id,
                        }))}
                        widthClassName="w-[230px]"
                    />

                    <FilterButton
                        icon={<MapPin size={16} />}
                        label="Todas as origens"
                        values={sourceValues}
                        onChange={setSourceValues}
                        options={[
                            { label: "Meta Ads", value: "meta_ads" },
                            { label: "Instagram", value: "instagram" },
                            { label: "Google", value: "google" },
                            { label: "Direto", value: "direct" },
                        ]}
                        widthClassName="w-[230px]"
                    />
                </div>

                <section className="mb-8 grid grid-cols-1 gap-5">
                    <HorizontalScroller scrollAmount={400}>
                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<Users size={26} />}
                                label="Clientes totais"
                                currentValue={totalClients}
                                previousValue={null}
                                color="pink"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<UserPlus size={26} />}
                                label="Novos leads"
                                currentValue={newLeads}
                                previousValue={null}
                                color="green"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<CalendarCheck size={26} />}
                                label="Agendados"
                                currentValue={scheduled}
                                previousValue={null}
                                color="blue"
                            />
                        </div>

                        <div className="min-w-[310px]">
                            <KpiCard
                                icon={<Clock size={26} />}
                                label="Sem interação"
                                currentValue={withoutInteraction}
                                previousValue={null}
                                color="orange"
                            />
                        </div>
                    </HorizontalScroller>
                </section>

                <section>
                    <div className="mb-5 flex items-center justify-between gap-6">
                        <h2 className="text-xl font-bold text-text">
                            Clientes ({totalClients})
                        </h2>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-[360px] items-center gap-3 rounded-xl border border-border bg-white px-4 shadow-sm">
                                <Search size={17} className="text-muted" />

                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por cliente ou telefone..."
                                    className="w-full bg-transparent text-sm text-text outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <AdvancedFilterButton
                                icon={<Filter size={16} />}
                                sections={[
                                    {
                                        id: "stage",
                                        title: "Estágio",
                                        values: stageValues,
                                        onChange: setStageValues,
                                        options: stages.map((stage) => ({
                                            label: stage.name,
                                            value: stage.id,
                                        })),
                                    },
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

                    <div className="overflow-hidden rounded-xl">
                        <table className="w-full table-fixed border-collapse text-left">
                            <thead>
                            <tr className="h-12 bg-slate-50 text-xs font-bold text-muted">
                                <th className="w-[260px] px-6">Cliente</th>
                                <th className="w-[170px] px-4">Telefone</th>
                                <th className="w-[170px] px-4">Estágio</th>
                                <th className="w-[145px] px-4">Origem</th>
                                <th className="w-[170px] px-4">Última interação</th>
                                <th className="w-[190px] px-4">Atendente</th>
                                <th className="w-[140px] px-4">Status</th>
                                <th className="w-[50px] px-4" />
                            </tr>
                            </thead>

                            <tbody>
                            {paginatedClients.map((client) => {
                                const stage = client.pipeline_stage_id
                                    ? stageById.get(client.pipeline_stage_id)
                                    : null;

                                return (
                                    <ClientRow
                                        key={client.id}
                                        client={client}
                                        stage={stage ?? null}
                                    />
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    {filteredClients.length > CLIENTS_PER_PAGE ?
                        <div className="mt-5 flex items-center justify-between pb-16">
                            <p className="text-sm font-medium text-muted">
                                Mostrando {pageStart}–{pageEnd} de {filteredClients.length} clientes
                            </p>

                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    : <div className={"pb-12"}></div>
                    }
                </section>
            </section>
        </main>
    );
}

function ClientRow({
                       client,
                       stage,
                   }: {
    client: Client;
    stage: PipelineStage | null;
}) {
    const status = getClientStatus(stage?.name ?? null);

    return (
        <tr className="h-[76px] border-b border-slate-100 text-sm text-text">
            <td className="px-6">
                <div className="flex items-center gap-3">
                    <InitialsAvatar name={client.name ?? "Cliente"} />

                    <div className="min-w-0">
                        <div className="truncate font-bold">
                            {client.name ?? "Cliente sem nome"}
                        </div>

                        <div className="mt-1 truncate text-xs text-muted">
                            cliente desde {formatSince(client.first_seen_at)}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-4 text-slate-700">{client.phone ?? "Sem telefone"}</td>

            <td className="px-4">
                <Chip
                    label={stage?.name ?? "Sem estágio"}
                    variant={getStageVariant(stage?.name ?? null)}
                />
            </td>

            <td className="px-4">
                <Chip
                    label={sourceLabel(client.utm_source)}
                    variant={getSourceVariant(client.utm_source)}
                />
            </td>

            <td className="px-4 text-slate-700">
                {timeAgo(client.last_interaction_at)}
            </td>

            <td className="px-4 text-slate-700">
                {client.attendant_name ?? "—"}
            </td>

            <td className="px-4">
                <Chip label={status.label} variant={status.variant} />
            </td>

            <td className="px-4 text-xl font-bold text-slate-400">›</td>
        </tr>
    );
}

function Chip({
                  label,
                  variant,
              }: {
    label: string;
    variant: "blue" | "green" | "purple" | "pink" | "yellow" | "red" | "gray";
}) {
    const classes: Record<typeof variant, string> = {
        blue: "bg-blue-soft text-blue",
        green: "bg-green-soft text-green",
        purple: "bg-purple-soft text-purple",
        pink: "bg-pink-soft text-pink",
        yellow: "bg-yellow-soft text-yellow",
        red: "bg-red-soft text-red",
        gray: "bg-slate-100 text-slate-500",
    };

    return (
        <span
            className={[
                "inline-flex rounded-md px-2.5 py-1 text-xs font-bold",
                classes[variant],
            ].join(" ")}
        >
            {label}
        </span>
    );
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

function getSourceVariant(source: string | null) {
    const normalized = source ?? "direct";

    if (normalized === "meta_ads" || normalized === "facebook") return "purple";
    if (normalized === "google") return "blue";
    if (normalized === "instagram") return "pink";

    return "gray";
}

function getStageVariant(stageName: string | null) {
    const stage = normalize(stageName ?? "");

    if (stage.includes("novo")) return "blue";
    if (stage.includes("tentando")) return "yellow";
    if (stage.includes("atendimento")) return "purple";
    if (stage.includes("interessado")) return "yellow";
    if (stage.includes("agend")) return "green";
    if (stage.includes("compareceu")) return "green";
    if (stage.includes("perdid")) return "red";

    return "gray";
}

function getClientStatus(stageName: string | null): {
    label: string;
    variant: "blue" | "green" | "purple" | "pink" | "yellow" | "red" | "gray";
} {
    const stage = normalize(stageName ?? "");

    if (stage.includes("perdid")) {
        return { label: "Perdido", variant: "red" };
    }

    if (stage.includes("compareceu")) {
        return { label: "Convertido", variant: "green" };
    }

    if (stage.includes("agend")) {
        return { label: "Agendado", variant: "green" };
    }

    if (stage.includes("interessado")) {
        return { label: "Quente", variant: "red" };
    }

    if (stage.includes("tentando")) {
        return { label: "Aguardando", variant: "yellow" };
    }

    return { label: "Ativo", variant: "green" };
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

function formatSince(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

function normalize(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function getInteractionDateRange(
    period: CalendarPresetValue | null,
    selectedRange: DateRange
): { start: string; end: string } | null {
    if (selectedRange.start) {
        return {
            start: selectedRange.start,
            end: selectedRange.end ?? selectedRange.start,
        };
    }

    if (!period || period === "always") {
        return null;
    }

    if (period === "yesterday") {
        const date = getDateWithOffset(-1);

        return {
            start: date,
            end: date,
        };
    }

    const days = Number(period);

    if (!Number.isFinite(days)) {
        return null;
    }

    return {
        start: getDateWithOffset(-(days - 1)),
        end: getDateWithOffset(0),
    };
}

function getDateWithOffset(offsetDays: number) {
    const date = new Date();

    date.setDate(date.getDate() + offsetDays);

    return toDateString(date.toISOString());
}

function toDateString(date: string) {
    return new Date(date).toISOString().slice(0, 10);
}