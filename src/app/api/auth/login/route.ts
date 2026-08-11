import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, { httpOnly: true, path: '/' });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الدخول' }, { status: 500 });
  }
}