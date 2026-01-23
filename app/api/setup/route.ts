import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Execute Raw SQL to create tables manually
        // Since Prisma migrate isn't working in this environment

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "password" TEXT NOT NULL,
                "hotelName" TEXT,
                "wifiSsid" TEXT,
                "wifiPass" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "User_pkey" PRIMARY KEY ("id")
            );
        `);

        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Room" (
                "id" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "deviceId" TEXT,
                "status" TEXT NOT NULL DEFAULT 'Vacant',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Room_deviceId_key" ON "Room"("deviceId");`);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Customer" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "phone" TEXT NOT NULL,
                "email" TEXT,
                "points" INTEGER NOT NULL DEFAULT 0,
                "visits" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Customer_phone_key" ON "Customer"("phone");`);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Guest" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "rfidCardId" TEXT,
                "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "checkOutTime" TIMESTAMP(3),
                "stayLength" INTEGER NOT NULL DEFAULT 1,
                "totalAmount" DOUBLE PRECISION NOT NULL,
                "paymentStatus" TEXT NOT NULL DEFAULT 'Unpaid',
                "status" TEXT NOT NULL DEFAULT 'Checked In',
                "roomId" TEXT NOT NULL,
                "currentRoomId" TEXT,
                "customerId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
            );
        `);
        // Foreign keys might fail if tables don't exist yet, but we are running in order.

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Employee" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "role" TEXT NOT NULL,
                "rfidCardId" TEXT,
                "phone" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "joinDate" TIMESTAMP(3) NOT NULL,
                "salary" DOUBLE PRECISION NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'Active',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Employee_rfidCardId_key" ON "Employee"("rfidCardId");`);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "AccessLog" (
                "id" SERIAL NOT NULL,
                "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deviceId" TEXT NOT NULL,
                "cardId" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "access" BOOLEAN NOT NULL,
                "message" TEXT,
                CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
            );
        `);

        return NextResponse.json({ success: true, message: "Tables created successfully" });
    } catch (error: any) {
        console.error("Setup Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
