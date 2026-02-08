
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guestId, items } = body; // items: { menuItemId, quantity, price }[]

        // Calculate total amount
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        const order = await prisma.order.create({
            data: {
                guestId,
                totalAmount,
                status: 'Pending',
                items: {
                    create: items.map((item: any) => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Order error details:", error); // Improved logging
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, deliveryManId } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (deliveryManId) updateData.deliveryManId = deliveryManId;

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                guest: {
                    include: { room: true }
                },
                items: {
                    include: { menuItem: true }
                },
                deliveryMan: true
            }
        });

        // Send Notification if assigned to Delivery Man
        if (deliveryManId && order.deliveryMan?.email) {
            const { sendEmail } = await import('@/lib/mail');

            const host = request.headers.get("host");
            const protocol = request.headers.get("x-forwarded-proto") || "http";
            const appUrl = `${protocol}://${host}`;

            const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #0056b3;">📦 New Delivery Assignment!</h2>
                <p>Hello <b>${order.deliveryMan.name}</b>,</p>
                <p>You have been assigned a new delivery task.</p>
                
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><b>Order ID:</b> #${order.id.slice(0, 8)}</p>
                    <p><b>Room:</b> <span style="font-size: 1.2em; font-weight: bold; color: #d9534f;">${order.guest?.room?.id || 'N/A'}</span></p>
                    <p><b>Guest:</b> ${order.guest?.name}</p>
                    <p><b>Items:</b></p>
                    <ul>
                        ${order.items.map((i: any) => `<li>${i.menuItem.name} (x${i.quantity})</li>`).join('')}
                    </ul>
                    <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
                </div>

                <p>Please pick up the order from the kitchen and deliver it immediately.</p>
                <br/>
                <a href="${appUrl}/api/restaurant/order/verify?id=${order.id}" 
                   style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                   ✅ Click here to Confirm Delivery
                </a>
                <br/>
                <br/>
                <p>Best regards,<br/>Hotel Management System</p>
            </div>
            `;

            await sendEmail(order.deliveryMan.email, `New Delivery Task - Room ${order.guest?.room?.id}`, emailHtml);
        }

        return NextResponse.json(order);

    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const guestId = searchParams.get('guestId');

        if (guestId) {
            const orders = await prisma.order.findMany({
                where: { guestId },
                include: {
                    items: {
                        include: { menuItem: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(orders);
        } else {
            // Admin/Staff view: All orders
            const orders = await prisma.order.findMany({
                include: {
                    items: {
                        include: { menuItem: true }
                    },
                    guest: {
                        select: {
                            name: true,
                            room: { select: { id: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(orders);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
