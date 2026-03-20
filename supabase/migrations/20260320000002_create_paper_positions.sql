-- Create paper_positions table
create table if not exists public.paper_positions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  symbol text not null,
  side text not null check (side in ('long', 'short')),
  entry_price numeric not null,
  size numeric not null,
  size_usd numeric not null,
  leverage integer not null default 1,
  margin numeric not null,
  tp numeric,
  sl numeric,
  liquidation_price numeric,
  opened_at bigint not null,
  closed_at bigint,
  exit_price numeric,
  pnl numeric,
  pnl_pct numeric,
  is_open boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_paper_positions_user_id on public.paper_positions(user_id);
create index idx_paper_positions_user_open on public.paper_positions(user_id, is_open);

-- Enable RLS
alter table public.paper_positions enable row level security;

-- Policies
create policy "Users can view own positions"
  on public.paper_positions for select
  using (auth.uid() = user_id);

create policy "Users can insert own positions"
  on public.paper_positions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own positions"
  on public.paper_positions for update
  using (auth.uid() = user_id);

create policy "Users can delete own positions"
  on public.paper_positions for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger paper_positions_updated_at
  before update on public.paper_positions
  for each row execute function public.update_updated_at();
