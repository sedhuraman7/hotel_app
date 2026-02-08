
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const complaintId = searchParams.get('id');
        const action = searchParams.get('action');

        if (!complaintId || !action) {
            return new NextResponse('Invalid request', { status: 400 });
        }

        let newStatus = 'Open';
        let message = '';
        let icon = '';
        let color = '';

        if (action === 'confirm') {
            newStatus = 'Closed'; // Fully resolved
            message = 'Thank you for confirming. We are glad the issue is resolved.';
            icon = '✅';
            color = '#28a745';
        } else if (action === 'reopen') {
            newStatus = 'Open'; // Not fixed
            message = 'We have reopened your ticket. Staff will be notified immediately.';
            icon = '⚠️';
            color = '#dc3545';
        }

        const complaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: { status: newStatus }
        });

        // HTML Response
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Resolution Confirmed</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 400px; width: 90%; }
                .icon { font-size: 64px; margin-bottom: 20px; display: block; }
                h1 { color: #333; margin-bottom: 10px; font-size: 24px; }
                p { color: #666; line-height: 1.6; }
                .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="card">
                <span class="icon">${icon}</span>
                <h1 style="color: ${color}">${action === 'confirm' ? 'Case Closed' : 'Ticket Re-opened'}</h1>
                <p>${message}</p>
                <a href="/guest/${complaint.guestId}" class="btn">Back to Dashboard</a>
            </div>
        </body>
        </html>
        `;

        return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        console.error("Verification error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
