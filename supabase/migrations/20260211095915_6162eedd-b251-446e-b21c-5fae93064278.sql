
-- Tabella clienti
CREATE TABLE public.clienti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  indirizzo TEXT DEFAULT '',
  piva TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to clienti" ON public.clienti
  FOR ALL USING (true) WITH CHECK (true);

-- Tabella preventivi
CREATE TABLE public.preventivi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  cliente TEXT NOT NULL,
  totale NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  unit TEXT DEFAULT '',
  modello TEXT DEFAULT '',
  descrizione TEXT DEFAULT '',
  imponibile NUMERIC DEFAULT 0,
  iva_applicata BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to preventivi" ON public.preventivi
  FOR ALL USING (true) WITH CHECK (true);
