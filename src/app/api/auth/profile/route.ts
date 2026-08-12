import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { name, password } = await req.json();

  const updateData: { name?: string; password?: string } = {};

  if (typeof name === 'string' && name.trim()) {
    updateData.name = name.trim();
  }

  if (typeof password === 'string' && password.trim().length >= 4) {
    updateData.password = password.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'لا توجد بيانات لتحديثها' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
