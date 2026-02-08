import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Check In Guest
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, roomId, cardId, phone, email, paymentStatus, totalAmount } = body;

        // 1. Check if Room is Vacant
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
        if (room.status !== "Vacant") return NextResponse.json({ error: "Room is not vacant" }, { status: 400 });

        // 2. Loyalty Logic (Create/Update Customer)
        const pointsEarned = Math.floor(parseFloat(totalAmount) * 0.10); // 10% back as points
        let customerId = null;
        let customer = null;

        if (phone) {
            customer = await prisma.customer.findUnique({ where: { phone } });

            if (customer) {
                // Update Existing Customer
                customer = await prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                        points: { increment: pointsEarned },
                        visits: { increment: 1 },
                        email: email || customer.email
                    }
                });
            } else {
                // Create New Customer
                customer = await prisma.customer.create({
                    data: {
                        name,
                        phone,
                        email,
                        points: pointsEarned,
                        visits: 1
                    }
                });
            }
            customerId = customer.id;
        }

        // 4. Create Guest Record
        const guest = await prisma.guest.create({
            data: {
                name,
                roomId,
                rfidCardId: cardId, // Optional
                paymentStatus,
                totalAmount: parseFloat(totalAmount),
                status: "Checked In",
                currentRoomId: roomId, // Bind as active guest
                customerId // Link to profile
            }
        });

        // 5. Update Room Status
        await prisma.room.update({
            where: { id: roomId },
            data: { status: "Occupied" }
        });

        // 3. Send Email
        if (customer && (email || customer.email)) {
            const mailTo = email || customer.email;
            if (mailTo) {
                const { sendEmail } = require("@/lib/mail");
                const { generateEmailHtml } = require("@/lib/email-template");

                // Get first admin as hotel owner (fallback)
                const admin = await prisma.user.findFirst();
                const hotelName = admin?.hotelName || "Luxury Hotel";
                const wifiSsid = admin?.wifiSsid || "Ask Reception";
                const wifiPass = admin?.wifiPass || "---";

                const content = `
                    <p style="font-size: 16px; line-height: 1.6;">Welcome, <strong style="color: #fff;">${name}</strong>!</p>
                    <p style="color: #ccc; margin-bottom: 25px;">You have successfully checked in to <strong style="color: #4da6ff; font-size: 18px;">Room ${roomId}</strong>.</p>
                    <div style="background: rgba(255, 215, 0, 0.1); border-left: 4px solid #FFD700; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="color: #FFD700; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">🎉 Loyalty Rewards</h3>
                        <p style="margin: 5px 0; color: #e0e0e0;">Points Earned: <strong style="color: #fff;">${pointsEarned}</strong></p>
                        <p style="margin: 5px 0; color: #e0e0e0;">Total Balance: <strong style="color: #fff; font-size: 18px;">${customer.points} Points</strong></p>
                    </div>
                 `;

                // Dynamic App URL from Request Headers (handles localhost:3001 etc)
                const host = req.headers.get("host"); // e.g. "localhost:3001"
                const protocol = req.headers.get("x-forwarded-proto") || "http";
                const appUrl = `${protocol}://${host}`;

                const webAppLink = `${appUrl}/guest/${guest.id}`;

                const html = generateEmailHtml(`Welcome, ${name}!`, hotelName, content, wifiSsid, wifiPass, webAppLink);
                await sendEmail(mailTo, `Welcome to ${hotelName}!`, html);
            }
        }

        return NextResponse.json(guest);

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
    }
}

// GET: List Guests (Active & History)
export async function GET(req: NextRequest) {
    try {
        const guests = await prisma.guest.findMany({
            orderBy: { checkInTime: 'desc' },
            include: {
                room: true,
                complaints: {
                    where: {
                        status: { notIn: ['Resolved', 'Closed'] }
                    }
                }
            }
        });
        return NextResponse.json(guests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
    }
}
