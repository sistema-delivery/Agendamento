// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { headers: req.headers } // opcional: passa headers para SSR
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  if (!session && url.pathname.startsWith('/app')) {
    // redireciona para login se não autenticado ao acessar rotas protegidas
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
