// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const { access_token, refresh_token, token, type } = router.query as {
      access_token?: string
      refresh_token?: string
      token?: string
      type?: string
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${access_token}` } } }
    )

    // 1) Fluxo OAuth (SSO)
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(async ({ error }) => {
          if (error) {
            console.error('Erro ao processar sessão:', error.message)
            alert('Erro na confirmação de e-mail.')
            return
          }

          const {
            data: { user }
          } = await supabase.auth.getUser()

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user!.id,
              full_name: user!.user_metadata.full_name,
              phone: ''
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError.message)
            alert('Houve um problema criando seu perfil.')
          }

          router.replace('/login?approved=true')
        })
      return
    }

    // 2) Fluxo de confirmação de e-mail via token (signup)
    if (token && type === 'signup') {
      supabase.auth
        .verifyOtp({ token, type: 'signup' })
        .then(({ error }) => {
          if (error) {
            console.error('Erro ao confirmar conta:', error.message)
            alert('Não foi possível confirmar sua conta.')
            return
          }
          router.replace('/login?approved=true')
        })
      return
    }

    // 3) Se não vier nenhum parâmetro válido
    alert('Parâmetros de autenticação ausentes.')
  }, [router])

  return <p>Conta confirmada! Redirecionando para login…</p>
}
