import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// 1. إنشاء توكن جديد عند ضغط زر الربط
export async function POST() {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    await prisma.telegramToken.create({
      data: { token },
    });
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: 'فشل إنشاء توكن' }, { status: 500 });
  }
}

// 2. الفحص الدوري (Polling) من الواجهة لمعرفة هل تم الضغط على Start
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'التوكن مطلوب' }, { status: 400 });

  const record = await prisma.telegramToken.findUnique({
    where: { token },
  });

  if (record && record.isLinked) {
    return NextResponse.json({ isLinked: true, chatId: record.chatId });
  }

  return NextResponse.json({ isLinked: false });
}