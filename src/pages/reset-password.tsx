// src/pages/reset-password.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [step, setStep] = useState<'loading'|'form'|'done'|'error'>('loading')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    supabaseClient.auth
      .getSessionFromUrl({ storeSession: true })
      .then(({ error }) => {
        if (error) {
          setError('Link inválido ou expirado.')
          setStep('error')
        } else {
          setStep('form')
        }
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error: upErr } = await supabaseClient.auth.updateUser({ password })
    if (upErr) {
      setError(upErr.message)
    } else {
      setStep('done')
      setTimeout(() => router.replace('/login'), 2000)
    }
  }

  if (step === 'loading') return <p>Validando link…</p>
  if (step === 'error')   return <p className="text-red-500">{error}</p>
  if (step === 'done')    return <p className="text-green-600">Senha alterada! Redirecionando…</p>

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nova senha
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Atualizar senha</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  )
}
