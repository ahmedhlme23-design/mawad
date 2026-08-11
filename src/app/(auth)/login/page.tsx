import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <AuthForm />
    </main>
  );
}