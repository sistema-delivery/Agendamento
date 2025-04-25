// src/pages/_app.tsx
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
  // Inicializa um browser client simples
  const [supabaseClient] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
