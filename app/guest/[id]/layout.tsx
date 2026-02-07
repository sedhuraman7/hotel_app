
import React from 'react';

export const metadata = {
    title: 'Guest Services',
    description: 'Order food and rate your stay',
}

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 border-b border-yellow-500/30">
                <div className="container mx-auto flex justify-between items-center max-w-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏨</span>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
                            LuxHotel
                        </h1>
                    </div>
                    <div className="text-xs text-gray-400">Guest Portal</div>
                </div>
            </header>
            <main className="flex-1 pb-24 max-w-lg mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
