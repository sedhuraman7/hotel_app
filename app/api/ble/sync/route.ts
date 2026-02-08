import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { deviceId, ble_devices } = body;

        console.log(`[API] BLE Sync Limit: Received data for device ${deviceId}`);

        if (!deviceId || !ble_devices || !Array.isArray(ble_devices)) {
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { deviceId },
            include: { currentGuest: true }
        });

        if (!room) {
            console.log(`[API] BLE Sync: Device ${deviceId} not linked to any room.`);
            return NextResponse.json({ error: "Device not found" }, { status: 404 });
        }

        // Logic: Check if current guest's phone (if we had MAC) is nearby?
        // Sort by signal strength
        const sortedDevices = ble_devices.sort((a: any, b: any) => b.rssi - a.rssi);
        const nearest = sortedDevices[0];
        const count = ble_devices.length;

        console.log(`[API] BLE Sync: Device=${deviceId}, Count=${count}, Nearest=${nearest?.mac || 'None'} (${nearest?.rssi || 0})`);

        // Update AccessLog for visibility
        // Log "BLE Sync" event so it appears in logs
        try {
            await prisma.accessLog.create({
                data: {
                    deviceId: deviceId || "unknown",
                    cardId: nearest?.mac || "BLE-SCAN",
                    type: "BLE Sync",
                    access: true,
                    message: `BLE Scan: ${count} devices found. Max Signal: ${nearest?.rssi || 'N/A'}`
                }
            });
        } catch (logErr) {
            console.error("Failed to log BLE Sync:", logErr);
        }

        if (nearest && nearest.rssi > -60) {
            // Assume someone is inside
            // We could update a "lastPresenceDetected" timestamp on the Room if we had one
        }

        return NextResponse.json({ status: "scanned", count: ble_devices.length });

    } catch (error) {
        console.error("BLE Sync Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
