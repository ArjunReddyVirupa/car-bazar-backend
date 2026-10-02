# Deployment checklist

## Supabase

1. Create a Supabase project.
2. Copy the Postgres connection string into `DATABASE_URL`.
3. Create a public Storage bucket named `car-images`.
4. Copy the project URL to `SUPABASE_URL`.
5. Copy the service role key to `SUPABASE_SECRET_KEY`.

## Backend

1. Push this repository to GitHub.
2. Create a Render Web Service from the repository.
3. The included `render.yaml` can be used as the service blueprint.
4. Add `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` as environment variables.
5. Deploy.
6. Run the seed once against the production database. From a secure machine with the production `DATABASE_URL` and admin variables set:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

Do not expose the production database URL in client-side code.

## Cookie configuration

If frontend and backend are on different sites, use:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

If they are same-site and your frontend/backend are under the same site, `lax` is simpler.

## Frontend

Set:

```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
```

or the equivalent environment variable for your Next.js app.

Every authenticated request must use `credentials: 'include'`.

## First production test

1. `GET /api/health`
2. `POST /api/auth/login`
3. `GET /api/auth/me`
4. `GET /api/admin/dashboard`
5. Create a car.
6. Upload one small image.
7. Open `GET /api/cars/:id` and verify the image URL.
8. Delete the test car.
9. Log out.
10. Verify an admin-only endpoint returns 401.
