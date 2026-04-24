import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        MVP · Next.js + Supabase + OpenAI
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
        Analiza recibos de sueldo en minutos
      </h1>
      <p className="mt-6 max-w-xl text-base text-slate-600 sm:text-lg">
        Sube un PDF o imagen de tu recibo, almacénalo de forma segura y prepara la base para análisis automático con IA.
      </p>

      <Link
        href="/datos"
        className="mt-10 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Subir recibo
      </Link>
    </main>
  );
}
