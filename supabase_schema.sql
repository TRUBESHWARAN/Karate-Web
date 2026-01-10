-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('admin', 'student')) default 'student',
  full_name text
);

-- 2. STUDENTS Table
create table public.students (
  id uuid references public.profiles(id) primary key,
  rank text default 'White Belt',
  join_date date default current_date,
  age int,
  emergency_contact text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. FEES Table
create table public.fees (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id),
  month text not null,
  amount numeric not null,
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  due_date date,
  payment_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. ANNOUNCEMENTS Table
create table public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Simplified for Starter)
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.fees enable row level security;
alter table public.announcements enable row level security;

-- Public read access for now to simplify (or specific policies)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Students can view own profile" on public.students for select using (auth.uid() = id);
create policy "Admins can view all students" on public.students for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Fees
create policy "Students view own fees" on public.fees for select using (student_id = auth.uid());
create policy "Admins manage fees" on public.fees for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Announcements
create policy "Everyone can view announcements" on public.announcements for select using (true);
create policy "Admins create announcements" on public.announcements for insert using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- TRIGGER to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'student');
  
  -- Also create partial student record
  insert into public.students (id) values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
