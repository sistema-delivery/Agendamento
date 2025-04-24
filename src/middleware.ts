import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabaseClient from './src/lib/supabaseClient';

export async function middleware(req: NextRequest) {
  const { data: { user } } = await supabaseClient.auth.getUserByCookie(req);
  const isAuth = !!user;
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith('/dashboard') && !isAuth) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
