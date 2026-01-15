-- Create a table to store user credits
create table if not exists user_credits (
  user_id uuid references auth.users not null primary key,
  credits int not null default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_credits enable row level security;

-- Create policies
-- Allow users to view their own credits
create policy "Users can view their own credits" on user_credits
  for select using (auth.uid() = user_id);

-- Only service role can insert/update/delete (implicitly denied for others by default RLS)
-- Note: We will use the service role key in the backend to manage credits.
