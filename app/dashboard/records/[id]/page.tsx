"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Shield, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuestHistoryPage() {
    const params = useParams();
    const guestId = params?.id;

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchTransactions = async () => {
        try {
            // Fetch logs for this guest/card
            // Since logs are by card_id, we need to know the card_id of the guest first
            // But let's assume we fetch guest details which includes logs or use a logs endpoint

            // First get guest details to get cardId
            const guestRes = await fetch(`/api/guests/${guestId}`);
            if (!guestRes.ok) throw new Error("Guest not found");
            const guest = await guestRes.json();

            if (guest.cardId) {
                // Fetch Element logs for this card
                const logsRes = await fetch(`/api/rfid/log?card_id=${guest.cardId}`);
                if (logsRes.ok) {
                    const logs = await logsRes.json();
                    setTransactions(logs);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (guestId) fetchTransactions();
    }, [guestId]);

    const filtered = transactions.filter(t =>
        t.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/records" className="p-2 hover:bg-slate-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Guest Transaction History</h1>
                    <p className="text-slate-500 text-sm">Access logs and events for Guest #{guestId}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-700">Activity Log</h3>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading History...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No transactions found for this guest card.</div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((log: any, i: number) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-50">
                                <div className={`p-2 rounded-lg ${log.access ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {log.access ? <Shield className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-slate-700 text-sm">{log.message}</h4>
                                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Device: <span className="font-mono text-slate-600">{log.deviceId}</span> •
                                        Type: <span className="uppercase">{log.type}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
