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
  const [cooldown, setCooldown] = useState<number>(0)

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
      options: {
        data: { full_name: name },
        // URL para onde o usuário será redirecionado após confirmar o e-mail
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
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
      // Cadastro OK: mostra feedback e redireciona para /login
      setFeedback('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} aria-busy={loading} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
        {error && <p className="text-red-500 mb-2" role="alert">{error}</p>}
        {feedback && <p className="text-green-600 mb-2" role="status">{feedback}</p>}
        {/* Campos de formulário para Nome, Email, Senha e Confirmação */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome completo</label>
          <input
            id="name"
            type="text"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirme sua senha</label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || cooldown > 0}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processando...' : cooldown > 0 ? `Tentar novamente em ${cooldown}s` : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}

export default SignupPage
