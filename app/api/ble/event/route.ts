import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("device_id");
    const tagId = searchParams.get("tag_id");
    const status = searchParams.get("status"); // 2=Entry, 3=Exit
    const rssi = searchParams.get("rssi");

    if (!deviceId || !tagId || !status) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Determine type
    const eventType = status === "2" ? "BLE Entry" : "BLE Exit";
    const access = status === "2"; // Entry is "Access", Exit is just log? Or both are info?
    // Let's mark both as "Authorized" usage, or just Info.
    // 2=IN(True), 3=OUT(False in boolean? No. Just log it).

    console.log(`[API] BLE Event: Device=${deviceId} Tag=${tagId} Type=${eventType}`);

    try {
        await prisma.accessLog.create({
            data: {
                deviceId: deviceId,
                cardId: tagId, // Store BLE Tag ID in cardId column
                type: eventType,
                access: true, // It's a tracking event, not a denial
                message: `BLE Tag ${tagId} ${status === "2" ? "Detected" : "Left"} (RSSI: ${rssi || 'N/A'})`
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}
