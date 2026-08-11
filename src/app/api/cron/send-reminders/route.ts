import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendTelegramNotification } from '@/lib/telegram';

export async function GET() {
  try {
    const now = new Date();

    const dueAppointments = await prisma.appointment.findMany({
      where: {
        dateTime: { lte: now },
        isSent: false,
      },
      include: { user: true },
    });

    for (const app of dueAppointments) {
      if (app.user?.telegramChatId) {
        const ok = await sendTelegramNotification(
          app.user.telegramChatId,
          app.title,
          app.description || '',
          app.dateTime
        );

        if (ok) {
          // إضافة await هنا لضمان عدم تكرار الإرسال
          await prisma.appointment.update({
            where: { id: app.id },
            data: { isSent: true },
          });
        }
      }
    }

    return NextResponse.json({ success: true, processed: dueAppointments.length });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'فشل الفحص' }, { status: 500 });
  }
}