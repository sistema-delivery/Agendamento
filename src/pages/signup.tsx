// src/pages/signup.tsx
import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

const SignupPage: React.FC = () => {
  const router = useRouter()
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState<number>(0)  // segundos restantes

  // Contador de cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (loading || cooldown > 0) return

    setError(null)
    setFeedback(null)

    // Validações de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A senha precisa ter ao menos 8 caracteres.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    setLoading(false)

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (msg.includes('rate limit')) {
        setError('Muitas tentativas de cadastro. Aguarde 60 s para tentar novamente.')
        setCooldown(60)
      } else {
        setError(`Erro ao cadastrar: ${authError.message}`)
      }
    } else {
      setFeedback('Cadastro realizado! Verifique seu e-mail.')
      setCooldown(60)
      // Redireciona após feedback
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        aria-busy={loading}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Criar conta</h1>

        {error && <p className="text-red-500 mb-2" role="alert">{error}</p>}
        {feedback && <p className="text-green-600 mb-2" role="status">{feedback}</p>}

        <label htmlFor="name" className="block mb-2">
          <span>Nome completo</span>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 block w-full border rounded p-2"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label htmlFor="email" className="block mb-2">
          <span>E-mail</span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label htmlFor="password" className="block mb-2">
          <span>Senha</span>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        <label htmlFor="confirmPassword" className="block mb-4">
          <span>Confirmar senha</span>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={loading || cooldown > 0}
          aria-disabled={loading || cooldown > 0}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
            loading || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading
            ? 'Cadastrando...'
            : cooldown > 0
            ? `Aguarde ${cooldown}s`
            : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}

export default SignupPage
