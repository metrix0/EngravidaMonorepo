// src/components/layout/SidePanelCRM.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    ChevronRight,
    Footprints,
    HelpCircle,
    LayoutDashboard,
    MessagesSquare,
    RefreshCcw,
    Users,
} from "lucide-react";

type SidePanelItem = {
    label: string;
    href: string;
    icon: ReactNode;
};

type SidePanelProps = {
    items?: SidePanelItem[];

    /**
     * true  = expanded sidebar changes page layout width
     * false = expanded sidebar floats over page
     */
    affectLayout?: boolean;

    /**
     * Initial open state.
     * Example: inbox can use defaultExpanded={false}
     */
    defaultExpanded?: boolean;
};

const COLLAPSED_WIDTH = 76;
const EXPANDED_WIDTH = 250;

const defaultItems: SidePanelItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Inbox", href: "/inbox", icon: <MessagesSquare size={18} /> },
    { label: "Clientes", href: "/clientes", icon: <Users size={18} /> },
    { label: "Pipeline", href: "/pipeline", icon: <Footprints size={18} /> },
];

export default function SidePanelCRM({
                                         items = defaultItems,
                                         affectLayout = true,
                                         defaultExpanded = true,
                                     }: SidePanelProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());
    const [now, setNow] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);


    useEffect(() => {
        const interval = window.setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => window.clearInterval(interval);
    }, []);

    const updatedLabel = useMemo(() => {
        return formatTimeAgo(lastUpdatedAt, now);
    }, [lastUpdatedAt, now]);

    const sidebarWidth = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;

    const layoutWidth = affectLayout ? sidebarWidth : COLLAPSED_WIDTH;

    function handleRefresh() {
        setIsRefreshing(true);
        setLastUpdatedAt(new Date());
        setNow(new Date());

        router.refresh();

        window.setTimeout(() => {
            setIsRefreshing(false);
        }, 500);
    }

    return (
        <div
            className="relative z-50 h-screen shrink-0 transition-[width] duration-300 ease-out"
            style={{ width: layoutWidth }}
        >
            <aside
                className="fixed left-0 top-0 z-50 flex h-screen max-h-screen flex-col overflow-y-auto border-r border-border bg-card py-7 shadow-sm transition-[width,box-shadow] duration-300 ease-out"
                style={{
                    width: sidebarWidth,
                    boxShadow:
                        !affectLayout && isExpanded
                            ? "0 25px 50px -12px rgb(15 23 42 / 0.18)"
                            : undefined,
                }}
            >
                <div className="mb-10 flex h-10 items-center justify-between px-5">
                    <Link
                        href="/"
                        className={`flex h-10 min-w-0 cursor-pointer items-center overflow-hidden rounded-xl transition hover:bg-slate-50 ${
                            isExpanded ? "w-[150px]" : "w-9"
                        }`}
                    >
                        {isExpanded && (
                            <img
                                src="/logo.png"
                                className="block max-h-9 w-full object-contain"
                                alt="Engravida"
                            />
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsExpanded((value) => !value)}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-muted transition-colors hover:bg-selection hover:text-text"
                        title={isExpanded ? "Recolher menu" : "Expandir menu"}
                    >
                        <ChevronRight
                            size={18}
                            className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : "rotate-0"
                            }`}
                        />
                    </button>
                </div>
                <nav className="space-y-2 px-4">
                    {items.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.label}
                                className={`flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 text-sm transition-colors duration-150 ${
                                    isActive
                                        ? "bg-brand-soft font-semibold text-brand"
                                        : "font-medium text-muted hover:bg-selection"
                                } ${isExpanded ? "justify-start" : "justify-center"}`}
                            >
                                <span className="shrink-0">{item.icon}</span>

                                {isExpanded && (
                                    <span className="min-w-0 truncate">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto space-y-4 px-4">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        title={`Atualizado ${updatedLabel}`}
                        className={`flex w-full min-w-0 cursor-pointer items-center rounded-xl border border-border p-4 text-left text-sm text-muted transition-colors duration-150 hover:bg-slate-50 hover:text-text ${
                            isExpanded
                                ? "justify-between gap-3"
                                : "justify-center px-0"
                        }`}
                    >
                        {isExpanded && (
                            <div className="min-w-0 flex-1 truncate">
                                Atualizado {updatedLabel}
                            </div>
                        )}

                        <RefreshCcw
                            size={18}
                            className={`min-w-[18px] ${
                                isRefreshing ? "animate-spin" : ""
                            }`}
                        />
                    </button>

                    <button
                        type="button"
                        title="Precisa de ajuda?"
                        className={`flex w-full cursor-pointer items-center rounded-xl border border-border p-3 text-xs text-muted transition-colors duration-150 hover:bg-slate-50 hover:text-text ${
                            isExpanded ? "gap-3" : "justify-center"
                        }`}
                    >
                        <HelpCircle className="shrink-0 text-brand" size={22} />

                        {isExpanded && <div>Precisa de ajuda?</div>}
                    </button>
                </div>
            </aside>
        </div>
    );
}

function formatTimeAgo(date: Date, now: Date): string {
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 30) return "agora";
    if (diffMinutes < 1) return "há menos de 1 minuto";
    if (diffMinutes === 1) return "há 1 minuto";
    if (diffMinutes < 60) return `há ${diffMinutes} minutos`;
    if (diffHours === 1) return "há 1 hora";

    return `há ${diffHours} horas`;
}