
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        let menuItems = await prisma.menuItem.findMany({
            where: {
                isAvailable: true
            },
            orderBy: {
                category: 'asc'
            }
        });

        if (menuItems.length === 0) {
            const defaultItems = [
                { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, description: 'Rich creamy paneer curry', isAvailable: true },
                { name: 'Chicken Biryani', category: 'Main Course', price: 350, description: 'Aromatic basmati rice with chicken', isAvailable: true },
                { name: 'Garlic Naan', category: 'Breads', price: 60, description: 'Leavened bread with garlic', isAvailable: true },
                { name: 'Veg Fried Rice', category: 'Chinese', price: 220, description: 'Wok tossed rice with veggies', isAvailable: true },
                { name: 'Crispy Corn', category: 'Starters', price: 180, description: 'Deep fried corn kernels', isAvailable: true },
                { name: 'Tomato Soup', category: 'Soups', price: 120, description: 'Classic tomato soup', isAvailable: true },
                { name: 'Cold Coffee', category: 'Beverages', price: 150, description: 'Chilled coffee with ice cream', isAvailable: true },
                { name: 'Gulab Jamun', category: 'Dessert', price: 100, description: 'Sweet dough balls in syrup', isAvailable: true },
                { name: 'Coke', category: 'Beverages', price: 50, description: 'Chilled soft drink 300ml', isAvailable: true },
                { name: 'Pepsi', category: 'Beverages', price: 50, description: 'Chilled soft drink 300ml', isAvailable: true },
                { name: 'Mineral Water', category: 'Beverages', price: 30, description: '1L Bottle', isAvailable: true },
                { name: 'Fresh Lime Soda', category: 'Beverages', price: 80, description: 'Refreshing lime drink', isAvailable: true },
                { name: 'Mango Lassi', category: 'Beverages', price: 120, description: 'Yogurt based mango drink', isAvailable: true },
            ];

            await prisma.menuItem.createMany({
                data: defaultItems
            });

            menuItems = await prisma.menuItem.findMany({
                where: { isAvailable: true },
                orderBy: { category: 'asc' }
            });
        }

        return NextResponse.json(menuItems);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, price, description, imageUrl } = body;

        const newItem = await prisma.menuItem.create({
            data: {
                name,
                category,
                price,
                description,
                imageUrl
            }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
