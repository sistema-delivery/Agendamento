// src/pages/auth/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [token, setToken] = useState<string>()
  const [newPass, setNewPass] = useState('')
  const [error, setError] = useState<string>()

  // 1) Pegar o token do hash da URL (ex: #type=recovery&token=xxx)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const t = params.get('token')
    if (!t) {
      setError('Token não encontrado na URL.')
      return
    }
    setToken(t)
  }, [])

  // 2) Quando o form for submetido, validar o OTP e atualizar a senha
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return

    // verifica o OTP de recuperação e já seta a sessão
    const { error: otpErr } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: token,
    })
    if (otpErr) {
      setError(`Erro ao validar o link: ${otpErr.message}`)
      return
    }

    // agora, com a sessão ativa, atualiza a senha
    const { error: updErr } = await supabase.auth.updateUser({
      password: newPass,
    })
    if (updErr) {
      setError(`Não foi possível atualizar: ${updErr.message}`)
      return
    }

    // tudo certo! manda pra tela de login
    router.replace('/login?reset=success')
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Redefinir senha</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {token && (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', margin: '1rem 0' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>
            Atualizar senha
          </button>
        </form>
      )}
    </div>
  )
}
