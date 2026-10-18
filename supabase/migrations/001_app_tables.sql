-- EmailForge app table (additive and idempotent). RLS is on with no public policies.
create table if not exists ef_sequences (
  id               uuid primary key default gen_random_uuid(),
  offer            text not null,
  target_audience  text not null,
  sequence_type    text,
  tone             text,
  email_count      integer,
  sender_name      text,
  company_name     text,
  emails           jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_ef_sequences_created on ef_sequences (created_at desc);
create index if not exists idx_ef_sequences_type    on ef_sequences (sequence_type);

alter table ef_sequences enable row level security;
