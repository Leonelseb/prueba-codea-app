import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const email = String(formData.get('email') ?? '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No se recibió archivo.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ message: 'El email es obligatorio.' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Tipo de archivo no soportado. Solo PDF e imágenes.' },
        { status: 400 }
      );
    }

    const extension = file.name.split('.').pop() ?? 'bin';
    const userId = crypto.randomUUID();
    const fileName = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('recibos')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from('recibos').getPublicUrl(fileName);

    const { error: userError } = await supabaseAdmin.from('users').upsert({ id: userId, email }, { onConflict: 'id' });
    if (userError) {
      return NextResponse.json({ message: userError.message }, { status: 500 });
    }

    const { error: receiptError } = await supabaseAdmin.from('recibos').insert({
      user_id: userId,
      file_url: publicData.publicUrl
    });

    if (receiptError) {
      return NextResponse.json({ message: receiptError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Recibo guardado correctamente.' });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Error inesperado al procesar el archivo.'
      },
      { status: 500 }
    );
  }
}
