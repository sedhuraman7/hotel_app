
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Employees...");
    try {
        const employees = await prisma.employee.findMany();
        console.log("Employees found:", employees.length);
        employees.forEach(e => {
            console.log(`- ${e.name}: Card='${e.rfidCardId}' Status=${e.status}`);
        });
    } catch (e) {
        console.error("Error listing employees:", e);
    }

    console.log("\nChecking Rooms...");
    try {
        const rooms = await prisma.room.findMany({ include: { currentGuest: true } });
        console.log("Rooms found:", rooms.length);
        rooms.forEach(r => {
            console.log(`- Room ${r.number}: DeviceID='${r.deviceId}' Guest=${r.currentGuest ? r.currentGuest.name : 'None'} Card=${r.currentGuest ? r.currentGuest.rfidCardId : 'N/A'}`);
        });
    } catch (e) {
        console.error("Error listing rooms:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
