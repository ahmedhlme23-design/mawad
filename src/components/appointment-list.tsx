'use client';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  isSent: boolean;
}

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return <div className="text-center py-10 text-slate-500">لا توجد مواعيد مجدولة.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" dir="rtl">
      {appointments.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
            <span className={`text-xs px-2 py-1 rounded ${item.isSent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.isSent ? 'تم الإرسال' : 'معلّق'}
            </span>
          </div>
          {item.description && <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{item.description}</p>}
          <div className="text-xs text-slate-400">
            ⏰ {new Date(item.dateTime).toLocaleString('ar-EG')}
          </div>
        </div>
      ))}
    </div>
  );
}