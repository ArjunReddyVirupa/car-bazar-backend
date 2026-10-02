# Supabase Storage Setup

1. Open the Supabase project.
2. Go to Storage.
3. Create a bucket named `car-images`.
4. Make the bucket public because the public car website needs to display images.
5. Copy the project URL to `SUPABASE_URL`.
6. Copy the server-only service role key to `SUPABASE_SECRET_KEY`.

## Important

The service-role key bypasses normal Storage RLS. It must exist only in the backend environment and must never be exposed to the browser or committed to Git.

The backend uploads to paths such as:

`cars/<car-id>/<uuid>.webp`

Images are resized to fit within 2000x1500 and encoded as WebP at quality 78 before upload.
