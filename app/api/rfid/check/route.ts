import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("card_id");
    const deviceId = searchParams.get("device_id");

    console.log(`[API] RFID Check: Card=${cardId}, Device=${deviceId}`);

    if (!cardId) {
        return NextResponse.json({ status: 0, message: "Card ID missing" }, { status: 400 });
    }

    try {
        let accessGranted = false;
        let accessType = "";
        let logMessage = "Access Denied";
        let duration = 0;
        let name = "Unknown";

        // 1. Check if Device is linked to any Room
        const room = await prisma.room.findUnique({
            where: { deviceId: deviceId || "" },
            include: { currentGuest: true }
        });

        if (!room) {
            logMessage = "Device Not Configured";
        } else {
            // 2. Check Employee (Case Insensitive search)
            const employee = await prisma.employee.findFirst({
                where: {
                    rfidCardId: {
                        equals: cardId,
                        mode: 'insensitive'
                    }
                }
            });

            if (employee && employee.status === "Active") {
                accessGranted = true;
                accessType = "employee";
                name = employee.name;
                logMessage = "Employee Access";
                duration = 1800; // 30 Mins
            }
            // 3. Check Guest
            else if (room.status === "Occupied" && room.currentGuest?.rfidCardId === cardId) {
                accessGranted = true;
                accessType = "guest";
                name = room.currentGuest.name;
                logMessage = "Guest Access";
            }
        }

        // 4. Log to Database (SQL)
        await prisma.accessLog.create({
            data: {
                deviceId: deviceId || "unknown",
                cardId: cardId,
                type: accessType || "denied",
                access: accessGranted,
                message: logMessage
            }
        });

        // 5. Log to Firebase (For Realtime Dashboard)
        try {
            const { db } = require("@/lib/firebase");
            const { ref, set } = require("firebase/database");
            const timestamp = Date.now().toString(); // ms
            const logRef = ref(db, `logs/${timestamp}`);

            let fbLogMsg = "";
            if (accessGranted) {
                fbLogMsg = `Card: ${cardId} (${name}) | Device: ${deviceId}`;
            } else {
                fbLogMsg = `ACCESS DENIED: ${cardId} | Device: ${deviceId}`;
            }

            // Fire and forget - don't await strictly to slow down response
            set(logRef, fbLogMsg).catch((e: any) => console.error("Firebase Log Error:", e));

        } catch (e) {
            console.error("Firebase Import/Log Error:", e);
        }

        return NextResponse.json({
            status: accessGranted ? 1 : 0,
            allowed: accessGranted,
            type: accessType,
            name,
            access_duration: duration
        });

    } catch (error) {
        console.error("RFID Check Error:", error);
        return NextResponse.json({ status: 0, message: "Server Error" }, { status: 500 });
    }
}
