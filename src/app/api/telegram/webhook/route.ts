import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.message?.text) {
      const text: string = body.message.text;
      const chatId = body.message.chat.id.toString();

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts[1];

        if (token) {
          await prisma.telegramToken.upsert({
            where: { token },
            update: { chatId, isLinked: true },
            create: { token, chatId, isLinked: true },
          });

          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '✅ تم ربط حسابك بنجاح! يمكنك الآن العودة للموقع وإتمام التسجيل.',
              }),
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}