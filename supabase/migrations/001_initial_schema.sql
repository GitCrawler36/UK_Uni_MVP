-- =============================================================
-- 001_initial_schema.sql
-- UK Admissions Platform — Rivil International Education Consultancy
-- =============================================================

-- ---------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------

create table universities (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        unique not null,
  logo_url    text,
  location    text,
  city        text,
  country     text        default 'United Kingdom',
  description text,
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

create table programmes (
  id                 uuid    primary key default gen_random_uuid(),
  university_id      uuid    references universities(id) on delete cascade,
  title              text    not null,
  slug               text    unique not null,
  degree_level       text    not null,
  subject_area       text    not null,
  duration_months    integer,
  tuition_fee_gbp    integer,
  overview           text,
  entry_requirements jsonb,
  is_active          boolean default true,
  is_featured        boolean default false,
  created_at         timestamptz default now()
);

create table intakes (
  id                   uuid primary key default gen_random_uuid(),
  programme_id         uuid references programmes(id) on delete cascade,
  intake_date          date not null,
  application_deadline date,
  status               text default 'open'
);

-- profiles mirrors auth.users — created automatically via trigger
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  email           text,
  phone           text,
  nationality     text,
  date_of_birth   date,
  passport_number text,
  passport_expiry date,
  role            text default 'student',
  created_at      timestamptz default now()
);

create table applications (
  id                    uuid        primary key default gen_random_uuid(),
  reference_number      text        unique not null,
  student_id            uuid        references profiles(id) on delete restrict,
  programme_id          uuid        references programmes(id) on delete restrict,
  intake_id             uuid        references intakes(id) on delete restrict,
  status                text        default 'received',
  academic_background   jsonb,
  english_proficiency   jsonb,
  funding_type          text,
  assigned_counsellor_id uuid       references profiles(id) on delete set null,
  is_priority           boolean     default false,
  submitted_at          timestamptz default now(),
  updated_at            timestamptz default now()
);

create table documents (
  id                  uuid        primary key default gen_random_uuid(),
  application_id      uuid        references applications(id) on delete cascade,
  document_type       text        not null,
  file_name           text        not null,
  file_url            text        not null,   -- Supabase Storage path, not public URL
  file_size_bytes     integer,
  verification_status text        default 'pending',
  rejection_reason    text,
  uploaded_at         timestamptz default now(),
  verified_at         timestamptz,
  verified_by         uuid        references profiles(id) on delete set null
);

create table messages (
  id             uuid        primary key default gen_random_uuid(),
  application_id uuid        references applications(id) on delete cascade,
  sender_id      uuid        references profiles(id) on delete set null,
  sender_role    text        not null,
  content        text        not null,
  is_email_sent  boolean     default false,
  is_read        boolean     default false,
  created_at     timestamptz default now()
);

create table internal_notes (
  id             uuid        primary key default gen_random_uuid(),
  application_id uuid        references applications(id) on delete cascade,
  author_id      uuid        references profiles(id) on delete set null,
  content        text        not null,
  created_at     timestamptz default now()
);

create table audit_log (
  id             uuid        primary key default gen_random_uuid(),
  application_id uuid        references applications(id) on delete cascade,
  action         text        not null,
  old_status     text,
  new_status     text,
  performed_by   uuid        references profiles(id) on delete set null,
  note           text,
  created_at     timestamptz default now()
);

create table leads (
  id                 uuid        primary key default gen_random_uuid(),
  full_name          text        not null,
  email              text        not null,
  phone              text,
  preferred_programme text,
  message            text,
  status             text        default 'new',
  created_at         timestamptz default now()
);

-- ---------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------

create index on programmes (university_id);
create index on programmes (degree_level);
create index on programmes (subject_area);
create index on programmes (is_active, is_featured);
create index on intakes (programme_id);
create index on applications (student_id);
create index on applications (assigned_counsellor_id);
create index on applications (status);
create index on applications (reference_number);
create index on documents (application_id);
create index on messages (application_id);
create index on messages (sender_id);
create index on internal_notes (application_id);
create index on audit_log (application_id);
create index on audit_log (performed_by);

-- ---------------------------------------------------------------
-- TRIGGER: auto-create profile on sign-up
-- ---------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------
-- TRIGGER: auto-update applications.updated_at
-- ---------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_updated_at
  before update on applications
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------

alter table universities     enable row level security;
alter table programmes       enable row level security;
alter table intakes           enable row level security;
alter table profiles          enable row level security;
alter table applications      enable row level security;
alter table documents         enable row level security;
alter table messages          enable row level security;
alter table internal_notes    enable row level security;
alter table audit_log         enable row level security;
alter table leads             enable row level security;

-- Helper: role check (reads from profiles, avoids JWT claim dependency)
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------
-- universities — public read, admin write
-- ---------------------------------------------------------------

create policy "universities: public read active"
  on universities for select
  using (is_active = true);

create policy "universities: admin full access"
  on universities for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- programmes — public read, admin write
-- ---------------------------------------------------------------

create policy "programmes: public read active"
  on programmes for select
  using (is_active = true);

create policy "programmes: admin full access"
  on programmes for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- intakes — public read, admin write
-- ---------------------------------------------------------------

create policy "intakes: public read"
  on intakes for select
  using (true);

create policy "intakes: admin full access"
  on intakes for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------

create policy "profiles: own read/write"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: counsellor read all"
  on profiles for select
  using (public.get_my_role() in ('counsellor', 'admin'));

create policy "profiles: admin full access"
  on profiles for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------

create policy "applications: student own"
  on applications for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "applications: counsellor assigned"
  on applications for select
  using (
    public.get_my_role() = 'counsellor'
    and assigned_counsellor_id = auth.uid()
  );

create policy "applications: counsellor update assigned"
  on applications for update
  using (
    public.get_my_role() = 'counsellor'
    and assigned_counsellor_id = auth.uid()
  )
  with check (
    public.get_my_role() = 'counsellor'
    and assigned_counsellor_id = auth.uid()
  );

create policy "applications: admin full access"
  on applications for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------

create policy "documents: student own application"
  on documents for all
  using (
    exists (
      select 1 from applications
      where applications.id = documents.application_id
        and applications.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from applications
      where applications.id = documents.application_id
        and applications.student_id = auth.uid()
    )
  );

create policy "documents: counsellor assigned application"
  on documents for select
  using (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = documents.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  );

create policy "documents: admin full access"
  on documents for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------

create policy "messages: student own application read"
  on messages for select
  using (
    exists (
      select 1 from applications
      where applications.id = messages.application_id
        and applications.student_id = auth.uid()
    )
  );

create policy "messages: student own application insert"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from applications
      where applications.id = messages.application_id
        and applications.student_id = auth.uid()
    )
  );

create policy "messages: counsellor assigned application"
  on messages for all
  using (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = messages.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  )
  with check (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = messages.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  );

create policy "messages: admin full access"
  on messages for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- internal_notes — staff only (counsellors + admins)
-- ---------------------------------------------------------------

create policy "internal_notes: counsellor assigned application"
  on internal_notes for all
  using (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = internal_notes.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  )
  with check (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = internal_notes.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  );

create policy "internal_notes: admin full access"
  on internal_notes for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- audit_log — append-only for staff, read-only for students
-- ---------------------------------------------------------------

create policy "audit_log: student own read"
  on audit_log for select
  using (
    exists (
      select 1 from applications
      where applications.id = audit_log.application_id
        and applications.student_id = auth.uid()
    )
  );

create policy "audit_log: counsellor assigned read"
  on audit_log for select
  using (
    public.get_my_role() = 'counsellor'
    and exists (
      select 1 from applications
      where applications.id = audit_log.application_id
        and applications.assigned_counsellor_id = auth.uid()
    )
  );

create policy "audit_log: admin full access"
  on audit_log for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- ---------------------------------------------------------------
-- leads — admin only
-- ---------------------------------------------------------------

create policy "leads: admin full access"
  on leads for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- Allow anonymous inserts for the contact / lead-capture form
create policy "leads: public insert"
  on leads for insert
  with check (true);
