// Save at supabase/functions/get-dashboard-stats/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // @ts-ignore
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

    // Get the date and timezone offset from the request body.
    const { date: dateStr, timezoneOffset } = await req.json();

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error("A valid date in YYYY-MM-DD format is required.");
    }
    
    let startDate, endDate;

    if (timezoneOffset !== undefined && typeof timezoneOffset === 'number') {
      // Client provided a timezone offset. Construct the UTC time range that corresponds to the user's local day.
      // A positive offset from getTimezoneOffset means the local time is behind UTC (e.g., Americas).
      const sign = timezoneOffset > 0 ? '-' : '+';
      const absOffset = Math.abs(timezoneOffset);
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const minutes = String(absOffset % 60).padStart(2, '0');
      const timezoneString = `${sign}${hours}:${minutes}`;
      
      startDate = new Date(`${dateStr}T00:00:00.000${timezoneString}`).toISOString();
      endDate = new Date(`${dateStr}T23:59:59.999${timezoneString}`).toISOString();
    } else {
      // Fallback to a simple UTC day range if no offset is provided.
      startDate = `${dateStr}T00:00:00.000Z`;
      endDate = `${dateStr}T23:59:59.999Z`;
    }

    // --- Perform database queries ---
    // Queries that MUST succeed are run in parallel.
    const [
      incomeResult,
      expensesResult,
      orderCountsResult,
      pendingOrdersResult,
    ] = await Promise.all([
      // 1. Calculate total income from orders completed on the given date
      supabaseAdmin
        .from('orders')
        .select('total')
        .eq('status', 'completed')
        .gte('updated_at', startDate)
        .lte('updated_at', endDate),

      // 2. Calculate total expenses created on the given date
      supabaseAdmin
        .from('expenses')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      
      // 3. Count completed and cancelled orders updated on the given date
      supabaseAdmin
        .from('orders')
        .select('status')
        .in('status', ['completed', 'cancelled'])
        .gte('updated_at', startDate)
        .lte('updated_at', endDate)
        .then(res => {
          if (res.error) throw res.error;
          const counts = { completed: 0, cancelled: 0 };
          // CRITICAL FIX: Add a safety check to ensure res.data is an array before iterating.
          // This prevents a server crash if no orders match the query.
          if (Array.isArray(res.data)) {
            (res.data as { status: 'completed' | 'cancelled' }[]).forEach(o => {
              if (o.status === 'completed') counts.completed++;
              if (o.status === 'cancelled') counts.cancelled++;
            });
          }
          return { data: counts, error: null };
        }),

      // 4. Count all pending orders (this is a live count, not date-specific)
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    // Error handling for required queries
    if (incomeResult.error) throw incomeResult.error;
    if (expensesResult.error) throw expensesResult.error;
    if (orderCountsResult.error) throw orderCountsResult.error;
    if (pendingOrdersResult.error) throw pendingOrdersResult.error;

    // --- Handle optional query (top products) gracefully ---
    // This prevents the entire function from failing if the RPC is not deployed.
    let topSellingProducts = [];
    try {
      const { data, error } = await supabaseAdmin.rpc('get_top_selling_products', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        console.error('Non-critical error fetching top products (RPC might be missing):', error.message);
      } else {
        topSellingProducts = data.map((p: any) => ({
          name: p.product_name,
          quantity: Number(p.total_quantity)
        }));
      }
    } catch(e) {
        console.error('Critical error calling top products RPC:', e.message);
    }
    
    // --- Process the results ---
    const income = incomeResult.data.reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = expensesResult.data.reduce((sum, e) => sum + e.amount, 0);
    const completedOrdersCount = orderCountsResult.data.completed;
    const cancelledOrdersCount = orderCountsResult.data.cancelled;
    const pendingOrders = pendingOrdersResult.count ?? 0;
    
    const net = income - totalExpenses;
    const averageOrderValue = completedOrdersCount > 0 ? income / completedOrdersCount : 0;

    // --- Construct the final response object ---
    const stats = {
      income,
      totalExpenses,
      net,
      pendingOrders,
      completedOrdersCount,
      cancelledOrdersCount,
      averageOrderValue,
      topSellingProducts,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});