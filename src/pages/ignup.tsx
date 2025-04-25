// src/pages/signup.tsx
import { supabase } from '../lib/supabaseClient'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  confirmPassword: z.string()
})

export default function SignupPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    if (data.password !== data.confirmPassword) {
      return toast.error('As senhas não coincidem.')
    }

    // 1) Sign up no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name }
      }
    })

    if (authError) {
      toast.error(authError.message)
      return
    }

    // 2) Insere/atualiza no perfil
    await supabase
      .from('profiles')
      .upsert({
       id: authData.user!.id,
        full_name: data.name,
        phone: '' // opcional, ou adicione campo no form
     })

    toast.success('Cadastro realizado! Verifique seu e-mail.')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ...seu markup de inputs para name, email, senha, confirmPassword */}
    </form>
  )
}
