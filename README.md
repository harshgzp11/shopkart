# ShopKart

ShopKart is a full-stack e-commerce application where customers can discover products, save items, place orders, and pay online. It also includes an admin area for managing the product catalogue and preparing paid orders for fulfillment.

## Features

### Customer accounts

- Register and log in with an email and password.
- Passwords are stored as bcrypt hashes.
- Authentication uses a JWT stored in an HttpOnly cookie.
- View your profile and log out securely.

### Product browsing

- Browse the product catalogue and open individual product details.
- Search products, filter by category, and sort by price.
- View product images, prices, descriptions, and stock availability.

### Cart and wishlist

- Add products to your cart and change quantities before checkout.
- Cart contents are saved to your customer account.
- Save products to a wishlist and remove them when no longer needed.

### Checkout and orders

- Provide a delivery address and start checkout with Razorpay.
- The backend checks product availability and calculates the order total.
- Payment confirmation is verified by the backend before an order is marked as paid.
- View order items, delivery details, payment status, and order status.
- Resume payment for eligible pending orders or cancel them while payment is still pending.

### Administration

- Admin accounts can add products through the admin dashboard.
- Admins can advance paid orders through fulfillment statuses.
- Regular customer accounts cannot access admin actions.

## Technology

| Area | Technologies |
|---|---|
| Frontend | React, React Router, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Authentication | bcrypt, JSON Web Tokens, HttpOnly cookies |
| Payments | Razorpay |

## Run locally

Install Node.js and npm, and make a MongoDB database available. Razorpay test credentials are needed to complete test checkout.

### Install dependencies

```sh
git clone https://github.com/harshgzp11/shopkart.git
cd shopkart
cd backend
npm install
cd ../frontend
npm install
```

### Configure the backend

From the repository root, copy the example configuration:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `MONGO_URI` to your MongoDB connection string and `JWT_SECRET` to a random private value of at least 32 characters. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to enable Razorpay checkout. Keep these values private.

### Start the app

Open two terminals from the repository root.

Terminal 1:

```sh
cd backend
npm run dev
```

Terminal 2:

```sh
cd frontend
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`. Locally, the frontend proxies `/api` requests to the backend on port `5000`.

## Admin accounts

New accounts are regular customers. To grant an account admin access, update its role in MongoDB:

```js
db.customers.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Vercel deployment

The repository is configured as a Vercel **Services** project with a frontend and backend.

1. Import the repository with root directory `./` and preset **Services**.
2. Add `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` as environment variables.
3. Deploy. Leave `VITE_API_URL` unset.


## Authored by
Harsh Srivastava
Class of 2029 A