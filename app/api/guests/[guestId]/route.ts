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
                const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
                const hotelName = admin?.hotelName || "Luxury Hotel";

                await sendEmail(
                    guest.customer.email,
                    `Thank You for Visiting ${hotelName}!`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #003366; color: #fff; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">Thank You!</h1>
                            <p style="margin: 5px 0 0; color: #FFD700;">We hope you enjoyed your stay</p>
                        </div>
                        <div style="padding: 20px; color: #333;">
                            <p>Dear <b>${guest.name}</b>,</p>
                            <p>You have successfully checked out from <b>${hotelName}</b>.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 10px;">
                                <h3 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">🧾 Receipt Summary</h3>
                                <p style="display: flex; justify-content: space-between;"><span>Room Number:</span> <b>${guest.roomId}</b></p>
                                <p style="display: flex; justify-content: space-between;"><span>Total Amount:</span> <b>₹${guest.totalAmount}</b></p>
                                <p style="display: flex; justify-content: space-between; color: green;"><span>Payment Status:</span> <b>${guest.paymentStatus}</b></p>
                            </div>

                            <div style="text-align: center; margin-top: 20px;">
                                <p style="font-weight: bold; color: #B8860B;">Current Loyalty Balance</p>
                                <div style="font-size: 2em; color: #003366;">${guest.customer.points} <span style="font-size: 0.5em;">Pts</span></div>
                            </div>

                            <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #666;">We look forward to welcoming you back soon!</p>
                        </div>
                    </div>
                    `
                );
            }
        }

        return NextResponse.json(guest);
    } catch (error) {
        console.error("Update Guest Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
