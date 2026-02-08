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
    // 2=IN(True), 3=OUT(False)

    console.log(`[API] BLE Event: Device=${deviceId} Tag=${tagId} Type=${eventType} RSSI=${rssi}`);

    try {
        await prisma.accessLog.create({
            data: {
                deviceId: deviceId,
                cardId: tagId, // Store BLE Tag ID in cardId column
                type: eventType,
                access: true, // It's a tracking event
                message: `BLE Event: Tag ${tagId} ${status === "2" ? "Entered/Detected" : "Exited/Left"}. Signal: ${rssi || 'N/A'}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("BLE Event Log Error:", e);
        // Even if DB fails, return 200 to ESP so it doesn't retry endlessly or panic
        return NextResponse.json({ success: true, warning: "Log Failed" });
    }
}
