import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const getAvailableRooms = async (req, res) => {
const { slot } = req.query;
const rooms = await prisma.room.findMany({
include: { bookings: true }
});


const available = rooms.filter(r => !r.bookings.some(b => b.slot === slot));
res.json(available);
};