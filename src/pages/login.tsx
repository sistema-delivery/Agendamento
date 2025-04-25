// src/pages/login.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import supabaseClient from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    // Redireciona usuário já logado para o dashboard
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFeedback(null)
    setLoading(true)

    // Envia requisição de login
    const { error: authError } = await supabaseClient.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      // Tratamento de erros específicos
      if (authError.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.')
      } else {
        setError(authError.message)
      }
    } else {
      router.push('/dashboard')
    }
  }

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault()
    setError(null)
    setFeedback(null)
    if (!email) {
      setError('Por favor, informe seu e-mail para recuperar a senha.')
      return
    }
    setForgotLoading(true)
    const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email)
    setForgotLoading(false)
    if (resetError) {
      setError('Erro ao enviar e-mail de recuperação: ' + resetError.message)
    } else {
      setFeedback('Se o e-mail estiver cadastrado, você receberá instruções para resetar a senha.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        aria-busy={loading || forgotLoading}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-4">Login de Barbeiro</h1>

        {/* Mensagens de erro ou feedback */}
        {error && <p className="text-red-500 mb-2" role="alert">{error}</p>}
        {feedback && <p className="text-green-600 mb-2" role="status">{feedback}</p>}

        {/* Campo de e-mail */}
        <label htmlFor="email" className="block mb-2">
          <span>Email</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full border rounded p-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-required="true"
          />
        </label>

        {/* Campo de senha */}
        <label htmlFor="password" className="block mb-4">
          <span>Senha</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full border rounded p-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-required="true"
          />
        </label>

        {/* Botão de login */}
        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Link para recuperar senha */}
        <p className="text-sm text-center mt-4">
          <button
            onClick={handleForgotPassword}
            disabled={forgotLoading}
            className="text-blue-600 underline"
          >
            {forgotLoading ? 'Enviando...' : 'Esqueci minha senha'}
          </button>
        </p>

        {/* Link para cadastro */}
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

// src/pages/dashboard.tsx (sem alterações)
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export interface Appointment {
  id: string
  name: string
  contact: string
  service: string
  date: string
  timeslot: string
  status: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Protege rota: redireciona se não autenticado
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
    })

    async function loadAppointments() {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('Erro ao buscar agendamentos:', error)
      } else {
        setAppointments(data as Appointment[])
      }

      setLoading(false)
    }

    loadAppointments()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return <p className="p-6">Carregando agendamentos…</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Agendamentos</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-center">Nenhum agendamento encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map(a => (
            <li key={a.id} className="p-4 border rounded shadow-sm">
              <p>
                <strong>Cliente:</strong> {a.name}
              </p>
              <p>
                <strong>Contato:</strong> {a.contact}
              </p>
              <p>
                <strong>Serviço:</strong> {a.service}
              </p>
              <p>
                <strong>Data:</strong> {a.date} às {a.timeslot}
              </p>
              <p>
                <strong>Status:</strong> {a.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
