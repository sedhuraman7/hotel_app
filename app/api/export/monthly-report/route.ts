import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { month, year } = await req.json();

        if (!month || !year) {
            return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        const guests = await prisma.guest.findMany({
            where: {
                checkInTime: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                room: true
            },
            orderBy: {
                checkInTime: 'asc'
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${month}-${year} Report`);

        // Define Columns
        worksheet.columns = [
            { header: 'Guest Name', key: 'name', width: 25 },
            { header: 'Room No', key: 'room', width: 10 },
            { header: 'Check-In Time', key: 'checkIn', width: 20 },
            { header: 'Check-Out Time', key: 'checkOut', width: 20 },
            { header: 'Stay Length (Days)', key: 'stay', width: 15 },
            { header: 'Total Amount', key: 'amount', width: 15 },
            { header: 'Payment Status', key: 'status', width: 15 },
            { header: 'ID Proof (Aadhar)', key: 'aadhar', width: 20 }, // Assuming field exists or just generic logic
        ];

        // Add Data
        guests.forEach(guest => {
            worksheet.addRow({
                name: guest.name,
                room: guest.room ? guest.room.id : 'N/A',
                checkIn: new Date(guest.checkInTime).toLocaleString(),
                checkOut: guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleString() : '-',
                stay: guest.stayLength,
                amount: guest.totalAmount,
                status: guest.paymentStatus,
                aadhar: 'N/A' // Schema doesn't have aadhar explicitly shown in previous view but logic usually implies it. 
            });
        });

        // Styling: Make Header Bold
        worksheet.getRow(1).font = { bold: true };

        // Protection: Lock the sheet so data cannot be modified
        // The password here is internal to the file structure to prevent edits.
        // The user also requested a password on the WEBSITE to even access this download.
        await worksheet.protect('secureAdminPassword123', {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: false,
            formatColumns: false,
            formatRows: false,
            insertColumns: false,
            insertRows: false,
            insertHyperlinks: false,
            deleteColumns: false,
            deleteRows: false,
            sort: false,
            autoFilter: false,
            pivotTables: false
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename=Hotel_Report_${month}_${year}.xlsx`
            }
        });

    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
