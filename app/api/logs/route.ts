import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const guestId = searchParams.get("guestId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!roomId && !guestId) return NextResponse.json({ error: "Missing roomId or guestId" }, { status: 400 });

    try {
        let whereCondition: any = {};
        let orConditions: any[] = [];

        // 1. FILTER BY GUEST ID
        if (guestId) {
            // Find Guest and include Room to get Device ID
            const guest = await prisma.guest.findUnique({
                where: { id: guestId },
                include: { room: true }
            });

            if (guest) {
                // Combine Device ID matches AND Card ID matches

                // a) Logs from their assigned Room Device (Guests + Staff entering their room)
                if (guest.room && guest.room.deviceId) {
                    orConditions.push({ deviceId: guest.room.deviceId });
                }

                // b) Logs from their Card (Them entering their room OR other areas like Gym/Main Gate)
                if (guest.rfidCardId) {
                    orConditions.push({ cardId: guest.rfidCardId });
                }

                // If no device config and no card, we can't find logs
                if (orConditions.length === 0) {
                    return NextResponse.json([]);
                }
            } else {
                return NextResponse.json({ error: "Guest not found" }, { status: 404 });
            }
        }
        // 2. FILTER BY ROOM ID
        else if (roomId) {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                include: { currentGuest: true }
            });

            if (room) {
                if (room.deviceId) {
                    orConditions.push({ deviceId: room.deviceId });
                }
                // Optional: Also show logs of the current guest? Maybe confusing. 
                // Let's stick to Room Device logs for Room View.
                else {
                    return NextResponse.json([]);
                }
            } else {
                return NextResponse.json({ error: "Room not found" }, { status: 404 });
            }
        }

        // Apply OR conditions if they exist
        if (orConditions.length > 0) {
            whereCondition.OR = orConditions;
        }

        // 3. Date Range Filter
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.timestamp = {
                gte: startDate,
                lte: endDate
            };
        }

        // 4. Execute Query
        const logs = await prisma.accessLog.findMany({
            where: whereCondition,
            orderBy: { timestamp: 'desc' },
            take: 100
        });

        return NextResponse.json(logs);

    } catch (error) {
        console.error("Logs Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
