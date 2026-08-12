import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

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

function buildRecurringDates(
  baseDate: Date,
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
  daysOfWeek: number[],
  daysOfMonth: number[],
  recurrenceCount: number
) {
  if (recurrence === 'NONE') {
    return [new Date(baseDate)];
  }

  const limit = recurrenceCount > 0 ? recurrenceCount + 1 : 365;
  const dates: Date[] = [new Date(baseDate)];
  const start = new Date(baseDate);
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + 5);

  const selectedWeekdays = daysOfWeek.length > 0 ? daysOfWeek : [start.getDay()];
  const selectedMonthDays = daysOfMonth.length > 0 ? daysOfMonth : [start.getDate()];

  for (let cursor = new Date(start); cursor <= end && dates.length < limit; cursor.setDate(cursor.getDate() + 1)) {
    const isBaseDate = cursor.getTime() === start.getTime();
    if (isBaseDate) continue;

    let matches = false;

    if (recurrence === 'DAILY') {
      matches = true;
    }

    if (recurrence === 'WEEKLY') {
      matches = selectedWeekdays.includes(cursor.getDay());
    }

    if (recurrence === 'MONTHLY') {
      matches = selectedMonthDays.includes(cursor.getDate());
    }

    if (matches) {
      dates.push(new Date(cursor));
    }
  }

  return dates.slice(0, limit);
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { dateTime: 'asc' },
  });

  const normalized = appointments.map((appointment) => ({
    ...appointment,
    daysOfWeek: parseStoredArray(appointment.daysOfWeek),
    daysOfMonth: parseStoredArray(appointment.daysOfMonth),
  }));

  return NextResponse.json(normalized);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

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

  const baseDate = new Date(dateTime);
  const normalizedWeeks = normalizeIntArray(daysOfWeek, 0, 6);
  const normalizedMonths = normalizeIntArray(daysOfMonth, 1, 31);
  const recurrenceType = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(recurrence) ? recurrence : 'NONE';

  const dates = buildRecurringDates(
    baseDate,
    recurrenceType,
    normalizedWeeks,
    normalizedMonths,
    Number(recurrenceCount) || 0
  );

  const created = await Promise.all(
    dates.map((itemDate) =>
      prisma.appointment.create({
        data: {
          title,
          description,
          dateTime: itemDate,
          userId,
          recurrence: recurrenceType,
          recurrenceCount: Number(recurrenceCount) || 0,
          isRecurring: recurrenceType !== 'NONE',
          daysOfWeek: JSON.stringify(normalizedWeeks),
          daysOfMonth: JSON.stringify(normalizedMonths),
        },
      })
    )
  );

  return NextResponse.json(created.map((item) => ({
    ...item,
    daysOfWeek: parseStoredArray(item.daysOfWeek),
    daysOfMonth: parseStoredArray(item.daysOfMonth),
  })));
}