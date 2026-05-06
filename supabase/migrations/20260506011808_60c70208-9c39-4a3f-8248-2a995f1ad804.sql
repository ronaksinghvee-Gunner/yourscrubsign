
CREATE OR REPLACE FUNCTION public.validate_subscriber()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF length(NEW.first_name) < 1 OR length(NEW.first_name) > 80 THEN
    RAISE EXCEPTION 'invalid first_name';
  END IF;
  IF length(NEW.email) > 254 OR NEW.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid email';
  END IF;
  IF length(NEW.zodiac_sign) > 20 OR length(NEW.specialty) > 20 OR length(NEW.source) > 80 THEN
    RAISE EXCEPTION 'invalid field length';
  END IF;
  IF array_length(NEW.word_selections, 1) > 3 THEN
    RAISE EXCEPTION 'too many words';
  END IF;
  -- always default unsubscribed to false on insert
  NEW.unsubscribed := false;
  RETURN NEW;
END $$;

CREATE TRIGGER validate_subscriber_trg
BEFORE INSERT ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION public.validate_subscriber();
