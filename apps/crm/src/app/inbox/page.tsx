// src/app/inbox/page.tsx
"use client";

import {useMemo, useState} from "react";
import {
    Bot,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Filter,
    Funnel,
    MapPin,
    MoreVertical,
    Paperclip,
    Search,
    Send,
    SlidersHorizontal,
    Smile,
    UserRound,
} from "lucide-react";
import {FaFacebookF, FaInstagram, FaWhatsapp} from "react-icons/fa6";

import {Card} from "@engravida/components";
import {InitialsAvatar} from "@engravida/components/conversations/InitialsAvatar";
import SidePanelCRM from "../../components/layout/SidePanelCRM";

type InboxStatus = "open" | "pending" | "closed";
type Channel = "WhatsApp" | "Instagram" | "Facebook";

type Conversation = {
    id: string;
    name: string;
    initials: string;
    phone: string;
    channel: Channel;
    preview: string;
    time: string;
    unread?: number;
    status: InboxStatus;
    city: string;
    funnel: string;
    funnelStage: string;
    intent: string;
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
    notes: {
        author: string;
        time: string;
        text: string;
    }[];
};

const conversations: Conversation[] = [
    {
        id: "1",
        name: "Tamiris",
        initials: "TA",
        phone: "55 11 98261-9605",
        channel: "WhatsApp",
        preview: "Oi, queria saber valores da FIV",
        time: "5 min",
        unread: 3,
        status: "open",
        city: "São Paulo",
        funnel: "Funil FIV",
        funnelStage: "Avaliação Agendada",
        intent: "Agendar avaliação",
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
        notes: [
            {
                author: "Roberta Oliveira",
                time: "Hoje, 10:20",
                text: "Cliente veio por Google Ads. Parece estar pronta para agendar.",
            },
        ],
    },
    {
        id: "2",
        name: "Ana Clara",
        initials: "AC",
        phone: "55 19 99812-4421",
        channel: "Instagram",
        preview: "Perfeito, qual unidade fica melhor?",
        time: "18 min",
        status: "open",
        city: "Campinas",
        funnel: "Funil Consulta",
        funnelStage: "Escolha de unidade",
        intent: "Escolher unidade",
        origin: "Instagram",
        campaign: "bio-instagram",
        responsible: "Natália Rocha",
        lastContact: "18 min",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Perfeito, qual unidade fica melhor?",
                time: "10:07",
            },
            {
                id: "m2",
                from: "attendant",
                text: "Posso te ajudar com isso. Você está em qual cidade?",
                time: "10:09",
            },
        ],
        notes: [],
    },
    {
        id: "3",
        name: "Juliana Costa",
        initials: "JC",
        phone: "55 11 97654-3321",
        channel: "WhatsApp",
        preview: "Tenho consulta marcada amanhã",
        time: "32 min",
        status: "pending",
        city: "São Paulo",
        funnel: "Funil Consulta",
        funnelStage: "Consulta marcada",
        intent: "Confirmar presença",
        origin: "WhatsApp",
        campaign: "retorno-organico",
        responsible: "Roberta Oliveira",
        lastContact: "32 min",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Tenho consulta marcada amanhã, queria confirmar o horário.",
                time: "09:53",
            },
        ],
        notes: [],
    },
    {
        id: "4",
        name: "Camila Souza",
        initials: "CS",
        phone: "55 21 98711-0021",
        channel: "Facebook",
        preview: "Pode me mandar os exames?",
        time: "1 h",
        unread: 1,
        status: "open",
        city: "Rio de Janeiro",
        funnel: "Funil FIV",
        funnelStage: "Envio de exames",
        intent: "Coletar exames",
        origin: "Facebook Ads",
        campaign: "fiv-rj-leads",
        responsible: "Natália Rocha",
        lastContact: "1 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Pode me mandar os exames?",
                time: "09:12",
            },
        ],
        notes: [],
    },
    {
        id: "5",
        name: "Vanessa Carvalho",
        initials: "VC",
        phone: "55 11 99101-7777",
        channel: "WhatsApp",
        preview: "Obrigada! vou confirmar com meu marido",
        time: "2 h",
        status: "pending",
        city: "São Paulo",
        funnel: "Funil FIV",
        funnelStage: "Aguardando decisão",
        intent: "Pediu para pensar",
        origin: "Google Ads",
        campaign: "engravida-sao-paulo",
        responsible: "Roberta Oliveira",
        lastContact: "2 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Obrigada! vou confirmar com meu marido",
                time: "08:20",
            },
        ],
        notes: [],
    },
    {
        id: "6",
        name: "Marina Lopes",
        initials: "ML",
        phone: "55 11 94321-2200",
        channel: "WhatsApp",
        preview: "Quais horários vocês têm amanhã?",
        time: "2 h",
        status: "open",
        city: "São Paulo",
        funnel: "Funil Consulta",
        funnelStage: "Escolha de horário",
        intent: "Agendar avaliação",
        origin: "Google Ads",
        campaign: "consulta-online",
        responsible: "Roberta Oliveira",
        lastContact: "2 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Quais horários vocês têm amanhã?",
                time: "08:11",
            },
        ],
        notes: [],
    },
    {
        id: "7",
        name: "Paula Mendes",
        initials: "PM",
        phone: "55 19 95544-8811",
        channel: "Instagram",
        preview: "O atendimento é online?",
        time: "3 h",
        status: "open",
        city: "Limeira",
        funnel: "Funil FIV",
        funnelStage: "Dúvida inicial",
        intent: "Responder informação",
        origin: "Instagram",
        campaign: "stories-fiv",
        responsible: "Natália Rocha",
        lastContact: "3 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "O atendimento é online?",
                time: "07:40",
            },
        ],
        notes: [],
    },
    {
        id: "8",
        name: "Bianca Reis",
        initials: "BR",
        phone: "55 11 93210-3001",
        channel: "Facebook",
        preview: "Gostaria de saber sobre valores",
        time: "4 h",
        status: "open",
        city: "Santo André",
        funnel: "Funil Consulta",
        funnelStage: "Preço apresentado",
        intent: "Objeção de preço",
        origin: "Facebook Ads",
        campaign: "valor-consulta",
        responsible: "Roberta Oliveira",
        lastContact: "4 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Gostaria de saber sobre valores",
                time: "06:30",
            },
        ],
        notes: [],
    },
    {
        id: "9",
        name: "Carolina Vieira",
        initials: "CV",
        phone: "55 11 90090-1212",
        channel: "WhatsApp",
        preview: "Consigo remarcar minha consulta?",
        time: "5 h",
        status: "pending",
        city: "São Paulo",
        funnel: "Funil Consulta",
        funnelStage: "Reagendamento",
        intent: "Reagendar consulta",
        origin: "WhatsApp",
        campaign: "retorno-organico",
        responsible: "Natália Rocha",
        lastContact: "5 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Consigo remarcar minha consulta?",
                time: "05:50",
            },
        ],
        notes: [],
    },
    {
        id: "10",
        name: "Fernanda Nunes",
        initials: "FN",
        phone: "55 21 96555-4444",
        channel: "WhatsApp",
        preview: "Quero entender os próximos passos",
        time: "6 h",
        status: "open",
        city: "Rio de Janeiro",
        funnel: "Funil FIV",
        funnelStage: "Explicação do tratamento",
        intent: "Explicar tratamento",
        origin: "Google Ads",
        campaign: "fiv-rj",
        responsible: "Roberta Oliveira",
        lastContact: "6 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Quero entender os próximos passos",
                time: "04:20",
            },
        ],
        notes: [],
    },
    {
        id: "11",
        name: "Letícia Ramos",
        initials: "LR",
        phone: "55 11 97770-0110",
        channel: "Instagram",
        preview: "Vou ver com meu parceiro",
        time: "7 h",
        status: "pending",
        city: "São Paulo",
        funnel: "Funil FIV",
        funnelStage: "Aguardando decisão",
        intent: "Pediu para pensar",
        origin: "Instagram",
        campaign: "bio-instagram",
        responsible: "Natália Rocha",
        lastContact: "7 h",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Vou ver com meu parceiro",
                time: "03:12",
            },
        ],
        notes: [],
    },
    {
        id: "12",
        name: "Renata Alves",
        initials: "RA",
        phone: "55 11 92222-6789",
        channel: "WhatsApp",
        preview: "Obrigada pelo atendimento",
        time: "1 d",
        status: "closed",
        city: "São Paulo",
        funnel: "Funil Consulta",
        funnelStage: "Finalizada",
        intent: "Recebeu informação",
        origin: "WhatsApp",
        campaign: "retorno-organico",
        responsible: "Roberta Oliveira",
        lastContact: "1 d",
        messages: [
            {
                id: "m1",
                from: "client",
                text: "Obrigada pelo atendimento",
                time: "Ontem",
            },
        ],
        notes: [],
    },
];

const PAGE_SIZE = 10;

const scrollbarClass =
    "[scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]";

export default function InboxPage() {
    const [status, setStatus] = useState<InboxStatus>("open");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const matchesStatus = conversation.status === status;
            const normalizedSearch = search.trim().toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                conversation.name.toLowerCase().includes(normalizedSearch) ||
                conversation.phone.toLowerCase().includes(normalizedSearch) ||
                conversation.preview.toLowerCase().includes(normalizedSearch);

            return matchesStatus && matchesSearch;
        });
    }, [status, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredConversations.length / PAGE_SIZE)
    );

    const paginatedConversations = filteredConversations.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const selectedConversation =
        conversations.find((conversation) => conversation.id === selectedId) ??
        conversations[0];

    function handleStatusChange(nextStatus: InboxStatus) {
        setStatus(nextStatus);
        setCurrentPage(1);
    }

    return (
        <main className="flex h-screen w-screen overflow-hidden bg-white text-slate-900">
            <SidePanelCRM affectLayout={false} defaultExpanded={false}/>

            <section
                className="grid h-screen min-w-0 flex-1 grid-cols-[minmax(270px,22vw)_minmax(420px,1fr)_minmax(285px,22vw)] gap-3 px-3 py-3">
                <ConversationListPanel
                    status={status}
                    onStatusChange={handleStatusChange}
                    search={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                    conversations={paginatedConversations}
                    totalConversations={filteredConversations.length}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    selectedConversationId={selectedConversation?.id ?? ""}
                    onSelectConversation={setSelectedId}
                />

                <ChatPanel conversation={selectedConversation}/>

                <CustomerPanel conversation={selectedConversation}/>
            </section>
        </main>
    );
}

function ConversationListPanel({
                                   status,
                                   onStatusChange,
                                   search,
                                   onSearchChange,
                                   conversations,
                                   totalConversations,
                                   totalPages,
                                   currentPage,
                                   onPageChange,
                                   selectedConversationId,
                                   onSelectConversation,
                               }: {
    status: InboxStatus;
    onStatusChange: (status: InboxStatus) => void;
    search: string;
    onSearchChange: (value: string) => void;
    conversations: Conversation[];
    totalConversations: number;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    selectedConversationId: string;
    onSelectConversation: (id: string) => void;
}) {
    return (
        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="mb-5 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    Inbox
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Atendimento omnichannel em tempo real
                </p>
            </div>

            <div className="mb-4 grid h-10 shrink-0 grid-cols-3 rounded-xl border border-slate-200 bg-white p-1">
                <InboxStatusButton
                    active={status === "open"}
                    onClick={() => onStatusChange("open")}
                >
                    Abertas
                </InboxStatusButton>

                <InboxStatusButton
                    active={status === "pending"}
                    onClick={() => onStatusChange("pending")}
                >
                    Pendentes
                </InboxStatusButton>

                <InboxStatusButton
                    active={status === "closed"}
                    onClick={() => onStatusChange("closed")}
                >
                    Fechadas
                </InboxStatusButton>
            </div>

            <div className="mb-4 flex shrink-0 gap-3">
                <div
                    className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
                    <Search size={18} className="shrink-0 text-slate-400"/>

                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Buscar conversas..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </div>

                <button
                    type="button"
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                    <SlidersHorizontal size={18}/>
                </button>
            </div>

            <div
                className={`min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 ${scrollbarClass}`}
            >
                {conversations.map((conversation) => (
                    <ConversationListItem
                        key={conversation.id}
                        conversation={conversation}
                        active={conversation.id === selectedConversationId}
                        onClick={() => onSelectConversation(conversation.id)}
                    />
                ))}

                {conversations.length === 0 && (
                    <div
                        className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                        Nenhuma conversa encontrada.
                    </div>
                )}

                {totalConversations > 0 && (
                    <div className="space-y-4 py-3">
                        <div className="flex items-center justify-between px-2 text-sm text-slate-500">
                            <span>
                                Mostrando{" "}
                                {Math.min(
                                    (currentPage - 1) * PAGE_SIZE + 1,
                                    totalConversations
                                )}
                                –{Math.min(currentPage * PAGE_SIZE, totalConversations)}{" "}
                                de {totalConversations} conversas
                            </span>
                        </div>

                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>
        </section>
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
            className={`grid w-full cursor-pointer grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                active
                    ? "border-brand bg-brand-soft/50 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
        >
            <InitialsAvatar name={conversation.name}/>

            <div className="min-w-0">
                <div
                    title={conversation.name}
                    className="truncate font-bold text-slate-950"
                >
                    {conversation.name}
                </div>

                <div
                    title={conversation.preview}
                    className="mt-1 truncate text-sm text-slate-500"
                >
                    {conversation.preview}
                </div>

                <div className="mt-2">
                    <ChannelBadge channel={conversation.channel}/>
                </div>
            </div>

            <div className="flex h-full shrink-0 flex-col items-end justify-between">
                <span
                    className={`whitespace-nowrap text-xs font-medium ${
                        active ? "text-brand" : "text-slate-500"
                    }`}
                >
                    {conversation.time}
                </span>

                {conversation.unread ? (
                    <span
                        className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand px-2 text-xs font-bold text-white">
                        {conversation.unread}
                    </span>
                ) : (
                    <span/>
                )}
            </div>
        </button>
    );
}

function ChatPanel({conversation}: { conversation: Conversation }) {
    return (
        <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-0">
            <div
                className="grid pb-3 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-5">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="shrink-0">
                        <InitialsAvatar name={conversation.name}/>
                    </div>

                    <div className="min-w-0">
                        <div
                            title={conversation.name}
                            className="truncate whitespace-nowrap text-xl font-bold text-slate-950"
                        >
                            {conversation.name}
                        </div>

                        <div
                            className="mt-1 flex min-w-0 items-center gap-3 overflow-hidden whitespace-nowrap text-sm text-slate-500">
                            <span className="shrink-0">{conversation.channel}</span>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green"/>
                            <span className="shrink-0">Online agora</span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
<span className="whitespace-nowrap rounded-xl bg-green-soft px-3 py-2 text-xs font-bold text-green">
    Em atendimento
                    </span>

                    <span className="whitespace-nowrap rounded-xl bg-brand-soft px-3 py-2 text-xs font-bold text-brand">
                        FIV
                    </span>

                    <button
                        type="button"
                        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    >
                        <MoreVertical size={18}/>
                    </button>
                </div>
            </div>

            <div
                className={`min-h-0 flex-1 overflow-y-auto bg-slate-50/40 px-5 py-5 ${scrollbarClass}`}
            >
                <div className="mb-6 flex items-center justify-center gap-4">
                    <div className="h-px w-44 bg-slate-200"/>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                        Hoje
                    </span>
                    <div className="h-px w-44 bg-slate-200"/>
                </div>

                <div className="space-y-6">
                    {conversation.messages.map((message) => (
                        <ChatBubble key={message.id} message={message}/>
                    ))}
                </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 p-1 px-2 pb-0">
                <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <textarea
                        rows={1}
                        placeholder="Responder como atendente..."
                        className="max-h-28 min-h-[34px] min-w-0 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none placeholder:text-slate-400"
                        onInput={(event) => {
                            const target = event.currentTarget;

                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />

                    <div className="flex shrink-0 items-center gap-1 pb-1">
                        <button
                            type="button"
                            title="Emoji"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        >
                            <Smile size={18}/>
                        </button>

                        <button
                            type="button"
                            title="Template"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        >
                            <FileText size={18}/>
                        </button>

                        <button
                            type="button"
                            title="Anexo"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                        >
                            <Paperclip size={18}/>
                        </button>

                        <button
                            type="button"
                            title="Enviar"
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-colors hover:bg-brand/90"
                        >
                            <Send size={17}/>
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function ChatBubble({
                        message,
                    }: {
    message: Conversation["messages"][number];
}) {
    const isAttendant = message.from === "attendant";

    return (
        <div className={`flex ${isAttendant ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[min(72%,520px)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isAttendant
                        ? "rounded-br-sm bg-brand text-white"
                        : "rounded-bl-sm bg-white text-slate-800"
                }`}
            >
                <p>{message.text}</p>

                <div
                    className={`text-right text-xs ${
                        isAttendant ? "text-white/80" : "text-slate-400"
                    }`}
                >
                    {message.time}
                </div>
            </div>
        </div>
    );
}

function CustomerPanel({conversation}: { conversation: Conversation }) {
    return (
        <aside
            className={`h-full min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${scrollbarClass}`}
        >
            <h2 className="mb-4 text-lg font-bold text-slate-950">Cliente</h2>

            <button
                className="mb-5 flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-4">
                    <InitialsAvatar name={conversation.name}/>

                    <div className="min-w-0">
                        <div
                            title={conversation.name}
                            className="truncate font-bold text-slate-950"
                        >
                            {conversation.name}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                            {conversation.phone}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin size={13}/>
                            <span className="truncate">{conversation.city}</span>
                        </div>

                        <div className="mt-2">
                            <ChannelBadge channel={conversation.channel}/>
                        </div>
                    </div>
                </div>

                <ChevronRight size={18} className="shrink-0 text-slate-400"/>
            </button>

            <PanelBlock>
                <div className="group/funnel relative rounded-2xl border border-slate-200 p-4">
                    <div
                        className="pointer-events-none absolute right-3 top-3 z-30 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/funnel:pointer-events-auto group-hover/funnel:opacity-100">
                        <button
                            type="button"
                            title="Retroceder"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            <ChevronLeft size={16}/>
                        </button>

                        <button
                            type="button"
                            title="Avançar"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            <ChevronRight size={16}/>
                        </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                            <Funnel size={18}/>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div
                                title={conversation.funnel}
                                className="text-sm font-bold text-slate-950"
                            >
                                {conversation.funnel}
                            </div>

                            <div
                                title={conversation.funnelStage}
                                className="mt-1 text-sm text-slate-500"
                            >
                                {conversation.funnelStage}
                            </div>
                        </div>
                    </div>
                </div>
            </PanelBlock>

            <PanelBlock title="Notas internas">
                <div className="rounded-2xl border border-slate-200 p-4">
                    {conversation.notes.length > 0 ? (
                        <div className="space-y-3">
                            {conversation.notes.map((note) => (
                                <div key={`${note.author}-${note.time}`} className="flex gap-3">
                                    <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-soft text-xs font-bold text-purple">
                                        {getInitials(note.author)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div
                                                title={note.author}
                                                className="truncate text-xs font-bold text-slate-800"
                                            >
                                                {note.author}
                                            </div>

                                            <div className="shrink-0 text-xs text-slate-400">
                                                {note.time}
                                            </div>
                                        </div>

                                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                            {note.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Nenhuma nota interna.
                        </p>
                    )}

                    <input
                        placeholder="Adicionar nota..."
                        className="mt-4 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none placeholder:text-slate-400"
                    />
                </div>
            </PanelBlock>

            <PanelBlock title="Dados CRM">
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm">
                    <CrmDataRow icon={<Bot size={16}/>} label="Origem:" value={conversation.origin}/>
                    <CrmDataRow icon={<Filter size={16}/>} label="Campanha:" value={conversation.campaign}/>
                    <CrmDataRow icon={<Clock size={16}/>} label="Último contato:" value={conversation.lastContact}/>
                    <CrmDataRow icon={<UserRound size={16}/>} label="Responsável:" value={conversation.responsible}/>
                </div>
            </PanelBlock>
        </aside>
    );
}

function InboxStatusButton({
                               active,
                               onClick,
                               children,
                           }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`cursor-pointer rounded-lg text-xs font-bold transition-colors ${
                active
                    ? "bg-brand text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
            {children}
        </button>
    );
}

function ChannelBadge({channel}: { channel: Channel }) {
    const className =
        channel === "WhatsApp"
            ? "bg-green-soft text-green"
            : channel === "Instagram"
                ? "bg-pink-soft text-pink"
                : "bg-blue-soft text-blue";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold ${className}`}
        >
            <ChannelIcon channel={channel}/>
            {channel}
        </span>
    );
}

function ChannelIcon({channel}: { channel: Channel }) {
    if (channel === "WhatsApp") {
        return <FaWhatsapp size={14}/>;
    }

    if (channel === "Instagram") {
        return <FaInstagram size={14}/>;
    }

    return <FaFacebookF size={13}/>;
}

function PanelBlock({
                        title,
                        children,
                    }: {
    title?: string | null;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-4">
            {title && (
                <h3 className="mb-2.5 text-base font-bold text-slate-950">{title}</h3>
            )

            }
            {children}
        </div>
    );
}

function CrmDataRow({
                        icon,
                        label,
                        value,
                    }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-[22px_1fr_1.25fr] items-center gap-2">
            <div className="text-slate-400">{icon}</div>
            <div className="text-slate-500">{label}</div>
            <div title={value} className="truncate font-bold text-slate-700">
                {value}
            </div>
        </div>
    );
}

function Pagination({
                        totalPages,
                        currentPage,
                        onPageChange,
                    }: {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2">
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft size={17}/>
            </button>

            {Array.from({length: totalPages}).map((_, index) => {
                const page = index + 1;

                return (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                            page === currentPage
                                ? "bg-brand-soft text-brand"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight size={17}/>
            </button>
        </div>
    );
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/);

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}