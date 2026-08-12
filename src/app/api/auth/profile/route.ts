import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { name, oldPassword, password } = await req.json();
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!currentUser) {
    return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  }

  if (typeof password === 'string' && password.trim()) {
    if (typeof oldPassword !== 'string' || !oldPassword.trim()) {
      return NextResponse.json({ error: 'يجب إدخال كلمة المرور القديمة لتغيير كلمة المرور' }, { status: 400 });
    }

    if (oldPassword !== currentUser.password) {
      return NextResponse.json({ error: 'كلمة المرور القديمة غير صحيحة' }, { status: 400 });
    }
  }

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
