// src/app/inbox/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
    Bot,
    Calendar,
    ChevronRight,
    Clock,
    ExternalLink,
    Filter,
    MapPin,
    MessageCircleMore,
    MoreVertical,
    Paperclip,
    Phone,
    Search,
    Send,
    Sparkles,
    Tag,
    User,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa6";

import { SidePanel } from "@engravida/components";

type Channel = "whatsapp" | "instagram" | "facebook";

type ConversationStatus = "open" | "pending" | "closed";

type Conversation = {
    id: string;
    name: string;
    initials: string;
    phone: string;
    channel: Channel;
    preview: string;
    time: string;
    unread: number;
    city: string;
    status: ConversationStatus;
    funnel: string;
    stage: string;
    origin: string;
    campaign: string;
    responsible: string;
    lastContact: string;
    messages: {
        id: string;
        from: "client" | "attendant";
        text: string;
        time: string;
    }[];
};

const conversations: Conversation[] = [
    {
        id: "1",
        name: "Tamiris",
        initials: "TA",
        phone: "55 11 98261-9605",
        channel: "whatsapp",
        preview: "Oi, queria saber valores da FIV",
        time: "5 min",
        unread: 3,
        city: "São Paulo",
        status: "open",
        funnel: "Funil FIV",
        stage: "Avaliação Agendada",
        origin: "Google Ads",
        campaign: "engravida-sao-paulo",
        responsible: "Roberta Oliveira",
        lastContact: "5 min",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Oi! Eu queria saber como funciona o tratamento de FIV e quais são os valores.",
                time: "10:21",
            },
            {
                id: "m2",
                from: "attendant",
                text: "Oi, Tamiris! Claro, posso te explicar. Primeiro fazemos uma avaliação com especialista para entender seu caso.",
                time: "10:22",
            },
            {
                id: "m3",
                from: "client",
                text: "Entendi. Essa avaliação pode ser online ou presencial?",
                time: "10:23",
            },
            {
                id: "m4",
                from: "attendant",
                text: "Pode ser presencial na unidade ou online, sim. Para FIV, geralmente indicamos avaliação inicial com exames em mãos.",
                time: "10:24",
            },
            {
                id: "m5",
                from: "client",
                text: "Perfeito. Queria ver um horário para essa semana, pode ser?",
                time: "10:25",
            },
        ],
    },
    {
        id: "2",
        name: "Ana Clara",
        initials: "AC",
        phone: "55 19 99120-8842",
        channel: "instagram",
        preview: "Perfeito, qual unidade fica melhor?",
        time: "18 min",
        unread: 0,
        city: "Campinas",
        status: "open",
        funnel: "Consulta inicial",
        stage: "Aguardando retorno",
        origin: "Instagram",
        campaign: "bio-instagram",
        responsible: "Marina Lopes",
        lastContact: "18 min",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Queria entender melhor como funciona a primeira consulta.",
                time: "09:48",
            },
            {
                id: "m2",
                from: "attendant",
                text: "Claro! Temos avaliação online e presencial. Você prefere qual formato?",
                time: "09:50",
            },
            {
                id: "m3",
                from: "client",
                text: "Perfeito, qual unidade fica melhor?",
                time: "09:54",
            },
        ],
    },
    {
        id: "3",
        name: "Juliana Costa",
        initials: "JC",
        phone: "55 11 98840-1102",
        channel: "whatsapp",
        preview: "Tenho consulta marcada amanhã",
        time: "32 min",
        unread: 0,
        city: "São Paulo",
        status: "open",
        funnel: "Confirmação",
        stage: "Consulta marcada",
        origin: "WhatsApp",
        campaign: "retorno-cliente",
        responsible: "Roberta Oliveira",
        lastContact: "32 min",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Tenho consulta marcada amanhã. Preciso levar algum exame?",
                time: "09:31",
            },
            {
                id: "m2",
                from: "attendant",
                text: "Sim, pode levar exames anteriores se tiver. Também enviamos a lista pelo WhatsApp.",
                time: "09:34",
            },
        ],
    },
    {
        id: "4",
        name: "Camila Souza",
        initials: "CS",
        phone: "55 21 99742-9011",
        channel: "facebook",
        preview: "Pode me mandar os exames?",
        time: "1 h",
        unread: 1,
        city: "Rio de Janeiro",
        status: "open",
        funnel: "Pré-consulta",
        stage: "Documentos pendentes",
        origin: "Facebook Ads",
        campaign: "fiv-rj-leads",
        responsible: "Larissa Martins",
        lastContact: "1 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Pode me mandar os exames que preciso fazer antes?",
                time: "08:40",
            },
        ],
    },
    {
        id: "5",
        name: "Vanessa Carvalho",
        initials: "VC",
        phone: "55 31 99842-1160",
        channel: "whatsapp",
        preview: "Obrigada! vou confirmar com meu marido",
        time: "2 h",
        unread: 0,
        city: "Belo Horizonte",
        status: "pending",
        funnel: "Funil FIV",
        stage: "Decisão familiar",
        origin: "Google Ads",
        campaign: "engravida-bh",
        responsible: "Roberta Oliveira",
        lastContact: "2 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Obrigada! vou confirmar com meu marido e retorno ainda hoje.",
                time: "08:02",
            },
        ],
    },
];

export default function InboxPage() {
    const [selectedId, setSelectedId] = useState(conversations[0].id);
    const [activeTab, setActiveTab] = useState<ConversationStatus>("open");
    const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");

    const selectedConversation =
        conversations.find((conversation) => conversation.id === selectedId) ??
        conversations[0];

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const matchesStatus = conversation.status === activeTab;
            const matchesChannel =
                channelFilter === "all" || conversation.channel === channelFilter;

            return matchesStatus && matchesChannel;
        });
    }, [activeTab, channelFilter]);

    return (
        <main className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
            <SidePanel />

            <section className="grid h-screen min-w-0 flex-1 grid-cols-[350px_minmax(0,1fr)_330px] overflow-hidden bg-slate-50/40">
                <ConversationListPanel
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    channelFilter={channelFilter}
                    onChannelFilterChange={setChannelFilter}
                    conversations={filteredConversations}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />

                <ChatPanel conversation={selectedConversation} />

                <CustomerDetailsPanel conversation={selectedConversation} />
            </section>
        </main>
    );
}

function ConversationListPanel({
                                   activeTab,
                                   onTabChange,
                                   channelFilter,
                                   onChannelFilterChange,
                                   conversations,
                                   selectedId,
                                   onSelect,
                               }: {
    activeTab: ConversationStatus;
    onTabChange: (value: ConversationStatus) => void;
    channelFilter: Channel | "all";
    onChannelFilterChange: (value: Channel | "all") => void;
    conversations: Conversation[];
    selectedId: string;
    onSelect: (id: string) => void;
}) {
    return (
        <aside className="flex h-full min-w-0 flex-col overflow-hidden border-r border-slate-200 bg-white px-5 py-7">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    Inbox
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atendimento omnichannel em tempo real
                </p>
            </header>

            <div className="mb-5 grid h-11 shrink-0 grid-cols-3 rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold">
                <InboxTab
                    label="Abertas"
                    active={activeTab === "open"}
                    onClick={() => onTabChange("open")}
                />

                <InboxTab
                    label="Pendentes"
                    active={activeTab === "pending"}
                    onClick={() => onTabChange("pending")}
                />

                <InboxTab
                    label="Fechadas"
                    active={activeTab === "closed"}
                    onClick={() => onTabChange("closed")}
                />
            </div>

            <div className="mb-4 flex shrink-0 gap-3">
                <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-400">
                    <Search size={18} />
                    <span>Buscar conversas...</span>
                </div>

                <button
                    type="button"
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                >
                    <Filter size={18} />
                </button>
            </div>

            <div className="mb-4 flex shrink-0 flex-wrap gap-2">
                <ChannelFilterButton
                    channel="whatsapp"
                    active={channelFilter === "whatsapp"}
                    onClick={() => onChannelFilterChange("whatsapp")}
                />

                <ChannelFilterButton
                    channel="instagram"
                    active={channelFilter === "instagram"}
                    onClick={() => onChannelFilterChange("instagram")}
                />

                <ChannelFilterButton
                    channel="facebook"
                    active={channelFilter === "facebook"}
                    onClick={() => onChannelFilterChange("facebook")}
                />

                <button
                    type="button"
                    onClick={() => onChannelFilterChange("all")}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        channelFilter === "all"
                            ? "border-red bg-red-soft text-red"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    Todos
                </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {conversations.map((conversation) => (
                    <ConversationListItem
                        key={conversation.id}
                        conversation={conversation}
                        active={conversation.id === selectedId}
                        onClick={() => onSelect(conversation.id)}
                    />
                ))}

                {conversations.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                        Nenhuma conversa encontrada.
                    </div>
                )}
            </div>

            <footer className="mt-5 flex shrink-0 items-center justify-between text-sm text-slate-500">
                <span>Mostrando 1–5 de 25 conversas</span>
                <ChevronRight size={18} />
            </footer>
        </aside>
    );
}

function ChatPanel({ conversation }: { conversation: Conversation }) {
    return (
        <section className="flex h-full min-w-0 flex-col overflow-hidden bg-slate-50/50">
            <header className="flex h-[104px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
                <div className="flex min-w-0 items-center gap-4">
                    <Avatar initials={conversation.initials} channel={conversation.channel} />

                    <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-slate-950">
                            {conversation.name}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span>{getChannelLabel(conversation.channel)}</span>
                            <span className="h-2 w-2 rounded-full bg-green" />
                            <span>Online agora</span>
                            <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {conversation.city}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-xl bg-green-soft px-3 py-2 text-sm font-bold text-green">
                        Em atendimento
                    </span>

                    <span className="rounded-xl bg-red-soft px-3 py-2 text-sm font-bold text-red">
                        FIV
                    </span>

                    <button
                        type="button"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7">
                <div className="mb-6 flex items-center justify-center gap-4">
                    <div className="h-px w-40 bg-slate-200" />
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        Hoje
                    </span>
                    <div className="h-px w-40 bg-slate-200" />
                </div>

                <div className="space-y-6">
                    {conversation.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                </div>

                <div className="mt-7 rounded-2xl border border-violet-200 bg-white px-5 py-4 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 font-bold text-purple">
                        <Sparkles size={17} />
                        Sugestão IA
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-600">
                            Oferecer horários disponíveis e perguntar a melhor unidade.
                        </p>

                        <button
                            type="button"
                            className="shrink-0 rounded-xl border border-violet-200 bg-purple-soft px-4 py-2 text-sm font-bold text-purple"
                        >
                            Usar sugestão
                        </button>
                    </div>
                </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
                <div className="flex min-h-[58px] items-center rounded-2xl border border-slate-200 bg-white px-5 text-sm text-slate-400">
                    Responder como atendente...

                    <div className="ml-auto flex items-center gap-3 text-slate-500">
                        <Sparkles size={19} />
                        <Paperclip size={19} />
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap gap-2">
                        <ComposerButton icon={<MessageCircleMore size={17} />} label="Template" />
                        <ComposerButton icon={<Paperclip size={17} />} label="Anexo" />
                        <ComposerButton icon={<Tag size={17} />} label="Nota interna" />
                        <ComposerButton icon={<Sparkles size={17} />} label="IA" />
                    </div>

                    <button
                        type="button"
                        className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red px-5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                        <Send size={17} />
                        Enviar
                    </button>
                </div>
            </footer>
        </section>
    );
}

function CustomerDetailsPanel({ conversation }: { conversation: Conversation }) {
    return (
        <aside className="flex h-full min-w-0 flex-col overflow-hidden border-l border-slate-200 bg-white px-5 py-6">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <h2 className="mb-4 text-lg font-bold text-slate-950">Cliente</h2>

                <section className="mb-5 rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-4">
                        <Avatar initials={conversation.initials} channel={conversation.channel} />

                        <div className="min-w-0 flex-1">
                            <div className="truncate font-bold text-slate-950">
                                {conversation.name}
                            </div>

                            <div className="mt-1 text-sm text-slate-500">
                                {conversation.phone}
                            </div>

                            <ChannelBadge channel={conversation.channel} />
                        </div>

                        <ChevronRight size={20} className="text-slate-400" />
                    </div>
                </section>

                <DetailSection title="Funil">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-soft text-red">
                            <Filter size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-slate-900">
                                {conversation.funnel}
                            </div>

                            <div className="mt-1 truncate text-sm text-slate-500">
                                {conversation.stage}
                            </div>
                        </div>

                        <button className="text-sm font-bold text-red">Alterar</button>
                    </div>
                </DetailSection>

                <DetailSection title="Resumo IA ✨">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-sm leading-relaxed text-slate-600">
                            Cliente interessada em FIV, perguntou sobre modalidade
                            online/presencial e pediu horários para esta semana.
                        </p>

                        <div className="mt-3 inline-flex rounded-xl bg-green-soft px-3 py-1.5 text-xs font-bold text-green">
                            Intenção: Agendar avaliação
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Notas internas">
                    <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-soft text-xs font-bold text-purple">
                                RO
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-bold text-slate-800">
                                        Roberta Oliveira
                                    </div>

                                    <div className="text-xs text-slate-400">Hoje, 10:20</div>
                                </div>

                                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                    Cliente veio por {conversation.origin}. Parece estar pronta para agendar.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">
                            Adicionar nota...
                        </div>
                    </div>
                </DetailSection>

                <DetailSection title="Dados CRM">
                    <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm">
                        <CrmRow icon={<Bot size={16} />} label="Origem:" value={conversation.origin} />
                        <CrmRow icon={<Tag size={16} />} label="Campanha:" value={conversation.campaign} />
                        <CrmRow icon={<Clock size={16} />} label="Último contato:" value={conversation.lastContact} />
                        <CrmRow icon={<User size={16} />} label="Responsável:" value={conversation.responsible} />
                    </div>
                </DetailSection>
            </div>

            <button
                type="button"
                className="mt-5 flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red px-5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            >
                Abrir perfil completo
                <ExternalLink size={17} />
            </button>
        </aside>
    );
}

function InboxTab({
                      label,
                      active,
                      onClick,
                  }: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer rounded-lg transition-colors ${
                active ? "bg-red text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
            }`}
        >
            {label}
        </button>
    );
}

function ConversationListItem({
                                  conversation,
                                  active,
                                  onClick,
                              }: {
    conversation: Conversation;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`grid w-full cursor-pointer grid-cols-[54px_1fr_auto] items-center gap-3 rounded-2xl border px-3 py-4 text-left transition-colors ${
                active
                    ? "border-red bg-red-soft/70"
                    : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
        >
            <Avatar initials={conversation.initials} channel={conversation.channel} />

            <div className="min-w-0">
                <div className="truncate font-bold text-slate-950">
                    {conversation.name}
                </div>

                <div className="mt-1 truncate text-sm text-slate-500">
                    {conversation.preview}
                </div>

                <div className="mt-2">
                    <ChannelBadge channel={conversation.channel} />
                </div>
            </div>

            <div className="flex h-full flex-col items-end justify-between">
                <span className={active ? "text-xs font-bold text-red" : "text-xs text-slate-500"}>
                    {conversation.time}
                </span>

                {conversation.unread > 0 && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red text-xs font-bold text-white">
                        {conversation.unread}
                    </span>
                )}
            </div>
        </button>
    );
}

function MessageBubble({
                           message,
                       }: {
    message: Conversation["messages"][number];
}) {
    const isAttendant = message.from === "attendant";

    return (
        <div className={`flex ${isAttendant ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[58%] rounded-2xl px-4 py-3 shadow-sm ${
                    isAttendant
                        ? "rounded-br-sm bg-red text-white"
                        : "rounded-bl-sm bg-white text-slate-800"
                }`}
            >
                <p className="text-sm leading-relaxed">{message.text}</p>

                <div
                    className={`mt-2 text-right text-xs ${
                        isAttendant ? "text-white/80" : "text-slate-400"
                    }`}
                >
                    {message.time}
                    {isAttendant ? " ✓✓" : ""}
                </div>
            </div>
        </div>
    );
}

function ChannelFilterButton({
                                 channel,
                                 active,
                                 onClick,
                             }: {
    channel: Channel;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                active
                    ? "border-red bg-red-soft text-red"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
            <ChannelIcon channel={channel} />
            {getChannelLabel(channel)}
        </button>
    );
}

function ChannelBadge({ channel }: { channel: Channel }) {
    const className =
        channel === "whatsapp"
            ? "bg-green-soft text-green"
            : channel === "instagram"
                ? "bg-pink-soft text-pink"
                : "bg-blue-soft text-blue";

    return (
        <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold ${className}`}
        >
            <ChannelIcon channel={channel} />
            {getChannelLabel(channel)}
        </span>
    );
}

function ChannelIcon({ channel }: { channel: Channel }) {
    if (channel === "whatsapp") {
        return <FaWhatsapp size={14} />;
    }

    if (channel === "instagram") {
        return <FaInstagram size={14} />;
    }

    return <FaFacebook size={14} />;
}

function Avatar({
                    initials,
                    channel,
                }: {
    initials: string;
    channel: Channel;
}) {
    const className =
        channel === "whatsapp"
            ? "bg-green-soft text-green"
            : channel === "instagram"
                ? "bg-purple-soft text-purple"
                : "bg-blue-soft text-blue";

    return (
        <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ${className}`}
        >
            {initials}
        </div>
    );
}

function DetailSection({
                           title,
                           children,
                       }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-5">
            <h3 className="mb-3 text-sm font-bold text-slate-950">{title}</h3>
            {children}
        </section>
    );
}

function CrmRow({
                    icon,
                    label,
                    value,
                }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-[22px_1fr_1.2fr] items-center gap-2 text-slate-500">
            <span className="text-slate-400">{icon}</span>
            <span>{label}</span>
            <span title={value} className="truncate font-bold text-slate-700">
                {value}
            </span>
        </div>
    );
}

function ComposerButton({
                            icon,
                            label,
                        }: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
        >
            {icon}
            {label}
        </button>
    );
}

function getChannelLabel(channel: Channel) {
    const labels: Record<Channel, string> = {
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        facebook: "Facebook",
    };

    return labels[channel];
}