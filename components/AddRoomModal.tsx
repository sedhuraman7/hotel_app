"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, BedDouble, Router, Tag } from "lucide-react";

type AddRoomModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
};

export default function AddRoomModal({ isOpen, onClose, onSubmit }: AddRoomModalProps) {
    const [formData, setFormData] = useState({
        roomNumber: "",
        roomType: "Deluxe",
        deviceId: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
        setFormData({ roomNumber: "", roomType: "Deluxe", deviceId: "" }); // Reset
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-md overflow-hidden rounded-2xl shadow-2xl flex flex-col"
                    >
                        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Add New Room</h2>
                                <p className="text-sm text-slate-500">Register a room & link ESP32</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <BedDouble className="w-4 h-4" /> Room Number
                                    </label>
                                    <input
                                        required
                                        value={formData.roomNumber}
                                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                                        placeholder="e.g. 101"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Tag className="w-4 h-4" /> Room Type
                                    </label>
                                    <select
                                        value={formData.roomType}
                                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Standard">Standard</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Router className="w-4 h-4" /> ESP32 Device ID (MAC)
                                    </label>
                                    <input
                                        value={formData.deviceId}
                                        onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                                        placeholder="e.g. 12345678"
                                    />
                                    <p className="text-[10px] text-slate-400">Found in ESP32 Serial Monitor during startup.</p>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                Save Configuration
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
