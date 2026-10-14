# ShopKart

ShopKart is a full-stack e-commerce application built with React, Vite, Express, and MongoDB.

## Features

- Customer registration, login, and logout using JWT cookies
- Product catalogue with search, category filtering, and price sorting
- Persistent, per-customer cart and wishlist
- Shipping address collection and Razorpay checkout/payment verification
- Customer order history and order status tracking
- Admin dashboard for product creation and order fulfillment

The application does not currently include product editing/deletion, product reviews, or shipping-label/receipt generation.

## Technology

- Frontend: React 19, React Router, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express 5, Mongoose, MongoDB
- Authentication: JWT in HTTP-only cookies, bcrypt password hashing
- Payments: Razorpay

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A MongoDB instance (local or MongoDB Atlas)
- Razorpay test or live API credentials to complete checkout

## Local setup

### 1. Clone and install dependencies

```sh
git clone https://github.com/harshgzp11/shopkart.git
cd shopkart
```

In one terminal:

```sh
cd backend
npm install
```

In a second terminal:

```sh
cd frontend
npm install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env`, then set `MONGO_URI` and replace `JWT_SECRET` with a private, randomly generated value of at least 32 characters. In PowerShell, copy the example from the repository root with:

```powershell
Copy-Item backend/.env.example backend/.env
```

Generate a secret from the `backend` directory:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to enable checkout. Use Razorpay test credentials for local development. Do not commit `.env` files or real credentials.

Start the API from the `backend` directory:

```sh
npm run dev
```

The API listens on `http://localhost:5000` by default. It will not start if required MongoDB configuration is missing or MongoDB cannot be reached.

### 3. Configure and start the frontend

Copy `frontend/.env.example` to `frontend/.env` if the API is not at the default URL. In PowerShell, use `Copy-Item frontend/.env.example frontend/.env` from the repository root, then set `VITE_API_URL` to the API origin. Start the frontend from the `frontend` directory:

```sh
npm run dev
```

Vite prints the frontend URL (normally `http://localhost:5173`).

### 4. Set up an administrator

New accounts have the `CUSTOMER` role and cannot create products or change order statuses. After registering an account, promote it using a trusted MongoDB shell or database client:

```javascript
db.customers.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Administrators can open `/admin` to add products and advance paid orders through fulfillment. Never expose an endpoint that lets users set their own role.

## Useful commands

Run these from their respective directories:

| Directory | Command | Purpose |
|---|---|---|
| `backend` | `npm start` | Start the API |
| `backend` | `npm run dev` | Start the API with Node watch mode |
| `backend` | `npm test` | Run backend tests |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run lint` | Lint the frontend |

## Environment files and secrets

The committed `.env.example` files contain placeholders only. Local `.env` files are ignored by Git. Keep database passwords, JWT secrets, and payment credentials private, and rotate any credential that has ever been committed or shared.

## Repository

[github.com/harshgzp11/shopkart](https://github.com/harshgzp11/shopkart)


Project by -
Harsh Srivastava
Class of 2029 A