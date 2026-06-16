ALTER TABLE public.purchases RENAME COLUMN stripe_session_id TO paypal_order_id;
ALTER TABLE public.purchases ADD CONSTRAINT purchases_user_track_unique UNIQUE (user_id, track_id);