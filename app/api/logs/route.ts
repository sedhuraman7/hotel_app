import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!roomId) return NextResponse.json({ error: "Missing roomId" }, { status: 400 });

    // 1. Find Device ID for Room
    const room = db.getRoomById(roomId);

    // If room not found or no device assigned, return empty or all logs?
    // Let's return empty if no device binding found
    // Or if we want to show logs for UNKNOWN logs that matched a card assigned to this room? 
    // Best: Filter by Device ID attached to Room.

    let targetDeviceId = room?.deviceId;

    // Get All Logs
    let logs = db.getLogs();

    // Filter by Device ID if room has one
    if (targetDeviceId) {
        logs = logs.filter(l => l.deviceId === targetDeviceId);
    } else {
        // If room has no device, maybe look for logs where cardId matches current guest?
        // For now, return empty to be safe
        // return NextResponse.json([]);
        // Actually, for demo, if no device ID, let's just return logs relevant to the room's guest card?
        if (room?.currentGuest?.cardId) {
            logs = logs.filter(l => l.cardId === room.currentGuest!.cardId);
        } else {
            // No device, no guest. Return empty.
            // Unless we want to show ALL logs for debugging? No.
            logs = [];
        }
    }

    // Filter by Date Range (Optional)
    if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999); // End of day

        logs = logs.filter(l => {
            const logTime = new Date(l.timestamp);
            return logTime >= startDate && logTime <= endDate;
        });
    }

    return NextResponse.json(logs);
}
