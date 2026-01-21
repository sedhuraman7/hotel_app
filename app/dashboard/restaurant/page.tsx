"use client";

import { useState } from "react";
import { Utensils, ChefHat, Coffee, ShoppingCart, Plus, X, Search, Clock, CheckCircle, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data ---
const MENU_ITEMS = [
    { id: 1, name: "Paneer Butter Masala", price: 280, category: "Main Course" },
    { id: 2, name: "Chicken Biryani", price: 350, category: "Main Course" },
    { id: 3, name: "Garlic Naan", price: 60, category: "Breads" },
    { id: 4, name: "Veg Fried Rice", price: 220, category: "Chinese" },
    { id: 5, name: "Crispy Corn", price: 180, category: "Starters" },
    { id: 6, name: "Tomato Soup", price: 120, category: "Soups" },
    { id: 7, name: "Cold Coffee", price: 150, category: "Beverages" },
    { id: 8, name: "Gulab Jamun", price: 100, category: "Dessert" },
];

const INITIAL_ORDERS = [
    { id: 101, room: "101", items: [{ name: "Chicken Biryani", qty: 2 }], total: 700, status: "Preparing", time: "10 mins ago" },
    { id: 102, room: "202", items: [{ name: "Cold Coffee", qty: 1 }], total: 150, status: "Delivering", time: "5 mins ago" },
];

export default function RestaurantPage() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // --- Stats ---
    const activeOrders = orders.filter(o => o.status !== "Delivered").length;
    const revenue = orders.reduce((sum, o) => sum + o.total, 12450); // Adding to base revenue

    // --- Modal State ---
    const [cart, setCart] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const addToCart = (item: any) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter(c => c.id !== itemId));
    };

    const placeOrder = () => {
        if (!selectedRoom || cart.length === 0) return;
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        const newOrder = {
            id: Math.floor(Math.random() * 10000),
            room: selectedRoom,
            items: cart.map(c => ({ name: c.name, qty: c.qty })),
            total,
            status: "Preparing",
            time: "Just now"
        };

        setOrders([newOrder, ...orders]);
        setCart([]);
        setSelectedRoom("");
        setIsOrderModalOpen(false);
    };

    const updateStatus = (orderId: number, newStatus: string) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Restaurant Management</h1>
                    <p className="text-slate-500 text-sm">Manage orders, menu items, and kitchen status</p>
                </div>
                <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    New Order
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Kitchen Queue</p>
                        <h3 className="text-2xl font-bold text-slate-800">{activeOrders}</h3>
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
                        <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">₹{revenue.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Orders Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Preparing */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Preparing
                    </h3>
                    {orders.filter(o => o.status === "Preparing").map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Room {order.room}</span>
                                <span className="text-xs text-slate-400">{order.time}</span>
                            </div>
                            <div className="space-y-1 mb-3">
                                {order.items.map((item, i) => (
                                    <p key={i} className="text-sm text-slate-700 flex justify-between">
                                        <span>{item.name}</span>
                                        <span className="font-medium text-slate-500">x{item.qty}</span>
                                    </p>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-800">₹{order.total}</span>
                                <button onClick={() => updateStatus(order.id, "Delivering")} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                    Mark Ready &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delivering */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Delivering
                    </h3>
                    {orders.filter(o => o.status === "Delivering").map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-400">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Room {order.room}</span>
                                <span className="text-xs text-slate-400">{order.time}</span>
                            </div>
                            <div className="space-y-1 mb-3">
                                {order.items.map((item, i) => (
                                    <p key={i} className="text-sm text-slate-700 flex justify-between">
                                        <span>{item.name}</span>
                                        <span className="font-medium text-slate-500">x{item.qty}</span>
                                    </p>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-800">₹{order.total}</span>
                                <button onClick={() => updateStatus(order.id, "Delivered")} className="text-xs font-medium text-green-600 hover:text-green-800">
                                    Mark Delivered &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delivered */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Completed
                    </h3>
                    {orders.filter(o => o.status === "Delivered").map(order => (
                        <div key={order.id} className="bg-white/60 p-4 rounded-xl border border-slate-100 opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Room {order.room}</span>
                                <span className="text-xs font-medium text-green-600">Paid & Delivered</span>
                            </div>
                            <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-500">{order.items.length} Items</span>
                                <span className="font-bold text-slate-700">₹{order.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Order Modal */}
            <AnimatePresence>
                {isOrderModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsOrderModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Left: Menu */}
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 border-r border-slate-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">Menu</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            placeholder="Search items..."
                                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {MENU_ITEMS.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => addToCart(item)}
                                            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-slate-700 group-hover:text-blue-600">{item.name}</h4>
                                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{item.category}</span>
                                                </div>
                                                <span className="font-bold text-slate-800">₹{item.price}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Cart */}
                            <div className="w-full md:w-96 flex flex-col bg-white">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5" /> Current Order
                                    </h2>
                                    <button onClick={() => setIsOrderModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">To Room</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                                            value={selectedRoom}
                                            onChange={(e) => setSelectedRoom(e.target.value)}
                                        >
                                            <option value="">-- Select Room --</option>
                                            <option value="101">Room 101 - (Ravi)</option>
                                            <option value="102">Room 102 - (John)</option>
                                            <option value="201">Room 201 - (Empty)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        {cart.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400">
                                                <Utensils className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                                <p>Cart is empty</p>
                                            </div>
                                        ) : (
                                            cart.map(item => (
                                                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-slate-700 text-sm">{item.name}</p>
                                                        <p className="text-xs text-slate-500">₹{item.price} x {item.qty}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-slate-800">₹{item.price * item.qty}</span>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50">
                                    <div className="flex justify-between items-center mb-4 text-lg">
                                        <span className="font-semibold text-slate-600">Total</span>
                                        <span className="font-bold text-slate-900">₹{cart.reduce((sum, i) => sum + (i.price * i.qty), 0)}</span>
                                    </div>
                                    <button
                                        onClick={placeOrder}
                                        disabled={!selectedRoom || cart.length === 0}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
