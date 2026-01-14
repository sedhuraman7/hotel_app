"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Printer, Download, CreditCard } from "lucide-react";

type InvoiceModalProps = {
    isOpen: boolean;
    onClose: () => void;
    record: any;
};

export default function InvoiceModal({ isOpen, onClose, record }: InvoiceModalProps) {
    if (!record) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" /> Invoice
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">#INV-{Date.now().toString().slice(-6)}</p>
                            </div>
                            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto">
                            {/* Hotel Info */}
                            <div className="text-center border-b border-slate-100 pb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Luxe Ocean Hotel</h2>
                                <p className="text-slate-500 text-sm">123 Beach Road, Chennai</p>
                            </div>

                            {/* Guest Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400 uppercase text-xs font-bold mb-1">Guest Name</p>
                                    <p className="font-semibold text-slate-800">{record.guestName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 uppercase text-xs font-bold mb-1">Room No.</p>
                                    <p className="font-semibold text-slate-800 text-lg">{record.roomNumber}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 uppercase text-xs font-bold mb-1">Check In</p>
                                    <p className="font-medium text-slate-700">{record.checkInTime}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 uppercase text-xs font-bold mb-1">Stay Duration</p>
                                    <p className="font-medium text-slate-700">{record.stayLength}</p>
                                </div>
                            </div>

                            {/* Bill Tables */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-slate-600">Room Charges</span>
                                    <span className="font-medium">₹{Number(record.totalAmount) * 0.9}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-slate-600">Taxes (10%)</span>
                                    <span className="font-medium">₹{Number(record.totalAmount) * 0.1}</span>
                                </div>
                                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-slate-800">Total Amount</span>
                                    <span className="font-bold text-blue-600 text-lg">₹{record.totalAmount}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${record.status === 'Checked In'
                                        ? 'bg-green-50 text-green-600 border-green-200'
                                        : 'bg-red-50 text-red-600 border-red-200'
                                    }`}>
                                    Status: {record.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                            <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors">
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-colors">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
