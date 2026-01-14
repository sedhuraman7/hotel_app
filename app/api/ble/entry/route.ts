import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tag_id");
    const deviceId = searchParams.get("device_id") || "unknown";

    if (!tagId) return NextResponse.json({ error: "Missing tag_id" }, { status: 400 });

    console.log(`[API] BLE Entry: Tag=${tagId}`);

    db.addLog({
        deviceId,
        cardId: tagId,
        type: "BLE",
        access: true,
        message: "Staff Entered Zone"
    });

    return NextResponse.json({ success: true, message: "Staff Identified" });
}
