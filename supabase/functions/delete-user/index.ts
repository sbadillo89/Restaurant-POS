import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
};

// Función principal que se ejecuta al recibir una petición
serve(async (req) => {
  // Manejo de CORS para peticiones desde el navegador
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

    // Se obtiene el ID del usuario a eliminar del cuerpo de la petición
    const { userId } = await req.json();
    if (!userId) throw new Error("El ID del usuario es requerido.");
    
    // La forma correcta y atómica de eliminar un usuario es llamar a `deleteUser`.
    // Esto depende de que la tabla 'profiles' tenga una clave foránea a 'auth.users'
    // con la acción `ON DELETE CASCADE`, que es la práctica estándar.
    // Al eliminar el usuario de auth, la base de datos eliminará automáticamente el perfil correspondiente.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
        throw new Error(`Error al eliminar el usuario: ${authError.message}`);
    }

    // Se devuelve una respuesta exitosa
    return new Response(
      JSON.stringify({ message: `Usuario ${userId} eliminado correctamente.` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // Se maneja cualquier error que ocurra
    console.error('Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message, details: error }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});