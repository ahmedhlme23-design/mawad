import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { name, username, password, linkToken } = await req.json();

    // جلب الـ Chat ID المرتبط بالتوكن
    const tokenRecord = await prisma.telegramToken.findUnique({
      where: { token: linkToken },
    });

    if (!tokenRecord || !tokenRecord.isLinked || !tokenRecord.chatId) {
      return NextResponse.json({ error: 'لم يتم ربط حساب التيليجرام بشكل صحيح' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password,
        telegramChatId: tokenRecord.chatId,
      },
    });

    // حذف التوكن المؤقت بعد الاستخدام
    await prisma.telegramToken.delete({ where: { token: linkToken } });

    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, { httpOnly: true, path: '/' });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'فشل إنشاء الحساب' }, { status: 500 });
  }
}