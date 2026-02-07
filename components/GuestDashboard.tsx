
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestDashboard({ guest, menuItems }: { guest: any, menuItems: any[] }) {
    const [cart, setCart] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [complaintType, setComplaintType] = useState('Room Service');
    const [complaintDesc, setComplaintDesc] = useState('');
    const [complaintStatus, setComplaintStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

    const filteredItems = activeCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === activeCategory);

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) return { ...i, quantity: Math.max(1, i.quantity + delta) };
            return i;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setIsPlacingOrder(true);
        try {
            const res = await fetch('/api/restaurant/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestId: guest.id,
                    items: cart.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            });

            if (res.ok) {
                setCart([]);
                setIsCartOpen(false);
                alert('Order placed successfully! Wait 15-20 mins.');
            } else {
                alert('Failed to place order.');
            }
        } catch (err) {
            console.error(err);
            alert('Error placing order.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const submitFeedback = async () => {
        if (feedbackRating === 0) return;
        setFeedbackStatus('submitting');
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestId: guest.id,
                    rating: feedbackRating,
                    comment: feedbackComment
                })
            });

            if (res.ok) setFeedbackStatus('success');
            else setFeedbackStatus('idle'); // or error
        } catch (err) {
            setFeedbackStatus('idle');
        }
    };

    const submitComplaint = async () => {
        if (!complaintDesc) return;
        setComplaintStatus('submitting');
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guestId: guest.id,
                    type: complaintType,
                    description: complaintDesc
                })
            });

            if (res.ok) {
                setComplaintStatus('success');
                setComplaintDesc('');
                setTimeout(() => setComplaintStatus('idle'), 3000);
            } else {
                setComplaintStatus('idle');
                alert('Failed to submit complaint');
            }
        } catch (err) {
            setComplaintStatus('idle');
            console.error(err);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-6 rounded-b-[2rem] shadow-xl mb-6">
                <h2 className="text-2xl font-bold mb-1">Welcome, {guest.name}!</h2>
                <p className="opacity-80">Room: <span className="font-mono bg-white/20 px-2 py-0.5 rounded ml-1 text-yellow-300">{guest.room?.id}</span></p>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeCategory === cat
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid gap-4 px-4 pb-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {item.category === 'Main Course' && '🍛'}
                                {item.category === 'Breads' && '🥖'}
                                {item.category === 'Chinese' && '🍜'}
                                {item.category === 'Beverages' && '🥤'}
                                {item.category === 'Dessert' && '🍰'}
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                            <div className="font-bold text-blue-600 mt-2">₹{item.price}</div>
                        </div>
                        <button
                            onClick={() => addToCart(item)}
                            className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors active:scale-95 shadow-sm"
                        >
                            + Add
                        </button>
                    </div>
                ))}
            </div>

            {/* Feedback Section */}
            <div className="px-4 mt-8 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Rate Your Stay 🌟</h3>
                    {feedbackStatus === 'success' ? (
                        <div className="text-green-600 text-center py-4 bg-green-50 rounded-lg">
                            Thank you for your feedback! ❤️
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center gap-3 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackRating(star)}
                                        className={`text-3xl transition-transform hover:scale-110 active:scale-95 ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-200'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none placeholder:text-gray-400"
                                rows={3}
                                placeholder="Tell us about your experience..."
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                            />
                            <button
                                onClick={submitFeedback}
                                disabled={feedbackRating === 0 || feedbackStatus === 'submitting'}
                                className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-slate-700 transition-colors"
                            >
                                {feedbackStatus === 'submitting' ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Complaints Section */}
            <div className="px-4 mb-24">
                <div className="bg-white rounded-3xl shadow-xl border border-red-50 overflow-hidden">
                    <div className="bg-red-50/50 p-6 border-b border-red-100">
                        <h3 className="text-xl font-bold text-red-900 flex items-center gap-3">
                            <span className="bg-red-100 p-2 rounded-xl text-2xl">🚨</span>
                            Need Assistance?
                        </h3>
                        <p className="text-red-600/80 text-sm mt-1">We're here to help. Select an issue type below.</p>
                    </div>

                    <div className="p-6">
                        {complaintStatus === 'success' ? (
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                <div className="text-5xl mb-4">✅</div>
                                <h4 className="text-xl font-bold text-green-800 mb-2">Request Sent!</h4>
                                <p className="text-green-600">Our team has been notified and will be with you shortly.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">What's the issue?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'Room Service', icon: '🍽️', label: 'Food/Service' },
                                            { id: 'Cleaning', icon: '🧹', label: 'Cleaning' },
                                            { id: 'Maintenance', icon: '🔧', label: 'Maintenance' },
                                            { id: 'Noise', icon: '🔊', label: 'Noise' },
                                            { id: 'Other', icon: '💬', label: 'Other' }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setComplaintType(type.id)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${complaintType === type.id
                                                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30 transform scale-105'
                                                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span>{type.icon}</span>
                                                <span className="font-medium text-sm">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Additional Details</label>
                                    <div className="relative">
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-400 focus:bg-white transition-all resize-none"
                                            rows={3}
                                            placeholder="Please describe the problem..."
                                            value={complaintDesc}
                                            onChange={(e) => setComplaintDesc(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={submitComplaint}
                                    disabled={!complaintDesc || complaintStatus === 'submitting'}
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                                >
                                    {complaintStatus === 'submitting' ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Submit Request <span className="text-xl">🚀</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Cart Button */}
            {
                cart.length > 0 && (
                    <div className="fixed bottom-4 left-4 right-4 z-50">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="bg-black/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                                <span className="font-bold">View Cart</span>
                            </div>
                            <span className="font-mono font-bold text-lg">₹{cartTotal}</span>
                        </button>
                    </div>
                )
            }

            {/* Cart Modal / Sheet */}
            {
                isCartOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Your Order</h3>
                                <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">✕</button>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto space-y-4 mb-6 pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                                        <div>
                                            <div className="font-medium text-gray-800">{item.name}</div>
                                            <div className="text-sm text-gray-500">₹{item.price} x {item.quantity}</div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600">-</button>
                                            <span className="font-medium w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-blue-600">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold mb-6">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <button
                                    onClick={placeOrder}
                                    disabled={isPlacingOrder}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-70 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                                >
                                    {isPlacingOrder ? (
                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    ) : 'Confirm Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
