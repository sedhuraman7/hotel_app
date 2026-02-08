import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const rawCardId = searchParams.get("card_id");
    const sentDeviceId = searchParams.get("device_id");

    // 1. Sanitize & Normalize
    // Remove non-alphanumeric (keep only A-Z, 0-9), convert to Upper Case
    // This helps match "1234 A" to "1234A" and "abc" to "ABC"
    const cardId = rawCardId ? rawCardId.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";
    const deviceId = sentDeviceId ? sentDeviceId.trim() : "unknown";

    console.log(`[API] RFID Check: Raw='${rawCardId}', Normalized='${cardId}', Device='${deviceId}'`);

    if (!cardId) {
        return NextResponse.json({ status: 0, message: "Card ID missing" }, { status: 400 });
    }

    try {
        let accessGranted = false;
        let accessType = "";
        let logMessage = "Access Denied";
        let duration = 0;
        let name = "Unknown"; // Default name for logs

        // 2. Find Room (Safe Check)
        // Try strict match first for Device ID
        let room = await prisma.room.findFirst({
            where: { deviceId: { equals: deviceId, mode: 'insensitive' } },
            include: { currentGuest: true }
        });

        if (!room) {
            console.log(`[API] Device '${deviceId}' not found in DB.`);
        }

        // 3. Employee Check (Prioritized)
        // First try Case-Insensitive Exact Match
        let employee = await prisma.employee.findFirst({
            where: {
                rfidCardId: { equals: cardId, mode: 'insensitive' },
                status: "Active" // Ensure only active employees get access
            }
        });

        // Fallback: Fuzzy Match if Exact Failed (Handle leading/trailing chars or length mismatch)
        if (!employee) {
            console.log(`[API] Exact match failed for Card '${cardId}'. Trying fuzzy search...`);

            // Fetch all active employees with a card ID
            // This is acceptable if employee count is small (<1000)
            const allEmployees = await prisma.employee.findMany({
                where: { rfidCardId: { not: null }, status: "Active" }
            });

            // Try to find if DB card is contained in Input or Input in DB card
            // e.g. Input: "0012345" vs DB: "12345" -> Match
            // e.g. Input: "123456789012" vs DB: "34567890" -> Match
            const fuzzyMatch = allEmployees.find(e => {
                const dbCard = e.rfidCardId!.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                return dbCard.length > 4 && (cardId.includes(dbCard) || dbCard.includes(cardId));
            });

            if (fuzzyMatch) {
                console.log(`[API] Fuzzy match found: ${fuzzyMatch.name} (Card: ${fuzzyMatch.rfidCardId})`);
                employee = fuzzyMatch;
            }
        }

        if (employee) {
            accessGranted = true;
            accessType = "employee";
            name = employee.name;
            logMessage = "Employee Access";
            duration = 1800; // 30 Mins
        }

        // 4. Guest Check
        // If not employee, check if it matches the current guest of the room
        else if (room && room.status === "Occupied" && room.currentGuest && room.currentGuest.rfidCardId) {
            const guestCard = room.currentGuest.rfidCardId.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

            // Check Guest ID (Fuzzy tolerant)
            // Strict check: guestCard === cardId
            // Fuzzy: includes
            if (cardId === guestCard || (cardId.length > 5 && (cardId.includes(guestCard) || guestCard.includes(cardId)))) {
                accessGranted = true;
                accessType = "guest";
                name = room.currentGuest.name;
                logMessage = "Guest Access";
            }
        }

        if (!room) logMessage += " (Device Not Configured)";

        console.log(`[API] Result: ${accessGranted ? "GRANTED" : "DENIED"} - ${logMessage}`);

        // 5. Log to Database (SQL)
        // Ensure we handle potential errors here gracefully so we don't block response
        try {
            await prisma.accessLog.create({
                data: {
                    deviceId: deviceId,
                    cardId: cardId, // Log the normalized ID
                    type: accessType || "denied",
                    access: accessGranted,
                    message: logMessage + (name !== "Unknown" ? ` (${name})` : "")
                }
            });
        } catch (logErr) {
            console.error("[API] Failed to save AccessLog:", logErr);
        }

        return NextResponse.json({
            status: accessGranted ? 1 : 0,
            allowed: accessGranted,
            type: accessType,
            name: name,
            access_duration: duration
        });

    } catch (error) {
        console.error("RFID Check Error:", error);
        return NextResponse.json({ status: 0, message: "Server Error" }, { status: 500 });
    }
}
