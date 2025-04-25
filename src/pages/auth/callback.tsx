// src/pages/auth/callback.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const AuthCallback: React.FC = () => {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!router.isReady) return

    // Verifica se há erro nos parâmetros de query
    const { error, error_description } = router.query as Record<string, string>

    // Se houver algum erro, falha na confirmação
    if (error || error_description) {
      setStatus('error')
    } else {
      // Sem erros: confirmação concluída com sucesso
      setStatus('success')
    }
  }, [router.isReady, router.query])

  if (status === 'loading') {
    return <p>Processando confirmação…</p>
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-xl font-semibold mb-4">Não foi possível confirmar o e-mail.</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    )
  }

  // Sucesso: email confirmado
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-xl font-semibold mb-4">E-mail confirmado com sucesso!</h1>
      <button
        onClick={() => router.push('/login')}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Ir para login
      </button>
    </div>
  )
}

export default AuthCallback
