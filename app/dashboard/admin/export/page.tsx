"use client";

import { useState } from "react";
import { Lock, FileSpreadsheet, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminExportPage() {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState("");

    // Export State
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isDownloading, setIsDownloading] = useState(false);

    const OWNER_PASSWORD = "admin"; // Simple hardcoded password for demo purposes

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === OWNER_PASSWORD) {
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Incorrect Access Key");
            setPasswordInput("");
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const res = await fetch("/api/export/monthly-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month: selectedMonth, year: selectedYear })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Monthly_Report_${selectedMonth}_${selectedYear}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Failed to download report");
            }
        } catch (err) {
            console.error(err);
            alert("Error downloading file");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {!isAuthenticated ? (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md text-center space-y-6"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8 text-slate-700" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Restricted Access</h1>
                            <p className="text-slate-500 text-sm mt-2">Enter Owner Password to access financial reports.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="text-left space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Access Key</label>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-center text-lg tracking-widest font-mono"
                                    placeholder="••••••"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 justify-center">
                                        <AlertCircle className="w-3 h-3" /> {error}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all"
                            >
                                Unlock Dashboard
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full text-center space-y-8"
                    >
                        <div className="flex items-center justify-center gap-3 text-green-600 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                            <span className="font-medium text-sm">Authenticated Owner Access</span>
                        </div>

                        <div>
                            <div className="inline-block p-4 bg-green-50 rounded-2xl mb-4">
                                <FileSpreadsheet className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Export Monthly Records</h2>
                            <p className="text-slate-500 mt-2 max-w-md mx-auto">
                                Download a read-only Excel sheet containing all check-in/out data, revenue, and guest details for the selected month.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                >
                                    {[2024, 2025, 2026].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full max-w-sm mx-auto py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating File...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download Excel Report
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
