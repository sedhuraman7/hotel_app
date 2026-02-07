
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch Pending Orders
        const pendingOrders = await prisma.order.findMany({
            where: { status: 'Pending' },
            include: {
                guest: {
                    select: {
                        name: true,
                        room: { select: { id: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Fetch Open Complaints
        const openComplaints = await prisma.complaint.findMany({
            where: { status: 'Open' },
            include: {
                guest: {
                    select: {
                        name: true,
                        room: { select: { id: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const notifications = [
            ...pendingOrders.map(o => ({
                id: `order-${o.id}`,
                type: 'Order',
                title: `New Order - Room ${o.guest?.room?.id || '?'}`,
                description: `Guest ${o.guest?.name} placed an order for ₹${o.totalAmount}`,
                time: o.createdAt,
                link: '/dashboard/restaurant'
            })),
            ...openComplaints.map(c => ({
                id: `complaint-${c.id}`,
                type: 'Complaint',
                title: `New Complaint - Room ${c.guest?.room?.id || '?'}`,
                description: `${c.type}: ${c.description}`,
                time: c.createdAt,
                link: `/dashboard/records`
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            count: pendingOrders.length + openComplaints.length,
            notifications
        });

    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
