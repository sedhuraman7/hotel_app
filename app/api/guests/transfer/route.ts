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
            const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
            const hotelName = admin?.hotelName || "Luxury Hotel";

            await sendEmail(
                guest.customer.email,
                `Room Transfer Update - ${hotelName}`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #003366; color: #fff; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Room Transfer Successful</h2>
                    </div>
                    <div style="padding: 20px; color: #333;">
                        <p>Dear <b>${guest.name}</b>,</p>
                        <p>Your room has been successfully changed.</p>
                        
                        <div style="background-color: #f0f7ff; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0;">Old Room: <b>${oldRoomId}</b></p>
                            <p style="margin: 10px 0 0; font-size: 1.1em;">New Room: <b style="color: #003366;">${newRoomId}</b></p>
                        </div>
                        
                        <p>We hope you enjoy your new room!</p>
                    </div>
                </div>
                `
            );
        }

        return NextResponse.json({ success: true, guest: updatedGuest });

    } catch (error) {
        console.error("Transfer error:", error);
        return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
    }
}
