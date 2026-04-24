import Link from 'next/link';
import ClientDataForm from '@/components/client-data-form';

export default function DatosPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Tus datos básicos</h1>
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Volver
        </Link>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        Antes de subir el recibo, completá esta información para asociar el documento al perfil del cliente.
      </p>

      <ClientDataForm />
    </main>
  );
}
