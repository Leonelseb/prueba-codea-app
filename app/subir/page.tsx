import Link from 'next/link';
import UploadForm from '@/components/upload-form';

type SubirPageProps = {
  searchParams?: Promise<{
    nombre?: string;
    apellido?: string;
    dni?: string;
    genero?: string;
  }>;
};

export default async function SubirPage({ searchParams }: SubirPageProps) {
  const params = await searchParams;
  const nombre = params?.nombre ?? '';
  const apellido = params?.apellido ?? '';
  const dni = params?.dni ?? '';
  const genero = params?.genero ?? '';

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Subir recibo</h1>
        <Link href="/datos" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Editar datos
        </Link>
      </div>

      {(nombre || apellido || dni || genero) && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <p className="mb-2 font-medium text-slate-900">Datos del cliente</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {nombre && <li><span className="text-slate-500">Nombre:</span> {nombre}</li>}
            {apellido && <li><span className="text-slate-500">Apellido:</span> {apellido}</li>}
            {dni && <li><span className="text-slate-500">DNI:</span> {dni}</li>}
            {genero && <li><span className="text-slate-500">Género:</span> {genero.replaceAll('_', ' ')}</li>}
          </ul>
        </section>
      )}

      <UploadForm />
    </main>
  );
}
