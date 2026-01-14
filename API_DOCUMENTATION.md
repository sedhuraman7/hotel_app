# API Documentation

## Base URL
`http://<YOUR_PC_IP>:3000/api`

## 1. RFID APIs

### Check Card Access (Verify)
**Endpoint:** `GET /rfid/check`
**Purpose:** Checks if a scanned card is valid for the given device (Room).
**Parameters:**
- `card_id`: The UID of the RFID card (e.g., `A3B2C1D4`).
- `device_id`: The ID of the ESP32 device (e.g., `101`).

**Response:**
```json
{
  "status": 1,
  "allowed": true,
  "type": "guest",  // or "employee"
  "name": "John Doe"
}
```

### Log RFID Event (Insert)
**Endpoint:** `GET /rfid/log`
**Purpose:** Logs an RFID scan event (Access Granted or Denied).
**Parameters:**
- `card_id`: The UID of the card.
- `type`: `1` (RFID Log).
- `device_id`: The ID of the ESP32.
- `access`: `granted` or `denied`.

## 2. BLE APIs

### Entry Detection
**Endpoint:** `GET /ble/entry`
**Purpose:** Triggered when a BLE tag (Key Fob) **enters** the room/zone.
**Parameters:**
- `tag_id`: The MAC address or Name of the BLE tag.
- `type`: `2` (Entry).
- `device_id`: The ID of the ESP32.

### Exit Detection
**Endpoint:** `GET /ble/exit`
**Purpose:** Triggered when a BLE tag **leaves** the room/zone (timeout).
**Parameters:**
- `tag_id`: The MAC address or Name of the BLE tag.
- `type`: `3` (Exit).
- `device_id`: The ID of the ESP32.

## 3. Employee RFID
Employee cards use the same **Check Card Access** API (`/rfid/check`).
The backend distinguishes them based on the `card_id`. If the ID matches an employee record, it returns `"type": "employee"`.

---

## Backend Info
**Current Status:** In-Memory (RAM).
**Data Persistence:** None. Data is lost if the server restarts.
**Recommendation:** Integrate **MongoDB** or **PostgreSQL** for permanent storage.
