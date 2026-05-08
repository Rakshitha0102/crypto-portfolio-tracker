# 📈 Scalability Notes – CryptoNest

This document outlines how CryptoNest is designed to scale and what additional steps can be taken to prepare it for production-level traffic.

---

## ✅ Current Architecture (What's Already in Place)

### 1. Modular MVC Structure
The project follows a clean **Model → Controller → Route** pattern. Adding a new feature (e.g., a watchlist, alerts, or trades module) requires only:
- A new Mongoose model in `/models/`
- A new controller in `/controllers/`
- A new route file in `/routes/`
- One line in `server.js` to mount it

Zero changes to existing code — fully open/closed principle.

### 2. API Versioning (`/api/v1/`)
All routes are prefixed with `/api/v1/`. When breaking changes are needed, a `/api/v2/` namespace can be introduced with zero disruption to existing clients.

### 3. JWT Stateless Authentication
JWT tokens are **stateless** — the server holds no session state. This means any number of backend instances can validate tokens independently, making horizontal scaling trivial.

### 4. Role-Based Access Control (RBAC) via Middleware
The `adminOnly` middleware is decoupled from business logic. New roles (e.g., `moderator`, `analyst`) can be added by:
- Adding the role to the `User` schema enum
- Creating a new middleware guard

### 5. MongoDB with Mongoose
MongoDB's **document model** scales well horizontally through **sharding**. The `Coin` collection references users via ObjectId — queries filter by `user` field, which can be indexed for fast lookups even at millions of records.

---

## 🚀 Recommended Scaling Strategies

### 🔴 Short Term (Immediate Production Readiness)

#### Rate Limiting
Prevent brute-force attacks and API abuse with `express-rate-limit`:
```bash
npm install express-rate-limit
```
```js
const rateLimit = require('express-rate-limit');
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

#### Input Sanitization
Add `express-mongo-sanitize` to block NoSQL injection:
```bash
npm install express-mongo-sanitize
```

#### Environment-Aware Logging
Replace `console.log` with a structured logger like **Winston** or **Morgan** for log levels, timestamps, and file output.

---

### 🟡 Medium Term (Scaling the Backend)

#### Caching with Redis
For frequently read data (e.g., live crypto prices, admin dashboards), add Redis caching:
```js
// Cache the admin "all coins" response for 60 seconds
const cached = await redis.get('admin:all_coins');
if (cached) return res.json(JSON.parse(cached));
// ...fetch from DB, then:
await redis.setEx('admin:all_coins', 60, JSON.stringify(data));
```
This reduces DB load drastically under high read traffic.

#### Database Indexing
Add indexes for common query patterns:
```js
// In Coin model
coinSchema.index({ user: 1, createdAt: -1 });

// In User model
userSchema.index({ email: 1 }, { unique: true });
```

#### Horizontal Scaling + Load Balancer
Run multiple Node.js instances behind an **Nginx** or **AWS ALB** load balancer:
```
[Client] → [Nginx / ALB]
              ├── Node Instance 1 (port 5000)
              ├── Node Instance 2 (port 5001)
              └── Node Instance 3 (port 5002)
```
Use **PM2 cluster mode** for multi-core utilization on a single server:
```bash
pm2 start server.js -i max
```

---

### 🟢 Long Term (Microservices & Cloud)

#### Microservices Decomposition
As the app grows, split into independent services:

| Service             | Responsibility                            |
|---------------------|-------------------------------------------|
| `auth-service`      | Registration, login, JWT issuance         |
| `portfolio-service` | Coin CRUD, portfolio calculations         |
| `price-service`     | Live price fetching from CoinGecko API    |
| `notification-service` | Price alerts, email/push notifications |

Each service has its own database and communicates via **REST** or **message queues (RabbitMQ / Kafka)**.

#### Container Deployment with Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Orchestrate with **Docker Compose** (dev) or **Kubernetes** (production).

#### Cloud Infrastructure
| Component          | Recommended Service                    |
|--------------------|----------------------------------------|
| Backend hosting    | AWS ECS / Railway / Render             |
| Database           | MongoDB Atlas (auto-scaling clusters)  |
| Caching            | AWS ElastiCache (Redis)                |
| File storage       | AWS S3                                 |
| CDN / Frontend     | Vercel / Netlify / CloudFront          |
| Secrets management | AWS Secrets Manager / Doppler          |

---

## 📊 Summary Table

| Strategy               | Impact        | Effort   | Priority |
|------------------------|---------------|----------|----------|
| Rate limiting          | Security      | Low      | ✅ Now   |
| DB indexing            | Performance   | Low      | ✅ Now   |
| Redis caching          | Performance   | Medium   | 🔜 Soon  |
| Horizontal scaling     | Availability  | Medium   | 🔜 Soon  |
| Dockerization          | Portability   | Medium   | 🔜 Soon  |
| Microservices split    | Scalability   | High     | 🔮 Later |
| Kubernetes             | Orchestration | High     | 🔮 Later |

---

> The current codebase is structured to support all of these enhancements without major rewrites — the modular architecture ensures each layer can be extracted, replaced, or scaled independently.
