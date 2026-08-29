// Archivo: app/api/create-client/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, nombre } = await req.json();
    
    // Usamos la clave maestra para tener permisos de administrador absolutos
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Creamos el usuario en Auth. El Trigger que creamos en SQL 
    // automáticamente le hará su perfil de "cliente".
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        nombre, 
        avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Fit1&backgroundColor=0ea5e9' 
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}