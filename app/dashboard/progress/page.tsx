"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, DollarSign, Users, Activity, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const StatCard = ({ title, value, change, icon: Icon, trend }: { title: string, value: string, change: string, icon: any, trend: "up" | "down" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden"
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
            </span>
            <span className="text-slate-400 text-xs">vs last month</span>
        </div>
    </motion.div>
);

export default function ProgressPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Business Analytics</h1>
                    <p className="text-slate-500 text-sm">Monitor your hotel's performance and growth</p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg outline-none focus:border-blue-500 cursor-pointer shadow-sm">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all">
                        <ArrowUpRight className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${data.stats.totalRevenue.toLocaleString()}`} change="+12.5%" icon={DollarSign} trend="up" />
                <StatCard title="Total Guests" value={data.stats.totalGuests} change="+8.2%" icon={Users} trend="up" />
                <StatCard title="Occupancy Rate" value={`${data.stats.occupancyRate}%`} change="-2.4%" icon={Activity} trend="down" />
                <StatCard title="Bookings (Month)" value={data.stats.bookingsThisMonth} change="+14.6%" icon={Calendar} trend="up" />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Revenue Overview</h3>
                        <p className="text-slate-400 text-sm">Income vs Expenses (Last 7 Days)</p>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Room Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Room Popularity</h3>
                        <p className="text-slate-400 text-sm">Most booked room types</p>
                    </div>
                    <div className="flex-1 min-h-[250px] relative">
                        {data.roomData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.roomData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.roomData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
                        )}
                        {/* Legend */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800">{data.stats.bookingsThisMonth}</p>
                                <p className="text-xs text-slate-500">Bookings</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        {data.roomData.map((item: any, index: number) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-slate-600">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
                <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.recentTransactions.map((trx: any) => (
                                <tr key={trx.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="py-4 text-sm text-slate-600 font-medium">#{trx.id}</td>
                                    <td className="py-4 text-sm text-slate-500">{trx.date}</td>
                                    <td className="py-4 text-sm text-slate-600">{trx.desc}</td>
                                    <td className="py-4 text-sm font-bold text-slate-800">₹{trx.amount}</td>
                                    <td className="py-4">
                                        <span className={`text-xs py-1 px-3 rounded-full font-bold ${trx.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {trx.status || "Completed"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {data.recentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No recent transactions found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
