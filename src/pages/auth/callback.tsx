// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // 1) Parseia token da hash
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      // 2) Cria um client temporário com o token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${access_token}` } } }
      )

      // 3) Estabelece a sessão
      supabase.auth.setSession({ access_token, refresh_token }).then(async ({ error }) => {
        if (error) {
          console.error('Erro ao processar sessão:', error.message)
          alert('Erro na confirmação de e-mail.')
          return
        }

        // 4) Agora que temos usuário autenticado, faz o upsert no profiles
        const {
          data: { user }
        } = await supabase.auth.getUser()

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: user!.id, full_name: user!.user_metadata.full_name, phone: '' })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError.message)
          alert('Houve um problema criando seu perfil.')
        }

        // 5) Redireciona ao dashboard
        router.replace('/dashboard')
      })
    } else {
      alert('Parâmetros de autenticação ausentes.')
    }
  }, [router])

  return <p>Confirmando sua conta…</p>
}
