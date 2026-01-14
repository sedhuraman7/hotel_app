import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("device_id");
    const tagId = searchParams.get("tag_id");
    const status = searchParams.get("status"); // 2 = Entry, 3 = Exit

    if (!deviceId || !tagId || !status) {
        return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const type = status === "2" ? "Entry" : (status === "3" ? "Exit" : "Unknown");

    console.log(`[BLE EVENT] Device: ${deviceId}, Tag: ${tagId}, Event: ${type}`);

    try {
        // Log the event to DB
        await prisma.accessLog.create({
            data: {
                deviceId: deviceId,
                cardId: tagId, // Using cardId field for BLE Tag ID
                type: "BLE " + type, // "BLE Entry" or "BLE Exit"
                access: true,
                message: `BLE Device ${type}`
            }
        });

        return NextResponse.json({ success: true, saved: true });
    } catch (e) {
        console.error("BLE Log Error", e);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}
