# 📒 SmartKhata — Digital Udhaar Book

A production-ready web application for small shopkeepers to manage customer credit (udhaar), record payments, and send WhatsApp reminders.

---

## 🗂️ Folder Structure

```
smartkhata/
├── server/                  # Node.js + Express Backend
│   ├── index.js             # Entry point
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── transactions.js
│   │   ├── dashboard.js
│   │   └── settings.js
│   └── middleware/
│       └── auth.js
│
└── client/                  # React Frontend
    ├── public/index.html
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/AuthContext.js
        ├── utils/
        │   ├── api.js
        │   └── helpers.js
        ├── hooks/
        │   └── useVoiceInput.js
        ├── components/
        │   ├── Layout.js
        │   ├── CustomerFormModal.js
        │   └── AddTransactionModal.js
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── CustomersPage.js
            ├── CustomerDetailPage.js
            └── SettingsPage.js
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Git

---

### Step 1 — Clone & Setup Backend

```bash
cd smartkhata/server
npm install

# Copy and fill the env file
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/smartkhata?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### Step 2 — Setup Frontend

```bash
cd smartkhata/client
npm install

# Copy and fill the env file
cp .env.example .env
```

Edit `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React app:
```bash
npm start
# App runs on http://localhost:3000
```

---

## 🚀 Deployment Guide

### MongoDB Atlas Setup
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all) for cloud deployment
5. Get your connection string from **Connect > Drivers**

---

### Backend — Deploy on Render

1. Push your `server/` folder to a GitHub repository
2. Go to [render.com](https://render.com) and create a **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Environment:** Node
5. Add environment variables in Render dashboard:
   ```
   PORT=5000
   MONGODB_URI=<your Atlas connection string>
   JWT_SECRET=<your secret key>
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
6. Deploy — Render gives you a URL like `https://smartkhata-api.onrender.com`

---

### Frontend — Deploy on Vercel

1. Push your `client/` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repo
4. Set **Framework Preset** to `Create React App`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://smartkhata-api.onrender.com/api
   ```
6. Click **Deploy**
7. Vercel gives you a URL like `https://smartkhata.vercel.app`

---

### Final Step — Update CORS

After both are deployed, go to Render and update:
```
CLIENT_URL=https://smartkhata.vercel.app
```

---

## 🔐 Environment Variables Reference

### Server (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWT tokens | `a_long_random_string` |
| `NODE_ENV` | Environment | `production` or `development` |
| `CLIENT_URL` | Frontend URL for CORS | `https://smartkhata.vercel.app` |

### Client (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://smartkhata-api.onrender.com/api` |

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Register/Login with JWT + bcrypt |
| 👥 Customers | Add, edit, delete customers with auto balance |
| 💸 Transactions | Credit (udhaar) and payment with optional items note |
| 🎤 Voice Input | Browser Web Speech API — Hindi & English support |
| 💬 WhatsApp Reminder | Click-to-chat link — no paid API needed |
| 📊 Dashboard | Total udhaar, recovered, pending summary |
| 📱 Responsive | Mobile-first, works on phone + laptop |
| ⚙️ Settings | Language toggle + customizable reminder template |

---

## 🛡️ API Endpoints

```
POST   /api/auth/register        Register new shop
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user

GET    /api/customers            List all customers (with balances)
POST   /api/customers            Add customer
GET    /api/customers/:id        Customer detail + transactions
PUT    /api/customers/:id        Update customer
DELETE /api/customers/:id        Delete customer + transactions

POST   /api/transactions         Add transaction (credit/payment)
DELETE /api/transactions/:id     Delete transaction

GET    /api/dashboard            Dashboard summary stats

GET    /api/settings             Get user settings
PUT    /api/settings             Update settings
```

---

## 🧪 Test Credentials (after setup)

Register via the UI at `/register` with any email/password.

---

## 📝 Tech Stack

- **Frontend:** React 18, Tailwind CSS 3, React Router 6, Axios, React Hot Toast
- **Backend:** Node.js, Express 4, Mongoose, JWT, bcryptjs, express-validator
- **Database:** MongoDB Atlas
- **Fonts:** Baloo 2 (display) + DM Sans (body)
- **Voice:** Browser Web Speech API (no external dependency)
- **WhatsApp:** wa.me click-to-chat (no paid API)
