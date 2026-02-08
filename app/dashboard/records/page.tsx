"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, FileText, ArrowRightLeft, History, DoorClosed, AlertTriangle } from "lucide-react";
import CheckInModal from "@/components/CheckInModal";
import TransferModal from "@/components/TransferModal";
import InvoiceModal from "@/components/InvoiceModal";

// Initial State
const initialRecords: any[] = [];

export default function RoomRecordsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Action Modals State
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [actionRecord, setActionRecord] = useState<any>(null);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/guests");
            if (res.ok) {
                const data = await res.json();
                // Map API data to UI structure
                const formatted = data.map((guest: any) => ({
                    id: guest.id,
                    guestName: guest.name,
                    roomNumber: guest.room?.id || "N/A",
                    checkInTime: new Date(guest.checkInTime).toLocaleString(),
                    checkOutDate: guest.checkOutTime ? new Date(guest.checkOutTime).toLocaleString() : "-",
                    stayLength: guest.stayLength + " days",
                    totalAmount: guest.totalAmount,
                    paymentStatus: guest.paymentStatus,
                    status: guest.status,
                    activeComplaints: guest.complaints ? guest.complaints.length : 0
                }));
                setRecords(formatted);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleAddRecord = async (data: any) => {
        const payload = {
            name: data.guestName,
            roomId: data.roomNumber,
            cardId: data.rfid || null,
            phone: data.phone,
            email: data.email,
            aadhar: data.aadhar,
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod, // From Modal
            totalAmount: data.totalAmount
        };

        const res = await fetch("/api/guests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchRecords();
            setIsModalOpen(false);
        } else {
            const err = await res.json();
            alert(`Check-in Failed: ${err.error}`);
        }
    };

    const handleCheckOut = async (guestId: string, paymentStatus: string, totalAmount: number) => {
        if (paymentStatus === 'Unpaid') {
            const confirmPayment = confirm(`⚠️ Payment Pending!\n\nTotal Amount: ₹${totalAmount}\n\nHas the guest paid by Cash or UPI? Click OK to confirm payment and checkout.`);
            if (!confirmPayment) return;
        } else {
            if (!confirm("Are you sure you want to check out this guest?")) return;
        }

        try {
            // If payment was unpaid, we assume it's now paid since they clicked OK
            const payload = {
                status: "Checked Out",
                paymentStatus: "Paid" // Auto-update to Paid on checkout
            };

            const res = await fetch(`/api/guests/${guestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchRecords(); // Refresh list
            } else {
                alert("Failed to check out guest");
            }
        } catch (error) {
            console.error("Checkout error:", error);
        }
    };

    const handleEdit = (record: any) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const openTransfer = (record: any) => {
        setActionRecord(record);
        setIsTransferOpen(true);
    };

    const openInvoice = (record: any) => {
        setActionRecord(record);
        setIsInvoiceOpen(true);
    };

    const handleTransferSubmit = async (newRoom: string) => {
        if (actionRecord) {
            try {
                const res = await fetch("/api/guests/transfer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        guestId: actionRecord.id,
                        oldRoomId: actionRecord.roomNumber,
                        newRoomId: newRoom
                    })
                });

                if (res.ok) {
                    fetchRecords(); // Refresh data
                    setIsTransferOpen(false);
                } else {
                    const err = await res.json();
                    alert(`Transfer Failed: ${err.error}`);
                }
            } catch (error) {
                console.error("Transfer error:", error);
                alert("Connection failed.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Active Check Ins</h1>
                    <p className="text-slate-500 text-sm">Manage guest check-ins and history</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                    >
                        Back
                    </Link>
                    <button
                        onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Add a New Record
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Guest Name</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Room Number</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Check-in Time</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Checked Out Date</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Stay Length</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Total Amount</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-blue-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 text-sm font-medium text-slate-700">{record.guestName}</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            {record.roomNumber}
                                            {record.activeComplaints > 0 && (
                                                <Link
                                                    href={`/dashboard/records/${record.id}?tab=Total Complaints`}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse border border-red-200 hover:bg-red-200 transition-colors cursor-pointer"
                                                    title={`${record.activeComplaints} Active Issue(s)`}
                                                >
                                                    <AlertTriangle className="w-3 h-3" /> {record.activeComplaints}
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 font-mono text-xs">{record.checkInTime}</td>
                                    <td className="p-4 text-sm text-slate-500 font-mono text-xs">{record.checkOutDate}</td>
                                    <td className="p-4 text-sm text-slate-600">{record.stayLength}</td>
                                    <td className="p-4 text-sm font-semibold text-slate-800">₹{record.totalAmount}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold gap-1.5 ${record.status === 'Checked In'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {record.status === 'Checked In' && (
                                                <button
                                                    onClick={() => handleCheckOut(record.id, record.paymentStatus || 'Unpaid', record.totalAmount)}
                                                    className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Check Out Guest"
                                                >
                                                    <DoorClosed className="w-4 h-4" />
                                                </button>
                                            )}
                                            <Link
                                                href={`/dashboard/records/${record.id}`}
                                                className="p-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                                title="View Transactions & History"
                                            >
                                                <History className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => openTransfer(record)}
                                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Transfer Room"
                                            >
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Edit Record"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openInvoice(record)}
                                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="View Invoice"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CheckInModal
                isOpen={isModalOpen}
                initialData={selectedRecord}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddRecord}
            />

            <TransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                guestName={actionRecord?.guestName}
                currentRoom={actionRecord?.roomNumber}
                onTransfer={handleTransferSubmit}
            />

            <InvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                record={actionRecord}
            />
        </div>
    );
}

// Removing RoomCard since we switched to Table view as per user request

