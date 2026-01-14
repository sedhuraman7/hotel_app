"use client";

import {
    IndianRupee,
    Users,
    BedDouble,
    CalendarDays,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Clock,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    LogOut,
    Activity
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Poll for updates every 2 seconds
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, []);

    const chartData = stats ? [
        { name: 'Occupied', value: stats.occupied, color: '#22c55e' },
        { name: 'Vacant', value: stats.vacant, color: '#f59e0b' },
        { name: 'Cleaned', value: stats.cleaning, color: '#3b82f6' },
    ] : [];

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-6">

            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Front Desk Overview</h1>
                    <p className="text-slate-500 text-sm">Real-time monitoring active.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase animate-pulse">
                    <Activity className="w-3 h-3" /> Live
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue}`}
                    change="0%"
                    isPositive={true}
                    icon={IndianRupee}
                    color="blue"
                />
                <StatCard
                    title="Rev. Per Room"
                    value="₹0"
                    change="0%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Occupancy Rate"
                    value={`${Math.round((stats.occupied / (stats.occupied + stats.vacant + stats.cleaning)) * 100 || 0)}%`}
                    change="0%"
                    isPositive={false}
                    icon={BedDouble}
                    color="orange"
                />
                <StatCard
                    title="Total Guests"
                    value={stats.totalGuests}
                    change="0"
                    isPositive={true}
                    icon={Users}
                    color="green"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Room Status Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BedDouble className="w-5 h-5 text-indigo-500" />
                                Live Room Status
                            </h3>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={60}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Live Logs */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-500" />
                            Recent Access Logs (ESP32)
                        </h3>
                        <div className="space-y-2">
                            {stats.recentLogs.length === 0 ? (
                                <p className="text-slate-500 text-sm italic">No logs yet. Scan a card!</p>
                            ) : (
                                stats.recentLogs.map((log: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${log.access ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Card: {log.cardId}</p>
                                                <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.access ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href="/dashboard/records" className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-colors">
                                <CalendarDays className="w-4 h-4" />
                                Reserve Room
                            </Link>
                            <Link href="/dashboard/records" className="h-12 bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                                Check In
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-green-50 text-green-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorStyles[color as keyof typeof colorStyles]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {change}
                </span>
                <span className="text-slate-400 ml-2">vs last week</span>
            </div>
        </div>
    );
}
