import { NextResponse } from "next/server";

import { supabase } from "@engravida/lib";

export async function POST() {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        return NextResponse.json(
            { ok: false, error: userError.message },
            { status: 500 }
        );
    }

    if (!user) {
        return NextResponse.json(
            { ok: false, error: "Not authenticated" },
            { status: 401 }
        );
    }

    const { data: attendant, error } = await supabase
        .from("attendants")
        .update({
            is_online: true,
        })
        .eq("auth_user_id", user.id)
        .eq("active", true)
        .select(`
            id,
            name,
            email,
            active,
            is_online,
            auth_user_id,
            units (
                id,
                name
            )
        `)
        .maybeSingle();

    if (error) {
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }

    if (!attendant) {
        return NextResponse.json(
            { ok: false, error: "No active attendant linked to this user" },
            { status: 403 }
        );
    }

    return NextResponse.json({
        ok: true,
        attendant,
    });
}