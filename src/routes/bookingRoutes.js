import express from 'express';
import { createBooking, cancelBooking, getAllBookings } from '../controllers/bookingController.js';
const router = express.Router();


router.post('/bookings', createBooking);
router.post('/cancel/:id', cancelBooking);
router.get('/bookings', getAllBookings);


export default router;