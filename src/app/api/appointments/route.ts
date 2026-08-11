import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { dateTime: 'asc' },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { title, description, dateTime } = await req.json();
  const appointment = await prisma.appointment.create({
    data: { title, description, dateTime: new Date(dateTime), userId },
  });

  return NextResponse.json(appointment);
}