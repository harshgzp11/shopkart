# ShopKart 🛒

A full-stack modern e-commerce platform built using the MERN stack (MongoDB, Express.js, React 19, Node.js) with Tailwind CSS and Vite.

This repository is structured as a **monorepo** tracking the progressive development of ShopKart over a scheduled 15-session build series.

---

## 🚀 Project Overview & Architecture

```
shopkart/
├── backend/            # Express.js REST API & MongoDB models
│   ├── controllers/    # Route controllers (Customer, Product)
│   ├── middlewares/    # JWT Auth & route protection middlewares
│   ├── models/         # Mongoose models (Customer, Product)
│   ├── routes/         # Express endpoint definitions
│   └── utils/          # Token generation and helper functions
├── frontend/           # React 19 + Vite client application
│   ├── src/
│   │   ├── components/ # Reusable UI widgets (Navbar, ProductCard)
│   │   ├── pages/      # Views (Home, Login, Register, Products, Details)
│   │   └── services/   # Axios API client & request wrappers
│   └── public/         # Static assets and icons
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 & custom modern aesthetics
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express 5
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (JSON Web Tokens) with `httpOnly` secure cookies & bcrypt hashing
- **Security & Utils**: CORS, cookie-parser, dotenv

---

## 📅 Roadmap & Milestones (15-Session Build Plan)

ShopKart is being developed incrementally. Below is the track of completed milestones and upcoming planned modules:

### ✅ Completed Sessions (1 – 3)
- **Session 1: Backend Setup & Authentication Engine** `[Tag: session-1]`
  - Express server boilerplate & MongoDB connection.
  - Customer Mongoose schema with pre-save password hashing.
  - JWT token generation, cookie configuration, and auth verification middleware.
  - Customer endpoints: Registration, Login, Logout, and Protected Profile route.
- **Session 2: Product Catalog & REST Endpoints** `[Tag: session-2]`
  - Product model with pricing, categories, stock, ratings, and image URLs.
  - Product controllers & routes for CRUD, category filtering, and product searches.
- **Session 3: Frontend Architecture & User Interface** `[Tag: session-3]`
  - Vite + React 19 setup with responsive layout.
  - Reusable components: Navbar with dynamic auth state, Product Cards.
  - User authentication pages: Login & Register with client-side validation.
  - Product catalog browsing and dedicated Product Details view.

### ⏳ Upcoming Sessions (4 – 15)
- [ ] **Session 4**: Shopping Cart State Management & Persistent Cart Storage
- [ ] **Session 5**: Cart Synchronization with Backend (User Cart APIs)
- [ ] **Session 6**: Checkout Flow & Address / Shipping Management
- [ ] **Session 7**: Payment Gateway Integration (Stripe / Razorpay)
- [ ] **Session 8**: Order Processing, Order History & Receipt Generation
- [ ] **Session 9**: User Account Dashboard & Profile Updates
- [ ] **Session 10**: Search, Advanced Filtering, Sorting & Pagination
- [ ] **Session 11**: Customer Product Reviews, Ratings & Feedback System
- [ ] **Session 12**: Admin Panel: Product & Category Management (CRUD)
- [ ] **Session 13**: Admin Panel: Order Fulfillment & Inventory Management
- [ ] **Session 14**: Performance Optimization, Caching & Error Handling
- [ ] **Session 15**: Production Polish, Security Audits & Final Review

---

## 💻 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/harshgzp11/shopkart.git
cd shopkart
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
node index.js
# Or with nodemon if installed: npx nodemon index.js
```
The API server will run on `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The client app will be accessible at `http://localhost:5173`.

---

## 🏷️ Milestone Tags

Each completed session is tagged in Git for quick reference:
- `git checkout session-1` - Inspect code at Session 1
- `git checkout session-2` - Inspect code at Session 2
- `git checkout session-3` - Current state at the end of Session 3

---

## 👤 Author
- **Harsh Srivastava** ([@harshgzp11](https://github.com/harshgzp11))
