create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_chat_sessions_one_session_per_user unique (user_id)
);

alter table public.ai_chat_sessions enable row level security;

drop policy if exists "Users can select their own AI chat sessions"
  on public.ai_chat_sessions;

create policy "Users can select their own AI chat sessions"
  on public.ai_chat_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own AI chat sessions"
  on public.ai_chat_sessions;

create policy "Users can insert their own AI chat sessions"
  on public.ai_chat_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own AI chat sessions"
  on public.ai_chat_sessions;

create policy "Users can update their own AI chat sessions"
  on public.ai_chat_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own AI chat sessions"
  on public.ai_chat_sessions;

create policy "Users can delete their own AI chat sessions"
  on public.ai_chat_sessions
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_ai_chat_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_chat_sessions_updated_at
  on public.ai_chat_sessions;

create trigger set_ai_chat_sessions_updated_at
  before update on public.ai_chat_sessions
  for each row
  execute function public.set_ai_chat_sessions_updated_at();
