// src/pages/auth/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 1) Pega o token do hash (#type=recovery&token=xxx)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const t = params.get('token')
    if (!t) {
      setError('Link de recuperação inválido.')
      return
    }
    setToken(t)
  }, [])

  // 2) Submete o form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    // verifica o OTP e autentica
    const { error: otpErr } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: token,
    })
    if (otpErr) {
      setError('Erro ao validar link: ' + otpErr.message)
      return
    }

    // atualiza a senha
    const { error: updErr } = await supabase.auth.updateUser({
      password,
    })
    if (updErr) {
      setError('Não foi possível atualizar: ' + updErr.message)
      return
    }

    // sucesso! manda pro login
    router.replace('/login?reset=success')
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl mb-4">Redefinir senha</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {token && (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-4 p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Atualizar senha
          </button>
        </form>
      )}
    </div>
  )
}
