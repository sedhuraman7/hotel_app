"use client";

import { useState, use } from "react";
import {
    UserCheck,
    MessageSquare,
    Star,
    IndianRupee,
    History,
    Utensils,
    ArrowLeft,
    Search,
    User,
    HelpCircle,
    Calendar
} from "lucide-react";
import Link from "next/link";

export default function RoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [activeTab, setActiveTab] = useState("Transaction");
    const [dateRange, setDateRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('All Transactions');

    const tabs = [
        { id: "Guest Checkin", icon: UserCheck, label: "Guest Checkin" },
        { id: "Total Complaints", icon: MessageSquare, label: "Total Complaints" },
        { id: "Star Rating", icon: Star, label: "Star Rating" },
        { id: "Total Revenue", icon: IndianRupee, label: "Total Revenue" },
        { id: "Transaction", icon: History, label: "Transaction" },
        { id: "Restaurant", icon: Utensils, label: "Restaurant" },
    ];

    const fetchTransactions = async () => {
        // if (!dateRange.start || !dateRange.end) return; // Allow fetching without date logic if API handles defaults, but API logic expects ranges if provided.
        // Actually for filtered view, logging specific guest history is better without strict date restrictions initially?
        // Let's keep existing logic.

        setLoading(true);
        setTransactions([]);

        try {
            // Fetch Logs from SQL API using guestId (which is passed as 'id' in params)
            const res = await fetch(`/api/logs?guestId=${id}&start=${dateRange.start}&end=${dateRange.end}`);

            if (res.ok) {
                const logs = await res.json();

                // Map SQL Logs to UI format
                const formattedLogs = logs.map((log: any) => ({
                    id: log.id?.toString() || Math.random().toString(),
                    type: log.type,
                    category: log.type === 'RFID' || (log.type && log.type.includes('Guest')) ? 'Guest' : 'Employee',
                    name: log.message || "Unknown User",
                    position: "Room Access",
                    cardId: log.cardId,
                    deviceId: log.deviceId,
                    access: log.access ? "Authorized" : "Denied",
                    time: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString()
                }));

                setTransactions(formattedLogs);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[80vh]">

            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                <Link href="/dashboard/records" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 px-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Records
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all border-l-4 ${activeTab === tab.id
                                ? "bg-blue-50 text-blue-600 border-blue-600"
                                : "text-slate-600 hover:bg-slate-50 border-transparent"
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-blue-600" : "text-slate-400"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">

                {/* Header Section based on active tab */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" /> Select Date Range (Record {id})
                            </h2>
                            <div className="flex gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">End Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="sm:pb-1">
                            <button
                                onClick={fetchTransactions}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? "Loading..." : "Get Transactions"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content */}
                {activeTab === "Transaction" && (
                    <div className="space-y-6">
                        {/* Stats Chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-purple-50 text-purple-700 p-4 rounded-xl flex items-center justify-between border border-purple-100">
                                <span className="flex items-center gap-2 font-semibold"><User className="w-4 h-4" /> Employee Transactions</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Employee").length}</span>
                            </div>
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                                <span className="flex items-center gap-2 font-semibold"><UserCheck className="w-4 h-4" /> Guest Transactions</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Guest").length}</span>
                            </div>
                            <div className="bg-orange-50 text-orange-700 p-4 rounded-xl flex items-center justify-between border border-orange-100">
                                <span className="flex items-center gap-2 font-semibold"><HelpCircle className="w-4 h-4" /> Other Events</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Unknown").length}</span>
                            </div>
                            <div className="bg-slate-100 text-slate-700 p-4 rounded-xl flex items-center justify-between border border-slate-200 sm:col-span-3">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-lg">{transactions.length}</span>
                            </div>
                        </div>

                        {/* Sub Tabs */}
                        <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
                            {['All Transactions', 'Employee', 'Guest', 'Unknown'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeSubTab === tab ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                                            <th className="p-4">S.No</th>
                                            <th className="p-4">Transaction ID</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Position/Details</th>
                                            <th className="p-4">Card ID</th>
                                            <th className="p-4">Access Type</th>
                                            <th className="p-4 text-right">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.filter(t => activeSubTab === 'All Transactions' || t.category === activeSubTab).length > 0 ? (
                                            transactions
                                                .filter(t => activeSubTab === 'All Transactions' || t.category === activeSubTab)
                                                .map((txn, index) => (
                                                    <tr key={txn.id} className="hover:bg-slate-50/50">
                                                        <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                                                        <td className="p-4 text-sm font-medium text-slate-700">{txn.id}</td>
                                                        <td className="p-4 text-sm text-slate-600">{txn.type}</td>
                                                        <td className="p-4 text-sm text-slate-600">{txn.name}</td>
                                                        <td className="p-4 text-sm text-slate-600">{txn.position}</td>
                                                        <td className="p-4 text-sm font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit">{txn.cardId}</td>
                                                        <td className="p-4 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${txn.access === 'Exit' || txn.access === 'Removed' ? 'bg-orange-100 text-orange-700' :
                                                                txn.access === 'System' || txn.access === 'Denied' ? 'bg-red-100 text-red-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {txn.access}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-500 text-right">{txn.time}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-slate-400">
                                                    {loading ? "Fetching logs..." : "No transactions found for this date."}
                                                </td>
                                            </tr>
                                        )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {activeTab !== "Transaction" && (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                            {tabs.find(t => t.id === activeTab)?.icon && <div className="text-slate-300 transform scale-150">
                                {/* Icon placeholder logic */}
                            </div>}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{activeTab} View</h3>
                        <p className="text-slate-500">Data for {activeTab} will be displayed here based on the selected date range.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
