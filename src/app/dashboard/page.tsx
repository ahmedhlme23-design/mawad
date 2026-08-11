'use client';

import { useEffect, useState } from 'react';
import { AppointmentList } from '@/components/appointment-list';
import { AppointmentModal } from '@/components/appointment-modal';

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      const data = await res.json();
      setAppointments(data);
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
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl"
          >
            + إضافة ميعاد
          </button>
        </header>

        <AppointmentList appointments={appointments} />

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchAppointments}
        />
      </div>
    </div>
  );
}