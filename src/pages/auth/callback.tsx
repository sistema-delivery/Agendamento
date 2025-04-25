// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function AuthCallback() {
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // 1) Pega toda a string após o '#' e monta um URLSearchParams
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      // 2) Seta a sessão no supabase-js
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            console.error('Erro ao processar sessão:', error.message)
            alert('Erro na confirmação de e-mail.')
          } else {
            // 3) Redirect para dashboard
            router.replace('/dashboard')
          }
        })
    } else {
      console.error('Tokens não encontrados na URL.')
      alert('Parâmetros de autenticação ausentes.')
    }
  }, [supabase, router])

  return <p>Confirmando sua conta…</p>
}
