// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function AuthCallback() {
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // extrai o token da hash (#) e seta a sessão
    supabase.auth.getSessionFromUrl({ storeSession: true })
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao processar callback:', error.message)
          alert('Erro na confirmação de e-mail.')
        }
        router.replace('/dashboard')
      })
  }, [supabase, router])

  return <p>Confirmando sua conta…</p>
}
