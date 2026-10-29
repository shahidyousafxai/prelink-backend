# prelink-backend

Backend API built with Node.js, Express, MongoDB (Mongoose) and Joi.

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

## Scripts

- `npm run dev` - start with nodemon (auto-restart)
- `npm start` - start with node

## Endpoints

| Method | Route                | Auth   |
| ------ | -------------------- | ------ |
| GET    | `/health`            | -      |
| POST   | `/api/auth/register` | -      |
| POST   | `/api/auth/login`    | -      |
| GET    | `/api/auth/me`       | Bearer |
