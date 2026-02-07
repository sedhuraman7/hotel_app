
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { guestId, rating, comment } = await request.json();

        const feedback = await prisma.feedback.create({
            data: {
                guestId,
                rating,
                comment
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');

    const whereClause = guestId ? { guestId } : {};

    const feedbacks = await prisma.feedback.findMany({
        where: whereClause,
        include: {
            guest: {
                select: {
                    name: true,
                    room: { select: { id: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
}
