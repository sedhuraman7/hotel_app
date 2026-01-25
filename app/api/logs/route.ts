import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const guestId = searchParams.get("guestId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!roomId && !guestId) return NextResponse.json({ error: "Missing roomId or guestId" }, { status: 400 });

    let logs = db.getLogs();

    // FILTER BY GUEST ID
    if (guestId) {
        // Try to find if this guestId is actually a cardId (simplest fallback)
        // Or search rooms for this guest
        let foundCardId = null;

        // 1. Check if guestId matches a Card ID directly (if passed from frontend)
        // 2. Or if it's a Guest Database ID, find the card.
        // For this demo, let's assume the ID passed IS the Card ID for simplicity,
        // OR search the rooms.

        const rooms = db.getRooms();
        for (const r of rooms) {
            // Check if guest object exists and matches ID
            if (r.currentGuest && (r.currentGuest as any).id === guestId) {
                foundCardId = r.currentGuest.cardId;
                break;
            }
        }

        if (foundCardId) {
            logs = logs.filter(l => l.cardId === foundCardId);
        } else {
            // Fallback: Assume the ID passed is a Card ID or Guest Name match?
            // Let's filter by cardId = guestId
            logs = logs.filter(l => l.cardId === guestId);
        }
    }
    // FILTER BY ROOM ID
    else if (roomId) {
        const room = db.getRoomById(roomId);
        let targetDeviceId = room?.deviceId;

        if (targetDeviceId) {
            logs = logs.filter(l => l.deviceId === targetDeviceId);
        } else {
            if (room?.currentGuest?.cardId) {
                logs = logs.filter(l => l.cardId === room.currentGuest!.cardId);
            } else {
                logs = [];
            }
        }
    }

    // Filter by Date Range
    if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        logs = logs.filter(l => {
            const logTime = new Date(l.timestamp);
            return logTime >= startDate && logTime <= endDate;
        });
    }

    return NextResponse.json(logs);
}
