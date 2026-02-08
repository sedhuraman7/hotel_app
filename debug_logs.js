
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Recent Access Logs...");
    try {
        const logs = await prisma.accessLog.findMany({
            take: 10,
            orderBy: { timestamp: 'desc' }
        });
        console.log("Last 10 Logs:");
        logs.forEach(l => {
            console.log(`[${l.timestamp.toISOString()}] Device=${l.deviceId} Card=${l.cardId} Type=${l.type} Access=${l.access} MSG=${l.message}`);
        });
    } catch (e) {
        console.error("Error listing logs:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
