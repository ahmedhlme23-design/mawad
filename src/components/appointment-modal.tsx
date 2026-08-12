'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppointmentItem } from '@/components/appointment-list';

interface Props {
  isOpen: boolean;
  appointment?: AppointmentItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const weekDays = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

function parseNumericArray(value: number[] | string | undefined | null): number[] {
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => Number(item)).filter((item) => !Number.isNaN(item))
      : [];
  } catch {
    return [];
  }
}

export function AppointmentModal({ isOpen, appointment, onClose, onSuccess }: Props) {
  const isEditing = Boolean(appointment);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
  const [recurrenceCount, setRecurrenceCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const recurrenceLabel = useMemo(() => {
    if (recurrence === 'NONE') return 'بدون تكرار';
    if (recurrence === 'DAILY') return 'يومي';
    if (recurrence === 'WEEKLY') return 'أسبوعي';
    return 'شهري';
  }, [recurrence]);

  useEffect(() => {
    if (!isOpen) return;

    if (appointment) {
      const appointmentDate = new Date(appointment.dateTime);
      setTitle(appointment.title || '');
      setDescription(appointment.description || '');
      setDate(appointmentDate.toISOString().slice(0, 10));
      setTime(appointmentDate.toTimeString().slice(0, 5));
      setRecurrence((appointment.recurrence as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY') || 'NONE');
      setDaysOfWeek(parseNumericArray(appointment.daysOfWeek));
      setDaysOfMonth(parseNumericArray(appointment.daysOfMonth));
      setRecurrenceCount(appointment.recurrenceCount || 0);
      return;
    }

    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setRecurrence('NONE');
    setDaysOfWeek([]);
    setDaysOfMonth([]);
    setRecurrenceCount(0);
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)
    );
  };

  const toggleDayOfMonth = (day: number) => {
    setDaysOfMonth((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const combinedDateTime = new Date(`${date}T${time}`).toISOString();
      const payload = {
        title,
        description,
        dateTime: combinedDateTime,
        recurrence,
        recurrenceCount,
        daysOfWeek,
        daysOfMonth,
      };

      const requestUrl = isEditing ? `/api/appointments/${appointment?.id}` : '/api/appointments';
      const response = await fetch(requestUrl, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setRecurrence('NONE');
        setDaysOfWeek([]);
        setDaysOfMonth([]);
        setRecurrenceCount(0);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          {isEditing ? 'تعديل الميعاد' : 'إضافة ميعاد جديد'}
        </h3>
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

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
            <label className="block text-sm mb-3 font-medium text-slate-700 dark:text-slate-200">نوع التكرار</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRecurrence(option as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                  className={`px-3 py-2 rounded-lg text-sm border ${
                    recurrence === option
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {option === 'NONE' && 'بدون تكرار'}
                  {option === 'DAILY' && 'يومي'}
                  {option === 'WEEKLY' && 'أسبوعي'}
                  {option === 'MONTHLY' && 'شهري'}
                </button>
              ))}
            </div>

            {recurrence !== 'NONE' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">عدد مرات التكرار</label>
                  <select
                    value={recurrenceCount}
                    onChange={(e) => setRecurrenceCount(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value={0}>دائم</option>
                    <option value={1}>مرة واحدة</option>
                    <option value={2}>مرتين</option>
                    <option value={3}>ثلاث مرات</option>
                    <option value={5}>خمس مرات</option>
                    <option value={10}>عشرة مرات</option>
                  </select>
                </div>

                {recurrence === 'WEEKLY' && (
                  <div>
                    <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">أيام الأسبوع</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {weekDays.map((day) => (
                        <label key={day.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={daysOfWeek.includes(day.value)}
                            onChange={() => toggleDayOfWeek(day.value)}
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {recurrence === 'MONTHLY' && (
                  <div>
                    <label className="block text-sm mb-2 text-slate-700 dark:text-slate-300">أيام الشهر</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                        <label key={day} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={daysOfMonth.includes(day)}
                            onChange={() => toggleDayOfMonth(day)}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-300">
                  النمط المختار: <span className="font-semibold">{recurrenceLabel}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'حفظ...' : isEditing ? 'تحديث الميعاد' : 'حفظ الميعاد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}