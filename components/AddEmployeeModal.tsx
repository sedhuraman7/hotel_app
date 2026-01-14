"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Key, Smartphone, Mail, Calendar, MapPin, DollarSign, Bluetooth } from "lucide-react";

type AddEmployeeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
};

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }: AddEmployeeModalProps) {
    const [formData, setFormData] = useState({
        employeeName: "",
        employeeId: "",
        rfid: "",
        bleId: "",
        employeeType: "",
        phoneNumber: "+91 ",
        email: "",
        dob: "",
        address: "",
        joinDate: "",
        salary: "",
        status: "Active",
        assignedRoom: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
                                <p className="text-sm text-slate-500">Enter employee details to generate ID</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">

                            {/* Basic Details */}
                            <section>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-500" /> Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Employee Name *</label>
                                        <input name="employeeName" required value={formData.employeeName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Enter full name" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Phone Number *</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="employee@hotel.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Address</label>
                                        <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Enter employee address" />
                                    </div>
                                </div>
                            </section>

                            {/* Employment Details */}
                            <section>
                                <div className="h-px bg-slate-100 mb-6" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-500" /> Employment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Employee ID *</label>
                                        <input name="employeeId" required value={formData.employeeId} onChange={handleChange} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Employee Type *</label>
                                        <select name="employeeType" required value={formData.employeeType} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">- Select Type -</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Receptionist">Receptionist</option>
                                            <option value="Housekeeping">Housekeeping</option>
                                            <option value="Chef">Chef</option>
                                            <option value="Security">Security</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Status *</label>
                                        <select name="status" required value={formData.status} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Join Date *</label>
                                        <input type="date" name="joinDate" required value={formData.joinDate} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Salary</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Enter salary" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Assigned Room</label>
                                        <select name="assignedRoom" value={formData.assignedRoom} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">- Select Room (Optional) -</option>
                                            <option value="101">101</option>
                                            <option value="102">102</option>
                                            <option value="201">201</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Hardware / IoT Config */}
                            <section>
                                <div className="h-px bg-slate-100 mb-6" />
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-amber-500" /> IoT Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">RF ID</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input name="rfid" value={formData.rfid} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Scan Card..." />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 uppercase">BLE ID</label>
                                        <div className="relative">
                                            <Bluetooth className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input name="bleId" value={formData.bleId} onChange={handleChange} className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Enter BLE Tag ID" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 pt-4 pb-0 flex items-center justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Add Employee
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
