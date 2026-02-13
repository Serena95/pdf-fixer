
-- Drop existing restrictive policies on clienti
DROP POLICY IF EXISTS "Authenticated users can delete clienti" ON public.clienti;
DROP POLICY IF EXISTS "Authenticated users can insert clienti" ON public.clienti;
DROP POLICY IF EXISTS "Authenticated users can read clienti" ON public.clienti;
DROP POLICY IF EXISTS "Authenticated users can update clienti" ON public.clienti;

-- Drop existing restrictive policies on preventivi
DROP POLICY IF EXISTS "Authenticated users can delete preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can insert preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can read preventivi" ON public.preventivi;
DROP POLICY IF EXISTS "Authenticated users can update preventivi" ON public.preventivi;

-- Create public access policies on clienti
CREATE POLICY "Public read clienti" ON public.clienti FOR SELECT USING (true);
CREATE POLICY "Public insert clienti" ON public.clienti FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update clienti" ON public.clienti FOR UPDATE USING (true);
CREATE POLICY "Public delete clienti" ON public.clienti FOR DELETE USING (true);

-- Create public access policies on preventivi
CREATE POLICY "Public read preventivi" ON public.preventivi FOR SELECT USING (true);
CREATE POLICY "Public insert preventivi" ON public.preventivi FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update preventivi" ON public.preventivi FOR UPDATE USING (true);
CREATE POLICY "Public delete preventivi" ON public.preventivi FOR DELETE USING (true);
