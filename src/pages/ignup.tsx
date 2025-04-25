// src/pages/signup.tsx
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import supabase from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'

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
      return toast.error('As senhas não coincidem.')
    }
    if (password.length < 8) {
      return toast.error('A senha precisa ter ao menos 8 caracteres.')
    }
    setLoading(true)
    // 1) Sign up no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (authError) {
      setLoading(false)
      return toast.error(authError.message)
    }
    // 2) Insere/atualiza no perfil
    await supabase
      .from('profiles')
      .upsert({
        id: authData.user!.id,
        full_name: name,
        phone: '' // ou adicione outro campo no form
      })
    setLoading(false)
    toast.success('Cadastro realizado! Verifique seu e-mail.')
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
