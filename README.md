Setup Instructions
Prerequisites
Docker and Docker Compose installed on your machine.

Git installed for cloning the repo.

Steps to Run Locally
Clone the repository:

bash
git clone [link](https://github.com/KRATI-cmd/workspace-booking.git)
cd workspace-booking
docker-compose up --build

Create .env file (if applicable) with necessary environment variables like database URL, secret keys, etc.

Build and start the Docker containers:

bash
docker-compose up --build
Apply database migrations:

For Django:

bash
docker-compose exec web python manage.py migrate
For Node.js Prisma:

bash
docker-compose exec app npx prisma migrate deploy
(Optional) Create a superuser/admin:

bash
docker-compose exec web python manage.py createsuperuser
Access the application API at http://localhost:8000/api/v1 (Django) or http://localhost:3000/api/v1 (Node.js), and admin interface if enabled.

Assumptions Made
There are 15 total rooms with types: 8 Private, 4 Conference, and 3 Shared desks (4 seats per desk).

Booking slots are hourly from 9 AM to 6 PM.

Private rooms are booked by individuals only.

Conference rooms require teams of at least 3 members.

Shared desks auto-fill individuals sequentially up to capacity.

Child team members (under age 10) count in headcount but do not occupy seats.

One booking allowed per user or team per slot with no overlap.

Cancellation frees up the booking slot immediately.

Proper locking and atomic transactions ensure no race conditions for concurrent bookings.

API Documentation / Usage Samples
Base URL
http://localhost:8000/api/v1 (Django default)
or
http://localhost:3000/api/v1 (Node.js default)

Endpoints
1. Book a Room
POST /bookings/

Request body:

json
{
  "userId": 1,
  "teamId": null,
  "roomType": "conference",
  "slot": "10:00-11:00",
  "date": "2025-10-20"
}
teamId can be null if individual booking.

The system auto-selects available room following booking priorities.

Response:

json
{
  "bookingId": 101,
  "room": { "id": 12, "type": "conference" },
  "slot": "10:00-11:00",
  "date": "2025-10-20",
  "status": "confirmed"
}
2. Cancel a Booking
POST /cancel/{bookingId}/

Response:

json
{
  "message": "Booking canceled successfully."
}
3. List All Bookings (Paginated)
GET /bookings/?page=1&limit=10

Response:

json
{
  "data": [...],
  "pagination": {
    "totalBookings": 120,
    "totalPages": 12,
    "currentPage": 1,
    "perPage": 10
  }
}
4. Check Available Rooms by Slot
GET /rooms/available/?date=2025-10-20&slot=10:00-11:00&roomType=private

Response:

json
[
  { "id": 5, "type": "private", "capacity": 1 },
  { "id": 7, "type": "private", "capacity": 1 }
]
Implementation Details
Database schema includes normalized tables for Users, Teams, Rooms, and Bookings.

Booking rules are enforced in service layer with Prisma/Django ORM validations and transactional atomicity.

Concurrency control uses Prisma transactions or Django database transactions with select_for_update locking.

Pagination implemented on bookings list for efficient data handling.

Docker setup includes Dockerfile and docker-compose.yml for seamless local and deployment environments.

Codebase maintains clean, DRY principles with comprehensive comments for maintainability.

