// src/pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    const code = router.query?.code as string | undefined
    if (!code) {
      alert('Parâmetro de confirmação ausente.')
      return
    }

    supabaseClient.auth
      .exchangeCodeForSession(code)
      .then(({ data: { session }, error }) => {
        if (error || !session) {
          alert('Falha ao criar sessão: ' + error?.message)
        } else {
          router.replace('/dashboard')
        }
      })
  }, [router.isReady, router.query])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p>Entrando…</p>
    </div>
  )
}
