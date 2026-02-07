
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');

        if (!orderId) {
            return new NextResponse('Order ID is required', { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Delivered' },
            include: { deliveryMan: true } // just in case we want to show who delivered
        });

        // HTML Response for the delivery person
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Delivery Confirmed</title>
            <style>
                body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0fdf4; color: #166534; }
                .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 90%; }
                h1 { margin-top: 0; }
                .icon { font-size: 4rem; margin-bottom: 1rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="icon">✅</div>
                <h1>Delivery Confirmed!</h1>
                <p>Order #${order.id.slice(0, 8)} status has been updated to <b>Delivered</b>.</p>
                <p>The admin dashboard will be updated automatically.</p>
                <p>Good job!</p>
            </div>
        </body>
        </html>
        `;

        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error("Verification error:", error);
        const errorHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>❌ Error Updating Status</h1>
            <p>Something went wrong or the Order ID is invalid.</p>
        </body>
        </html>
        `;
        return new NextResponse(errorHtml, { status: 500, headers: { 'Content-Type': 'text/html' } });
    }
}
