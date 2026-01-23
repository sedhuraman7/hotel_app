import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ guestId: string }> }
) {
    try {
        const { guestId } = await params;
        const body = await request.json();
        const { status } = body; // "Checked Out"

        // 1. Update Guest & Fetch Customer Email
        const guest = await prisma.guest.update({
            where: { id: guestId },
            data: {
                status,
                checkOutTime: status === "Checked Out" ? new Date() : undefined
            },
            include: { customer: true }
        });

        // 2. If Checked Out, Free the Room & Send Email
        if (status === "Checked Out") {
            // Free the Room
            if (guest.currentRoomId) {
                await prisma.room.update({
                    where: { id: guest.currentRoomId },
                    data: { status: "Vacant" }
                });

                // Unbind from guest
                await prisma.guest.update({
                    where: { id: guestId },
                    data: { currentRoomId: null }
                });
            }

            // Send Email
            if (guest.customer?.email) {
                const { sendEmail } = require("@/lib/mail");
                const { generateEmailHtml } = require("@/lib/email-template");

                const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
                const hotelName = admin?.hotelName || "Luxury Hotel";

                const content = `
                    <div style="text-align: center;">
                        <h2 style="color: #4da6ff; margin: 0 0 10px 0;">Thank You for Visiting!</h2>
                        <p style="color: #ccc; margin-bottom: 30px;">We hope you enjoyed your stay at ${hotelName}.</p>
                        
                        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 25px; text-align: left; margin-bottom: 30px;">
                            <h3 style="color: #e0e0e0; margin: 0 0 20px 0; border-bottom: 1px solid #333; padding-bottom: 10px;">🧾 Receipt Summary</h3>
                            
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="color: #a0a0a0;">Room Number</span>
                                <span style="color: #fff; font-weight: bold;">${guest.roomId}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="color: #a0a0a0;">Amount Paid</span>
                                <span style="color: #fff; font-weight: bold;">₹${guest.totalAmount}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
                                <span style="color: #a0a0a0;">Status</span>
                                <span style="color: #00ff00; font-weight: bold;">${guest.paymentStatus}</span>
                            </div>
                        </div>

                        <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 12px; padding: 20px;">
                            <p style="color: #FFD700; margin: 0 0 5px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Loyalty Balance</p>
                            <div style="font-size: 32px; font-weight: bold; color: #fff; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);">${guest.customer.points} <span style="font-size: 16px; color: #ccc;">Pts</span></div>
                        </div>
                    </div>
                `;

                const html = generateEmailHtml(`Thank You!`, hotelName, content);
                await sendEmail(guest.customer.email, `Thank You for Visiting ${hotelName}!`, html);
            }
        }

        return NextResponse.json(guest);
    } catch (error) {
        console.error("Update Guest Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
