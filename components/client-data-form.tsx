'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormData = {
  nombre: string;
  apellido: string;
  dni: string;
  genero: string;
};

const initialState: FormData = {
  nombre: '',
  apellido: '',
  dni: '',
  genero: ''
};

export default function ClientDataForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialState);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(formData);
    router.push(`/subir?${params.toString()}`);
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={(event) => updateField('nombre', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring"
            />
          </div>

          <div>
            <label htmlFor="apellido" className="mb-2 block text-sm font-medium text-slate-700">
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              required
              value={formData.apellido}
              onChange={(event) => updateField('apellido', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring"
            />
          </div>

          <div>
            <label htmlFor="dni" className="mb-2 block text-sm font-medium text-slate-700">
              DNI
            </label>
            <input
              id="dni"
              type="text"
              required
              pattern="[0-9]{7,10}"
              title="Ingresá un DNI válido (solo números)."
              value={formData.dni}
              onChange={(event) => updateField('dni', event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring"
            />
          </div>

          <div>
            <label htmlFor="genero" className="mb-2 block text-sm font-medium text-slate-700">
              Género
            </label>
            <select
              id="genero"
              required
              value={formData.genero}
              onChange={(event) => updateField('genero', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring"
            >
              <option value="" disabled>
                Seleccionar
              </option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="no_binario">No binario</option>
              <option value="prefiero_no_decirlo">Prefiero no decirlo</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Continuar a carga de recibo
        </button>
      </form>
    </section>
  );
}
