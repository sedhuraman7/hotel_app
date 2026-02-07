"use client";

import { useState, useEffect } from "react";
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

const INITIAL_ORDERS: any[] = [];

export default function RestaurantPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<string | null>(null);
    const [deliveryMen, setDeliveryMen] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchOrders(); // Initial load
        fetchDeliveryMen();

        const interval = setInterval(() => {
            fetchOrders(); // Poll every 10 seconds
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/restaurant/order'); // Need to ensure GET /api/restaurant/order returns all for admin
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDeliveryMen = async () => {
        // Mocking for now or fetch from /api/employees if endpoint exists with role filter
        // Assuming we can fetch all and filter client side
        try {
            const res = await fetch('/api/employees');
            if (res.ok) {
                const data = await res.json();
                setDeliveryMen(data.filter((e: any) => e.role === 'Delivery' || e.role === 'Staff')); // Adjust roles as needed
            }
        } catch (e) {
            console.error(e);
        }
    };


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

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/restaurant/order', {
                method: 'PATCH', // Need to implement PATCH in route
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const assignDelivery = async (employeeId: string) => {
        if (!selectedOrderForDelivery) return;
        try {
            const res = await fetch('/api/restaurant/order', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedOrderForDelivery, status: 'delivering', deliveryManId: employeeId }) // Assuming status 'delivering' means assigned
            });
            if (res.ok) {
                setIsAssignModalOpen(false);
                setSelectedOrderForDelivery(null);
                fetchOrders();
                // Notification simulation
                alert(`Order Assigned to ${deliveryMen.find(d => d.id === employeeId)?.name}! Notification sent.`);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openAssignModal = (orderId: string) => {
        setSelectedOrderForDelivery(orderId);
        setIsAssignModalOpen(true);
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Pending */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Pending
                    </h3>
                    {orders.filter(o => o.status === "Pending").map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded">Room {order.guest?.room?.id || 'N/A'}</span>
                                <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="space-y-1 mb-3">
                                {order.items?.map((item: any) => (
                                    <p key={item.id} className="text-sm text-slate-700 flex justify-between">
                                        <span>{item.menuItem?.name}</span>
                                        <span className="font-medium text-slate-500">x{item.quantity}</span>
                                    </p>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-800">₹{order.totalAmount}</span>
                                <button onClick={() => updateStatus(order.id, "Preparing")} className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                                    Start Preparing &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preparing */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <ChefHat className="w-4 h-4" /> Preparing
                    </h3>
                    {orders.filter(o => o.status === "Preparing").map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-orange-400">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">Room {order.guest?.room?.id || 'N/A'}</span>
                                <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="space-y-1 mb-3">
                                {order.items?.map((item: any) => (
                                    <p key={item.id} className="text-sm text-slate-700 flex justify-between">
                                        <span>{item.menuItem?.name}</span>
                                        <span className="font-medium text-slate-500">x{item.quantity}</span>
                                    </p>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-800">₹{order.totalAmount}</span>
                                <button onClick={() => updateStatus(order.id, "Ready")} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                    Mark Ready &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ready / Assign Delivery */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Ready for Delivery
                    </h3>
                    {orders.filter(o => o.status === "Ready" || o.status === "Delivering").map(order => (
                        <div key={order.id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 ${order.status === 'delivering' ? 'border-l-yellow-400' : 'border-l-blue-400'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Room {order.guest?.room?.id || 'N/A'}</span>
                                {order.deliveryMan && <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded">{order.deliveryMan.name}</span>}
                            </div>
                            <div className="space-y-1 mb-3">
                                <div className="text-xs text-slate-500 mb-1">Status: {order.status}</div>
                            </div>
                            <div className="pt-3 border-t border-dashed border-slate-200 flex flex-col gap-2">
                                <div className="flex justify-between font-bold text-slate-800">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>

                                {order.status !== 'Relivering' && !order.deliveryManId ? (
                                    <button onClick={() => openAssignModal(order.id)} className="w-full py-1.5 bg-slate-800 text-white text-xs rounded hover:bg-slate-700">
                                        Assign Delivery Man
                                    </button>
                                ) : (
                                    <button onClick={() => updateStatus(order.id, "Delivered")} className="w-full py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Completed */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Completed
                    </h3>
                    {orders.filter(o => o.status === "Delivered" || o.status === "Completed").map(order => (
                        <div key={order.id} className="bg-white/60 p-4 rounded-xl border border-slate-100 opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Room {order.guest?.room?.id || 'N/A'}</span>
                                <span className="text-xs font-medium text-green-600">Delivered</span>
                            </div>
                            <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-500">{order.items?.length || 0} Items</span>
                                <span className="font-bold text-slate-700">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assign Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Assign Delivery Man</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {deliveryMen.map(man => (
                                    <button
                                        key={man.id}
                                        onClick={() => assignDelivery(man.id)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-blue-100 group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 font-bold text-xs">
                                                {man.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-slate-700">{man.name}</div>
                                                <div className="text-xs text-slate-500">{man.role}</div>
                                            </div>
                                        </div>
                                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 text-xs font-bold">Select</div>
                                    </button>
                                ))}
                                {deliveryMen.length === 0 && <div className="text-center text-slate-400 py-4">No delivery staff found.</div>}
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="mt-4 w-full py-2 text-slate-500 hover:text-slate-800 text-sm">Cancel</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


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
