'use client';

import { useMemo, useState } from 'react';

type UploadState = 'idle' | 'loading' | 'success' | 'error';

export default function UploadForm() {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const isPdf = file?.type === 'application/pdf';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus('error');
      setMessage('Selecciona un archivo antes de subir.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Subiendo archivo...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);

      const response = await fetch('/api/recibos', {
        method: 'POST',
        body: formData
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'No se pudo subir el archivo.');
      }

      setStatus('success');
      setMessage('Recibo subido correctamente.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring"
          />
        </div>

        <div>
          <label htmlFor="file" className="mb-2 block text-sm font-medium text-slate-700">
            Archivo (PDF o imagen)
          </label>
          <input
            id="file"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>

        {previewUrl && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Preview</p>
            {isPdf ? (
              <iframe src={previewUrl} className="h-[420px] w-full rounded-lg" title="Vista previa PDF" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Vista previa del recibo" className="max-h-[420px] w-full rounded-lg object-contain" />
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Subiendo...' : 'Guardar recibo'}
        </button>

        {message && (
          <p
            className={`text-sm ${
              status === 'success' ? 'text-emerald-600' : status === 'error' ? 'text-rose-600' : 'text-slate-600'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
