# 🪙 CryptoNest – Crypto Portfolio Tracker

A full-stack **Crypto Portfolio Tracker** built with **Node.js + Express + MongoDB** (backend) and **React.js** (frontend). Features JWT authentication, role-based access control (RBAC), and full CRUD for managing a personal crypto portfolio.

---

## 📁 Project Structure

```
cryptonest/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   └── coinController.js     # Add, Get, Update, Delete coins
│   ├── middleware/
│   │   └── auth.js               # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt hashing)
│   │   └── Coin.js               # Coin/portfolio schema
│   ├── routes/
│   │   ├── auth.js               # /api/v1/auth/*
│   │   └── coin.js               # /api/v1/coins/*
│   ├── .env                      # Environment variables (not committed)
│   ├── server.js                 # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── AdminPanel.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    └── package.json
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- npm or yarn

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rakshitha0102/crypto-portfolio-tracker.git
cd crypto-portfolio-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cryptonest
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
```

Start the backend server:

```bash
npm run dev        # development (nodemon)
# or
node server.js     # production
```

Server runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Environment Variables

| Variable     | Description                        | Example                        |
|--------------|------------------------------------|--------------------------------|
| `PORT`       | Port for the Express server        | `5000`                         |
| `MONGO_URI`  | MongoDB connection string          | `mongodb://localhost:27017/db` |
| `JWT_SECRET` | Secret key for signing JWT tokens  | `mysecretkey`                  |
| `JWT_EXPIRE` | Token expiry duration              | `7d`                           |

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

#### Auth Routes

| Method | Endpoint             | Access  | Description              |
|--------|----------------------|---------|--------------------------|
| POST   | `/auth/register`     | Public  | Register a new user      |
| POST   | `/auth/login`        | Public  | Login and get JWT token  |
| GET    | `/auth/me`           | Private | Get logged-in user info  |

#### Coin (Portfolio) Routes

| Method | Endpoint             | Access       | Description                        |
|--------|----------------------|--------------|------------------------------------|
| POST   | `/coins`             | Private      | Add a coin to portfolio             |
| GET    | `/coins`             | Private      | Get all coins for current user      |
| PUT    | `/coins/:id`         | Private      | Update a coin (owner only)          |
| DELETE | `/coins/:id`         | Private      | Delete a coin (owner only)          |
| GET    | `/coins/admin/all`   | Admin only   | Get all coins across all users      |

**Authorization header format:**
```
Authorization: Bearer <jwt_token>
```

---

## 👥 User Roles

| Role    | Capabilities                                      |
|---------|---------------------------------------------------|
| `user`  | Register, login, manage own coin portfolio        |
| `admin` | All user capabilities + view all users' portfolios |

> Roles are set during registration. The `adminOnly` middleware guards admin routes.

---

## 🛡️ Security Features

- **Password hashing** – bcrypt with 12 salt rounds
- **JWT authentication** – Stateless, expiry-based tokens (7-day default)
- **Role-based access control** – Middleware-enforced admin routes
- **Ownership checks** – Users can only modify their own coins
- **Input validation** – Mongoose schema-level validation with descriptive error messages
- **Password never returned** – `select: false` on the password field in User schema

---

## 🗄️ Database Schema

### User

```
_id        ObjectId
name       String (required)
email      String (required, unique)
password   String (hashed, select: false)
role       String (enum: user | admin, default: user)
createdAt  Date
updatedAt  Date
```

### Coin

```
_id        ObjectId
user       ObjectId → ref: User
symbol     String (uppercase, required)
name       String (required)
quantity   Number (min: 0, required)
buyPrice   Number (min: 0, required)
notes      String (optional)
createdAt  Date
updatedAt  Date
```

---

## 🖥️ Frontend Pages

| Route        | Component      | Access        | Description                          |
|--------------|----------------|---------------|--------------------------------------|
| `/login`     | Login.jsx      | Public        | Login form with validation           |
| `/register`  | Register.jsx   | Public        | Register with password strength meter|
| `/dashboard` | Dashboard.jsx  | Private       | View & manage own portfolio          |
| `/admin`     | AdminPanel.jsx | Private       | Admin view of all users' portfolios  |

---

## 📬 Postman Collection

Import `CryptoNest_API.postman_collection.json` into Postman.

The collection includes:
- Pre-configured `{{baseUrl}}` and `{{token}}` variables
- Auto-save token scripts on login/register
- Example request bodies and responses for all endpoints

---

## 📦 Dependencies

### Backend

| Package       | Purpose                          |
|---------------|----------------------------------|
| express       | Web framework                    |
| mongoose      | MongoDB ODM                      |
| bcryptjs      | Password hashing                 |
| jsonwebtoken  | JWT generation & verification    |
| dotenv        | Environment variable management  |
| cors          | Cross-origin resource sharing    |

### Frontend

| Package           | Purpose                         |
|-------------------|---------------------------------|
| react             | UI library                      |
| react-router-dom  | Client-side routing             |
| axios             | HTTP client for API calls       |

---

## 🧪 Testing the API

1. Import the Postman collection (`CryptoNest_API.postman_collection.json`)
2. Register a user → token is auto-saved
3. Add coins to portfolio
4. Test update/delete on your coins
5. Register an admin user and test `/coins/admin/all`

---

## 📈 Scalability Notes

See [SCALABILITY.md](./SCALABILITY.md) for a detailed note on how this project is architected for growth and production readiness.

---

## 📄 License

MIT – feel free to use and modify.
