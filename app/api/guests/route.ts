import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Check In Guest
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // body: { name, roomId, cardId, phone, paymentStatus, totalAmount }

        const { name, roomId, cardId, phone, email, paymentStatus, totalAmount } = body;

        // 1. Check if Room is Vacant
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
        if (room.status !== "Vacant") return NextResponse.json({ error: "Room is not vacant" }, { status: 400 });

        // 2. Loyalty Logic (Create/Update Customer)
        // 1 Point per $1 (or ₹1). Simple logic.
        const pointsEarned = Math.floor(parseFloat(totalAmount) * 0.10); // 10% back as points
        let customerId = null;

        if (phone) {
            let customer = await prisma.customer.findUnique({ where: { phone } });

            if (customer) {
                // Update Existing Customer
                customer = await prisma.customer.update({
                    where: { phone },
                    data: {
                        points: { increment: pointsEarned },
                        visits: { increment: 1 },
                        email: email || customer.email // Update email if provided
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

            // 3. Send Email (if email exists)
            if (email || customer.email) {
                const mailTo = email || customer.email;
                if (mailTo) {
                    const { sendEmail } = require("@/lib/mail");

                    // Fetch Admin details (Get the latest registered admin)
                    const admin = await prisma.user.findFirst({
                        orderBy: { createdAt: 'desc' }
                    });
                    const hotelName = admin?.hotelName || "Luxury Hotel";
                    const wifiSsid = admin?.wifiSsid || "Ask Reception";
                    const wifiPass = admin?.wifiPass || "---";

                    // WiFi QR Code
                    const qrData = `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

                    await sendEmail(
                        mailTo,
                        `Welcome to ${hotelName}! 🏨`,
                        `
                       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                           <div style="background-color: #003366; color: #FFD700; padding: 20px; text-align: center;">
                               <h1 style="margin: 0;">${hotelName}</h1>
                               <p style="margin: 5px 0 0; color: #fff;">Experience Luxury & Comfort</p>
                           </div>
                           <div style="padding: 20px; color: #333;">
                               <h2 style="color: #003366;">Welcome, ${name}!</h2>
                               <p>You have successfully checked in to <b style="color: #003366; font-size: 1.2em;">Room ${roomId}</b>.</p>
                               
                               <div style="background-color: #f9f9f9; border-left: 5px solid #FFD700; padding: 15px; margin: 20px 0;">
                                   <h3 style="margin-top: 0; color: #B8860B;">🎉 Loyalty Rewards</h3>
                                   <p>Points Earned: <b>${pointsEarned}</b></p>
                                   <p>Total Balance: <b style="font-size: 1.2em;">${customer.points} Points</b></p>
                                   <small>Redeemable on your next visit!</small>
                               </div>

                               <div style="text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                                   <h3 style="color: #003366;">📶 Wi-Fi Access</h3>
                                   <img src="${qrUrl}" alt="WiFi QR Code" style="border: 2px solid #ddd; border-radius: 5px;" />
                                   <p>Network: <b>${wifiSsid}</b></p>
                                   <p>Password: <b>${wifiPass}</b></p>
                               </div>
                               
                               <p style="margin-top: 30px;">Enjoy your stay!</p>
                           </div>
                           <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                               &copy; ${new Date().getFullYear()} ${hotelName}. All rights reserved.
                           </div>
                       </div>
                       `
                    );
                }
            }
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
            include: { room: true }
        });
        return NextResponse.json(guests);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
    }
}
