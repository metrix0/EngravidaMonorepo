import { NextResponse } from "next/server";

import { supabase } from "@engravida/lib";

export async function GET() {
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
        return NextResponse.json({
            ok: true,
            user: null,
            attendant: null,
        });
    }

    const { data: attendant, error: attendantError } = await supabase
        .from("attendants")
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
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (attendantError) {
        return NextResponse.json(
            { ok: false, error: attendantError.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        ok: true,
        user: {
            id: user.id,
            email: user.email ?? null,
        },
        attendant,
    });
}