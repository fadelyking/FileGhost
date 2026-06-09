create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  subscription_status text,
  free_images_used integer not null default 0,
  access_expires_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.processed_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  original_filename text not null,
  cleaned_filename text not null,
  storage_path text,
  mime_type text,
  metadata_before jsonb,
  metadata_after jsonb,
  file_size_before integer,
  file_size_after integer,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  image_count integer not null default 1,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.processed_images enable row level security;
alter table public.usage_events enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can read own processed images"
on public.processed_images
for select
using (auth.uid() = user_id);

create policy "Users can read own usage events"
on public.usage_events
for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('cleaned-images', 'cleaned-images', false)
on conflict (id) do nothing;

create index if not exists processed_images_user_id_idx on public.processed_images(user_id);
create index if not exists processed_images_expires_at_idx on public.processed_images(expires_at);
create index if not exists usage_events_user_id_idx on public.usage_events(user_id);
