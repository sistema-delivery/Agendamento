// src/pages/signup.tsx
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      return alert('As senhas não coincidem.')
    }
    if (password.length < 8) {
      return alert('A senha precisa ter ao menos 8 caracteres.')
    }
    setLoading(true)
    // Sign up no Supabase Auth (perfil criado automaticamente por trigger)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    setLoading(false)
    if (authError) {
      return alert('Erro ao cadastrar: ' + authError.message)
    }
    alert('Cadastro realizado! Verifique seu e-mail.')
    router.push('/login')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block">Nome completo</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block">Confirmar senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Cadastrando...' : 'Criar conta'}
        </button>
      </form>
    </div>
  )
}

