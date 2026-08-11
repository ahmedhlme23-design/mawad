import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // التأكد من وجود رسالة وأمر /start
    if (body.message && body.message.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id.toString();

      if (text.startsWith('/start')) {
        const token = text.split(' ')[1]; // استخراج التوكن المرفق مع /start

        if (token) {
          // تحديث التوكن في قاعدة البيانات لربطه بالـ chatId
          await prisma.telegramToken.update({
            where: { token },
            data: { chatId, isLinked: true },
          });

          // إرسال رسالة تأكيد للمستخدم داخل تيليجرام
          await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: 'تم ربط حسابك بنجاح! يمكنك الآن العودة للموقع وإتمام التسجيل.',
              }),
            }
          );
        }
      }
    }

    // إرجاع 200 OK دائماً لتيليجرام
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    // إرجاع 200 لتجنب إعادة المحاولات المتكررة من تيليجرام عند حدوث خطأ
    return NextResponse.json({ ok: true });
  }
}