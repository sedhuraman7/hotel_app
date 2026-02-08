
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- Cleaning Room Device IDs ---");

    const rooms = await prisma.room.findMany();
    let fixedCount = 0;

    for (const room of rooms) {
        if (room.deviceId) {
            const cleanId = room.deviceId.trim();
            if (cleanId !== room.deviceId) {
                console.log(`Fixing Room ${room.id}: '${room.deviceId}' -> '${cleanId}'`);

                await prisma.room.update({
                    where: { id: room.id },
                    data: { deviceId: cleanId }
                });
                fixedCount++;
            }
        }
    }

    console.log(`\nDone. Fixed ${fixedCount} rooms.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
