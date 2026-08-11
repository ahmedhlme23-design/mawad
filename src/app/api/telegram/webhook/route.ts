import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (message && message.text) {
      const chatId = message.chat.id.toString();
      const text = message.text as string;

      // التأكد أن الرسالة تبدأ بـ /start وبداخلها Token
      if (text.startsWith('/start ')) {
        const token = text.split(' ')[1];

        // البحث عن التوكن والتأكد من وجوده
        const tokenRecord = await prisma.telegramToken.findUnique({
          where: { token },
        });

        if (tokenRecord) {
          // تحديث حالة التوكن وتخزين Chat ID
          await prisma.telegramToken.update({
            where: { token },
            data: { chatId, isLinked: true },
          });

          // إرسال رسالة تأكيد للمستخدم على التيليجرام
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '✅ تم ربط حسابك بالموقع بنجاح! يمكنك إغلاق المحادثة والعودة للموقع لإكمال التسجيل.',
            }),
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}