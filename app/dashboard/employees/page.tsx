"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit, BedDouble } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        try {
            const res = await fetch("/api/employees");
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to load employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = async (data: any) => {
        const payload = {
            id: data.employeeId,
            name: `${data.firstName} ${data.lastName}`,
            role: data.role,
            phone: data.phoneNumber,
            email: data.email,
            salary: data.salary,
            joinDate: new Date().toISOString(),
            rfidCardId: null
        };

        const res = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            fetchEmployees();
            setIsModalOpen(false);
        } else {
            const err = await res.json();
            alert(`Failed: ${err.error || "Something went wrong"}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        await fetch(`/api/employees?id=${id}`, { method: "DELETE" });
        fetchEmployees();
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-slate-400">Loading Employees...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
                    <p className="text-slate-500 text-sm">Manage staff, assignments, and roles</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                    <BedDouble className="w-4 h-4" />
                    Total Employees: {employees.length}
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-400">No employees found. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20`}>
                                        {employee.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
                                        <p className="text-slate-500 text-sm">{employee.role}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {employee.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(employee.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Employee ID</p>
                                    <p className="text-sm font-medium text-slate-700">{employee.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="text-sm font-medium text-slate-700">{employee.phone}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-sm font-medium text-slate-700 truncate" title={employee.email}>{employee.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Join Date</p>
                                    <p className="text-sm font-medium text-slate-700">{new Date(employee.joinDate).toLocaleDateString()}</p>
                                </div>
                                <div className="col-span-2">
                                    <div className="h-px bg-slate-50 my-2" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary</p>
                                    <p className="text-sm font-bold text-slate-800">₹{employee.salary}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEmployee}
            />
        </div>
    );
}
