import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')

  useEffect(() => {
    if (!router.isReady) return

    // Supabase devolve ?type=signup ou ?error=<msg>
    const { type, error } = router.query as Record<string,string>

    if (error) {
      setStatus('error')
      return
    }
    if (type === 'signup') {
      setStatus('success')
      return
    }
    // fallback
    setStatus('error')
  }, [router.isReady, router.query])

  if (status === 'loading') return <p>Processando confirmação…</p>
  if (status === 'error')
    return (
      <div>
        <h1>Não foi possível confirmar o e-mail.</h1>
        <button onClick={() => router.push('/')}>Voltar</button>
      </div>
    )

  return (
    <div>
      <h1>E-mail confirmado com sucesso!</h1>
      <button onClick={() => router.push('/login')}>Ir para login</button>
    </div>
  )
}
