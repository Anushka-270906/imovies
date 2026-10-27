# iMovies – Complete Full-Stack Movie Ticket Booking Web Application

![iMovies Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop)

**iMovies** is a modern, responsive, full-stack movie ticket booking web application built for college project demonstration and production readiness. It combines a cinematic dark navy and crimson red UI inspired by top cinema platforms with an enterprise-grade Mongoose database architecture, live seat locking, atomic concurrency protection, JWT authentication, and a complete administrator management portal.

---

## 🎬 Key Features

### 1. Cinematic Storefront & Landing Experience
- **Cinematic Hero Section:** Welcoming header with dynamic backdrop switcher, quick movie search bar, and direct call-to-actions.
- **Trending & Now Showing:** Live movie cards displaying high-definition posters, ratings, certifications, durations, genres, and audio formats.
- **Anticipated Upcoming Blockbusters:** Dedicated section showcasing future theatrical releases.
- **Value Proposition Highlights:** Showcasing Dolby Atmos audio, Laser IMAX projection, live seat locking, and instant contactless E-tickets.

### 2. User Authentication & Security
- **JWT-Based Authentication:** Issued via secure HTTP-only cookies and Bearer tokens for versatile deployment.
- **Password Security:** Multi-round `bcryptjs` hashing with salting.
- **Registration Form:** Validates name, email formatting, password length, confirmation matching, and duplicate email prevention.
- **Login Experience:** Friendly validation errors, show/hide password toggle, and convenient 1-click demo login buttons for both User and Administrator roles.

### 3. Movie Discovery & User Dashboard
- **Instant Search:** Search across movie titles, synopses, and genres.
- **Dynamic Genre & Language Filters:** Real-time filtering by Action, Sci-Fi, Drama, Adventure, and languages (English, Hindi, etc.).
- **Sorting Options:** Sort by Recommended/Featured, Highest Rated (IMDb/Audience), Latest Release, or Title (A-Z).
- **Favorites & Watchlist:** Add and remove movies to personal watchlist persisted in MongoDB.

### 4. Movie Details & Showtime Selection
- **Rich Media Backdrops:** High-resolution movie posters and backdrop imagery.
- **Trailer Integration:** Embedded responsive YouTube trailer player.
- **Date Selector:** Daily showtime chips (Today, Tomorrow, and upcoming dates).
- **Theater Grouping:** Grouped by theater location, screen type (e.g. Laser IMAX, Dolby Cinema), and starting ticket price.

### 5. Interactive Seat Layout & Live Availability
- **Curved Cinema Screen:** Screen orientation guide with glowing red curvature.
- **3 Realistic Seating Tiers:**
  - **Balcony Tier (Premium):** Top-tier leather recliners with executive pricing.
  - **Middle Tier (Executive):** Optimal viewing angle with standard pricing.
  - **Regular / Lower Tier (Standard):** Front-row immersive seating with budget pricing.
- **Visual Statuses:**
  - `Available` (interactive card)
  - `Selected` (glowing crimson red with checkmark)
  - `Booked / Sold` (muted with lock indicator, disabled)
  - `Locked` (temporary reservation by another user)
- **Live Real-time Seat Synchronization:** WebSocket synchronization powered by Socket.IO.
- **Atomic Concurrency Protection:** Atomic MongoDB `$nin` queries prevent race conditions and guarantee zero double-bookings.

### 6. Checkout & Payment Simulation
- **Dynamic Price Calculation:** Automatic tallying of selected seats, tier subtotals, 5% tech/convenience fee, and grand total.
- **Payment Gateway Architecture:** Cleanly separated architecture ready for Stripe or Razorpay integration.
- **Demo Payment Simulator:** Fully functional academic demonstration mode featuring test Credit/Debit Cards, UPI QR simulation, and Net Banking.
- **Celebratory Confirmation:** Instant particle confetti animation and digital booking reference generation (`IMV-XXXXXXXX`).

### 7. My Bookings & Digital E-Tickets
- **Booking Records:** History of all past and active customer reservations.
- **Printable E-Ticket Modal:** Clean admission pass complete with simulated QR barcode, theater address, date, showtime, and seat list (`window.print()` ready).
- **Cancellation Policy:** 1-click self-service booking cancellation with immediate seat release and demo refund status.

### 8. Administrator Control Center (`/admin`)
- **Protected RBAC:** Backend authorization middleware verifies `admin` role on every administrative endpoint.
- **Live Analytics Dashboard:**
  - Total Registered Users
  - Total Movies in Catalog
  - Total Theaters / Auditoriums
  - Total Scheduled Shows
  - Total Bookings Placed
  - Confirmed vs. Cancelled Bookings
  - Gross Revenue from verified successful payments
- **Movie Management:** Full CRUD (Create, Read, Update, Delete) with image URLs, trailers, and booking safety checks.
- **Theater Management:** Configure theaters, screen auditoriums, and seat counts per tier.
- **Show Management:** Schedule movies to theaters with date and time conflict prevention.
- **All Bookings:** Master table of all customer bookings with status filtering, search by reference, digital ticket preview, and administrative cancellation.
- **User Directory:** View all registered members, roles, and order histories.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js (v20+), Express.js, Socket.IO, Morgan, Cookie-Parser, CORS |
| **Database** | MongoDB Server 8.0/9.0, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs, HTTP-Only Cookies |
| **Payments** | Modular Payment Engine (Integrated Demo Simulator + Stripe/Razorpay hooks) |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`) |

---

## 🚀 Getting Started on Windows

### Prerequisites
- **Node.js LTS** (v20.x or v22.x / v24.x)
- **MongoDB Server** (Community Edition running locally on `localhost:27017` or a MongoDB Atlas URI)

### 1. Installation
In the project root folder `f:\imovies`, install all dependencies:
```bash
node scripts/install-all.js
```
*(Or install manually in both folders: `cd server && npm install`, then `cd ../client && npm install`)*

### 2. Configure Environment Variables
A pre-configured `.env` is already created inside `server/.env`.
For custom settings, refer to `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secure_jwt_secret_key_2026_x89!
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@imovies.com
ADMIN_PASSWORD=Admin@12345
PAYMENT_MODE=DEMO
```

### 3. Seed Database with Realistic Blockbusters & Theaters
Run the automated seed script to populate movies, theaters, showtimes, and users:
```bash
npm run seed
```
*Output will confirm 8 blockbuster movies, 4 premium theaters, 168 scheduled shows, and initial test bookings.*

### 4. Start the Application
Run both backend API and frontend Vite server with one command:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API URL:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Seeded Demonstration Accounts

For quick college and presentation evaluation, use the pre-configured credentials or the **1-Click Fill** buttons on the Login page:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@12345` | Full administrative control, analytics, CRUD for movies/theaters/shows, booking refunds |
| **Standard User** | `alex@example.com` | `User@12345` | Ticket booking, live seat selection, checkout, My Bookings, Favorites |
| **Second User** | `sarah@example.com` | `User@12345` | Independent booking history and separate watchlist |

---

## 🧪 Automated Testing

An automated test suite validates all critical backend flows:
```bash
cd server
node --test scripts/test-suite.js
```

### Tested Workflows:
1. Health Check status verification (`/api/health`)
2. Movie catalog querying and title/genre search filtering
3. User login credential validation
4. Rejection of invalid credentials
5. Role-based access control (normal users blocked from `/api/admin/*` with 403 Forbidden)
6. Administrative privilege validation on stats endpoints
7. End-to-end atomic seat booking, double-booking rejection (409 Conflict), cancellation, and seat release

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & issue JWT
- `POST /api/auth/logout` - Clear auth session cookie
- `GET /api/auth/me` - Get authenticated profile

### Movies (`/api/movies`)
- `GET /api/movies` - List movies with search, genre, language, status, and sorting filters
- `GET /api/movies/:id` - Movie details with populated shows and theaters
- `POST /api/movies` - Admin: Add new movie
- `PUT /api/movies/:id` - Admin: Update movie
- `DELETE /api/movies/:id` - Admin: Delete movie (with booking validation)

### Theaters (`/api/theaters`)
- `GET /api/theaters` - List theaters with tier capacities and pricing
- `POST /api/theaters` - Admin: Add theater
- `DELETE /api/theaters/:id` - Admin: Remove theater

### Shows (`/api/shows`)
- `GET /api/shows` - Query shows filtered by movie, theater, or date
- `GET /api/shows/:id` - Show details with live booked and locked seats
- `POST /api/shows` - Admin: Schedule show (with conflict prevention)
- `POST /api/shows/:id/lock` - Temporary seat reservation lock

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Atomic seat reservation and booking confirmation
- `GET /api/bookings/my` - Logged in user's reservation history
- `GET /api/bookings/:id` - Detailed booking receipt
- `POST /api/bookings/:id/cancel` - Cancel booking & release seats

### Administrator (`/api/admin`)
- `GET /api/admin/dashboard` - Live database analytics
- `GET /api/admin/bookings` - Master reservations list
- `GET /api/admin/users` - Directory of registered users

---

## 🎓 Academic Integrity Notice
This project was developed for academic submission. The payment gateway operates in an explicit **DEMO SIMULATION MODE**. No real credit card or currency is processed.
