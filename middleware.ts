// middleware.ts  (na raiz do projeto, mesmo nível de package.json)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(req: NextRequest) {
  // cria um client Supabase capaz de ler cookies no Middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res, cookies });

  // obtém o usuário autenticado (via cookie de sessão)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // se for rota /dashboard e não estiver logado, redireciona para /login
  if (req.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return res;
}
