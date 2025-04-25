// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    // Só executa após o Next.js popular `router.query`
    if (!isReady) return

    const token = Array.isArray(query.token) ? query.token[0] : query.token

    if (!token) {
      alert('Token de confirmação ausente.')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Confirma o magic link / signup link usando token_hash
    supabase.auth
      .verifyOtp({ token_hash: token, type: 'email' })
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao confirmar conta:', error.message)
          alert('Não foi possível confirmar sua conta.')
        } else {
          router.replace('/login?approved=true')
        }
      })
  }, [isReady, query.token, router])

  return <p>Confirmando sua conta…</p>
}
