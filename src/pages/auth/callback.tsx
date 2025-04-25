// src/pages/auth/callback.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()
  const { isReady, query } = router

  useEffect(() => {
    if (!isReady) return

    // Pega token (string ou array)
    const raw = query.token
    const token = Array.isArray(raw) ? raw[0] : raw

    if (!token) {
      alert('Token de confirmação ausente.')
      return
    }

    // URLs de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/login?approved=true`

    // Monta a URL de confirmação
    const confirmUrl = `${supabaseUrl}/auth/v1/verify`
      + `?token=${encodeURIComponent(token)}`
      + `&type=email`  // “email” é o type usado no template Confirm signup :contentReference[oaicite:0]{index=0}
      + `&redirect_to=${encodeURIComponent(redirectTo)}`

    // Redireciona de verdade para o endpoint do Supabase
    window.location.replace(confirmUrl)
  }, [isReady, query.token])

  return <p>Confirmando sua conta…</p>
}
