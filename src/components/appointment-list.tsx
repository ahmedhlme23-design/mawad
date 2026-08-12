'use client';

export interface AppointmentItem {
  id: string;
  title: string;
  description?: string | null;
  dateTime: string;
  isSent: boolean;
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceCount?: number;
  isRecurring?: boolean;
  daysOfWeek?: number[] | string;
  daysOfMonth?: number[] | string;
}

export function AppointmentList({
  appointments,
  onEdit,
  onDelete,
}: {
  appointments: AppointmentItem[];
  onEdit?: (appointment: AppointmentItem) => void;
  onDelete?: (id: string) => void;
}) {
  if (appointments.length === 0) {
    return <div className="text-center py-10 text-slate-500">لا توجد مواعيد مجدولة.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" dir="rtl">
      {appointments.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-sm">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
            <span className={`text-xs px-2 py-1 rounded ${item.isSent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.isSent ? 'تم الإرسال' : 'معلّق'}
            </span>
          </div>

          {item.description && <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{item.description}</p>}

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
            <div>⏰ {new Date(item.dateTime).toLocaleString('ar-EG')}</div>
            {item.isRecurring && (
              <div className="text-blue-600 dark:text-blue-300">
                {item.recurrence === 'DAILY' && 'تكرار يومي'}
                {item.recurrence === 'WEEKLY' && 'تكرار أسبوعي'}
                {item.recurrence === 'MONTHLY' && 'تكرار شهري'}
                {item.recurrenceCount ? ` • ${item.recurrenceCount} تكرار` : ' • دائم'}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              تعديل
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(item.id)}
              className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}