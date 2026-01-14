"use client";

import { Utensils, ChefHat, Coffee, ShoppingCart, Plus } from "lucide-react";

export default function RestaurantPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Restaurant Management</h1>
                    <p className="text-slate-500 text-sm">Manage orders, menu items, and kitchen status</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30">
                    <Plus className="w-4 h-4" />
                    New Order
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Active Orders</p>
                        <h3 className="text-2xl font-bold text-slate-800">12</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Items Served</p>
                        <h3 className="text-2xl font-bold text-slate-800">48</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Daily Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">₹12,450</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="inline-flex justify-center items-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Menu & Ordering System Coming Soon</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    This module will handle room service orders, restaurant tables, and kitchen inventory management.
                </p>
            </div>
        </div>
    );
}
