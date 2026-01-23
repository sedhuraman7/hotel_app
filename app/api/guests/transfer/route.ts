import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { guestId, oldRoomId, newRoomId } = body;

        // 1. Validate
        const guest = await prisma.guest.findUnique({ where: { id: guestId }, include: { customer: true } });
        if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

        const newRoom = await prisma.room.findUnique({ where: { id: newRoomId } });
        if (!newRoom) return NextResponse.json({ error: "New room not found" }, { status: 404 });
        if (newRoom.status !== "Vacant") return NextResponse.json({ error: "New room is not vacant" }, { status: 400 });

        // 2. Perform Transfer
        // a. Free old room
        await prisma.room.update({
            where: { id: oldRoomId },
            data: { status: "Vacant" }
        });

        // b. Occupy new room
        await prisma.room.update({
            where: { id: newRoomId },
            data: { status: "Occupied" }
        });

        // c. Update Guest
        const updatedGuest = await prisma.guest.update({
            where: { id: guestId },
            data: {
                currentRoomId: newRoomId,
                roomId: newRoomId // Update main room link too depending on logic, or just track current
            }
        });

        // 3. Send Email
        if (guest.customer?.email) {
            const { sendEmail } = require("@/lib/mail");
            const { generateEmailHtml } = require("@/lib/email-template");

            const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
            const hotelName = admin?.hotelName || "Luxury Hotel";

            const content = `
                <div style="text-align: center;">
                    <h2 style="color: #4da6ff; margin: 0 0 20px 0;">Room Transfer Successful</h2>
                    <p style="font-size: 16px;">Dear <strong style="color: #fff;">${guest.name}</strong>,</p>
                    <p style="color: #ccc;">Your room change request has been completed.</p>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); border-left: 4px solid #4da6ff; padding: 20px; border-radius: 8px; margin: 30px auto; max-width: 400px; text-align: left;">
                        <p style="margin: 0 0 10px 0; color: #a0a0a0;">Old Room: <del style="color: #666;">${oldRoomId}</del></p>
                        <p style="margin: 0; font-size: 20px;">New Room: <strong style="color: #fff;">${newRoomId}</strong></p>
                    </div>
                </div>
            `;

            const html = generateEmailHtml(`Room Transfer Update`, hotelName, content);
            await sendEmail(guest.customer.email, `Room Transfer Update - ${hotelName}`, html);
        }

        return NextResponse.json({ success: true, guest: updatedGuest });

    } catch (error) {
        console.error("Transfer error:", error);
        return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
    }
}
