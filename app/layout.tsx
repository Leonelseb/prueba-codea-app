import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analizador de Recibos MVP',
  description: 'MVP para subir y analizar recibos de sueldo con IA'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
