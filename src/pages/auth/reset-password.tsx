// src/pages/auth/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const { isReady } = router
  const [token, setToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Captura o token de recuperação da URL
  useEffect(() => {
    if (!isReady) return
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const type = params.get('type')
    const t = params.get('token')
    if (type !== 'recovery' || !t) {
      setError('Link de recuperação inválido ou expirado.')
      return
    }
    setToken(t)
  }, [isReady])

  // Envia novo password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('Token não encontrado.')
      return
    }

    setLoading(true)
    // Verifica o OTP de recuperação
    const { error: otpError } = await supabaseClient.auth.verifyOtp({
      type: 'recovery',
      token_hash: token,
    })
    if (otpError) {
      setError('Erro ao validar link: ' + otpError.message)
      setLoading(false)
      return
    }

    // Atualiza a senha do usuário
    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    })
    setLoading(false)

    if (updateError) {
      setError('Erro ao atualizar senha: ' + updateError.message)
    } else {
      // Redireciona para login com flag de sucesso
      router.replace('/login?reset=success')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Redefinir senha</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {!token ? (
          <p>Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password" className="block mb-2">
              <span>Nova senha</span>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full border rounded p-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
