
-- subscribers
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  zodiac_sign TEXT NOT NULL,
  specialty TEXT NOT NULL,
  word_selections TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'direct',
  unsubscribed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (signup). No public select/update/delete.
CREATE POLICY "anyone can subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

-- daily_readings
CREATE TABLE public.daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  zodiac_sign TEXT NOT NULL,
  long_reading TEXT NOT NULL,
  short_reading TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL,
  specialty_line TEXT NOT NULL,
  affirmation TEXT NOT NULL DEFAULT '',
  email_subject TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, zodiac_sign, specialty)
);

CREATE INDEX idx_daily_readings_date ON public.daily_readings(date);

ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

-- Public can read readings (it's the whole product)
CREATE POLICY "readings are public"
  ON public.daily_readings FOR SELECT
  USING (true);
