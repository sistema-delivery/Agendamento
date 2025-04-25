// src/pages/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // só roda após o Next.js hidratar o router
    if (!router.isReady) return

    async function initSession() {
      // primeiro, tenta ler query params (?access_token=...&refresh_token=...)
      let access_token = typeof router.query.access_token === 'string'
        ? router.query.access_token
        : ''
      let refresh_token = typeof router.query.refresh_token === 'string'
        ? router.query.refresh_token
        : ''

      // se não vierem no query, tenta na hash (#access_token=...&refresh_token=...)
      if (!access_token || !refresh_token) {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        access_token = params.get('access_token') || ''
        refresh_token = params.get('refresh_token') || ''
      }

      if (!access_token || !refresh_token) {
        setError('Parâmetros inválidos na URL.')
        setLoading(false)
        return
      }

      // seta a sessão no Supabase
      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token,
        refresh_token,
      })

      if (sessionError) {
        console.error('setSession error:', sessionError)
        setError('Erro ao validar link. Solicite um novo reset de senha.')
      }

      setLoading(false)
    }

    initSession()
  }, [router.isReady, router.query])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Verificando link...</p>
  }
  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>
  }
  if (success) {
    return (
      <p className="text-center mt-10 text-green-600">
        Senha atualizada com sucesso! Redirecionando para login...
      </p>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-4">Redefinir Senha</h1>
        <label className="block mb-4">
          <span>Nova Senha</span>
          <input
            type="password"
            className="mt-1 block w-full border rounded p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Redefinir Senha
        </button>
      </form>
    </div>
  )
}
