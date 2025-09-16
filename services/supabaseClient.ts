/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rhifcwzocmsbwspolgxe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaWZjd3pvY21zYndzcG9sZ3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTg5NjEsImV4cCI6MjA3MzM5NDk2MX0.68tu4zWlyGt38RvuOyQ0Ls6Ah__XTeZ2GKj0LE-MB-Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);