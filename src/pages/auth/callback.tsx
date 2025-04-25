// src/pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!router.isReady) return
    const { token } = router.query as { token?: string }

    const confirmEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Parâmetro de confirmação ausente.')
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        type: 'signup',
        token_hash: token,
      })

      if (error) {
        console.error('Erro ao confirmar e-mail:', error.message)
        setStatus('error')
        setMessage('Falha ao confirmar o e-mail. Tente novamente mais tarde.')
      } else {
        setStatus('success')
        setMessage('E-mail confirmado com sucesso! Você pode fazer login agora.')
      }
    }

    confirmEmail()
  }, [router.isReady, router.query.token])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {status === 'loading' && <p className="text-gray-700">Confirmando e-mail...</p>}

      {status === 'error' && (
        <>
          <p className="text-red-600 mb-4">{message}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </>
      )}

      {status === 'success' && (
        <>
          <p className="text-green-600 mb-4">{message}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Ir para login
          </button>
        </>
      )}
    </div>
  )
}
