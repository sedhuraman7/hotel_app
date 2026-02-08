
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Adding more menu items...')

    const menuItems = [
        // Starters
        { name: 'Paneer Tikka', category: 'Starters', price: 220, description: 'Spiced cottage cheese grilled to perfection', isAvailable: true },
        { name: 'Gobi Manchurian', category: 'Starters', price: 180, description: 'Crispy cauliflower tossed in tangy sauce', isAvailable: true },
        { name: 'Chicken 65', category: 'Starters', price: 250, description: 'Spicy deep fried chicken starter', isAvailable: true },
        { name: 'French Fries', category: 'Starters', price: 120, description: 'Classic salted potato fries', isAvailable: true },
        { name: 'Veg Spring Roll', category: 'Starters', price: 150, description: 'Crispy rolls filled with veggies', isAvailable: true },

        // Main Course (Indian)
        { name: 'Chicken Biryani', category: 'Main Course', price: 350, description: 'Aromatic basmati rice with chicken', isAvailable: true },
        { name: 'Mutton Biryani', category: 'Main Course', price: 450, description: 'Traditional biryani with tender mutton', isAvailable: true },
        { name: 'Veg Pulao', category: 'Main Course', price: 200, description: 'Lightly spiced rice with vegetables', isAvailable: true },
        { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, description: 'Rich creamy paneer curry', isAvailable: true },
        { name: 'Dal Makhani', category: 'Main Course', price: 240, description: 'Creamy black lentils slow cooked', isAvailable: true },
        { name: 'Kadai Chicken', category: 'Main Course', price: 320, description: 'Chicken cooked with bell peppers and spices', isAvailable: true },
        { name: 'Butter Chicken', category: 'Main Course', price: 340, description: 'Classic chicken in tomato butter gravy', isAvailable: true },

        // Breads
        { name: 'Butter Naan', category: 'Breads', price: 50, description: 'Soft leavened bread with butter', isAvailable: true },
        { name: 'Garlic Naan', category: 'Breads', price: 60, description: 'Leavened bread with garlic', isAvailable: true },
        { name: 'Tandoori Roti', category: 'Breads', price: 30, description: 'Whole wheat bread baked in tandoor', isAvailable: true },
        { name: 'Parotta', category: 'Breads', price: 40, description: 'Layered flatbread', isAvailable: true },

        // Chinese
        { name: 'Veg Fried Rice', category: 'Chinese', price: 220, description: 'Wok tossed rice with veggies', isAvailable: true },
        { name: 'Chicken Fried Rice', category: 'Chinese', price: 260, description: 'Wok tossed rice with chicken and egg', isAvailable: true },
        { name: 'Veg Hakka Noodles', category: 'Chinese', price: 200, description: 'Stir fried noodles with veggies', isAvailable: true },
        { name: 'Chilli Chicken', category: 'Chinese', price: 280, description: 'Chicken tossed in spicy chilli sauce', isAvailable: true },

        // Soups & Salads
        { name: 'Tomato Soup', category: 'Soups', price: 120, description: 'Classic tomato soup', isAvailable: true },
        { name: 'Sweet Corn Soup', category: 'Soups', price: 130, description: 'Creamy corn soup', isAvailable: true },
        { name: 'Green Salad', category: 'Soups', price: 100, description: 'Fresh sliced vegetables', isAvailable: true },

        // Beverages
        { name: 'Cold Coffee', category: 'Beverages', price: 150, description: 'Chilled coffee with ice cream', isAvailable: true },
        { name: 'Masala Chai', category: 'Beverages', price: 40, description: 'Spiced Indian tea', isAvailable: true },
        { name: 'Fresh Lime Soda', category: 'Beverages', price: 80, description: 'Refreshing lime drink', isAvailable: true },
        { name: 'Mango Lassi', category: 'Beverages', price: 120, description: 'Yogurt based mango drink', isAvailable: true },
        { name: 'Coke', category: 'Beverages', price: 50, description: 'Chilled soft drink 300ml', isAvailable: true },
        { name: 'Water Bottle', category: 'Beverages', price: 30, description: '1L Mineral Water', isAvailable: true },

        // Desserts
        { name: 'Gulab Jamun', category: 'Dessert', price: 100, description: 'Sweet dough balls in syrup (2 pcs)', isAvailable: true },
        { name: 'Vanilla Ice Cream', category: 'Dessert', price: 80, description: 'Classic vanilla scoop', isAvailable: true },
        { name: 'Chocolate Brownie', category: 'Dessert', price: 180, description: 'Warm brownie with chocolate sauce', isAvailable: true },
        { name: 'Fruit Salad', category: 'Dessert', price: 150, description: 'Seasonal fresh fruits with cream', isAvailable: true },
    ]

    let count = 0;
    for (const item of menuItems) {
        const existing = await prisma.menuItem.findFirst({
            where: { name: item.name }
        })

        if (!existing) {
            await prisma.menuItem.create({
                data: item
            })
            console.log(`Created: ${item.name}`)
            count++;
        }
    }

    console.log(`\nAdded ${count} new items. Total available items: ${menuItems.length} checked.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
