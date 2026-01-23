module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Simple in-memory store for the demo
// In a real app, this would be a database like MongoDB or Postgres
__turbopack_context__.s([
    "db",
    ()=>db
]);
// Default Rooms with Device Binding (Mock)
let rooms = [];
let logs = [];
// Pre-approved cards (Mock DB)
const authorizedCards = {};
const db = {
    getRooms: ()=>rooms,
    getRoomById: (id)=>rooms.find((r)=>r.id === id),
    updateRoomStatus: (id, status, guestData)=>{
        const room = rooms.find((r)=>r.id === id);
        if (room) {
            room.status = status;
            room.currentGuest = guestData || undefined;
        }
    },
    // UPDATE DEVICE BINDING
    updateRoomDevice: (roomId, deviceId)=>{
        const room = rooms.find((r)=>r.id === roomId);
        if (room) {
            room.deviceId = deviceId;
        }
    },
    // Check Access: Validates if Card is assigned to the Room associated with the Device
    checkAccess: (cardId, deviceId)=>{
        // 1. Check Global/Staff cards first
        if (authorizedCards[cardId]) return authorizedCards[cardId];
        // 2. Find which room this Device belongs to
        const room = rooms.find((r)=>r.deviceId === deviceId);
        // 3. If room found, check if it is Occupied AND the Card matches the Guest's Card
        if (room && room.status === "Occupied" && room.currentGuest?.cardId === cardId) {
            return `Guest ${room.currentGuest.name} (Room ${room.id})`;
        }
        return null;
    },
    addLog: (log)=>{
        const newLog = {
            ...log,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString()
        };
        logs.unshift(newLog); // Add to top
        if (logs.length > 100) logs.pop(); // Keep size manageable
        return newLog;
    },
    getLogs: ()=>logs
};
}),
"[project]/app/api/dashboard/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/store.ts [app-route] (ecmascript)");
;
;
async function GET() {
    const rooms = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].getRooms();
    const logs = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].getLogs().slice(0, 5); // Base 5 recent logs
    const stats = {
        occupied: rooms.filter((r)=>r.status === "Occupied").length,
        vacant: rooms.filter((r)=>r.status === "Vacant").length,
        cleaning: rooms.filter((r)=>r.status === "Cleaning").length,
        // dirty: rooms.filter(r => r.status === "Dirty").length || 0,
        totalGuests: rooms.reduce((acc, r)=>acc + (r.status === "Occupied" ? 1 : 0), 0),
        recentLogs: logs,
        revenue: 0
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(stats);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__64958b23._.js.map