// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    supabase.auth
      .exchangeCodeForSession()
      .then(({ data: { session }, error }) => {
        if (error || !session) {
          console.error('Erro na sessão:', error?.message)
          alert('Falha ao confirmar e-mail.')
          return
        }
        // sessão criada com sucesso!
        router.replace('/dashboard')
      })
  }, [router.isReady])

  return <p>Confirmando sua conta…</p>
}
