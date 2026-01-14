"use client";

import { useEffect, useState } from "react";
import { BedDouble, Wrench, Plus, Save, Settings, Wifi } from "lucide-react";
import AddRoomModal from "@/components/AddRoomModal";

export default function RoomsAssetsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [editingRoom, setEditingRoom] = useState<string | null>(null);
    const [tempDeviceId, setTempDeviceId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Rooms from API
    const fetchRooms = async () => {
        try {
            const res = await fetch("/api/rooms");
            if (res.ok) {
                const data = await res.json();
                setRooms(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleEdit = (room: any) => {
        setEditingRoom(room.id);
        setTempDeviceId(room.deviceId || "");
    };

    const handleSave = async (id: string) => {
        // Optimistic update
        setRooms(prev => prev.map(r => r.id === id ? { ...r, deviceId: tempDeviceId } : r));
        setEditingRoom(null);

        // API Call
        await fetch("/api/rooms", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, deviceId: tempDeviceId })
        });
    };

    const handleAddRoom = async (data: any) => {
        const payload = {
            id: data.roomNumber,
            type: data.roomType,
            deviceId: data.deviceId
        };

        // API Call
        const res = await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchRooms(); // Refresh list
        } else {
            alert("Failed to add room. ID might exist.");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading Rooms...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rooms & Device Config</h1>
                    <p className="text-slate-500 text-sm">Map ESP32 Controllers to Rooms</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Room
                </button>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BedDouble className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">No Rooms Configured</h3>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">Add a room to start mapping your IoT devices and managing check-ins.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        + Add First Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">

                            {/* Status Indicator Stripe */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${room.deviceId ? "bg-green-500" : "bg-red-500/50"}`} />

                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                                    <BedDouble className="w-6 h-6" />
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">{room.type}</span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800">Room {room.id}</h3>

                            <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wifi className={`w-4 h-4 ${room.deviceId ? "text-green-600" : "text-amber-500"}`} />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ESP32 Device ID</span>
                                </div>

                                {editingRoom === room.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            autoFocus
                                            value={tempDeviceId}
                                            onChange={(e) => setTempDeviceId(e.target.value)}
                                            className="w-full text-sm p-1.5 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <button onClick={() => handleSave(room.id)} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600">
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center group cursor-pointer" onClick={() => handleEdit(room)}>
                                        <span className={`text-sm font-mono font-medium ${room.deviceId ? "text-slate-700" : "text-red-400 italic"}`}>
                                            {room.deviceId || "Not Configured"}
                                        </span>
                                        <Settings className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                                <button className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold uppercase hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                                    <Wrench className="w-3 h-3" /> Config
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRoom}
            />
        </div>
    );
}
