// src/pages/signup.tsx
import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

const SignupPage: React.FC = () => {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown(prev => Math.max(prev - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || cooldown > 0) return

    setError(null)
    setFeedback(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    setLoading(false)

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (msg.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde 60s para tentar novamente.')
        setCooldown(60)
      } else {
        setError(`Erro ao cadastrar: ${authError.message}`)
      }
    } else {
      setFeedback('Cadastro realizado! Verifique seu e-mail para confirmar.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Criar Conta</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {feedback && <p className="text-green-600 mb-2">{feedback}</p>}

        <label className="block mb-4">
          <span>Nome completo</span>
          <input
            type="text"
            required
            className="mt-1 block w-full border rounded p-2"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span>E-mail</span>
          <input
            type="email"
            required
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span>Senha</span>
          <input
            type="password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span>Confirmar senha</span>
          <input
            type="password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
            loading || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Criando conta…' : cooldown > 0 ? `Aguarde ${cooldown}s` : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}

export default SignupPage
