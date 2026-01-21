import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // 1. Total Revenue (all time or this month? usually dashboard defaults to a range, let's do all time for "Total Revenue" card but charts by month)
        // Let's do "Total Revenue" as sum of all payments
        const revenueAgg = await prisma.guest.aggregate({
            _sum: { totalAmount: true }
        });
        const totalRevenue = revenueAgg._sum.totalAmount || 0;

        // 2. Total Guests (All time)
        const totalGuests = await prisma.guest.count();

        // 3. Occupancy Rate (Active stays / Total Rooms)
        const totalRooms = await prisma.room.count();
        const activeGuests = await prisma.guest.count({
            where: { status: "Checked In" }
        });
        const occupancyRate = totalRooms > 0 ? ((activeGuests / totalRooms) * 100).toFixed(1) : "0";

        // 4. Bookings (This Month)
        const bookingsThisMonth = await prisma.guest.count({
            where: {
                checkInTime: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        // 5. Revenue Chart Data (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const recentGuests = await prisma.guest.findMany({
            where: {
                checkInTime: { gte: sevenDaysAgo }
            },
            select: {
                checkInTime: true,
                totalAmount: true
            }
        });

        // Group by day for chart
        const chartDataMap = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { weekday: 'short' });
            chartDataMap.set(dateStr, 0);
        }

        recentGuests.forEach(g => {
            const day = new Date(g.checkInTime).toLocaleDateString("en-US", { weekday: 'short' });
            if (chartDataMap.has(day)) {
                chartDataMap.set(day, chartDataMap.get(day) + g.totalAmount);
            }
        });

        const chartData = Array.from(chartDataMap.entries()).map(([name, revenue]) => ({
            name,
            revenue,
            expenses: revenue * 0.4 // Mock expenses as 40% of revenue for now since we don't track expenses separately in schema yet
        })).reverse();

        // 6. Room Popularity (Group by Room Type)
        // Since Room Type is on Room model, we need to join.
        // Prisma doesn't support direct groupBy on relation, so we fetch guests with room type or all rooms.
        // Easier: Group rooms by type and count their history. 
        // Actually, let's just count all Guests and their associated Room's type.
        const guestsWithRooms = await prisma.guest.findMany({
            include: { room: true }
        });

        const roomTypeCounts: Record<string, number> = {};
        guestsWithRooms.forEach(g => {
            const type = g.room?.type || "Standard";
            roomTypeCounts[type] = (roomTypeCounts[type] || 0) + 1;
        });

        const roomData = Object.entries(roomTypeCounts).map(([name, value]) => ({ name, value }));

        // 7. Recent Transactions
        const recentTransactions = await prisma.guest.findMany({
            take: 5,
            orderBy: { checkInTime: 'desc' },
            include: { room: true }
        });

        const transactionsFormatted = recentTransactions.map(t => ({
            id: t.id.slice(0, 8), // Short ID
            date: new Date(t.checkInTime).toLocaleDateString(),
            desc: `Room Booking - ${t.room?.type} (Room ${t.room?.id})`,
            amount: t.totalAmount,
            status: t.paymentStatus
        }));

        return NextResponse.json({
            stats: {
                totalRevenue,
                totalGuests,
                occupancyRate,
                bookingsThisMonth
            },
            chartData,
            roomData,
            recentTransactions: transactionsFormatted
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
