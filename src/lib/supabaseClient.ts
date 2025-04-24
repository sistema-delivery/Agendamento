// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export default supabaseClient;

// ---------------------------------------------------------
// middleware.ts  (na raiz do projeto, mesmo nível de package.json)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabaseClient from './src/lib/supabaseClient';

export async function middleware(req: NextRequest) {
  const {
    data: { user },
  } = await supabaseClient.auth.getUserByCookie(req);

  const isAuth = !!user;
  const url    = req.nextUrl.clone();

  if (url.pathname.startsWith('/dashboard') && !isAuth) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------
// next.config.js
module.exports = {
  experimental: {
    middleware: true,  // permite que o middleware leia cookies
  },
  // ...outras configurações
};
