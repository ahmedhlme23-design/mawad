'use client';

import { useEffect, useState } from 'react';
import { AppointmentList, type AppointmentItem } from '@/components/appointment-list';
import { AppointmentModal } from '@/components/appointment-modal';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentItem | null>(null);

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('هل تريد حذف هذا الميعاد؟');
    if (!confirmed) return;

    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAppointments();
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">جدول المواعيد</h1>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl"
          >
            + إضافة ميعاد
          </button>
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
      </div>
    </div>
  );
}