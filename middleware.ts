// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  // Inicializa o Supabase client no middleware usando supabase-js
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      // para SSR, opcional: replica cookies/headers
      headers: req.headers as any
    }
  );

  // Obtém sessão atual
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // Protege rotas que comecem em /app
  if (!session && url.pathname.startsWith('/app')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
