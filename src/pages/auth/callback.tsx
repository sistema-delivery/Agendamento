// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .getSessionFromUrl({ storeSession: true })
      .then(async ({ data, error }) => {
        if (error) {
          console.error('Erro na confirmação de e-mail:', error.message)
          alert('Não foi possível confirmar sua conta.')
          return
        }

        // Se quiser garantir que o perfil exista:
        if (data.session?.user) {
          const { user } = data.session
          await supabase
            .from('profiles')
            .upsert({ id: user.id, full_name: user.user_metadata.full_name, phone: '' })
        }

        router.replace('/login?approved=true')
      })
  }, [router])

  return <p>Confirmando sua conta…</p>
}
