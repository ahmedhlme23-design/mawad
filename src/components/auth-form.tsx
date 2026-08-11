'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // حالات الربط التلقائي عبر التيليجرام
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });

  const BOT_USERNAME = 'webmanger_bot'; // ضع اسم البوت الخاص بك هنا (بدون @)

 // 1. توليد توكن الربط عند فتح رابط التيليجرام
  const handleConnectTelegram = async () => {
    try {
      setError('');
      const res = await fetch('/api/auth/telegram-token', { method: 'POST' });
      
      if (!res.ok) {
        throw new Error(`خطأ في السيرفر: ${res.status}`);
      }

      const data = await res.json();

      if (!data || !data.token) {
        throw new Error('لم يتم استلام توكن صالح من السيرفر');
      }

      setLinkToken(data.token);
      setIsCheckingLink(true);

      // فتح البوت في نافذة جديدة
      window.open(`https://t.me/${BOT_USERNAME}?start=${data.token}`, '_blank');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الربط');
    }
  };

  // 2. فحص دوري (Polling) لمتابعة تأكيد الربط من البوت
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCheckingLink && linkToken && !isTelegramLinked) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/telegram-token?token=${linkToken}`);
          const data = await res.json();

          if (data.isLinked) {
            setIsTelegramLinked(true);
            setIsCheckingLink(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error checking telegram status:', err);
        }
      }, 3000); // فحص كل 3 ثوانٍ
    }

    return () => clearInterval(interval);
  }, [isCheckingLink, linkToken, isTelegramLinked]);

  // 3. إرسال الفورم عند الانتهاء
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !isTelegramLinked) {
      setError('يرجى ربط حسابك بالتيليجرام أولاً لإكمال الإنشاء');
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : { ...formData, linkToken };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ غير متوقع');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isLogin ? 'تسجيل الدخول' : 'حساب جديد'}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {isLogin ? 'مرحباً بك مجدداً! ادخل بياناتك للمتابعة' : 'أنشئ حسابك وربطه بالتيليجرام لاستلام التنبيهات'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 text-slate-800 dark:text-white"
              placeholder="مثال: أحمد محمد"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 text-slate-800 dark:text-white"
            placeholder="ahmed123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 text-slate-800 dark:text-white"
            placeholder="••••••••"
          />
        </div>

        {!isLogin && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ربط الحساب مع Telegram
            </label>

            {!isTelegramLinked ? (
              <button
                type="button"
                onClick={handleConnectTelegram}
                className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
              >
                <span>✈️</span>
                {isCheckingLink ? 'في انتظار الضغط على Start في البوت...' : 'انقر هنا لربط الحساب تلقائياً'}
              </button>
            ) : (
              <div className="w-full py-2.5 px-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg flex items-center justify-center gap-2">
                <span>✅</span> تم ربط حسابك بالتيليجرام بنجاح!
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!isLogin && !isTelegramLinked)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 mt-4"
        >
          {loading ? 'جاري التحميل...' : isLogin ? 'دخول' : 'إتمام إنشاء الحساب'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-blue-600 font-semibold hover:underline"
        >
          {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </button>
      </div>
    </div>
  );
}