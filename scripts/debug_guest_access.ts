
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- Debugging Guest Access & Transactions ---");

    // 1. Get Latest Guest
    // 1. Get Latest Guest
    const guest = await prisma.guest.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            room: {
                include: { currentGuest: true }
            }
        }
    });

    if (!guest) {
        console.log("No guests found in database.");
        return;
    }

    // Simplified Logging
    console.log("--- Guest ---");
    console.log(JSON.stringify(guest, null, 2));

    console.log("--- Logs ---");
    const logs = await prisma.accessLog.findMany({
        where: {
            OR: [
                guest.room?.deviceId ? { deviceId: guest.room.deviceId } : {},
                guest.rfidCardId ? { cardId: guest.rfidCardId } : {}
            ]
        },
        orderBy: { timestamp: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(logs, null, 2));

    // Simulation
    if (guest.room && guest.room.deviceId && guest.rfidCardId) {
        console.log("--- Simulation ---");
        const cardId = guest.rfidCardId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

        const room = await prisma.room.findFirst({
            where: { deviceId: guest.room.deviceId },
            include: { currentGuest: true }
        });

        console.log("Card Used:", cardId);
        console.log("Room Current Guest:", JSON.stringify(room?.currentGuest, null, 2));

        const dbCard = room?.currentGuest?.rfidCardId?.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        console.log("DB Card:", dbCard);
        console.log("Match:", cardId === dbCard);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
