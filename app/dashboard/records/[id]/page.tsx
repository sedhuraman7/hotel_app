"use client";

import { useState, use, useEffect } from "react";
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
    const [orders, setOrders] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [guestDetails, setGuestDetails] = useState<any>(null);
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
        setLoading(true);
        setTransactions([]);

        try {
            // Fetch Logs from SQL API using guestId (which is passed as 'id' in params)
            console.log(`Fetching logs for Guest ID: ${id}`);
            const res = await fetch(`/api/logs?guestId=${id}&start=${dateRange.start}&end=${dateRange.end}`);

            if (res.ok) {
                const logs = await res.json();
                console.log("Raw Logs:", logs);

                // Map SQL Logs to UI format
                const formattedLogs = logs.map((log: any) => {
                    let category = "Unknown";
                    const typeLower = log.type?.toLowerCase() || "";
                    const messageLower = log.message?.toLowerCase() || "";

                    if (typeLower.includes("ble")) {
                        category = "BLE";
                    } else if (typeLower.includes("guest") || messageLower.includes("guest")) {
                        category = "Guest";
                    } else if (typeLower.includes("employee") || messageLower.includes("employee")) {
                        category = "Employee";
                    } else if (!log.access) {
                        category = "Denied";
                    } else {
                        // If authorized but not explicitly guest, assume employee (staff card)
                        if (log.access) {
                            category = "Employee";
                        } else {
                            category = "Denied";
                        }
                    }

                    return {
                        id: log.id?.toString() || Math.random().toString(),
                        type: log.type,
                        category: category,
                        name: log.message || "Unknown User",
                        position: log.deviceId ? `Room/Device: ${log.deviceId}` : "Room Access",
                        cardId: log.cardId,
                        deviceId: log.deviceId, // Store for UI
                        access: log.access ? "Authorized" : "Denied",
                        time: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString()
                    };
                });

                setTransactions(formattedLogs);
            } else {
                console.error("Failed to fetch logs");
                setTransactions([]);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/restaurant/order?guestId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/feedback?guestId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComplaints = async () => {
        setLoading(true);
        console.log(`Fetching complaints for guestId: ${id}`);
        try {
            const res = await fetch(`/api/complaints?guestId=${id}`);
            if (res.ok) {
                const data = await res.json();
                console.log("Complaints data:", data);
                setComplaints(data);
            }
        } catch (error) {
            console.error("Error fetching complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGuestDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/guests');
            if (res.ok) {
                const data = await res.json();
                const guest = data.find((g: any) => g.id === id);
                setGuestDetails(guest);
            }
        } catch (error) {
            console.error("Error fetching guest details:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateComplaintStatus = async (complaintId: string, status: string) => {
        try {
            await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: complaintId, status })
            });
            fetchComplaints();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    // simplified polling or effect
    const loadData = () => {
        if (activeTab === "Transaction") fetchTransactions();
        if (activeTab === "Restaurant") fetchOrders();
        if (activeTab === "Star Rating") fetchFeedback();
        if (activeTab === "Total Complaints") fetchComplaints();
        if (activeTab === "Guest Checkin") fetchGuestDetails();
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    // Poll every 5s if on tracking tabs
    useEffect(() => {
        if (activeTab === "Total Complaints" || activeTab === "Restaurant") {
            const interval = setInterval(loadData, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);


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
                                onClick={loadData}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                {loading ? "Loading..." : "Get Data"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Content */}
                {activeTab === "Transaction" && (
                    <div className="space-y-6">
                        {/* Stats Chips */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-purple-50 text-purple-700 p-4 rounded-xl flex items-center justify-between border border-purple-100">
                                <span className="flex items-center gap-2 font-semibold"><User className="w-4 h-4" /> Employee</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Employee").length}</span>
                            </div>
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                                <span className="flex items-center gap-2 font-semibold"><UserCheck className="w-4 h-4" /> Guest</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Guest").length}</span>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center justify-between border border-emerald-100">
                                <span className="flex items-center gap-2 font-semibold"><History className="w-4 h-4" /> BLE</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "BLE").length}</span>
                            </div>
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-between border border-red-100">
                                <span className="flex items-center gap-2 font-semibold"><HelpCircle className="w-4 h-4" /> Denied/Other</span>
                                <span className="font-bold text-lg">{transactions.filter(t => t.category === "Denied" || t.category === "Unknown").length}</span>
                            </div>
                        </div>

                        {/* Sub Tabs */}
                        <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
                            {['All Transactions', 'Employee', 'Guest', 'BLE', 'Denied'].map((tab) => (
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
                                            <th className="p-4">Room/Device</th>
                                            <th className="p-4">Card ID</th>
                                            <th className="p-4">Access Type</th>
                                            <th className="p-4 text-right">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.filter(t => activeSubTab === 'All Transactions' || t.category === activeSubTab).length > 0 ? (
                                            transactions
                                                .filter(t => activeSubTab === 'All Transactions' || t.category === activeSubTab) // Filter Denied not Unknown for tab
                                                .map((txn, index) => (
                                                    <tr key={txn.id} className="hover:bg-slate-50/50">
                                                        <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                                                        <td className="p-4 text-sm font-medium text-slate-700">{txn.id}</td>
                                                        <td className="p-4 text-sm text-slate-600">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${txn.type?.toLowerCase().includes('ble') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {txn.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-600">{txn.name}</td>
                                                        <td className="p-4 text-sm text-slate-600 font-mono text-xs">{txn.position}</td>
                                                        <td className="p-4 text-sm font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit">{txn.cardId}</td>
                                                        <td className="p-4 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${txn.access === 'Exit' || txn.access === 'Removed' ? 'bg-orange-100 text-orange-700' :
                                                                txn.access === 'System' || txn.access === 'Denied' ? 'bg-red-100 text-red-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {txn.access}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-slate-500 text-right whitespace-nowrap">{txn.time}</td>
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

                {/* Star Rating View */}
                {activeTab === "Star Rating" && (
                    <div className="space-y-4">
                        {feedbacks.length > 0 ? (
                            feedbacks.map((fb: any) => (
                                <div key={fb.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-5 h-5 ${star <= fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-500 ml-2">{new Date(fb.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-700">{fb.comment || "No comment provided."}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-100">No ratings yet.</div>
                        )}
                    </div>
                )}

                {/* Restaurant View */}
                {activeTab === "Restaurant" && (
                    <div className="space-y-4">
                        {orders.length > 0 ? (
                            orders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-2">
                                        <div>
                                            <div className="font-bold text-slate-800">Order #{order.id.slice(0, 8)}</div>
                                            <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.menuItem.name} x {item.quantity}</span>
                                                <span className="font-mono">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>₹{order.totalAmount}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-100">No orders placed.</div>
                        )}
                    </div>
                )}

                {/* Total Complaints View */}
                {activeTab === "Total Complaints" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Complaints Log</h2>
                            <button onClick={fetchComplaints} className="text-sm text-blue-600 hover:text-blue-800 underline">Refresh</button>
                        </div>
                        {complaints.length > 0 ? (
                            complaints.map((comp: any) => (
                                <div key={comp.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-slate-800">{comp.type}</span>
                                            <span className="text-xs text-slate-500">{new Date(comp.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mb-1">
                                            Guest: {comp.guest?.name} {comp.guest?.customer?.email ? `(${comp.guest.customer.email})` : <span className="text-red-500 font-bold">(No Email)</span>}
                                        </div>
                                        <p className="text-slate-600">{comp.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${comp.status === 'Open' ? 'bg-red-100 text-red-700' :
                                            comp.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                comp.status === 'Resolved' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {comp.status}
                                        </span>
                                        {comp.status !== 'Closed' && comp.status !== 'Resolved' && (
                                            <div className="flex gap-2">
                                                {comp.status === 'Open' && (
                                                    <button
                                                        onClick={() => updateComplaintStatus(comp.id, 'In Progress')}
                                                        className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded border border-yellow-200 hover:bg-yellow-100"
                                                    >
                                                        Mark In Progress
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateComplaintStatus(comp.id, 'Resolved')}
                                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                                                >
                                                    Mark Resolved & Verify
                                                </button>
                                            </div>
                                        )}
                                        {comp.status === 'Resolved' && (
                                            <span className="text-xs text-slate-400 italic">Waiting for Guest...</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-100">No complaints found.</div>
                        )}
                    </div>
                )}

                {/* Guest Checkin View */}
                {activeTab === "Guest Checkin" && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        {guestDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Guest Profile</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between"><span className="text-slate-500">Name</span> <span className="font-medium">{guestDetails.name}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Phone</span> <span className="font-medium">{guestDetails.phone || 'N/A'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email</span> <span className="font-medium">{guestDetails.email || 'N/A'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Loyalty Points</span> <span className="font-medium text-yellow-600">{guestDetails.customer?.points || 0} pts</span></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Stay Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between"><span className="text-slate-500">Room</span> <span className="font-medium bg-slate-100 px-2 rounded">{guestDetails.room?.id}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Check In</span> <span className="font-medium">{new Date(guestDetails.checkInTime).toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className="font-medium text-green-600">{guestDetails.status}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Payment Status</span> <span className={`font-medium ${guestDetails.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{guestDetails.paymentStatus}</span></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500">Loading guest details...</div>
                        )}
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {activeTab !== "Transaction" && activeTab !== "Star Rating" && activeTab !== "Restaurant" && activeTab !== "Total Complaints" && activeTab !== "Guest Checkin" && (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                        <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                            {/* Icon placeholder logic */}
                            <HelpCircle className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{activeTab} View</h3>
                        <p className="text-slate-500">Data for {activeTab} will be displayed here based on the selected date range.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
