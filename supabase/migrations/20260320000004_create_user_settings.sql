-- Create user_settings table
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  theme text default 'dark' not null,
  notifications_enabled boolean default true not null,
  default_leverage integer default 10 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- Policies
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.update_updated_at();

-- Auto-create settings on profile creation
create or replace function public.handle_new_profile_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_settings
  after insert on public.profiles
  for each row execute function public.handle_new_profile_settings();
