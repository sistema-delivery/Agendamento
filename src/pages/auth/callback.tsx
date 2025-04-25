// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Captura apenas o token de confirmação enviado no link
    const { token } = router.query as { token?: string }

    if (!token) {
      alert('Token de confirmação ausente.')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Verifica o OTP (token_hash) do magic link / signup
    supabase.auth
      .verifyOtp({ token_hash: token, type: 'email' })
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao confirmar conta:', error.message)
          alert('Não foi possível confirmar sua conta.')
        } else {
          // Redireciona para login com sinalização de aprovação
          router.replace('/login?approved=true')
        }
      })
  }, [router])

  return <p>Confirmando sua conta…</p>
}
