import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;

export async function GET(request) {
  const jwtToken = request.cookies.get('admin_jwt')?.value;
  if (!jwtToken) {
    return NextResponse.json({ authenticated: false });
  }
  try {
    jwt.verify(jwtToken, JWT_SECRET);
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
