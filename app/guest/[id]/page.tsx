
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import GuestDashboard from '@/components/GuestDashboard';

// Define Page Props type for Next.js 15+
type Props = {
    params: Promise<{ id: string }>;
};

export default async function GuestPage({ params }: Props) {
    const { id } = await params;

    const guest = await prisma.guest.findUnique({
        where: { id },
        include: { room: true }
    });

    if (!guest || guest.status !== 'Checked In') {
        // If guest checked out or not found, show a friendly 404 or redirect
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Expired</h1>
                <p className="text-gray-500">According to our records, you have checked out or the link is invalid.</p>
            </div>
        );
    }

    // Fetch menu items
    const menuItems = await prisma.menuItem.findMany({
        where: { isAvailable: true },
        orderBy: { category: 'asc' }
    });

    return (
        <GuestDashboard guest={guest} menuItems={menuItems} />
    );
}
