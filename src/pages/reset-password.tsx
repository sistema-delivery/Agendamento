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
    // Tenta extrair tokens da hash (#...) ou da query (?...)
    const raw =
      window.location.hash.substring(1) || window.location.search.substring(1)
    const params = new URLSearchParams(raw)
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (!access_token || !refresh_token) {
      setError('Parâmetros inválidos na URL.')
      setLoading(false)
      return
    }

    // Seta a sessão no Supabase
    supabaseClient.auth
      .setSession({ access_token, refresh_token })
      .then(({ data, error }) => {
        if (error) {
          console.error('setSession error:', error)
          setError('Erro ao validar link. Solicite novo reset de senha.')
        }
        setLoading(false)
      })
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Redireciona após sucesso
      setTimeout(() => {
        router.push('/login')
      }, 3000)
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
