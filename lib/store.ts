
// Simple in-memory store for the demo
// In a real app, this would be a database like MongoDB or Postgres

export type Room = {
    id: string; // Room Number (e.g. 101)
    type: string;
    deviceId: string; // ESP32 Device ID
    status: "Occupied" | "Vacant" | "Cleaning";
    currentGuest?: {
        name: string;
        cardId: string;
        checkInTime: string;
    };
};

export type Log = {
    id: string;
    timestamp: string;
    deviceId: string;
    cardId: string;
    type: string;
    access: boolean;
    message: string;
};

// Default Rooms with Device Binding (Mock)
let rooms: Room[] = [];

let logs: Log[] = [];

// Pre-approved cards (Mock DB)
const authorizedCards: Record<string, string> = {};

export const db = {
    getRooms: () => rooms,

    getRoomById: (id: string) => rooms.find(r => r.id === id),

    updateRoomStatus: (id: string, status: Room['status'], guestData?: Room['currentGuest']) => {
        const room = rooms.find(r => r.id === id);
        if (room) {
            room.status = status;
            room.currentGuest = guestData || undefined;
        }
    },

    // UPDATE DEVICE BINDING
    updateRoomDevice: (roomId: string, deviceId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            room.deviceId = deviceId;
        }
    },

    // Check Access: Validates if Card is assigned to the Room associated with the Device
    checkAccess: (cardId: string, deviceId: string) => {
        // 1. Check Global/Staff cards first
        if (authorizedCards[cardId]) return authorizedCards[cardId];

        // 2. Find which room this Device belongs to
        const room = rooms.find(r => r.deviceId === deviceId);

        // 3. If room found, check if it is Occupied AND the Card matches the Guest's Card
        if (room && room.status === "Occupied" && room.currentGuest?.cardId === cardId) {
            return `Guest ${room.currentGuest.name} (Room ${room.id})`;
        }

        return null;
    },

    addLog: (log: Omit<Log, "id" | "timestamp">) => {
        const newLog = {
            ...log,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString()
        };
        logs.unshift(newLog); // Add to top
        if (logs.length > 100) logs.pop(); // Keep size manageable
        return newLog;
    },

    getLogs: (cardId?: string) => {
        if (cardId) return logs.filter(l => l.cardId === cardId);
        return logs;
    },
};
