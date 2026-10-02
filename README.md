# Car Marketplace Backend

Production-structured Node.js + TypeScript + Express + Prisma + PostgreSQL/Supabase backend for a small used-car marketplace.

## Included

- Admin email/password login
- bcrypt password hashing
- HttpOnly JWT cookie sessions
- Login/logout/current-admin endpoints
- Rate limiting
- Helmet security headers
- CORS configuration
- Zod validation
- PostgreSQL schema with Prisma
- Car CRUD
- Public car listing/search/filtering/pagination
- Admin-only car creation/update/delete/status changes
- Multiple car images
- Image validation and WebP compression using Sharp
- Supabase Storage integration
- Enquiry capture endpoint
- Health endpoint
- Graceful shutdown
- Prisma migration/seed setup
- Render deployment configuration

## Prerequisites

- Node.js 20.19+ recommended
- Supabase project with PostgreSQL
- Supabase Storage bucket named `car-images`

## 1. Install

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and a strong `JWT_SECRET`.

Never expose `SUPABASE_SECRET_KEY` to the browser.

## 3. Create the Supabase storage bucket

In Supabase Dashboard -> Storage -> New bucket:

- Name: `car-images`
- Public bucket: enabled

The backend uses the service-role key only on the server for uploads/deletes.

## 4. Database setup

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

The seed creates the admin account from environment variables if supplied, otherwise it uses a development-only default account.

Recommended production seed variables:

```env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_NAME=Business Admin
```

For production, set these before running the seed. Do not commit them.

## 5. Run locally

```bash
npm run dev
```

API: http://localhost:4000
Health: http://localhost:4000/api/health

## Admin login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yourdomain.com",
  "password": "your-password"
}
```

The server sets an HttpOnly cookie. The frontend must use `credentials: 'include'` for API requests.

## API overview

### Public

- `GET /api/health`
- `GET /api/cars`
- `GET /api/cars/:id`
- `POST /api/enquiries`

### Admin authenticated

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/cars`
- `PUT /api/cars/:id`
- `DELETE /api/cars/:id`
- `PATCH /api/cars/:id/status`
- `POST /api/cars/:id/images`
- `DELETE /api/cars/:id/images/:imageId`

## Car creation example

```json
{
  "brand": "Toyota",
  "model": "Innova Crysta",
  "variant": "2.4 ZX",
  "year": 2021,
  "price": 1750000,
  "kmDriven": 52000,
  "fuelType": "DIESEL",
  "transmission": "MANUAL",
  "ownerCount": 1,
  "location": "Kurnool, Andhra Pradesh",
  "description": "Well maintained family car.",
  "registrationNumber": "APXXAB1234"
}
```

## Upload images

Use `multipart/form-data`:

- field name: `images`
- max 20 files per request
- accepted image MIME types: JPEG, PNG, WebP, AVIF
- images are converted to WebP before storage

Example with curl after login:

```bash
curl -X POST http://localhost:4000/api/cars/CAR_ID/images \
  -H "Cookie: car_admin_session=..." \
  -F "images=@car1.jpg" \
  -F "images=@car2.jpg"
```

## Search

Examples:

```text
GET /api/cars?status=AVAILABLE
GET /api/cars?brand=Toyota&minPrice=500000&maxPrice=1500000
GET /api/cars?fuelType=DIESEL&transmission=MANUAL
GET /api/cars?minYear=2020&maxKmDriven=80000
GET /api/cars?location=Kurnool&page=1&pageSize=12
```

## Important security notes

1. Never commit `.env`.
2. Never send `SUPABASE_SECRET_KEY` to the frontend.
3. Use HTTPS in production.
4. Set `COOKIE_SECURE=true` in production.
5. Change the seeded admin password immediately.
6. Do not expose Prisma Studio publicly.
7. Keep registration numbers private if you later decide not to show them publicly.
8. Add a backup strategy before the inventory becomes business-critical.

## Render

The included `render.yaml` defines a Node web service. Add all required environment variables in Render. For `DATABASE_URL`, use your Supabase connection string.

Build command:

```bash
npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

Start command:

```bash
npm start
```
