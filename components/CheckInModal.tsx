"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Users, CreditCard, Calendar, DoorClosed, Key, Save } from "lucide-react";

type CheckInModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
};

export default function CheckInModal({ isOpen, onClose, onSubmit, initialData }: CheckInModalProps) {
    const [rooms, setRooms] = useState<any[]>([]);

    const defaultData = {
        // Guest Details
        guestName: "",
        adults: 1,
        children: 0,
        rfid: "",
        phone: "", // Added phone field

        // Room Details
        roomNumber: "", // Room ID
        roomType: "",
        rate: 0,

        // Payment Details
        roomTariff: 0,
        taxAmount: 0,
        totalAmount: 0,
        stayLength: 1,
        checkInTime: "",
        paymentStatus: "Unpaid",
        status: "Checked In"
    };

    const [formData, setFormData] = useState(defaultData);

    // Fetch rooms when modal opens
    useEffect(() => {
        if (isOpen) {
            fetch("/api/rooms")
                .then(res => res.json())
                .then(data => setRooms(data))
                .catch(err => console.error("Failed to fetch rooms", err));

            if (initialData) {
                setFormData({
                    ...defaultData,
                    ...initialData,
                    checkInTime: initialData.checkInTime ? initialData.checkInTime.replace(" ", "T").slice(0, 16) : "",
                    stayLength: parseInt(initialData.stayLength) || 1
                });
            } else {
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                setFormData({
                    ...defaultData,
                    checkInTime: now.toISOString().slice(0, 16)
                });
            }
        }
    }, [isOpen, initialData]);

    // Update Room Type when Room Number changes
    useEffect(() => {
        if (formData.roomNumber) {
            const selectedRoom = rooms.find(r => r.id === formData.roomNumber);
            if (selectedRoom) {
                setFormData(prev => ({ ...prev, roomType: selectedRoom.type }));
            }
        }
    }, [formData.roomNumber, rooms]);

    // Auto-calculate Total
    useEffect(() => {
        const tariff = Number(formData.roomTariff) || 0;
        const tax = Number(formData.taxAmount) || 0;
        setFormData(prev => ({ ...prev, totalAmount: tariff + tax }));
    }, [formData.roomTariff, formData.taxAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">New Concierge Check-In</h2>
                                <p className="text-sm text-slate-500">Enter guest details to create a new record</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Guest Details */}
                            <section>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-500" /> Guest Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Guest Name *</label>
                                        <input name="guestName" required value={formData.guestName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="+91 9876543210" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">RF ID</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input name="rfid" value={formData.rfid} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Scan Card..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Adults *</label>
                                            <input type="number" name="adults" min={1} required value={formData.adults} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Children</label>
                                            <input type="number" name="children" min={0} value={formData.children} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Room Details */}
                            <section>
                                <div className="h-px bg-slate-100 mb-6" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <DoorClosed className="w-5 h-5 text-purple-500" /> Room Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Room Number *</label>
                                        <select name="roomNumber" required value={formData.roomNumber} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer">
                                            <option value="">- Select -</option>
                                            {rooms.map(room => (
                                                <option key={room.id} value={room.id} disabled={room.status !== "Vacant"}>
                                                    Room {room.id} ({room.status})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Room Type</label>
                                        <input name="roomType" readOnly value={formData.roomType} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Rate</label>
                                        <input type="number" name="rate" required value={formData.rate} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                </div>
                            </section>

                            {/* Payment Details */}
                            <section>
                                <div className="h-px bg-slate-100 mb-6" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-500" /> Payment & Stay
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Room Tariff *</label>
                                        <input type="number" name="roomTariff" required value={formData.roomTariff} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Tax Amount *</label>
                                        <input type="number" name="taxAmount" required value={formData.taxAmount} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Total Amount</label>
                                        <input type="number" name="totalAmount" readOnly value={formData.totalAmount} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Stay Length (Days) *</label>
                                        <input type="number" name="stayLength" min={1} required value={formData.stayLength} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Check In Time *</label>
                                        <input type="datetime-local" name="checkInTime" required value={formData.checkInTime} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Payment Status *</label>
                                        <select name="paymentStatus" required value={formData.paymentStatus} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer">
                                            <option value="Paid">Paid</option>
                                            <option value="Unpaid">Unpaid</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 pt-4 pb-0 flex items-center justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
