'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AppointmentModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // دمج التاريخ والوقت في صيغة ISO لتخزينها في قاعدة البيانات
      const combinedDateTime = new Date(`${date}T${time}`).toISOString();

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          dateTime: combinedDateTime 
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">إضافة ميعاد جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">عنوان الميعاد *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">وصف الميعاد (اختياري)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
            />
          </div>

          {/* فصل التاريخ والوقت إلى حقلين مستقلين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">التاريخ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">الوقت *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'حفظ...' : 'حفظ الميعاد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}