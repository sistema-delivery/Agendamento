// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Criando cliente Supabase
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Exportando como default para evitar conflitos de declarações
export default supabaseClient;

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './src/lib/supabaseClient';

export async function middleware(req: NextRequest) {
  const { data } = await supabase.auth.getUserByCookie(req);
  const isAuth = !!data.user;
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith('/dashboard') && !isAuth) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// next.config.js deve habilitar cookies para middleware
// experimental: { middleware: true }
