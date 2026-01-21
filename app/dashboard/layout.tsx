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
    FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [hotelData, setHotelData] = useState({ name: "Holiday Chennai", email: "admin@hotel.com" });

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
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <ConciergeBell className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl tracking-tight hidden md:block">Luxe OS</span>
                            </div>

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
                            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

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
