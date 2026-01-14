import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("card_id");
    const deviceId = searchParams.get("device_id") || "unknown";
    const access = searchParams.get("access") === "granted";
    const type = searchParams.get("type");

    if (!cardId) return NextResponse.json({ error: "Missing card_id" }, { status: 400 });

    console.log(`[API] Log Transaction: Card=${cardId} Access=${access}`);

    db.addLog({
        deviceId,
        cardId,
        type: type || "unknown",
        access,
        message: access ? "Entry Granted" : "Entry Denied"
    });

    return NextResponse.json({ success: true });
}
