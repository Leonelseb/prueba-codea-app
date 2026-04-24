# Recibos MVP (Next.js + Supabase + OpenAI)

MVP web para subir recibos de sueldo (PDF o imagen), guardarlos en Supabase Storage y registrar el archivo en base de datos.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Supabase (Database + Storage)
- OpenAI API (cliente inicializado para próximos pasos de análisis)

## Estructura

```txt
app/
  api/recibos/route.ts      # Endpoint de upload
  datos/page.tsx            # Pantalla de datos del cliente
  subir/page.tsx            # Pantalla de carga de recibo
  page.tsx                  # Landing
components/
  upload-form.tsx           # Formulario + preview
lib/
  supabase.ts               # Cliente Supabase (service role)
  openai.ts                 # Cliente OpenAI helper
supabase/
  schema.sql                # Tablas, policies y bucket
```

## 1) Requisitos

- Node.js 20+
- Proyecto en Supabase

## 2) Instalar dependencias

```bash
npm install
```

## 3) Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completa `.env.local` con tus credenciales:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## 4) Preparar base de datos y storage

1. Abre Supabase Dashboard → SQL Editor.
2. Ejecuta el contenido de `supabase/schema.sql`.

## 5) Ejecutar en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Flujo actual

1. Landing con botón **Subir recibo** (va a `/datos`).
2. Página `/datos` para pedir nombre, apellido, DNI y género.
3. Página `/subir`:
   - carga PDF o imagen
   - preview del archivo
   - envío al backend
4. API `/api/recibos`:
   - valida archivo + email
   - sube archivo a bucket `recibos`
   - guarda registro en tabla `users`
   - guarda registro en tabla `recibos`

## Próximo paso sugerido (IA)

Usar `lib/openai.ts` para procesar el contenido del recibo (OCR + extracción de campos) y guardar el resultado en otra tabla (`recibos_analisis`).
