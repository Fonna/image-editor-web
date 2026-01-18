create table public.feedback (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  message text not null,
  created_at timestamp with time zone not null default now(),
  status text not null default 'new',
  constraint feedback_pkey primary key (id),
  constraint feedback_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null
);

alter table public.feedback enable row level security;

create policy "Enable insert for everyone" on public.feedback
  for insert with check (true);

create policy "Enable read for authenticated users only" on public.feedback
  for select using (auth.role() = 'authenticated');
