import { NextResponse } from "next/server";

import { supabase } from "@engravida/lib/supabase/client";
import type { ClientNote } from "@/types/inbox";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ threadId: string }> }
) {
    const { threadId } = await params;
    const body = await request.json();

    const text = String(body.text ?? "").trim();
    const authorName = String(body.author_name ?? "Atendente").trim();

    if (!text) {
        return NextResponse.json(
            { ok: false, error: "Note text is required" },
            { status: 400 }
        );
    }

    const { data: thread, error: threadError } = await supabase
        .from("thread")
        .select(`
            id,
            client_id,
            clients (
                id,
                notes
            )
        `)
        .eq("id", threadId)
        .single();

    if (threadError) {
        return NextResponse.json(
            { ok: false, error: threadError.message },
            { status: 500 }
        );
    }

    const client = thread.clients as any;
    const currentNotes = Array.isArray(client?.notes)
        ? (client.notes as ClientNote[])
        : [];

    const note: ClientNote = {
        id: crypto.randomUUID(),
        author_name: authorName,
        text,
        created_at: new Date().toISOString(),
    };

    const nextNotes = [note, ...currentNotes];

    const { error: updateError } = await supabase
        .from("clients")
        .update({ notes: nextNotes })
        .eq("id", thread.client_id);

    if (updateError) {
        return NextResponse.json(
            { ok: false, error: updateError.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        note,
    });
}