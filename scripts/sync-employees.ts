
import { PrismaClient } from "@prisma/client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
// import dotenv from "dotenv";
// dotenv.config();

// Firebase Config (replicated from lib/firebase.ts or env)
const firebaseConfig = {
    apiKey: "AIzaSyDuJF46OdZQl76PuCPZiVo12_IlBy7X8xY",
    authDomain: "nshotel.firebaseapp.com",
    databaseURL: "https://nshotel-default-rtdb.firebaseio.com",
    projectId: "nshotel",
    storageBucket: "nshotel.firebasestorage.app",
    messagingSenderId: "276227381187",
    appId: "1:276227381187:web:3696a3666115b9b7b5cf76",
    measurementId: "G-RRMSG5BGWB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const prisma = new PrismaClient();

async function syncEmployees() {
    console.log("Starting Employee Sync...");

    try {
        const employees = await prisma.employee.findMany();
        console.log(`Found ${employees.length} employees in SQL.`);

        if (employees.length === 0) {
            console.log("No employees to sync.");
            return;
        }

        for (const emp of employees) {
            if (emp.rfidCardId) {
                console.log(`Syncing ${emp.name} (${emp.rfidCardId})...`);
                await set(ref(db, `employees/${emp.rfidCardId}`), {
                    name: emp.name,
                    role: emp.role,
                    id: emp.id,
                    active: true,
                    syncedAt: new Date().toISOString()
                });
            } else {
                console.log(`Skipping ${emp.name} (No RFID).`);
            }
        }
        console.log("\n✅ Sync Complete!");
    } catch (error) {
        console.error("Sync Failed:", error);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

syncEmployees();
