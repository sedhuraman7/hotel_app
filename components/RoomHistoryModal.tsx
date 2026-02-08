
"use client";

import { useEffect, useState } from "react";
import { X, Calendar, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

type RoomHistoryModalProps = {
    roomId: string | null;
    isOpen: boolean;
    onClose: () => void;
};

export default function RoomHistoryModal({ roomId, isOpen, onClose }: RoomHistoryModalProps) {
    const [guests, setGuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && roomId) {
            setLoading(true);
            // We need an API to fetch guests by roomId.
            // Currently /api/guests lists ALL guests. We might need to filter client side or add query param.
            // Let's assume /api/guests returns all and we filter here for now, or use a specific query.
            // A better way is /api/guests?roomId=101
            fetch(`/api/guests?roomId=${roomId}`)
                .then(res => res.json())
                .then(data => {
                    // Filter if API doesn't support generic filtering yet (it might return all)
                    // The GET /api/guests currently returns all guests.
                    // We can filter client side for safety.
                    const roomGuests = Array.isArray(data)
                        ? data.filter((g: any) => g.roomId === roomId || g.currentRoomId === roomId)
                        : [];

                    // Sort by checkInTime descending
                    roomGuests.sort((a: any, b: any) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
                    setGuests(roomGuests);
                })
                .catch(err => console.error("History fetch error:", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, roomId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Room {roomId} History</h2>
                        <p className="text-sm text-slate-500">Guest log and transaction archives</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Loading history...</div>
                    ) : guests.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-6 h-6 text-slate-300" />
                            </div>
                            <h3 className="text-slate-600 font-medium">No History Found</h3>
                            <p className="text-slate-400 text-sm">No guests have checked into this room yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {guests.map((guest) => {
                                const isCurrent = guest.status === 'Checked In';
                                return (
                                    <div key={guest.id} className={`group bg-white rounded-xl p-4 border transition-all hover:shadow-md ${isCurrent ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {guest.name}
                                                    {isCurrent && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Active</span>}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-mono">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        In: {new Date(guest.checkInTime).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {guest.checkOutTime
                                                            ? `Out: ${new Date(guest.checkOutTime).toLocaleDateString()}`
                                                            : 'Ongoing Stay'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-slate-900">₹{guest.totalAmount}</div>
                                                <div className={`text-xs font-semibold ${guest.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {guest.paymentStatus || 'Unpaid'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-50 flex justify-end">
                                            <Link
                                                href={`/dashboard/records/${guest.id}`}
                                                className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                                            >
                                                View Transactions & Full Details <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
