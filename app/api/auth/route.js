import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;

export async function POST(request) {
  const { accessCode } = await request.json();
  if (!accessCode || accessCode !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ success: false, message: 'Code incorrect' }, { status: 401 });
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });

  // Utilisation d'une URL absolue pour corriger le plantage Vercel :
  const response = NextResponse.redirect(new URL('/admin/create', request.url));
  
  response.cookies.set('admin_jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  });
  return response;
}
