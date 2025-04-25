import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // garante que query params já estejam disponíveis
    if (!router.isReady) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth
      .getSessionFromUrl({ storeSession: true })
      .then(async ({ data: { session }, error }) => {
        if (error || !session) {
          console.error('Erro ao processar sessão:', error?.message)
          alert('Erro na confirmação de e-mail.')
          return
        }

        const user = session.user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata.full_name,
            phone: ''
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError.message)
          alert('Houve um problema criando seu perfil.')
        }

        router.replace('/dashboard')
      })
  }, [router.isReady])

  return <p>Confirmando sua conta…</p>
}
