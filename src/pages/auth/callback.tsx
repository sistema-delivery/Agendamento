// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    // pega o código de autorização da URL (?code=...)
    const code = router.query.code as string | undefined
    if (!code) {
      console.error('Código de autorização ausente na URL')
      alert('Não foi possível confirmar o e-mail.')
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)   // <— agora recebe o code
      .then(({ data: { session }, error }) => {
        if (error || !session) {
          console.error('Erro ao trocar código por sessão:', error?.message)
          alert('Falha ao confirmar e-mail.')
          return
        }
        // sucesso: redireciona para o dashboard
        router.replace('/dashboard')
      })
  }, [router.isReady, router.query.code])

  return <p>Confirmando sua conta…</p>
}
