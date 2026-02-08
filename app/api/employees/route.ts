import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET: List all employees
export async function GET(req: NextRequest) {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
}

// POST: Add a new employee
export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // { id, name, role, rfidCardId, phone, email, joinDate, salary }
        const { id, name, role, rfidCardId, phone, email, joinDate, salary } = body;

        // Check ID uniqueness
        const existing = await prisma.employee.findUnique({
            where: { id }
        });

        if (existing) {
            return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 });
        }

        const numericSalary = salary ? parseFloat(salary) : 0;
        if (isNaN(numericSalary)) {
            return NextResponse.json({ error: "Invalid Salary" }, { status: 400 });
        }

        const employee = await prisma.employee.create({
            data: {
                id,
                name,
                role,
                rfidCardId: rfidCardId || null,
                phone,
                email,
                joinDate: new Date(joinDate),
                salary: numericSalary,
                status: "Active"
            }
        });

        return NextResponse.json(employee);
    } catch (error: any) {
        console.error("Add Employee Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create employee" }, { status: 500 });
    }
}

// DELETE: Remove employee
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const employee = await prisma.employee.findUnique({ where: { id } });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        await prisma.employee.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
