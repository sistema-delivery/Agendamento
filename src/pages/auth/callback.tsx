// src/pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function Callback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const confirmEmail = async () => {
      const token = router.query.token as string | undefined
      if (!token) {
        setStatus('error')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token,
      })

      if (error) {
        console.error('Erro ao confirmar e-mail:', error.message)
        setStatus('error')
      } else {
        setStatus('success')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    if (router.isReady) confirmEmail()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Confirmando e-mail...</p>}
      {status === 'success' && (
        <p className="text-green-600">E-mail confirmado com sucesso! Redirecionando…</p>
      )}
      {status === 'error' && (
        <p className="text-red-600">Não foi possível confirmar o e-mail.</p>
      )}
    </div>
  )
}
