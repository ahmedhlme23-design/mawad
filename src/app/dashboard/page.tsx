'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentList, type AppointmentItem } from '@/components/appointment-list';
import { AppointmentModal } from '@/components/appointment-modal';

interface UserProfile {
  id: string;
  name: string;
  username: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentItem | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
  };

  const fetchProfile = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const user = await res.json();
      setProfile(user);
      setProfileName(user.name || '');
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل تريد تسجيل الخروج؟');
    if (!confirmed) return;

    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('هل تريد حذف هذا الميعاد؟');
    if (!confirmed) return;

    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAppointments();
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          password: profilePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء تحديث الملف الشخصي');

      setProfilePassword('');
      setIsProfileOpen(false);
      fetchProfile();
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">جدول المواعيد</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <span className="text-xl">👤</span>
              <span className="font-medium">{profile?.name || 'الملف الشخصي'}</span>
            </button>

            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl"
            >
              + إضافة ميعاد
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-xl font-medium"
            >
              تسجيل الخروج
            </button>
          </div>
        </header>

        <AppointmentList
          appointments={appointments}
          onEdit={(appointment) => {
            setEditingAppointment(appointment);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />

        <AppointmentModal
          isOpen={isModalOpen}
          appointment={editingAppointment}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
          onSuccess={fetchAppointments}
        />

        {isProfileOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">الملف الشخصي</h3>
                <button type="button" onClick={() => setIsProfileOpen(false)} className="text-slate-500 text-2xl">×</button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                {profileError && (
                  <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600">{profileError}</div>
                )}

                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">الاسم</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    placeholder="اتركها فارغة إذا لم ترغب بالتغيير"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsProfileOpen(false)} className="px-4 py-2 border rounded-lg">إلغاء</button>
                  <button type="submit" disabled={profileLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    {profileLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}