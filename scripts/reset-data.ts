
import { PrismaClient } from '@prisma/client';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

const prisma = new PrismaClient();

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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

async function main() {
    console.log("🧹 Starting Cleanup...");

    // 1. Clear Transactional Data in SQL (Prisma)
    console.log("Deleting Transactions...");
    await prisma.transaction.deleteMany({});

    console.log("Deleting Access Logs...");
    await prisma.accessLog.deleteMany({});

    // 2. Reset Rooms (Disconnect Guests first to avoid Foreign Key issues)
    console.log("Resetting Rooms...");
    // We update rooms to remove the currentGuest relation and set status to Vacant
    await prisma.room.updateMany({
        data: {
            status: "Vacant",
        }
    });

    // Disconnect relations manually if needed, but since Guest is the one with foreign key `currentRoomId`, 
    // and Room has `guests`.
    // Actually, Guest has `currentRoomId`. 
    // We need to delete Guests. But Guest depends on Room? No, Guest.roomId references Room.id.
    // Guest.currentRoomId references Room.id.

    // We can delete guests now.
    console.log("Deleting Guests...");
    await prisma.guest.deleteMany({});

    console.log("Deleting Customers (Loyalty Profile)...");
    await prisma.customer.deleteMany({});

    // 3. Clear Firebase Data
    console.log("Clearing Firebase Logs...");
    await set(ref(db, 'logs'), null);

    console.log("Resetting Device Authorization in Firebase...");
    // We want to remove 'authorized_card' from all devices
    const devicesRef = ref(db, 'devices');
    const snapshot = await get(devicesRef);
    if (snapshot.exists()) {
        const updates: any = {};
        snapshot.forEach((childSnapshot) => {
            const deviceId = childSnapshot.key;
            // Set authorized_card to null (delete it)
            updates[`devices/${deviceId}/authorized_card`] = null;
        });
        if (Object.keys(updates).length > 0) {
            await ref(db).update(updates);
        }
    }

    console.log("✅ Cleanup Complete! All transactional data has been wiped.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
