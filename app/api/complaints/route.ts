
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { guestId, type, description } = await request.json();

        const complaint = await prisma.complaint.create({
            data: {
                guestId,
                type,
                description,
                status: 'Open'
            }
        });

        return NextResponse.json(complaint);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const guestId = searchParams.get('guestId');

        const whereClause = guestId ? { guestId } : {};

        const complaints = await prisma.complaint.findMany({
            where: whereClause,
            include: {
                guest: {
                    select: {
                        name: true,
                        customer: {
                            select: { email: true }
                        },
                        room: { select: { id: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(complaints);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        // 1. Update Complaint Status
        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status },
            include: {
                guest: {
                    include: {
                        room: true,
                        customer: true // Get email from customer
                    }
                }
            }
        });

        // 2. If Staff Marked Resolved -> Send Confirmation Email to Guest
        const guestEmail = complaint.guest?.customer?.email;
        console.log(`[Complaint] Status update: ${status}. Guest Email: ${guestEmail}`);

        if (status === 'Resolved' && guestEmail) {
            console.log(`[Complaint] Sending resolution email to ${guestEmail}`);
            const { sendEmail } = await import('@/lib/mail');

            const host = request.headers.get("host"); // e.g. "localhost:3001"
            const protocol = request.headers.get("x-forwarded-proto") || "http";
            const appUrl = `${protocol}://${host}`;

            const confirmLink = `${appUrl}/api/complaints/verify?id=${complaint.id}&action=confirm`;
            const rejectLink = `${appUrl}/api/complaints/verify?id=${complaint.id}&action=reopen`;

            const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #ddd;">
                    <h2 style="margin: 0; color: #0056b3;">Service Request Update</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Hello <b>${complaint.guest.name}</b>,</p>
                    <p>Our staff has marked your complaint regarding <b>${complaint.type}</b> as resolved.</p>
                    
                    <div style="background: #f1f3f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 14px; color: #555;"><i>"${complaint.description}"</i></p>
                    </div>

                    <p>Are you satisfied with the resolution?</p>
                    
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${confirmLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px; display: inline-block;">
                            ✅ Yes, It's Fixed
                        </a>
                        <a href="${rejectLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            ❌ No, Still an Issue
                        </a>
                    </div>
                    
                    <p style="font-size: 12px; color: #777;">Clicking "Yes" will close this ticket.</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
                    Hotel Management System
                </div>
            </div>
            `;

            await sendEmail(guestEmail, `Service Request Resolved? - Room ${complaint.guest.room?.id}`, emailHtml);
        }

        return NextResponse.json(complaint);
    } catch (error) {
        console.error("Complaint update error:", error);
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}
