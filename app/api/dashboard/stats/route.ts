import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Get Room Stats
        const roomCounts = await prisma.room.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        const statsMap = roomCounts.reduce((acc: any, curr) => {
            acc[curr.status.toLowerCase()] = curr._count.status;
            return acc;
        }, {});

        // 2. Get Recent Logs
        const logs = await prisma.accessLog.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' }
        });

        // 3. Get Total Guests (Active)
        const totalGuests = await prisma.guest.count({
            where: { status: "Checked In" }
        });

        const stats = {
            occupied: statsMap['occupied'] || 0,
            vacant: statsMap['vacant'] || 0,
            cleaning: statsMap['cleaning'] || 0,
            totalGuests: totalGuests,
            recentLogs: logs,
            revenue: 0, // Placeholder
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({
            occupied: 0, vacant: 0, cleaning: 0,
            totalGuests: 0, recentLogs: [], revenue: 0
        });
    }
}
