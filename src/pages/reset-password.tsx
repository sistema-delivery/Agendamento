// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const access_token = router.query.access_token as string
    const refresh_token = router.query.refresh_token as string
    const type = router.query.type as string

    if (access_token && refresh_token) {
      // Redireciona para reset-password se for fluxo de recovery
      if (type === 'recovery') {
        router.replace({
          pathname: '/reset-password',
          query: { access_token, refresh_token },
        })
        return
      }

      // Fluxo normal de confirmação de e-mail / login
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        }
      )

      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(async ({ error }) => {
          if (error) {
            console.error('Erro ao processar sessão:', error.message)
            alert('Erro na confirmação de e-mail.')
            return
          }

          // Atualiza ou cria perfil
          const {
            data: { user },
          } = await supabase.auth.getUser()

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user!.id,
              full_name: user!.user_metadata.full_name,
              phone: '',
            })

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError.message)
            alert('Houve um problema criando seu perfil.')
          }

          router.replace('/dashboard')
        })
    } else {
      alert('Parâmetros de autenticação ausentes.')
    }
  }, [router])

  return <p>Confirmando sua conta…</p>
}
