# API Reference

Base URL locally: `http://localhost:4000/api`

All successful responses use `{ "success": true, "data": ... }`.
Errors use `{ "success": false, "error": { "code", "message" } }`.

## Auth

### POST /auth/login

```json
{ "email": "admin@example.com", "password": "..." }
```

Sets an HttpOnly cookie.

### POST /auth/logout
Requires admin session.

### GET /auth/me
Requires admin session.

## Cars

### GET /cars
Public. Query parameters:

`page`, `pageSize`, `search`, `brand`, `model`, `minPrice`, `maxPrice`, `minYear`, `maxYear`, `maxKmDriven`, `fuelType`, `transmission`, `location`, `status`, `featured`

### GET /cars/:id
Public.

### POST /cars
Admin.

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
  "registrationNumber": "APXXAB1234",
  "featured": false
}
```

### PUT /cars/:id
Admin. Send any subset of fields from the create schema.

### PATCH /cars/:id/status
Admin.

```json
{ "status": "SOLD" }
```

### DELETE /cars/:id
Admin. Deletes the car record and attempts to delete all associated storage files.

### POST /cars/:id/images
Admin. `multipart/form-data`, field name `images`. Max 20 files and 8 MB each by default. Images are normalized to WebP.

### DELETE /cars/:id/images/:imageId
Admin.

## Enquiries

### POST /enquiries
Public.

```json
{
  "carId": "cm...",
  "customerName": "Customer Name",
  "phone": "+919999999999",
  "message": "I want to inspect this car."
}
```

## Admin

All admin routes require the HttpOnly admin session cookie.

### GET /admin/dashboard
Returns car and enquiry counts for the admin dashboard.

### GET /admin/enquiries?page=1&pageSize=25
Returns customer enquiries with the related car summary.
