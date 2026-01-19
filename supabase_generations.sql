-- 1. Create the generations table
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users, -- Nullable for guests
  guest_id text,                      -- For guest users (UUID string)
  prompt text not null,
  model text,
  mode text check (mode in ('text-to-image', 'image-to-image')),
  image_url text not null,            -- Permanent Supabase Storage URL
  width int,
  height int,
  credits_used int default 2,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table generations enable row level security;

-- 3. Policies
-- Policy for Authenticated Users (Own rows)
create policy "Users can view their own generations" on generations
  for select using (auth.uid() = user_id);

-- Policy for Service Role (Backend can do anything)
-- (Implicitly enabled via admin client)

-- 4. Create a storage bucket for generated images if it doesn't exist
-- Note: Creating buckets via SQL requires specific extensions/permissions. 
-- We will assume the bucket 'generated_images' needs to be created or we use the API to upload.
-- We will add a policy for the storage objects to be publicly readable.

insert into storage.buckets (id, name, public)
values ('generated_images', 'generated_images', true)
on conflict (id) do nothing;

-- Allow public access to read generated images
create policy "Public Access" on storage.objects for select
using ( bucket_id = 'generated_images' );

-- Allow authenticated users (and service role) to upload
create policy "Authenticated users can upload" on storage.objects for insert
with check ( bucket_id = 'generated_images' );
