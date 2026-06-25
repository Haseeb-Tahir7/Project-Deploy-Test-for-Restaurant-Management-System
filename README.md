# Restaurant Management System

Full-stack MERN app with Admin Dashboard and Sales POS portals.

## Project Structure

```
/client   → React (Vite) frontend
/server   → Express + MongoDB backend
```

## Setup

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Seed Admin Account (first time only)

```bash
curl -X POST http://localhost:5000/api/auth/seed \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@restaurant.com\",\"password\":\"admin123\"}"
```

This route disables itself once an admin exists.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Features

- **Admin Dashboard:** stats, notes, coupons, stocks, receipts (PDF/Excel export), menu CRUD, salesperson accounts
- **Sales POS:** menu ordering, coupon verification, receipt generation, personal receipt history
- **Auth:** JWT-based login with role-based routing
- **Theme:** light/dark mode toggle

## Default Login

After seeding:
- Email: `admin@restaurant.com`
- Password: `admin123`

## Tech Stack

- MongoDB Atlas, Express, React (Vite), Node.js
- Axios, React Router v6, Context API
- bcryptjs, jsonwebtoken, jsPDF, SheetJS (xlsx)
