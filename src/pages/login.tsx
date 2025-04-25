// src/pages/login.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

const LoginPage: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState<boolean>(false)
  const [cooldown, setCooldown] = useState<number>(0) // segundos restantes

  // Redireciona quem já estiver autenticado
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  // Countdown do cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setFeedback(null)
    setLoading(true)

    const { error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (authError) {
      const msg = authError.message.includes('Invalid login credentials')
        ? 'E-mail ou senha incorretos.'
        : authError.message
      setError(msg)
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (forgotLoading || cooldown > 0) return

    setError(null)
    setFeedback(null)

    if (!email) {
      setError('Por favor, informe seu e-mail para recuperar a senha.')
      return
    }

    const handleForgot = async (e: React.FormEvent) => {
  e.preventDefault()
  setForgotLoading(true)
  setForgotError(null)
  setForgotSuccess(false)

  const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
  })

  setForgotLoading(false)

  if (resetError) {
    setForgotError(resetError.message)
  } else {
    setForgotSuccess(true)
  }
}

    if (resetError) {
      // Trata rate limit específico
      if (resetError.message.toLowerCase().includes('rate limit')) {
        setError(
          'Você solicitou muitas vezes o reset de senha. Aguarde 60 seg e tente novamente.'
        )
        setCooldown(60)
      } else {
        setError(`Erro ao enviar e-mail de recuperação: ${resetError.message}`)
      }
    } else {
      setFeedback('Se o e-mail estiver cadastrado, você receberá instruções em breve.')
      setCooldown(60)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        aria-busy={loading || forgotLoading}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-4">Login de Barbeiro</h1>

        {error && (
          <p className="text-red-500 mb-2" role="alert">
            {error}
          </p>
        )}
        {feedback && (
          <p className="text-green-600 mb-2" role="status">
            {feedback}
          </p>
        )}

        <label htmlFor="email" className="block mb-2">
          <span>Email</span>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label htmlFor="password" className="block mb-4">
          <span>Senha</span>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm text-center mt-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={forgotLoading || cooldown > 0}
            className={`underline ${
              forgotLoading || cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'
            }`}
          >
            {forgotLoading
              ? 'Enviando...'
              : cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : 'Esqueci minha senha'}
          </button>
        </p>

        <p className="mt-2 text-sm text-center">
          Não tem conta?{' '}
          <a href="/signup" className="text-blue-600 underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
