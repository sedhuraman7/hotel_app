
import { prisma } from "../lib/prisma";

async function main() {
    console.log("--- Checking Menu Items ---");

    const items = await prisma.menuItem.findMany();
    console.log(`Found ${items.length} menu items.`);

    items.forEach(item => {
        console.log(`- ${item.name} (${item.category}) [${item.isAvailable ? 'Available' : 'Unavailable'}]`);
    });

    if (items.length === 0) {
        console.log("\n⚠️ No menu items found! The dashboard will look empty.");
        console.log("Run the seed script or add items via API.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
