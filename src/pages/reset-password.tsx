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
    // Extrai token da URL (hash ou query) e armazena na sessão interna do Supabase
    supabaseClient.auth
      .getSessionFromUrl({ storeSession: true })
      .then(({ data, error }) => {
        if (error || !data.session) {
          setError('Link inválido ou expirado. Solicite um novo envio de redefinição.')
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
      // opcional: redirecionar após alguns segundos
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
