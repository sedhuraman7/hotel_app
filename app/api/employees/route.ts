import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET: List all employees
export async function GET() {
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
        const body = await req.json();

        // Check ID uniqueness
        const existing = await prisma.employee.findUnique({ where: { id: body.id } });
        if (existing) {
            return NextResponse.json({ error: "Employee ID already exists" }, { status: 400 });
        }

        const salary = body.salary ? parseFloat(body.salary) : 0;
        if (isNaN(salary)) {
            return NextResponse.json({ error: "Invalid Salary" }, { status: 400 });
        }

        const employee = await prisma.employee.create({
            data: {
                id: body.id,
                name: body.name,
                role: body.role,
                rfidCardId: body.rfidCardId || null,
                phone: body.phone,
                email: body.email,
                joinDate: new Date(body.joinDate),
                salary: salary,
                status: "Active"
            }
        });

        // Sync to Firebase (REMOVED)
        // Employee data is now SQL-only.

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

        // Get employee details first to find RFID
        const employee = await prisma.employee.findUnique({ where: { id } });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        await prisma.employee.delete({
            where: { id }
        });

        // Remove from Firebase (REMOVED)
        // SQL only.

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
