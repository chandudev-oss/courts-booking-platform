# Sports Booking Platform

Minimal README for local development and quick reference.

Summary
- Full-stack app to book courts, equipment, and coaches with dynamic pricing and admin controls.

Quick Start

1) Backend
```powershell
cd backend
npm install
cp .env.example .env   # add your MONGO_URI and JWT_SECRET
npm run seed           # optional
npm run dev
```

2) Frontend
```powershell
cd frontend
npm install
npm run dev
```

Environment: Add `MONGO_URI`, `JWT_SECRET`, `PORT` to `backend/.env`.

Scripts: Backend `npm run dev` or `npm run seed`. Frontend `npm run dev`.

Port conflict? Set `$env:PORT=3001; npm run dev` in frontend.

Courts management

Coaches management

Equipment inventory

Pricing rules configuration

Bookings overview

Each page includes:

Table

CRUD forms

Filters

Status indicators

Admin auth is required.

7. System Architecture
Frontend (React + Tailwind)
      |
      | Axios API Calls
      v
Backend (Node.js + Express)
      |
      | Mongoose Queries
      v
Database (MongoDB)

Key Backend Components

Controllers: Business logic

Models: Schemas

Routes: API mapping

Middleware: Auth, validation

Utils: Pricing Engine, availability checker

8. Data Models (Detailed)
8.1 Court Model
name
type: enum
basePrice
isActive

8.2 Coach Model
name
hourlyRate
availability: [{ dayOfWeek, startHour, endHour }]

8.3 Equipment Model
name
totalStock
perUnitFee

8.4 PricingRule Model
name
type: fixed | multiplier
condition
value
isActive

8.5 Booking Model

(As mentioned earlier)

9. APIs (Complete List)
Authentication

POST /auth/register

POST /auth/login

GET /auth/me

Courts

GET /courts

POST /admin/courts

PATCH /admin/courts/:id

DELETE /admin/courts/:id

Coaches

GET /coaches

POST /admin/coaches

PATCH /admin/coaches/:id

Equipment

GET /equipment

POST /admin/equipment

PATCH /admin/equipment/:id

Pricing Rules

POST /admin/pricing-rules

GET /pricing-rules

PATCH /admin/pricing-rules/:id

DELETE /admin/pricing-rules/:id

Bookings

POST /bookings

GET /bookings/user

GET /admin/bookings

PATCH /bookings/:id/cancel

Pricing Estimate

POST /pricing/estimate

10. Testing Requirements
10.1 Unit Tests

Pricing calculations

Availability logic

Equipment stock management

Booking overlap detection

10.2 Integration Tests

Booking workflow end-to-end

Admin CRUD operations

10.3 API Testing

Postman collection shared in GitHub repo

11. Deployment Requirements
Backend

Deploy on Render / Railway

Env variables:

MONGO_URI

JWT_SECRET

ADMIN_EMAIL

Frontend

Deployed on Netlify or Vercel

Environment variable:

REACT_APP_API_BASE_URL


Real-time notifications using WebSockets or Socket.IO

12. Acceptance Criteria

A feature is accepted only if:

Multi-resource availability validation works consistently.

Pricing breakdown sums correctly.

No double booking is possible under concurrency.

Admin can fully manage dynamic pricing rules.

React UI is responsive and functional.
