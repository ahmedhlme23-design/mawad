import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

function normalizeIntArray(value: unknown, min: number, max: number) {
  if (!Array.isArray(value)) return [];

  const set = new Set<number>();

  for (const item of value) {
    const number = Number(item);
    if (Number.isInteger(number) && number >= min && number <= max) {
      set.add(number);
    }
  }

  return [...set].sort((a, b) => a - b);
}

function parseStoredArray(value: string | number[] | null | undefined) {
  if (Array.isArray(value)) return value;
  if (!value || value === 'null') return [];

  try {
    const parsed = JSON.parse(value as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { id } = await params;
  const appointment = await prisma.appointment.findFirst({
    where: { id, userId },
  });

  if (!appointment) {
    return NextResponse.json({ error: 'الموعد غير موجود' }, { status: 404 });
  }

  return NextResponse.json({
    ...appointment,
    daysOfWeek: parseStoredArray(appointment.daysOfWeek),
    daysOfMonth: parseStoredArray(appointment.daysOfMonth),
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.appointment.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: 'الموعد غير موجود' }, { status: 404 });
  }

  const body = await req.json();
  const {
    title,
    description,
    dateTime,
    recurrence = 'NONE',
    recurrenceCount = 0,
    daysOfWeek = [],
    daysOfMonth = [],
  } = body;

  const normalizedWeeks = normalizeIntArray(daysOfWeek, 0, 6);
  const normalizedMonths = normalizeIntArray(daysOfMonth, 1, 31);
  const recurrenceType = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(recurrence) ? recurrence : 'NONE';

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      title,
      description,
      dateTime: dateTime ? new Date(dateTime) : existing.dateTime,
      recurrence: recurrenceType,
      recurrenceCount: Number(recurrenceCount) || 0,
      isRecurring: recurrenceType !== 'NONE',
      daysOfWeek: JSON.stringify(normalizedWeeks),
      daysOfMonth: JSON.stringify(normalizedMonths),
    },
  });

  return NextResponse.json({
    ...updated,
    daysOfWeek: parseStoredArray(updated.daysOfWeek),
    daysOfMonth: parseStoredArray(updated.daysOfMonth),
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.appointment.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: 'الموعد غير موجود' }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
