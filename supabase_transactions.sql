-- Create a table to store payment transaction history
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount decimal(10, 2) not null,
  currency text not null default 'USD',
  status text not null, -- 'completed', 'failed', 'pending'
  plan_id text not null, -- 'TRIAL', 'STARTER', 'PRO', 'ULTRA'
  credits_added int not null,
  provider_transaction_id text, -- ID from Creem/Stripe
  metadata jsonb, -- Store full webhook payload or specific metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;

-- Create policies
-- Allow users to view their own transactions
create policy "Users can view their own transactions" on transactions
  for select using ((select auth.uid()) = user_id);

-- Service role can do everything (implicitly allowed if no policy blocks it, but we rely on RLS bypass in admin client)
