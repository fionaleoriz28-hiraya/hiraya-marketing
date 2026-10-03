-- Public client inquiry flow for the Hiraya marketing site.
CREATE TABLE IF NOT EXISTS public.client_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  social_links TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  challenge TEXT,
  budget TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_inquiries TO service_role;
ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS client_inquiries_created_idx
  ON public.client_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS client_inquiries_status_idx
  ON public.client_inquiries (status);

CREATE OR REPLACE FUNCTION public.submit_public_inquiry(
  p_full_name TEXT,
  p_business_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_business_type TEXT DEFAULT NULL,
  p_social_links TEXT DEFAULT NULL,
  p_services TEXT[] DEFAULT '{}',
  p_challenge TEXT DEFAULT NULL,
  p_budget TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inquiry_id UUID;
BEGIN
  IF length(trim(coalesce(p_full_name, ''))) < 2 THEN
    RAISE EXCEPTION 'A valid name is required';
  END IF;

  IF length(trim(coalesce(p_business_name, ''))) < 2 THEN
    RAISE EXCEPTION 'A valid business name is required';
  END IF;

  IF length(trim(coalesce(p_email, ''))) < 5 OR position('@' in p_email) = 0 THEN
    RAISE EXCEPTION 'A valid email is required';
  END IF;

  IF coalesce(array_length(p_services, 1), 0) = 0 THEN
    RAISE EXCEPTION 'Please select at least one service';
  END IF;

  INSERT INTO public.client_inquiries (
    full_name,
    business_name,
    email,
    phone,
    business_type,
    social_links,
    services,
    challenge,
    budget,
    message
  )
  VALUES (
    left(trim(p_full_name), 160),
    left(trim(p_business_name), 160),
    left(trim(p_email), 320),
    left(nullif(trim(p_phone), ''), 80),
    left(nullif(trim(p_business_type), ''), 160),
    left(nullif(trim(p_social_links), ''), 2000),
    p_services[1:10],
    left(nullif(trim(p_challenge), ''), 3000),
    left(nullif(trim(p_budget), ''), 160),
    left(nullif(trim(p_message), ''), 5000)
  )
  RETURNING id INTO inquiry_id;

  RETURN inquiry_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_inquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT
) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_client_inquiry_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS client_inquiries_updated_at ON public.client_inquiries;
CREATE TRIGGER client_inquiries_updated_at
BEFORE UPDATE ON public.client_inquiries
FOR EACH ROW EXECUTE FUNCTION public.set_client_inquiry_updated_at();
