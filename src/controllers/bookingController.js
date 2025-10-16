import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export const createBooking = async (req, res) => {
  try {
    const { userId, teamId, roomType, slot } = req.body;

    let room = null;

    if (roomType === 'PRIVATE') {
      room = await prisma.room.findFirst({
        where: {
          type: 'PRIVATE',
          bookings: { none: { slot } },
        },
      });
    } else if (roomType === 'CONFERENCE') {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true },
      });

      if (!team || team.members.length < 3) {
        return res.status(400).json({
          message: 'Conference requires at least 3 members',
        });
      }

      room = await prisma.room.findFirst({
        where: {
          type: 'CONFERENCE',
          bookings: { none: { slot } },
        },
      });
    } else if (roomType === 'SHARED') {
      const sharedRooms = await prisma.room.findMany({
        where: { type: 'SHARED' },
        include: { bookings: true },
      });

      for (const r of sharedRooms) {
        const userCount = r.bookings.length;
        if (userCount < r.capacity) {
          room = r;
          break;
        }
      }
    }

    if (!room) {
      return res
        .status(400)
        .json({ message: 'No available room for the selected slot and type.' });
    }

    console.log({ slot, userId, teamId, roomId: room.id });

    const booking = await prisma.booking.create({
      data: {
        slot,
        userId,
        teamId,
        roomId: room.id, 
      },
    });

    return res
      .status(201)
      .json({ message: 'Booking successful', bookingId: booking.id });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ message: 'Error creating booking' });
  }
};

export const cancelBooking = async (req, res) => {
try {
const { bookingId } = req.params;
const chkBooking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
if(!chkBooking){
    return res.status(200).json({success:false, message: 'Booking not found' });
}
await prisma.booking.delete({ where: { id: parseInt(bookingId) } });

return res.json({success:true, message: 'Booking cancelled successfully' });
} catch (err) {
    console.log("error in cancelling room",err)
return res.status(500).json({success:false, message: 'Error cancelling booking' });
}
};


export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;  // current page, default 1
    const limit = parseInt(req.query.limit) || 10; // results per page, default 10
    const skip = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      skip,
      take: limit,
      include: {
        room: true,
        user: true,
        team: true
      },
      orderBy: {
        createdAt: 'desc' // optional, ensures consistent order
      }
    });

    // Get total count for pagination meta info
    const totalBookings = await prisma.booking.count();
    const totalPages = Math.ceil(totalBookings / limit);

    return res.json({
      data: bookings,
      pagination: {
        totalBookings,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
