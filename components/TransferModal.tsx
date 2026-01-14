"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRightLeft, DoorClosed, Save } from "lucide-react";

type TransferModalProps = {
    isOpen: boolean;
    onClose: () => void;
    guestName: string;
    currentRoom: string;
    onTransfer: (newRoom: string) => void;
};

export default function TransferModal({ isOpen, onClose, guestName, currentRoom, onTransfer }: TransferModalProps) {
    const [newRoom, setNewRoom] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoom && newRoom !== currentRoom) {
            onTransfer(newRoom);
            onClose();
            setNewRoom("");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Transfer Room
                            </h3>
                            <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl space-y-2">
                                <p className="text-sm text-blue-600 font-semibold">Current Booking</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">{guestName}</span>
                                    <span className="bg-white px-2 py-1 rounded text-xs font-bold text-slate-600 border border-blue-100">Room {currentRoom}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Select New Room</label>
                                <div className="relative">
                                    <DoorClosed className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <select
                                        required
                                        value={newRoom}
                                        onChange={(e) => setNewRoom(e.target.value)}
                                        className="w-full pl-10 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                                    >
                                        <option value="">-- Select Available Room --</option>
                                        <option value="101" disabled={currentRoom === "101"}>101 {currentRoom === "101" && "(Current)"}</option>
                                        <option value="102" disabled={currentRoom === "102"}>102 {currentRoom === "102" && "(Current)"}</option>
                                        <option value="201" disabled={currentRoom === "201"}>201 {currentRoom === "201" && "(Current)"}</option>
                                        <option value="202" disabled={currentRoom === "202"}>202 {currentRoom === "202" && "(Current)"}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20">Transfer Now</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
