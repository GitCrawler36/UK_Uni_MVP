# UK Admissions Platform — Claude Code Context

## Project overview
A UK university admissions platform for Sri Lankan students built
for Rivil International Education Consultancy. Similar to IDP Education
in terms of programme browsing. Students browse partner university
programmes, submit an enquiry with their contact details and programme
interest, and Rivil's counsellors follow up via WhatsApp or email
to handle the application process offline.

This is a LEAD GENERATION platform — not a full application portal.
No document uploads. No application tracking. No student accounts.
The website connects students with Rivil's counsellors who then
handle everything offline through WhatsApp and email.

## Tech stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL for leads and programme data)
- Forms: React Hook Form + Zod validation
- Icons: Lucide React
- Email: Resend or SendGrid for enquiry notifications to Rivil

## Project structure
src/
  app/
    (public)/          All public pages — no auth required
      page.tsx         Home /
      programmes/      Programme listing + detail
      about/           About Us
      contact/         Contact Us
      thank-you/       Confirmation after enquiry
    (admin)/           Simple admin — protected by password
      admin/           Manage programmes and view enquiries
  components/
    ui/                shadcn base components
    shared/            Navbar, Footer, ProgrammeCard, EnquiryForm
    admin/             Admin components
  lib/
    supabase/          Supabase client
    validations/       Zod schemas
  types/               TypeScript types

## Pages (11 total)
Public:
  /                    Home — hero, featured programmes, how it works
  /programmes          Programme listing with search and filters
  /programmes/[slug]   Programme detail with enquiry form
  /about               About Us — Rivil connection and mission
  /contact             Contact Us — general enquiry form
  /thank-you           Confirmation page after enquiry submitted

Admin (simple password protected):
  /admin               Dashboard — recent enquiries count
  /admin/enquiries     All enquiries list with contact details
  /admin/programmes    Manage programme listings
  /admin/programmes/new         Add new programme
  /admin/programmes/[id]/edit   Edit programme
  /admin/universities  Manage universities

## Database tables (already created in Supabase)
- universities    Partner university details
- programmes      Course listings with entry requirements
- intakes         Available intake dates per programme
- leads           Student enquiries submitted via website

## Enquiry flow
1. Student browses programmes on /programmes
2. Student clicks a programme they are interested in
3. On the programme detail page they see an enquiry panel
4. Student fills in: Name, Email, Phone/WhatsApp, Message (optional)
5. On submit: saved to leads table + email sent to Rivil team
6. Student sees thank you page with Rivil WhatsApp number
7. Rivil counsellor contacts student via WhatsApp or email
8. Everything from this point handled offline by Rivil

## Enquiry form fields
- full_name (required)
- email (required)
- phone (required — labelled as "Phone / WhatsApp")
- programme_interest (auto-filled from the programme page)
- university_interest (auto-filled from the programme page)
- preferred_intake (dropdown from available intakes)
- message (optional)

## WhatsApp integration
Every programme detail page has a prominent WhatsApp button
that opens a pre-filled WhatsApp message:
"Hi Rivil, I am interested in [Course Name] at [University Name].
Please contact me."
Rivil WhatsApp number: to be added to .env.local

## Design
- Professional, trustworthy — students making major life decisions
- Primary colour: deep navy blue #0F2C5E
- Clean minimal design, mobile first
- Fast load times optimised for Sri Lanka
- WhatsApp green (#25D366) used for WhatsApp buttons only

## Admin access
Simple email + password login via Supabase Auth.
Only one role — admin. No student accounts needed.
Admin can: view enquiries, add/edit/archive programmes,
add/edit universities.

## Environment variables needed
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=94XXXXXXXXX
RESEND_API_KEY= (or SENDGRID_API_KEY)
NEXT_PUBLIC_APP_URL=http://localhost:3000

## Rules
- No student authentication or accounts
- No document uploads
- No application status tracking
- All enquiries saved to leads table
- Admin email notified on every new enquiry
- WhatsApp button on every programme detail page
- Mobile responsive on all pages

## University data management
- Rivil staff manage all university and programme data 
  via the admin portal at /admin
- Each programme has an optional official_course_url field 
  linking to the university's own website
- Programme detail page shows a "View on University Website" 
  button if official_course_url is set
- No developer needed to add or update universities or courses