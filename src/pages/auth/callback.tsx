// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    if (!isReady) return

    // Extrai o token da URL
    const raw = query.token
    const token = Array.isArray(raw) ? raw[0] : raw

    if (!token) {
      // Redireciona imediatamente ao login em caso de token ausente
      router.replace('/login?error=token_missing')
      return
    }

    // Verifica o OTP do Supabase diretamente no cliente
    ;(async () => {
      const { error } = await supabase.auth.verifyOtp({
        type: 'signup',
        token_hash: token,
      })

      if (error) {
        console.error('Erro ao confirmar e-mail:', error.message)
        // Redireciona ao login em caso de falha (token expirado ou inválido)
        router.replace('/login?error=otp_expired')
      } else {
        // Redireciona ao login após confirmação bem-sucedida
        router.replace('/login?verified=true')
      }
    })()
  }, [isReady, query.token, router])

  return <p>Confirmando sua conta...</p>
}
