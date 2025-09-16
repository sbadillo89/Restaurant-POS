// Guardar en: supabase/functions/create-user/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
};

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Cliente de Supabase con permisos de administrador.
    // Se utilizan fallbacks hardcodeados para garantizar el funcionamiento si las variables de entorno no están presentes.
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') || "https://rhifcwzocmsbwspolgxe.supabase.co",
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaWZjd3pvY21zYndzcG9sZ3hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgxODk2MSwiZXhwIjoyMDczMzk0OTYxfQ.ghmfXWiOBGvVFOLRlF_eMd614gcvG6Mr5xR5KKEhkKA",
      // Es una buena práctica deshabilitar la persistencia de sesión para clientes de servidor.
      { auth: { persistSession: false } }
    );

    // Obtener datos del nuevo usuario desde la petición
    const { username, password, role } = await req.json();
    if (!username || !password || !role) {
      throw new Error("Username, password, and role are required.");
    }

    // ÚNICA RESPONSABILIDAD: Crear el usuario en el sistema de autenticación de Supabase.
    // La base de datos se encargará de crear el perfil correspondiente a través de un trigger.
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${username.toLowerCase()}@maildrop.cc`, // Usamos un email dummy
      password: password,
      email_confirm: true, // El usuario ya está confirmado
      user_metadata: {
        username: username,
        role: role,
      }
    });

    if (authError) throw authError;
    if (!user) throw new Error("User creation did not return a user object.");
    
    // Devolver una respuesta exitosa con el usuario creado
    return new Response(
      JSON.stringify({ message: `User ${username} created successfully.`, user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    // Manejo de errores mejorado: devuelve el mensaje y los detalles del error.
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message, details: error }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});