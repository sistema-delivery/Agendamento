// src/pages/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            setError('Erro ao validar sessão.')
          } else {
            setSessionReady(true)
          }
        })
    } else {
      setError('Parâmetros inválidos na URL.')
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Redefinir Senha</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {!sessionReady && !error && <p>Carregando sessão…</p>}
        {sessionReady && !success && (
          <>
            <label className="block mb-4">
              <span>Nova Senha</span>
              <input
                type="password"
                className="mt-1 block w-full border rounded p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              Redefinir Senha
            </button>
          </>
        )}
        {success && <p className="text-green-600">Senha redefinida com sucesso!</p>}
      </form>
    </div>
  )
}
