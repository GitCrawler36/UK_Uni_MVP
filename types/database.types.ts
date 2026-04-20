export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ---------------------------------------------------------------
// Row types (what you get back from SELECT)
// ---------------------------------------------------------------

export interface University {
  id: string
  name: string
  slug: string
  logo_url: string | null
  location: string | null
  city: string | null
  country: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Programme {
  id: string
  university_id: string | null
  title: string
  slug: string
  degree_level: string
  subject_area: string
  duration_months: number | null
  tuition_fee_gbp: number | null
  overview: string | null
  entry_requirements: Json | null
  official_course_url: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface Intake {
  id: string
  programme_id: string | null
  intake_date: string
  application_deadline: string | null
  status: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  nationality: string | null
  date_of_birth: string | null
  passport_number: string | null
  passport_expiry: string | null
  role: 'student' | 'counsellor' | 'admin'
  created_at: string
}

export type ApplicationStatus =
  | 'received'
  | 'under_review'
  | 'more_info_required'
  | 'eligible'
  | 'not_eligible'
  | 'forwarded_to_rivil'

export interface Application {
  id: string
  reference_number: string
  student_id: string | null
  programme_id: string | null
  intake_id: string | null
  status: ApplicationStatus
  academic_background: Json | null
  english_proficiency: Json | null
  funding_type: string | null
  assigned_counsellor_id: string | null
  is_priority: boolean
  submitted_at: string
  updated_at: string
}

export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected'

export interface Document {
  id: string
  application_id: string | null
  document_type: string
  file_name: string
  file_url: string
  file_size_bytes: number | null
  verification_status: DocumentVerificationStatus
  rejection_reason: string | null
  uploaded_at: string
  verified_at: string | null
  verified_by: string | null
}

export type SenderRole = 'student' | 'counsellor' | 'admin'

export interface Message {
  id: string
  application_id: string | null
  sender_id: string | null
  sender_role: SenderRole
  content: string
  is_email_sent: boolean
  is_read: boolean
  created_at: string
}

export interface InternalNote {
  id: string
  application_id: string | null
  author_id: string | null
  content: string
  created_at: string
}

export interface AuditLog {
  id: string
  application_id: string | null
  action: string
  old_status: string | null
  new_status: string | null
  performed_by: string | null
  note: string | null
  created_at: string
}

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed'

export interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  preferred_programme: string | null
  message: string | null
  status: LeadStatus
  created_at: string
}

// ---------------------------------------------------------------
// Insert types (omit server-generated fields)
// ---------------------------------------------------------------

export type UniversityInsert = Omit<University, 'id' | 'created_at'> & Partial<Pick<University, 'id' | 'created_at'>>
export type ProgrammeInsert  = Omit<Programme,  'id' | 'created_at'> & Partial<Pick<Programme,  'id' | 'created_at'>>
export type IntakeInsert     = Omit<Intake,     'id'>                & Partial<Pick<Intake,     'id'>>
export type ProfileInsert    = Omit<Profile,    'created_at'>        & Partial<Pick<Profile,    'created_at'>>
export type ApplicationInsert = Omit<Application, 'id' | 'submitted_at' | 'updated_at'> &
  Partial<Pick<Application, 'id' | 'submitted_at' | 'updated_at'>>
export type DocumentInsert   = Omit<Document,   'id' | 'uploaded_at'> & Partial<Pick<Document,   'id' | 'uploaded_at'>>
export type MessageInsert    = Omit<Message,    'id' | 'created_at'>  & Partial<Pick<Message,    'id' | 'created_at'>>
export type InternalNoteInsert = Omit<InternalNote, 'id' | 'created_at'> & Partial<Pick<InternalNote, 'id' | 'created_at'>>
export type AuditLogInsert   = Omit<AuditLog,   'id' | 'created_at'>  & Partial<Pick<AuditLog,   'id' | 'created_at'>>
export type LeadInsert       = Omit<Lead,       'id' | 'created_at'>  & Partial<Pick<Lead,       'id' | 'created_at'>>

// ---------------------------------------------------------------
// Supabase Database shape (used to type the client)
// ---------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: University
        Insert: UniversityInsert
        Update: Partial<UniversityInsert>
      }
      programmes: {
        Row: Programme
        Insert: ProgrammeInsert
        Update: Partial<ProgrammeInsert>
      }
      intakes: {
        Row: Intake
        Insert: IntakeInsert
        Update: Partial<IntakeInsert>
      }
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      applications: {
        Row: Application
        Insert: ApplicationInsert
        Update: Partial<ApplicationInsert>
      }
      documents: {
        Row: Document
        Insert: DocumentInsert
        Update: Partial<DocumentInsert>
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: Partial<MessageInsert>
      }
      internal_notes: {
        Row: InternalNote
        Insert: InternalNoteInsert
        Update: Partial<InternalNoteInsert>
      }
      audit_log: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: Partial<AuditLogInsert>
      }
      leads: {
        Row: Lead
        Insert: LeadInsert
        Update: Partial<LeadInsert>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}

// ---------------------------------------------------------------
// Convenience join types used across the app
// ---------------------------------------------------------------

export type ApplicationWithRelations = Application & {
  programme: (Programme & { university: University | null }) | null
  intake: Intake | null
  student: Profile | null
  assigned_counsellor: Profile | null
}

export type DocumentWithVerifier = Document & {
  verifier: Profile | null
}

export type MessageWithSender = Message & {
  sender: Profile | null
}
