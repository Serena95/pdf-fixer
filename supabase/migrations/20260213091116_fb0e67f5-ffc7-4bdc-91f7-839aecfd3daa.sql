
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to clienti" ON public.clienti;
DROP POLICY IF EXISTS "Allow all access to preventivi" ON public.preventivi;

-- Authenticated users can read all clienti
CREATE POLICY "Authenticated users can read clienti"
ON public.clienti FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clienti"
ON public.clienti FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clienti"
ON public.clienti FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clienti"
ON public.clienti FOR DELETE
USING (auth.role() = 'authenticated');

-- Same for preventivi
CREATE POLICY "Authenticated users can read preventivi"
ON public.preventivi FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert preventivi"
ON public.preventivi FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update preventivi"
ON public.preventivi FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete preventivi"
ON public.preventivi FOR DELETE
USING (auth.role() = 'authenticated');

-- Add length constraints to clienti
ALTER TABLE public.clienti
  ADD CONSTRAINT clienti_nome_length CHECK (char_length(nome) >= 1 AND char_length(nome) <= 255);

-- Add constraints to preventivi
ALTER TABLE public.preventivi
  ADD CONSTRAINT preventivi_cliente_length CHECK (char_length(cliente) >= 1 AND char_length(cliente) <= 255),
  ADD CONSTRAINT preventivi_totale_positive CHECK (totale >= 0),
  ADD CONSTRAINT preventivi_imponibile_positive CHECK (imponibile >= 0);
