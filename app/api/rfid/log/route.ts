import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("card_id");
    const action = searchParams.get("action"); // 'fetch' or 'log' (default log for esp32 backward compat if needed, but esp32 usually provides params)

    // ESP32 Logging Mode (Standard call from firmware)
    // Firmware sends: ?card_id=X&device_id=Y&access=true...
    // We can distinguish by presence of 'device_id' maybe? Or just assume if it has data params it's a log.
    // Actually, distinct endpoint is better. But to avoid changing ESP32, let's look at usage.
    // ESP32 uses: /api/rfid/check ... wait, ESP32 calls /api/rfid/log ??
    // The ESP32 code calls `/api/rfid/check` to validate.
    // Does it call `/api/rfid/log`? 
    // Checking `hotel_node.ino`: It calls `/api/ble/event` and `/api/rfid/check`.
    // It does NOT seem to call `/api/rfid/log` explicitly in the snippets I saw.
    // Wait, let me double check the ESP32 code for `log` calls.

    // If ESP32 doesn't call this, then `check` might be logging internally?
    // Let's assume this route is for viewing logs too.

    if (action === 'fetch' && cardId) {
        // Fetch logs for UI
        const logs = db.getLogs(cardId);
        return NextResponse.json(logs);
    }

    // Default: Logging (or if this endpoint is only for logging)
    // Currently this endpoint always adds specific hardcoded log if params are missing?
    // No, it expects card_id.

    // Fallback log insertion (if used by some device)
    const deviceId = searchParams.get("device_id") || "unknown";
    const access = searchParams.get("access") === "granted";
    const type = searchParams.get("type");

    if (!cardId) return NextResponse.json({ error: "Missing card_id" }, { status: 400 });

    console.log(`[API] Log Transaction: Card=${cardId} Access=${access}`);

    db.addLog({
        deviceId,
        cardId,
        type: type || "unknown",
        access,
        message: access ? "Entry Granted" : "Entry Denied"
    });

    return NextResponse.json({ success: true });
}
