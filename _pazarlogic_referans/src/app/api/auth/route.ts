import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email ve sifre gerekli' }, { status: 400 });

    // Simple auth - in production use bcrypt
    const user = await db.user.findFirst({ where: { email } });
    if (!user || user.password !== password) return NextResponse.json({ error: 'Gecersiz email veya sifre' }, { status: 401 });
    if (!user.isActive) return NextResponse.json({ error: 'Hesap devre disi' }, { status: 403 });

    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const { password: _, twoFactorCode: __, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch { return NextResponse.json({ error: 'Giris basarisiz' }, { status: 500 }); }
}

export async function GET() {
  const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, lastLogin: true, storeId: true } });
  return NextResponse.json(users);
}
