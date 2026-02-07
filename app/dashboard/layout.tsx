"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ConciergeBell,
    BarChart2,
    FileText,
    Utensils,
    BedDouble,
    Users,
    Bell,
    LogOut,
    UserCircle,
    FileSpreadsheet,
    Package,
    AlertCircle,
    ChevronRight,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [hotelData, setHotelData] = useState({ name: "Holiday Chennai", email: "admin@hotel.com" });
    const [notifData, setNotifData] = useState<{ count: number, notifications: any[] }>({ count: 0, notifications: [] });
    const [showNotif, setShowNotif] = useState(false);

    const fetchNotifs = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifData(data);
            }
        } catch (e) {
            console.error("Notif fetch error", e);
        }
    };

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const name = localStorage.getItem("hotelName");
            const email = localStorage.getItem("hotelEmail");
            if (name || email) {
                setHotelData({
                    name: name || "Holiday Chennai",
                    email: email || "admin@hotel.com"
                });
            }
        }
    }, []);

    const navItems = [
        { name: "Front Desk", icon: ConciergeBell, href: "/dashboard" },
        { name: "Progress", icon: BarChart2, href: "/dashboard/progress" },
        { name: "Room Records", icon: FileText, href: "/dashboard/records" },
        { name: "Restaurant", icon: Utensils, href: "/dashboard/restaurant" },
        { name: "Rooms & Assets", icon: BedDouble, href: "/dashboard/rooms" },
        { name: "Employees", icon: Users, href: "/dashboard/employees" },
        { name: "Reports", icon: FileSpreadsheet, href: "/dashboard/admin/export" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Top Navigation Bar */}
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo / Title Area */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <ConciergeBell className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl tracking-tight hidden md:block">Luxe OS</span>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center space-x-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${isActive
                                                ? "text-white bg-slate-800"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : ""}`} />
                                            <span>{item.name}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full mx-4"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotif(!showNotif)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notifData.count > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-slate-900">
                                            {notifData.count}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                <AnimatePresence>
                                    {showNotif && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                                            >
                                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                                    {notifData.count > 0 && <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">{notifData.count} New</span>}
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto">
                                                    {notifData.notifications.length > 0 ? (
                                                        notifData.notifications.map((n) => (
                                                            <Link
                                                                key={n.id}
                                                                href={n.link}
                                                                onClick={() => setShowNotif(false)}
                                                                className="block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'Order' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                                                                        {n.type === 'Order' ? <Package className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-slate-800 truncate">{n.title}</p>
                                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.description}</p>
                                                                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                                                                </div>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center">
                                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <Bell className="w-6 h-6 text-slate-300" />
                                                            </div>
                                                            <p className="text-sm text-slate-500">No new notifications</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <Link
                                                    href="/dashboard/progress"
                                                    onClick={() => setShowNotif(false)}
                                                    className="block p-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    View All Activity
                                                </Link>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="h-6 w-px bg-slate-700 mx-1" />

                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{hotelData.name}</p>
                                    <p className="text-xs text-slate-400">{hotelData.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                        <UserCircle className="w-8 h-8 text-slate-300" />
                                    </div>
                                </div>
                                <Link
                                    href="/"
                                    onClick={() => localStorage.clear()}
                                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
