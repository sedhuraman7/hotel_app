
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const deliveryMan = await prisma.employee.findFirst({
        where: { role: 'Delivery' }
    });

    if (!deliveryMan) {
        console.log('No Delivery Man found. Creating one...');
        await prisma.employee.create({
            data: {
                id: 'EMP-DEL-001',
                name: 'Ramesh Kumar',
                role: 'Delivery',
                phone: '9876543210',
                email: 'ramesh.delivery@example.com',
                joinDate: new Date(),
                salary: 15000,
                status: 'Active'
            }
        });
        console.log('Created Delivery Man: Ramesh Kumar');
    } else {
        console.log('Delivery Man already exists:', deliveryMan.name);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
