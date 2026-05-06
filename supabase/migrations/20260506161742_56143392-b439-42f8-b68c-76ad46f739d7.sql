CREATE TABLE public.store_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit store interest"
ON public.store_interest
FOR INSERT
TO public
WITH CHECK (
  length(email) <= 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND category IN ('between-shifts','affirmation-tools','wear-the-shift')
);

CREATE INDEX idx_store_interest_category ON public.store_interest(category);
CREATE INDEX idx_store_interest_created_at ON public.store_interest(created_at DESC);