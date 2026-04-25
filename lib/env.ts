const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'NEXT_PUBLIC_APP_URL',
] as const

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\nPlease add them to your .env.local file.`
    )
  }
}

// Only validate at runtime in Node.js (not during type-checking)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  validateEnv()
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
}
