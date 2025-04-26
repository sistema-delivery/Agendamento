// src/pages/login.tsx

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

const LoginPage: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0) // segundos restantes

  // Mensagem após confirmação de conta
  useEffect(() => {
    const { approved } = router.query
    if (approved === 'true') {
      setFeedback('Conta confirmada com sucesso! Agora é só fazer login.')
    }
  }, [router.query])

  // Countdown do cooldown de reenvio de senha
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

    setForgotLoading(true)
    const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        // REDIRECT ORIGINAL: para /reset-password
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      }
    )
    setForgotLoading(false)

    if (resetError) {
      if (resetError.message.toLowerCase().includes('rate limit')) {
        setError(
          'Você solicitou muitas vezes o reset de senha.\nAguarde 60 seg e tente novamente.'
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
    <div className="login-container">
      <h1>Login de Barbeiro</h1>

      {error && <div className="error">{error}</div>}
      {feedback && <div className="feedback">{feedback}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <button
        onClick={handleForgotPassword}
        disabled={forgotLoading || cooldown > 0}
        className={`underline ${
          forgotLoading || cooldown > 0
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600'
        }`}
      >
        {forgotLoading
          ? 'Enviando...'
          : cooldown > 0
          ? `Reenviar em ${cooldown}s`
          : 'Esqueci minha senha'}
      </button>

      <p>
        Não tem conta? <a href="/signup">Cadastre-se</a>
      </p>
    </div>
  )
}

export default LoginPage
