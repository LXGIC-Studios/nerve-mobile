-- Create paper_balances table
create table if not exists public.paper_balances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  total numeric not null default 100000,
  available numeric not null default 100000,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.paper_balances enable row level security;

-- Policies
create policy "Users can view own balance"
  on public.paper_balances for select
  using (auth.uid() = user_id);

create policy "Users can insert own balance"
  on public.paper_balances for insert
  with check (auth.uid() = user_id);

create policy "Users can update own balance"
  on public.paper_balances for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger paper_balances_updated_at
  before update on public.paper_balances
  for each row execute function public.update_updated_at();

-- Auto-create balance on profile creation
create or replace function public.handle_new_profile_balance()
returns trigger as $$
begin
  insert into public.paper_balances (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_balance
  after insert on public.profiles
  for each row execute function public.handle_new_profile_balance();
