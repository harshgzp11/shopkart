# ShopKart

ShopKart is a full-stack online store built with React, Express, and MongoDB.

## Features

- Customer registration and login
- Product catalogue, cart, and wishlist
- Razorpay checkout and order history
- Admin tools for products and order fulfillment

## Technology

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: bcrypt and JWT in an HttpOnly cookie
- Payments: Razorpay

## Run locally

You need Node.js, npm, and a MongoDB database. Razorpay test credentials are needed to test payments.

### 1. Clone and install

```sh
git clone https://github.com/harshgzp11/shopkart.git
cd shopkart
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env`. From the project root, in PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `MONGO_URI` to your MongoDB connection string and `JWT_SECRET` to a private random value of at least 32 characters. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to enable payments. Use test keys for development.

### 3. Start the app

Open two terminals from the project folder. In the first, start the backend:

```sh
cd backend
npm run dev
```

In the second, start the frontend:

```sh
cd frontend
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`. The frontend sends API requests through its local `/api` proxy to the backend on port `5000`.

## Deploy to Vercel

1. Import the GitHub repository. Keep the root directory as `./` and choose **Services**.
2. Add `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in the Vercel project environment variables.
3. Deploy. Leave `VITE_API_URL` unset.

## Admin account

New accounts have the `CUSTOMER` role. To grant admin access, update the account in MongoDB:

```js
db.customers.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Run checks

Run each command from its project folder:

| Folder | Command | Purpose |
|---|---|---|
| `backend` | `npm test` | Run backend tests |
| `frontend` | `npm run lint` | Check frontend code |
| `frontend` | `npm run build` | Build the frontend |

## Keep secrets private

Use local `.env` files for development and Vercel environment variables for deployment. Never commit `.env` files, database credentials, JWT secrets, or Razorpay secrets to GitHub.
