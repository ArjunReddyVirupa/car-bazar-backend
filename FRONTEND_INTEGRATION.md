# Frontend integration notes

Use `credentials: 'include'` for every request that needs the admin cookie.

```ts
const API_URL = import.meta.env.VITE_API_URL;

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

For image upload:

```ts
const formData = new FormData();
for (const file of files) formData.append('images', file);

await fetch(`${API_URL}/cars/${carId}/images`, {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

Do not manually set `Content-Type` for `FormData`; the browser adds the multipart boundary.
