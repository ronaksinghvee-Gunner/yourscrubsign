ALTER TABLE public.store_interest 
  ADD COLUMN IF NOT EXISTS session_id uuid,
  ALTER COLUMN email DROP NOT NULL;

DROP POLICY IF EXISTS "anyone can submit store interest" ON public.store_interest;

CREATE POLICY "anyone can submit store interest"
ON public.store_interest
FOR INSERT
TO public
WITH CHECK (
  category = ANY (ARRAY['between-shifts'::text, 'affirmation-tools'::text, 'wear-the-shift'::text])
  AND (
    email IS NULL
    OR (length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  )
);