const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const bookingController = require("./controllers/bookingController");
const roomController = require("./controllers/roomController");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- Routes ---
app.get("/", (req, res) => {
  res.send("FreJun Room Booking API is running!");
});

// Booking routes
app.post("/api/v1/bookings", (req, res) => bookingController.createBooking(req, res, prisma));
app.post("/api/v1/cancel/:bookingId", (req, res) => bookingController.cancelBooking(req, res, prisma));
app.get("/api/v1/bookings", (req, res) => bookingController.getAllBookings(req, res, prisma));

// Room routes
app.get("/api/v1/rooms/available", (req, res) => roomController.getAvailableRooms(req, res, prisma));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
