import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // body: { deviceId, ble_devices: [ { mac, rssi }, ... ] }

        const { deviceId, ble_devices } = body;

        if (!deviceId || !ble_devices || !Array.isArray(ble_devices)) {
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { deviceId },
            include: { currentGuest: true }
        });

        if (!room) return NextResponse.json({ error: "Device not found" }, { status: 404 });

        // Logic: Check if current guest's phone (if we had MAC) is nearby?
        // OR simply log the "Occupancy" state if RSSI is strong.

        // For now, let's just Log the Strongest Signal for Debugging
        const nearest = ble_devices.sort((a, b) => b.rssi - a.rssi)[0];

        if (nearest && nearest.rssi > -60) {
            // Assume someone is inside
            // We could update a "lastPresenceDetected" timestamp on the Room
        }

        return NextResponse.json({ status: "scanned", count: ble_devices.length });

    } catch (error) {
        console.error("BLE Sync Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
